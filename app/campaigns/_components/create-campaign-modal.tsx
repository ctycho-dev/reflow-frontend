'use client'

import { useState, useMemo } from 'react'
import { useAccount, useWriteContract, usePublicClient } from 'wagmi'
import { parseEventLogs } from 'viem'
import { useAuthMe } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api'
import { useSiweLogin } from '@/hooks/use-siwe-login'
import { useTokens } from '@/hooks/use-tokens'
import { useProtocols } from '@/hooks/use-protocols'
import { campaignsApi } from '@/lib/api/campaigns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  CHAIN_ID,
  DISTRIBUTOR_ADDRESS,
  distributorAbi,
  REWARD_TOKEN_DECIMALS,
  REWARD_TOKEN_SYMBOL,
} from '@/lib/contracts'
import { toBaseUnits } from '@/app/utils/helpers'

interface CreateCampaignModalProps {
  onCreated?: () => void
}

type Step = 'idle' | 'draft' | 'wallet' | 'confirming' | 'linking'

const STEP_LABEL: Record<Step, string> = {
  idle: 'Create',
  draft: 'Saving draft…',
  wallet: 'Confirm in wallet…',
  confirming: 'Waiting for confirmation…',
  linking: 'Linking…',
}

const DAY_MS = 86_400_000

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function linkWithRetry(
  campaignId: number,
  body: { onchainId: number; txHash: string },
) {
  // 409 = Envio hasn't indexed the creation block yet — poll.
  // 422 = params mismatch — a bug, never retry.
  for (let attempt = 0; ; attempt++) {
    try {
      return await campaignsApi.link(campaignId, body)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && attempt < 5) {
        await sleep(2000)
        continue
      }
      throw err
    }
  }
}

