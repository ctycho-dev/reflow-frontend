// app/wallet/_components/eligibility-cards.tsx
'use client'

import { CampaignEligibility } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TokenBadge } from '@/components/badges'
import { useTokens } from '@/hooks/use-tokens'
import { useProtocols } from '@/hooks/use-protocols'
import { formatVolume } from '@/lib/format'
import { cn } from '@/lib/utils'

interface EligibilityCardsProps {
  eligibility: CampaignEligibility[]
}

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  </svg>
)

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 5a.75.75 0 01.75.75v4.59l2.95 1.7a.75.75 0 11-.75 1.3l-3.33-1.92A.75.75 0 019.25 11V5.75A.75.75 0 0110 5z"
      clipRule="evenodd"
    />
  </svg>
)

export function EligibilityCards({ eligibility }: EligibilityCardsProps) {
  const { data: tokens = [] } = useTokens()
  const { data: protocols = [] } = useProtocols()

  const tokensByAddress = new Map(tokens.map((t) => [t.address.toLowerCase(), t]))
  const protocolsByAddress = new Map(protocols.map((p) => [p.address.toLowerCase(), p]))

  if (eligibility.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Campaign Eligibility
        </h3>
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No active campaigns for this wallet.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Campaign Eligibility
      </h3>
      <div className="grid gap-3">
        {eligibility.map((item) => {
          const token = tokensByAddress.get(item.campaign.tokenAddress.toLowerCase())
          const protocol = item.campaign.targetContractAddress
            ? protocolsByAddress.get(item.campaign.targetContractAddress.toLowerCase())
            : undefined

          const decimals = token?.decimals ?? 18
          const symbol = token?.symbol ?? ''
          const volumeDisplay = formatVolume(item.totalVolume, decimals)
          const requiredDisplay = formatVolume(item.campaign.minTotalVolume, decimals)
          const progressPct = Math.min(100, Math.round(item.progress * 100))

          // Three visual states: qualified > enrolled > not enrolled
          const state = item.qualified ? 'qualified' : item.enrolled ? 'enrolled' : 'unenrolled'

          return (
            <Card
              key={item.campaign.id}
              className={cn(
                'bg-card border-border',
                state === 'qualified' && 'border-success/50',
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        state === 'qualified' && 'text-success',
                        state === 'enrolled' && 'text-primary',
                        state === 'unenrolled' && 'text-muted-foreground',
                      )}
                    >
                      {state === 'qualified' ? <CheckIcon /> : <ClockIcon />}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{item.campaign.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {token && <TokenBadge token={token} />}
                        {protocol && (
                          <span className="text-xs text-muted-foreground">{protocol.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold text-primary">
                      {item.campaign.rewardAmount.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Volume</span>
                    <span className="font-mono text-foreground">
                      {volumeDisplay} {symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Required</span>
                    <span className="font-mono text-foreground">
                      {requiredDisplay} {symbol}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <Progress value={progressPct} className="h-1.5" />
                  <p className="text-xs text-right text-muted-foreground">
                    {progressPct}%
                  </p>
                </div>

                {state === 'qualified' && (
                  <p className="mt-3 text-sm text-success">
                    ✓ Qualified for {item.campaign.rewardAmount.toString()} pts
                  </p>
                )}
                {state === 'enrolled' && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Enrolled — keep going to qualify
                  </p>
                )}
                {state === 'unenrolled' && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Not enrolled
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}