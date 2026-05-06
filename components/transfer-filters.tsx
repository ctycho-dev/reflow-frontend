'use client'

import { useState } from 'react'
import { Token, Protocol } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TransferFiltersProps {
  onFilterChange: (filters: {
    token: Token | 'all'
    protocol: Protocol | 'all'
    minAmount: number
  }) => void
}

export function TransferFilters({ onFilterChange }: TransferFiltersProps) {
  const [token, setToken] = useState<Token | 'all'>('all')
  const [protocol, setProtocol] = useState<Protocol | 'all'>('all')
  const [minAmount, setMinAmount] = useState('')

  const handleFilterChange = (
    newToken?: Token | 'all',
    newProtocol?: Protocol | 'all',
    newMinAmount?: string
  ) => {
    const t = newToken ?? token
    const p = newProtocol ?? protocol
    const m = newMinAmount ?? minAmount

    if (newToken !== undefined) setToken(t)
    if (newProtocol !== undefined) setProtocol(p)
    if (newMinAmount !== undefined) setMinAmount(m)

    onFilterChange({
      token: t,
      protocol: p === 'all' ? 'all' : p,
      minAmount: parseFloat(m) || 0,
    })
  }

  const handleReset = () => {
    setToken('all')
    setProtocol('all')
    setMinAmount('')
    onFilterChange({ token: 'all', protocol: 'all', minAmount: 0 })
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
      <Select
        value={token}
        onValueChange={(v) => handleFilterChange(v as Token | 'all')}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Token" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tokens</SelectItem>
          <SelectItem value="USDC">USDC</SelectItem>
          <SelectItem value="weETH">weETH</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={protocol ?? 'all'}
        onValueChange={(v) =>
          handleFilterChange(undefined, v === 'all' ? 'all' : (v as Protocol))
        }
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Protocol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Protocols</SelectItem>
          <SelectItem value="Aave">Aave</SelectItem>
          <SelectItem value="Uniswap">Uniswap</SelectItem>
          <SelectItem value="Compound">Compound</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Min Amount</span>
        <Input
          type="number"
          placeholder="0"
          value={minAmount}
          onChange={(e) => handleFilterChange(undefined, undefined, e.target.value)}
          className="w-28 font-mono"
        />
      </div>

      <Button variant="ghost" size="sm" onClick={handleReset}>
        Reset
      </Button>
    </div>
  )
}
