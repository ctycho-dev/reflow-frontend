// app/faucet/page.tsx — full
'use client'

import { useEffect, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi, formatUnits } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthMe } from '@/hooks/use-auth'
import { useSiweLogin } from '@/hooks/use-siwe-login'
import { useFaucetClaim, useFaucetStatus } from '@/hooks/use-faucet'
import {
  REWARD_TOKEN_ADDRESS,
  REWARD_TOKEN_DECIMALS,
  REWARD_TOKEN_SYMBOL,
} from '@/lib/contracts'

const BALANCE_REFETCH_MS = 10_000

function formatCooldown(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export default function FaucetPage() {
  const { address, isConnected } = useAccount()
  const { data: session } = useAuthMe()
  const siweLogin = useSiweLogin()
  const claim = useFaucetClaim()

  const authed = isConnected && !!session
  const { data: status } = useFaucetStatus(authed)

  // Local ticking copy of the server's retryAfterSeconds
  const [cooldown, setCooldown] = useState(0)
  useEffect(() => {
    setCooldown(status?.retryAfterSeconds ?? 0)
  }, [status?.retryAfterSeconds])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearInterval(t)
  }, [cooldown > 0])

  const { data: balance } = useReadContract({
    address: REWARD_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: BALANCE_REFETCH_MS,
    },
  })

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Faucet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get {REWARD_TOKEN_SYMBOL} to fund campaigns or generate volume.
          100 per wallet, once every 24 hours.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Your balance</span>
            <span className="text-2xl font-bold font-mono text-primary">
              {balance !== undefined
                ? Number(
                    formatUnits(balance, REWARD_TOKEN_DECIMALS),
                  ).toLocaleString('en-US')
                : '—'}
              <span className="text-xs text-muted-foreground ml-1">
                {REWARD_TOKEN_SYMBOL}
              </span>
            </span>
          </div>

          {!isConnected ? (
            <p className="text-sm text-muted-foreground">
              Connect your wallet to claim.
            </p>
          ) : !session ? (
            <Button
              className="w-full cursor-pointer"
              onClick={() => siweLogin.mutate()}
              disabled={siweLogin.isPending}
            >
              {siweLogin.isPending ? 'Check wallet…' : 'Sign in to claim'}
            </Button>
          ) : cooldown > 0 ? (
            <Button className="w-full" disabled>
              Come back in {formatCooldown(cooldown)}
            </Button>
          ) : (
            <Button
              className="w-full cursor-pointer"
              onClick={() => claim.mutate()}
              disabled={claim.isPending}
            >
              {claim.isPending ? 'Claiming…' : `Claim 100 ${REWARD_TOKEN_SYMBOL}`}
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            Tokens are minted by the protocol signer — arrival takes up to a
            minute. You also need Base Sepolia ETH for gas (any public faucet).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}