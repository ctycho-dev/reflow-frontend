'use client'

import { Token } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { TokenBadge } from './badges'

interface VolumeStatsProps {
  volumeByToken: Record<Token, number>
}

export function VolumeStats({ volumeByToken }: VolumeStatsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Total Volume
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TokenBadge token="USDC" />
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${volumeByToken.USDC.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total USDC volume</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TokenBadge token="weETH" />
            </div>
            <p className="text-2xl font-bold font-mono text-foreground">
              {volumeByToken.weETH.toFixed(4)} ETH
            </p>
            <p className="text-xs text-muted-foreground mt-1">Total weETH volume</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
