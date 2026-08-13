'use client'

import { useState } from 'react'
import { useTokens } from '@/hooks/use-tokens'
import { useProtocols } from '@/hooks/use-protocols'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Filters = {
  token: string | 'all'      // token symbol e.g. 'USDC'
  protocol: string | 'all'   // protocol slug e.g. 'aave-v3'
  minAmount: number
}

interface TransferFiltersProps {
  onFilterChange: (filters: Filters) => void
}

export function TransferFilters({ onFilterChange }: TransferFiltersProps) {
  const { data: tokens = [] } = useTokens()
  const { data: protocols = [] } = useProtocols()

  const [token, setToken] = useState<string | 'all'>('all')
  const [protocol, setProtocol] = useState<string | 'all'>('all')
  const [minAmount, setMinAmount] = useState('')

  const emit = (next: Partial<Filters>) => {
    const merged: Filters = {
      token: next.token ?? token,
      protocol: next.protocol ?? protocol,
      minAmount: next.minAmount ?? (parseFloat(minAmount) || 0),
    }
    onFilterChange(merged)
  }

  const handleTokenChange = (value: string) => {
    setToken(value)
    emit({ token: value })
  }

  const handleProtocolChange = (value: string) => {
    setProtocol(value)
    emit({ protocol: value })
  }

  const handleMinAmountChange = (value: string) => {
    setMinAmount(value)
    emit({ minAmount: parseFloat(value) || 0 })
  }

  const handleReset = () => {
    setToken('all')
    setProtocol('all')
    setMinAmount('')
    onFilterChange({ token: 'all', protocol: 'all', minAmount: 0 })
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
      <Select value={token} onValueChange={handleTokenChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Token" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tokens</SelectItem>
          {tokens.map((t) => (
            <SelectItem key={t.address} value={t.symbol}>
              {t.symbol}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={protocol} onValueChange={handleProtocolChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Protocol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Protocols</SelectItem>
          {protocols.map((p) => (
            <SelectItem key={p.address} value={p.slug}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Min Amount</span>
        <Input
          type="number"
          placeholder="0"
          value={minAmount}
          onChange={(e) => handleMinAmountChange(e.target.value)}
          className="w-28 font-mono"
        />
      </div>

      <Button variant="ghost" size="sm" onClick={handleReset}>
        Reset
      </Button>
    </div>
  )
}