export function CreateCampaignModal({ onCreated }: CreateCampaignModalProps) {
  const { isConnected } = useAccount()
  const { data: session } = useAuthMe()
  const siweLogin = useSiweLogin()
  const authed = isConnected && !!session

  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()

  const { data: tokens = [] } = useTokens()
  const { data: protocols = [] } = useProtocols()

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('idle')
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const [protocolAddress, setProtocolAddress] = useState('')
  const [minVolume, setMinVolume] = useState('')
  const [rewardAmount, setRewardAmount] = useState('')
  const [durationDays, setDurationDays] = useState('7')
  const [startsAt, setStartsAt] = useState('')
  const [maxRecipients, setMaxRecipients] = useState('100')

  const selectedToken = tokens.find((t) => t.address === tokenAddress)
  const busy = step !== 'idle'

  const reset = () => {
    setName('')
    setDescription('')
    setTokenAddress('')
    setProtocolAddress('')
    setMinVolume('')
    setRewardAmount('')
    setDurationDays('7')
    setStartsAt('')
    setMaxRecipients('100')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authed) {
      setError('Sign in with your wallet first')
      return
    }
    if (!selectedToken) {
      setError('Pick a token')
      return
    }
    if (!protocolAddress) {
      setError('Pick a target contract')
      return
    }
    if (!publicClient) {
      setError('Wallet client not ready')
      return
    }

    // One source of truth for the window: both the draft's ISO strings and the
    // tx's epoch seconds derive from these two Date objects. Two independent
    // conversions could disagree; one cannot.
    const startDate = new Date(startsAt)
    const endDate = new Date(startDate.getTime() + parseInt(durationDays, 10) * DAY_MS)
    if (startDate.getTime() <= Date.now()) {
      setError('Start must be in the future — the contract rejects past start times')
      return
    }

    setError(null)
    const rewardWei = toBaseUnits(rewardAmount, REWARD_TOKEN_DECIMALS)

    let draftId: number | null = null
    let currentStep: Step = 'idle'
    const advance = (s: Step) => {
      currentStep = s
      setStep(s)
    }

    try {
      // 1 — persist intent before the irreversible action (dual-write)
      advance('draft')
      const draft = await campaignsApi.createDraft({
        name,
        description: description || null,
        chainId: CHAIN_ID,
        tokenAddress: selectedToken.address,
        targetContractAddress: protocolAddress,
        minTotalVolume: toBaseUnits(minVolume, selectedToken.decimals),
        rewardAmount: rewardWei,
        startsAt: startDate.toISOString(),
        endsAt: endDate.toISOString(),
        maxRecipients: parseInt(maxRecipients, 10),
      })
      draftId = draft.id

      // 2 — createCampaign from the user's wallet
      advance('wallet')
      const txHash = await writeContractAsync({
        address: DISTRIBUTOR_ADDRESS,
        abi: distributorAbi,
        functionName: 'createCampaign',
        args: [
          selectedToken.address as `0x${string}`,
          protocolAddress as `0x${string}`,
          BigInt(Math.floor(startDate.getTime() / 1000)),
          BigInt(Math.floor(endDate.getTime() / 1000)),
          BigInt(rewardWei),
        ],
      })

      advance('confirming')
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
      const [created] = parseEventLogs({
        abi: distributorAbi,
        eventName: 'CampaignCreated',
        logs: receipt.logs.filter(
          (l) => l.address.toLowerCase() === DISTRIBUTOR_ADDRESS.toLowerCase(),
        ),
      })
      if (!created) throw new Error('CampaignCreated event not found in receipt')

      // 3 — bind draft to chain; backend verifies creator + params vs Envio
      advance('linking')
      await linkWithRetry(draftId, {
        onchainId: Number(created.args.campaignId),
        txHash,
      })

      setOpen(false)
      reset()
      onCreated?.()
      toast.success('Campaign created on-chain', { description: name })
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 409
          ? 'Transaction confirmed, but indexing is taking longer than usual. It will link automatically on your next visit.'
          : err instanceof Error
            ? err.message
            : 'Failed to create campaign'

      if (draftId !== null && currentStep !== 'draft') {
        toast.error('Creation interrupted', { description: message })
      } else {
        toast.error('Could not create campaign', { description: message })
      }
      setError(message)
    } finally {
      setStep('idle')
    }
  }

  const groupedProtocols = useMemo(() => {
    const map = new Map<string, { name: string; contracts: typeof protocols }>()
    for (const p of protocols) {
      const existing = map.get(p.slug)
      if (existing) existing.contracts.push(p)
      else map.set(p.slug, { name: p.name, contracts: [p] })
    }
    return Array.from(map.values())
  }, [protocols])

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (busy) return // never close mid-flow — a wallet prompt may be pending
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 mr-2"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Campaign</DialogTitle>
          <DialogDescription>
            Campaign is created on-chain from your wallet. You fund it in a
            separate step.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., USDC Power Users"
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does a wallet need to do to qualify?"
              maxLength={2000}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              <Select value={tokenAddress} onValueChange={setTokenAddress}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a token" />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((t) => (
                    <SelectItem key={t.address} value={t.address}>
                      {t.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="protocol">Target Contract</Label>
              <Select value={protocolAddress} onValueChange={setProtocolAddress}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a target" />
                </SelectTrigger>
                <SelectContent>
                  {groupedProtocols.map((group) => (
                    <SelectGroup key={group.name}>
                      <SelectLabel>{group.name}</SelectLabel>
                      {group.contracts.map((c) => (
                        <SelectItem key={c.address} value={c.address}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minVolume">
              Minimum Volume {selectedToken && `(${selectedToken.symbol})`}
            </Label>
            <Input
              id="minVolume"
              type="number"
              step="any"
              min="0"
              value={minVolume}
              onChange={(e) => setMinVolume(e.target.value)}
              placeholder="0.5"
              required
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startsAt">Starts At</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationDays">Duration (days)</Label>
              <Input
                id="durationDays"
                type="number"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                required
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rewardAmount">
                Reward Pool ({REWARD_TOKEN_SYMBOL})
              </Label>
              <Input
                id="rewardAmount"
                type="number"
                step="any"
                min="0"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                placeholder="100"
                required
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRecipients">Max Recipients</Label>
              <Input
                id="maxRecipients"
                type="number"
                min="1"
                value={maxRecipients}
                onChange={(e) => setMaxRecipients(e.target.value)}
                required
                className="font-mono"
              />
            </div>
          </div>

          {!isConnected ? (
            <p className="text-sm text-muted-foreground">
              Connect your wallet to create a campaign.
            </p>
          ) : !session ? (
            <div className="flex items-center justify-between rounded-lg bg-secondary/30 p-3">
              <p className="text-sm text-muted-foreground">
                Sign in to prove wallet ownership.
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => siweLogin.mutate()}
                disabled={siweLogin.isPending}
              >
                {siweLogin.isPending ? 'Check wallet…' : 'Sign in'}
              </Button>
            </div>
          ) : null}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !authed}>
              {STEP_LABEL[step]}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}