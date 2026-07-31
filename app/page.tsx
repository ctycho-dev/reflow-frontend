'use client'

import { useState, useCallback } from 'react'
import { useStats } from '@/hooks/use-stats'
import { useTransfers } from '@/hooks/use-transfers'
import { TokenStatsSidebar } from '@/components/token-stats-sidebar'
import { TransferFilters } from '@/app/_components/transfer-filters'
import { TransferTable } from '@/app/_components/transfer-table'

type Filters = {
  token: string | 'all'
  protocol: string | 'all'
  minAmount: number
}

export default function LiveFeedPage() {
  const { data: stats = [] } = useStats()
  const { transfers, newTransferIds, connected, error } = useTransfers()

  const [filters, setFilters] = useState<Filters>({
    token: 'all',
    protocol: 'all',
    minAmount: 0,
  })

  const filteredTransfers = transfers.filter((t) => {
    if (filters.token !== 'all' && t.token.symbol !== filters.token) return false
    if (filters.protocol !== 'all' && t.counterparty?.protocol?.slug !== filters.protocol) return false
    if (filters.minAmount > 0 && t.amountDecimal < filters.minAmount) return false
    return true
  })

  return (
    <div className="flex gap-6 p-6">
      <TokenStatsSidebar stats={stats} />

      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Live Transfer Feed</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time on-chain activity for tracked ERC-20 transfers
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
            {connected ? 'Live' : 'Reconnecting…'}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <TransferFilters onFilterChange={setFilters} />

        <TransferTable transfers={filteredTransfers} newTransferIds={newTransferIds} />
      </div>
    </div>
  )
}