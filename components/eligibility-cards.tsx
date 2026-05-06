'use client'

import { CampaignEligibility } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { TokenBadge } from './badges'
import { cn } from '@/lib/utils'

interface EligibilityCardsProps {
  eligibility: CampaignEligibility[]
}

export function EligibilityCards({ eligibility }: EligibilityCardsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Campaign Eligibility
      </h3>
      <div className="grid gap-3">
        {eligibility.map((item) => (
          <Card
            key={item.campaignId}
            className={cn(
              'bg-card border-border',
              item.eligible && 'border-success/50'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-lg',
                      item.eligible ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {item.eligible ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">
                      {item.campaignName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <TokenBadge token={item.token} />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold text-primary">
                    {item.potentialPoints}
                  </p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your volume</span>
                  <span className="font-mono text-foreground">
                    {item.token === 'USDC'
                      ? `$${item.currentVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                      : `${item.currentVolume.toFixed(4)} ETH`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Required</span>
                  <span className="font-mono text-foreground">
                    {item.token === 'USDC'
                      ? `$${item.requiredVolume.toLocaleString()}`
                      : `${item.requiredVolume} ETH`}
                  </span>
                </div>
              </div>

              {item.eligible ? (
                <p className="mt-3 text-sm text-success">
                  Qualifies for {item.campaignName} - {item.potentialPoints} pts
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Below threshold for {item.campaignName}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
