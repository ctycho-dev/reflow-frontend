'use client'

import { useState, useEffect, useCallback } from 'react'
import { Transfer, Token, Protocol } from '@/lib/types'
import { generateMockTransfers, getMockTokenStats } from '@/lib/mock-data'
import { TokenStatsSidebar } from '@/components/token-stats-sidebar'
import { TransferFilters } from '@/components/transfer-filters'
import { TransferTable } from '@/components/transfer-table'

export default function LiveFeedPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [filteredTransfers, setFilteredTransfers] = useState<Transfer[]>([])
  const [newTransferIds, setNewTransferIds] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState<{
    token: Token | 'all'
    protocol: Protocol | 'all'
    minAmount: number
  }>({ token: 'all', protocol: 'all', minAmount: 0 })

  const stats = getMockTokenStats()

  // Initial load
  useEffect(() => {
    const initial = generateMockTransfers(25)
    setTransfers(initial)
    setFilteredTransfers(initial)
  }, [])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newTransfer = generateMockTransfers(1)[0]
      newTransfer.timestamp = new Date()
      newTransfer.id = `tx-${Date.now()}-new`

      setTransfers((prev) => {
        const updated = [newTransfer, ...prev.slice(0, 49)]
        return updated
      })

      setNewTransferIds((prev) => {
        const updated = new Set(prev)
        updated.add(newTransfer.id)
        return updated
      })

      // Clear new status after animation
      setTimeout(() => {
        setNewTransferIds((prev) => {
          const updated = new Set(prev)
          updated.delete(newTransfer.id)
          return updated
        })
      }, 3000)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = transfers

    if (filters.token !== 'all') {
      filtered = filtered.filter((t) => t.token === filters.token)
    }

    if (filters.protocol !== 'all') {
      filtered = filtered.filter((t) => t.protocol === filters.protocol)
    }

    if (filters.minAmount > 0) {
      filtered = filtered.filter((t) => {
        const amount = t.token === 'USDC' ? t.amount : t.amountUsd
        return amount >= filters.minAmount
      })
    }

    setFilteredTransfers(filtered)
  }, [transfers, filters])

  const handleFilterChange = useCallback(
    (newFilters: { token: Token | 'all'; protocol: Protocol | 'all'; minAmount: number }) => {
      setFilters(newFilters)
    },
    []
  )

  return (
    <div className="flex gap-6 p-6">
      <TokenStatsSidebar stats={stats} />
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Live Transfer Feed</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time on-chain activity for USDC and weETH
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live
          </div>
        </div>

        <TransferFilters onFilterChange={handleFilterChange} />

        <TransferTable transfers={filteredTransfers} newTransferIds={newTransferIds} />
      </div>
    </div>
  )
}
