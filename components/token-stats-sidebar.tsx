'use client'

import { TokenStats } from '@/lib/types'
import { TokenBadge } from './badges'
import { Card, CardContent } from '@/components/ui/card'

interface TokenStatsSidebarProps {
  stats: TokenStats[]
}

export function TokenStatsSidebar({ stats }: TokenStatsSidebarProps) {
  return (
    <aside className="w-64 shrink-0 space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Token Stats
      </h2>
      {stats.map((stat) => (
        <Card key={stat.token} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <TokenBadge token={stat.token} />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Transfers today</span>
                <span className="font-mono text-sm font-medium text-foreground">
                  {stat.transfersToday.toLocaleString()}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Volume</span>
                <span className="font-mono text-sm font-medium text-foreground">
                  {stat.token === 'USDC' ? '$' : ''}
                  {stat.volume}
                  {stat.volumeUnit}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </aside>
  )
}
