// components/leaderboard-drawer.tsx
'use client'

import { Campaign, Token, Protocol, LeaderboardEntry } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { TokenBadge, ProtocolTag, StatusBadge } from '@/components/badges'
import { Progress } from '@/components/ui/progress'
import { formatVolume, formatRewardAmount } from '@/lib/format'
import { REWARD_TOKEN_SYMBOL } from '@/lib/contracts'
import { useCampaignDetail } from '@/hooks/use-campaign-detail'
import { FundCampaignSection } from './fund-campaign-section'
import { toast } from 'sonner'

interface LeaderboardDrawerProps {
  campaign: Campaign | null
  token: Token | undefined
  protocol: Protocol | undefined
  leaderboard: LeaderboardEntry[]
  loading?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function relativeTime(c: Campaign, which: 'start' | 'end'): string {
  const now = Date.now()
  const target = (which === 'start' ? c.startsAt : c.endsAt).getTime()
  const days = Math.round(Math.abs(target - now) / 86_400_000)
  const plural = days === 1 ? '' : 's'

  if (which === 'start' && (c.status === 'funded' || c.status === 'created')) {
    return target > now ? (days === 0 ? 'today' : `in ${days} day${plural}`) : ''
  }
  if (which === 'end') {
    if (c.status === 'live') return days === 0 ? 'today' : `${days} day${plural} left`
    if (['ended', 'settling', 'settled'].includes(c.status)) {
      return days === 0 ? 'today' : `${days} day${plural} ago`
    }
  }
  return ''
}

export function LeaderboardDrawer({
  campaign,
  token,
  protocol,
  leaderboard,
  loading = false,
  open,
  onOpenChange,
}: LeaderboardDrawerProps) {
  const { data: detail } = useCampaignDetail(campaign?.id)

  if (!campaign) return null

  const progress = campaign.maxRecipients > 0
    ? (campaign.enrolledCount / campaign.maxRecipients) * 100
    : 0

  const startsRelative = relativeTime(campaign, 'start')
  const endsRelative = relativeTime(campaign, 'end')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {token && <TokenBadge token={token} />}
            {protocol && <ProtocolTag protocol={protocol} />}
            <StatusBadge status={campaign.status} />
          </div>
          <SheetTitle className="text-xl">{campaign.name}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {campaign.description}
          </SheetDescription>

          {/* on-chain identity strip */}
          {detail && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <span className="capitalize">{detail.status}</span>
              {detail.onchainId != null && (
                <span>· #{detail.onchainId} on-chain</span>
              )}
              {detail.createTxHash && (
                
                <a  href={`https://sepolia.basescan.org/tx/${detail.createTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-foreground"
                >
                  creation tx ↗
                </a>
              )}
              {detail.status === 'created' && !detail.isFunded && (
                <span className="text-yellow-500">awaiting funding</span>
              )}
              {detail.isFunded && <span className="text-green-500">funded</span>}
            </div>
          )}

          {/* how to qualify — always visible; copy adapts to window state */}
          {campaign.targetContractAddress && (
            <div className="rounded-lg bg-secondary/30 p-4 space-y-2 mt-2">
              <p className="text-sm font-medium text-foreground">How to qualify</p>
              <p className="text-xs text-muted-foreground">
                Transfer at least{' '}
                <span className="font-mono text-foreground">
                  {formatVolume(campaign.minTotalVolume, token?.decimals ?? 18)}{' '}
                  {token?.symbol}
                </span>{' '}
                to the target address{' '}
                {campaign.status === 'live'
                  ? 'during the campaign window, then enroll.'
                  : 'once the campaign is live, then enroll. Transfers outside the window do not count.'}
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono bg-background rounded px-2 py-1 truncate">
                  {campaign.targetContractAddress}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(campaign.targetContractAddress!)
                    toast.success('Address copied')
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </SheetHeader>

        <div className="py-4 space-y-4 border-b border-border">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-primary">
                {formatRewardAmount(campaign.rewardAmount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {REWARD_TOKEN_SYMBOL} pool
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-foreground">
                {campaign.enrolledCount}
              </p>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-foreground">
                {campaign.maxRecipients}
              </p>
              <p className="text-xs text-muted-foreground">Capacity</p>
            </div>
          </div>

          <div className="space-y-1 px-4">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Enrollment</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 px-4 pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Starts</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(campaign.startsAt)}
              </p>
              {startsRelative && (
                <p className="text-xs text-muted-foreground">{startsRelative}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ends</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(campaign.endsAt)}
              </p>
              {endsRelative && (
                <p className="text-xs text-muted-foreground">{endsRelative}</p>
              )}
            </div>
          </div>
        </div>

        {/* creator-only, self-hides when funded */}
        {detail && (
          <div className="py-4">
            <FundCampaignSection detail={detail} />
          </div>
        )}

        <div className="py-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Leaderboard
            </h3>
            {loading && (
              <span className="text-xs text-muted-foreground">Updating…</span>
            )}
          </div>

          {leaderboard.length === 0 && !loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No qualifying activity yet.
            </div>
          ) : (
            <div className="space-y-2">
              {(() => {
                const qualifiedCount = leaderboard.filter((e) => e.qualified).length
                return leaderboard.map((entry, index) => {
                  const volumeDisplay = formatVolume(
                    entry.totalVolume,
                    token?.decimals ?? 18,
                  )
                  // Pool is equal-split among qualifying wallets at finalize.
                  // Until then this is a projection over the current qualified set.
                  const projectedShare =
                    entry.qualified && qualifiedCount > 0
                      ? formatRewardAmount(
                          campaign.rewardAmount / BigInt(qualifiedCount),
                        )
                      : null

                  return (
                    <div
                      key={entry.walletAddress}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <span
                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${index === 0
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : index === 1
                            ? 'bg-gray-400/20 text-gray-400'
                            : index === 2
                              ? 'bg-orange-500/20 text-orange-500'
                              : 'bg-muted text-muted-foreground'
                          }`}
                      >
                        {entry.rank}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-foreground truncate">
                          {truncateAddress(entry.walletAddress)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {volumeDisplay} {token?.symbol ?? ''} volume
                        </p>
                      </div>
                      <div className="text-right">
                        {projectedShare ? (
                          <>
                            <p className="font-mono text-sm font-medium text-primary">
                              ~{projectedShare}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {REWARD_TOKEN_SYMBOL} est.
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            below threshold
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}