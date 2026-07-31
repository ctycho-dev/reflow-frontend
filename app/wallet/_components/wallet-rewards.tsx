// app/wallet/_components/wallet-rewards.tsx
'use client'

import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWalletClaims } from '@/hooks/use-wallet-claims'
import { useClaimReward, isAlreadyClaimedError } from '@/hooks/use-claim-reward'
import { formatRewardAmount } from '@/lib/format'
import { explorerTxUrl } from '@/lib/explorer'
import { ExternalLinkIcon } from '@/components/external-link-icon'
import { toast } from 'sonner'   // or your use-toast — match the enroll flow

export function WalletRewards({ address }: { address: string }) {
  const { address: connectedAddress } = useAccount()
  const isOwnWallet =
    connectedAddress?.toLowerCase() === address.toLowerCase()

  const { data: claims = [], isLoading } = useWalletClaims(address)
  const claim = useClaimReward()

  const onClaim = (campaignId: number) => {
    claim.mutate(campaignId, {
      onSuccess: ({ txHash, alreadyClaimed }) => {
        if (alreadyClaimed) {
          toast.info('Already claimed — refreshing')
          return
        }
        toast.success('Reward claimed', { description: txHash })
      },
      onError: (err) => {
        if (isAlreadyClaimedError(err)) {
          toast.info('Already claimed — refreshing')
          return
        }
        toast.error('Claim failed', { description: err.message })
      },
    })
  }

  if (isLoading || claims.length === 0) return null  // explorer page: no empty-state noise

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base">Rewards</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {claims.map((c) => {
          const claimingThis =
            claim.isPending && claim.variables === c.campaignId

          return (
            <div key={c.campaignId} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">{c.campaignName}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {formatRewardAmount(c.amount)} REFLOW
                </p>
              </div>

              {c.claimed ? (
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-success border-success/40">
                    ✓ Claimed
                  </Badge>
                  {c.claimTxHash && explorerTxUrl(c.chainId, c.claimTxHash) && (
                    <ExternalLinkIcon
                      href={explorerTxUrl(c.chainId, c.claimTxHash)!}
                      label="View claim transaction"
                    />
                  )}
                </div>
              ) : c.rootStatus === 'confirmed' ? (
                isOwnWallet ? (
                  <Button
                    size="sm"
                    onClick={() => onClaim(c.campaignId)}
                    disabled={claimingThis}
                    className="min-w-[6rem]"
                  >
                    {claimingThis ? 'Claiming…' : 'Claim'}
                  </Button>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Claimable
                  </Badge>
                )
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Settling…
                </Badge>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}