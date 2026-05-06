import { cn } from '@/lib/utils'
import { Token, Protocol } from '@/lib/types'

interface TokenBadgeProps {
  token: Token
  className?: string
}

export function TokenBadge({ token, className }: TokenBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        token === 'USDC' && 'bg-usdc/20 text-usdc',
        token === 'weETH' && 'bg-weeth/20 text-weeth',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          token === 'USDC' && 'bg-usdc',
          token === 'weETH' && 'bg-weeth'
        )}
      />
      {token}
    </span>
  )
}

interface ProtocolTagProps {
  protocol: Protocol
  className?: string
}

export function ProtocolTag({ protocol, className }: ProtocolTagProps) {
  if (!protocol) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
        protocol === 'Aave' && 'bg-aave/20 text-aave',
        protocol === 'Uniswap' && 'bg-uniswap/20 text-uniswap',
        protocol === 'Compound' && 'bg-compound/20 text-compound',
        className
      )}
    >
      {protocol}
    </span>
  )
}

interface StatusBadgeProps {
  status: 'Active' | 'Ended'
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        status === 'Active' && 'bg-success/20 text-success',
        status === 'Ended' && 'bg-muted text-muted-foreground',
        className
      )}
    >
      {status === 'Active' && (
        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
      )}
      {status}
    </span>
  )
}
