'use client'

import { useState, useMemo } from 'react'
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
  REWARD_TOKEN_DECIMALS,
  REWARD_TOKEN_SYMBOL,
} from '@/lib/contracts'

interface CreateCampaignModalProps {
  onCreated?: () => void
}

function toBaseUnits(humanValue: string, decimals: number): string {
  // Convert "0.5" + 18 → "500000000000000000"
  // Done with string ops to avoid float precision loss.
  const [whole, frac = ''] = humanValue.split('.')
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals)
  const combined = (whole + fracPadded).replace(/^0+(?=\d)/, '')
  return combined === '' ? '0' : combined
}

export function CreateCampaignModal({ onCreated }: CreateCampaignModalProps) {
  const { data: tokens = [] } = useTokens()
  const { data: protocols = [] } = useProtocols()

  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
    if (!selectedToken) {
      setError('Pick a token')
      return
    }
    if (!protocolAddress) {
      setError('Pick a target contract')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await campaignsApi.create({
        name,
        description: description || null,
        chainId: CHAIN_ID,
        tokenAddress: selectedToken.address,
        targetContractAddress: protocolAddress,
        minTotalVolume: toBaseUnits(minVolume, selectedToken.decimals),
        rewardAmount: toBaseUnits(rewardAmount, REWARD_TOKEN_DECIMALS),
        durationDays: parseInt(durationDays, 10),
        startsAt: new Date(startsAt).toISOString(),
        maxRecipients: parseInt(maxRecipients, 10),
      })

      setOpen(false)
      reset()
      onCreated?.()

      toast.success('Campaign created', {
        description: name,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create campaign'
      toast.error('Could not create campaign', { description: message })
      setError(message)
    } finally {
      setSubmitting(false)
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
            Configure campaign rules and reward.
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
                Reward ({REWARD_TOKEN_SYMBOL})
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

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}