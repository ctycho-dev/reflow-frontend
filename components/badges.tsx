import { cn } from '@/lib/utils'
import type { Protocol, Token, CampaignStatus } from '@/lib/types'

interface TokenBadgeProps {
  token: Token
  className?: string
}

export function TokenBadge({ token, className }: TokenBadgeProps) {
  const symbol = token.symbol
  const color = token.color ?? 'currentColor'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium',
        className
      )}
      style={{
        backgroundColor: token.color ? `${token.color}20` : undefined,
        color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {symbol}
    </span>
  )
}

interface ProtocolTagProps {
  protocol?: Protocol | null
  className?: string
}

export function ProtocolTag({ protocol, className }: ProtocolTagProps) {
  if (!protocol) return null

  const color = protocol.color ?? 'currentColor'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide',
        className
      )}
      style={{
        backgroundColor: protocol.color ? `${protocol.color}20` : undefined,
        color,
      }}
    >
      {protocol.name}
    </span>
  )
}

const STATUS_BADGE: Record <
  CampaignStatus,
  { label: string; className: string; pulse?: boolean }
> = {
  draft:    { label: 'Draft',            className: 'bg-muted text-muted-foreground' },
  created:  { label: 'Awaiting funding', className: 'bg-warning/20 text-warning' },
  funded:   { label: 'Upcoming',         className: 'bg-primary/20 text-primary' },
  live:     { label: 'Active',           className: 'bg-success/20 text-success', pulse: true },
  ended:    { label: 'Ended',            className: 'bg-muted text-muted-foreground' },
  settling: { label: 'Settling',         className: 'bg-muted text-muted-foreground' },
  settled:  { label: 'Settled',          className: 'bg-muted text-muted-foreground' },
}

interface StatusBadgeProps {
  status: CampaignStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_BADGE[status] ?? {
    label: status,
    className: 'bg-muted text-muted-foreground',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        cfg.className,
        className,
      )}
    >
      {cfg.pulse && (
        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
      )}
      {cfg.label}
    </span>
  )
}


