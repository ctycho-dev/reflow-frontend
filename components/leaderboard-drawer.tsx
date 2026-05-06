'use client'

import { Campaign, LeaderboardEntry } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { TokenBadge, StatusBadge } from './badges'
import { Progress } from '@/components/ui/progress'

interface LeaderboardDrawerProps {
  campaign: Campaign | null
  leaderboard: LeaderboardEntry[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function LeaderboardDrawer({
  campaign,
  leaderboard,
  open,
  onOpenChange,
}: LeaderboardDrawerProps) {
  if (!campaign) return null

  const progress = (campaign.enrolled / campaign.totalEligible) * 100

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <TokenBadge token={campaign.token} />
            <StatusBadge status={campaign.status} />
          </div>
          <SheetTitle className="text-xl">{campaign.name}</SheetTitle>
          <p className="text-sm text-muted-foreground">{campaign.ruleDescription}</p>
        </SheetHeader>

        <div className="py-4 space-y-4 border-b border-border">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-primary">
                {campaign.rewardPoints}
              </p>
              <p className="text-xs text-muted-foreground">Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-foreground">
                {campaign.enrolled}
              </p>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-mono text-foreground">
                {campaign.totalEligible}
              </p>
              <p className="text-xs text-muted-foreground">Eligible</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="py-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.address}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    index === 0
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
                    {truncateAddress(entry.address)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${entry.qualifyingVolume.toLocaleString()} volume
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium text-primary">
                    {entry.pointsEarned.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
