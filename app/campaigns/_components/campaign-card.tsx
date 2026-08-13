// components/campaign-card.tsx
'use client'
import { formatRewardAmount } from '@/lib/format'
import { Campaign, Token, Protocol, CampaignEligibility } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { TokenBadge, ProtocolTag, StatusBadge } from '@/components/badges'
import { explorerTokenUrl, explorerAddressUrl } from '@/lib/explorer'
import { ExternalLinkIcon } from '@/components/external-link-icon'

interface CampaignCardProps {
  campaign: Campaign
  token: Token | undefined
  protocol: Protocol | undefined
  eligibility: CampaignEligibility | undefined
  walletConnected: boolean
  enrollPending: boolean
  onClick: () => void
  onEnroll: () => void
}

type CampaignStatus = 'Upcoming' | 'Active' | 'Ended'

function getCampaignStatus(c: Campaign, now: Date): CampaignStatus {
  if (now < c.startsAt) return 'Upcoming'
  if (now > c.endsAt) return 'Ended'
  return 'Active'
}

export function CampaignCard({
  campaign,
  token,
  protocol,
  eligibility,
  walletConnected,
  enrollPending,
  onClick,
  onEnroll,
}: CampaignCardProps) {
  const status = getCampaignStatus(campaign, new Date())
  const progress = campaign.maxRecipients > 0
    ? (campaign.enrolledCount / campaign.maxRecipients) * 100
    : 0

  const enrolled = eligibility?.enrolled ?? false
  const qualified = eligibility?.qualified ?? false

  // Single component that picks the right state-driven label/style
  const renderEnrollButton = () => {
    const baseClasses = 'min-w-[6.5rem] cursor-pointer'
    const wrap = (children: React.ReactNode) => (
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    )

    if (campaign.status === 'created') {
      return wrap(
        <Button size="sm" variant="outline" disabled className={baseClasses}>
          Awaiting funding
        </Button>,
      )
    }
    if (campaign.status !== 'live') return null

    if (!walletConnected) {
      return wrap(
        <Button size="sm" variant="outline" disabled className={baseClasses}>
          Connect
        </Button>
      )
    }
    if (qualified) {
      return wrap(
        <Button size="sm" variant="outline" disabled className={`${baseClasses} text-success border-success/40`}>
          ✓ Qualified
        </Button>
      )
    }
    if (enrolled) {
      return wrap(
        <Button size="sm" variant="outline" disabled className={baseClasses}>
          Enrolled
        </Button>
      )
    }
    if (campaign.isFull) {
      return wrap(
        <Button size="sm" variant="outline" disabled className={baseClasses}>
          Full
        </Button>
      )
    }
    return wrap(
      <Button size="sm" onClick={onEnroll} disabled={enrollPending} className={baseClasses}>
        {enrollPending ? 'Enrolling…' : 'Enroll'}
      </Button>
    )
  }

  return (
    <Card
      className="bg-card border-border cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {token && (
              <div className="inline-flex items-center gap-1">
                <TokenBadge token={token} />
                {explorerTokenUrl(campaign.chainId, campaign.tokenAddress) && (
                  <ExternalLinkIcon
                    href={explorerTokenUrl(campaign.chainId, campaign.tokenAddress)!}
                    label={`View ${token.symbol} on explorer`}
                  />
                )}
              </div>
            )}
            {protocol && campaign.targetContractAddress && (
              <div className="inline-flex items-center gap-1">
                <ProtocolTag protocol={protocol} />
                {explorerAddressUrl(campaign.chainId, campaign.targetContractAddress) && (
                  <ExternalLinkIcon
                    href={explorerAddressUrl(campaign.chainId, campaign.targetContractAddress)!}
                    label={`View ${protocol.name} contract on explorer`}
                  />
                )}
              </div>
            )}
            <StatusBadge status={status} />
          </div>
          {/* <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-primary font-mono">
              {campaign.rewardAmount.toString()}
            </span>
            <span className="text-xs text-muted-foreground ml-1">pts</span>
          </div> */}
          <div className="text-right shrink-0">
            <span className="text-2xl font-bold text-primary font-mono">
              {formatRewardAmount(campaign.rewardAmount)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              REFLOW
            </span>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1">
          {campaign.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {campaign.description}
        </p>

        {/* Bottom row: progress on left, enroll on right */}
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Enrolled</span>
              <span className="font-mono text-foreground">
                {campaign.enrolledCount.toLocaleString('en-US')} / {campaign.maxRecipients.toLocaleString('en-US')}
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
          {renderEnrollButton()}
        </div>
      </CardContent>
    </Card>
  )
}
