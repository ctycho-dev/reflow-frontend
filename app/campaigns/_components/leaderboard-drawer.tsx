// components/leaderboard-drawer.tsx
'use client'

import { Campaign, Token, Protocol, LeaderboardEntry } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { TokenBadge, ProtocolTag, StatusBadge } from '../../../components/badges'
import { Progress } from '@/components/ui/progress'
import { formatVolume, formatRewardAmount } from '@/lib/format'
import { REWARD_TOKEN_SYMBOL } from '@/lib/contracts'

interface LeaderboardDrawerProps {
  campaign: Campaign | null
  token: Token | undefined
  protocol: Protocol | undefined
  leaderboard: LeaderboardEntry[]
  loading?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

type CampaignStatus = 'Upcoming' | 'Active' | 'Ended'

function getCampaignStatus(c: Campaign, now: Date): CampaignStatus {
  if (now < c.startsAt) return 'Upcoming'
  if (now > c.endsAt) return 'Ended'
  return 'Active'
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

function relativeTime(
  d: Date,
  status: CampaignStatus,
  which: 'start' | 'end',
): string {
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const days = Math.round(Math.abs(diffMs) / 86_400_000)

  if (status === 'Upcoming' && which === 'start') {
    return days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`
  }
  if (status === 'Active' && which === 'end') {
    return days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} left`
  }
  if (status === 'Ended' && which === 'end') {
    return days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`
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
  if (!campaign) return null

  const status = getCampaignStatus(campaign, new Date())
  const progress = campaign.maxRecipients > 0
    ? (campaign.enrolledCount / campaign.maxRecipients) * 100
    : 0

  const startsRelative = relativeTime(campaign.startsAt, status, 'start')
  const endsRelative = relativeTime(campaign.endsAt, status, 'end')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {token && <TokenBadge token={token} />}
            {protocol && <ProtocolTag protocol={protocol} />}
            <StatusBadge status={status} />
          </div>
          <SheetTitle className="text-xl">{campaign.name}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {campaign.description}
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4 border-b border-border">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-primary">
                {formatRewardAmount(campaign.rewardAmount)}
              </p>
              <p className="text-xs text-muted-foreground">{REWARD_TOKEN_SYMBOL}</p>
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
              No enrollments yet.
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const rewardDisplay = entry.qualified
                  ? formatRewardAmount(campaign.rewardAmount)
                  : '0'
                const volumeDisplay = formatVolume(
                  entry.totalVolume,
                  token?.decimals ?? 18,
                )

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
                      <p className="font-mono text-sm font-medium text-primary">
                        {rewardDisplay}
                      </p>
                      <p className="text-xs text-muted-foreground">{REWARD_TOKEN_SYMBOL}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
