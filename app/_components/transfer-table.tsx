
'use client'

import { Transfer } from '@/lib/types'
import { TokenBadge, ProtocolTag } from '../../components/badges'
import { cn } from '@/lib/utils'

interface TransferTableProps {
  transfers: Transfer[]
  newTransferIds?: Set<string>
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  return `${hours}h ago`
}

function formatAmount(amount: number, tokenSymbol: string) {
  if (tokenSymbol === 'USDC') {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })
}

export function TransferTable({
  transfers,
  newTransferIds = new Set(),
}: TransferTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-secondary/30">
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Block
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Token
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              From
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              To
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Protocol
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Time
            </th>
          </tr>
        </thead>

        <tbody>
          {transfers.map((transfer) => (
            <tr
              key={transfer.id}
              className={cn(
                'border-b border-border/50 hover:bg-secondary/20 transition-colors',
                newTransferIds.has(transfer.id) && 'animate-slide-in bg-success/5'
              )}
            >
              <td className="px-4 py-3">
                <span className="font-mono text-sm text-muted-foreground">
                  {transfer.blockNumber.toLocaleString('en-US')}
                </span>
              </td>

              <td className="px-4 py-3">
                <TokenBadge token={transfer.token} />
              </td>

              <td className="px-4 py-3">
                <span className="font-mono text-sm text-foreground">
                  {truncateAddress(transfer.from.address)}
                </span>
              </td>

              <td className="px-4 py-3">
                <span className="font-mono text-sm text-foreground">
                  {truncateAddress(transfer.to.address)}
                </span>
              </td>

              <td className="px-4 py-3 text-right">
                <div className="flex flex-col items-end">
                  <span className="font-mono text-sm font-medium text-foreground">
                    {formatAmount(transfer.amountDecimal, transfer.token.symbol)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {transfer.token.symbol}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3">
                {transfer.counterparty?.protocol ? (
                  <ProtocolTag protocol={{
                    address: transfer.counterparty.protocol.address,
                    slug: transfer.counterparty.protocol.slug,
                    name: transfer.counterparty.protocol.name,
                    color: transfer.counterparty.protocol.color,
                    label: transfer.counterparty.protocol.label,
                  }} />
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </td>

              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {newTransferIds.has(transfer.id) && (
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse-green" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatTime(transfer.timestamp)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}