'use client'

import { Campaign } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TokenBadge, StatusBadge } from './badges'

interface CampaignCardProps {
  campaign: Campaign
  onClick: () => void
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const progress = (campaign.enrolled / campaign.totalEligible) * 100

  return (
    <Card
      className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <TokenBadge token={campaign.token} />
            <StatusBadge status={campaign.status} />
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary font-mono">
              {campaign.rewardPoints}
            </span>
            <span className="text-xs text-muted-foreground ml-1">pts</span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1">
          {campaign.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {campaign.ruleDescription}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Enrolled</span>
            <span className="font-mono text-foreground">
              {campaign.enrolled.toLocaleString()} / {campaign.totalEligible.toLocaleString()}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  )
}
