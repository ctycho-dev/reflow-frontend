// 'use client'

// import { TokenStats } from '@/lib/types'
// import { TokenBadge } from './badges'
// import { Card, CardContent } from '@/components/ui/card'

// interface TokenStatsSidebarProps {
//   stats: TokenStats[]
// }

// export function TokenStatsSidebar({ stats }: TokenStatsSidebarProps) {
//   return (
//     <aside className="w-64 shrink-0 space-y-4">
//       <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
//         Token Stats
//       </h2>
//       {stats.map((stat) => (
//         <Card key={stat.token} className="bg-card border-border">
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between mb-3">
//               <TokenBadge token={stat.token} />
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-baseline justify-between">
//                 <span className="text-xs text-muted-foreground">Transfers today</span>
//                 <span className="font-mono text-sm font-medium text-foreground">
//                   {stat.transfersToday.toLocaleString('en-US')}
//                 </span>
//               </div>
//               <div className="flex items-baseline justify-between">
//                 <span className="text-xs text-muted-foreground">Volume</span>
//                 <span className="font-mono text-sm font-medium text-foreground">
//                   {stat.token === 'USDC' ? '$' : ''}
//                   {stat.volume}
//                   {stat.volumeUnit}
//                 </span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </aside>
//   )
// }


'use client'

import { TokenStats } from '@/lib/types'
import { TokenBadge, ProtocolTag } from './badges'
import { Card, CardContent } from '@/components/ui/card'

interface TokenStatsSidebarProps {
  stats: TokenStats[]
}

function formatVolume(value: number, symbol: string) {
  const prefix = symbol === 'USDC' ? '$' : ''
  const suffix = symbol !== 'USDC' ? ` ${symbol}` : ''

  let formatted: string
  if (value >= 1_000_000_000) {
    formatted = `${(value / 1_000_000_000).toFixed(1)}B`
  } else if (value >= 1_000_000) {
    formatted = `${(value / 1_000_000).toFixed(1)}M`
  } else if (value >= 1_000) {
    formatted = `${(value / 1_000).toFixed(1)}K`
  } else {
    formatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return `${prefix}${formatted}${suffix}`
}

export function TokenStatsSidebar({ stats }: TokenStatsSidebarProps) {
  return (
    <aside className="w-64 shrink-0 space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Token Stats — last 24 hours
      </h2>

      {stats.map((stat) => (
        <Card key={stat.id} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3 gap-2">
              <TokenBadge token={stat.token} />
              <ProtocolTag protocol={{ slug: stat.protocol.slug, name: stat.protocol.name, color: stat.protocol.color }} />
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Transfers
                </span>
                <span className="font-mono text-sm font-medium text-foreground">
                  {stat.transferCount.toLocaleString('en-US')}
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Volume
                </span>
                <span className="font-mono text-sm font-medium text-foreground text-right">
                  {formatVolume(stat.totalVolumeDecimal, stat.token.symbol)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </aside>
  )
}