// app/wallet/page.tsx
'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useEligibility } from '@/hooks/use-eligibility'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EligibilityCards } from './_components/eligibility-cards'
import { WalletRewards } from './_components/wallet-rewards'
import { CHAIN_ID } from '@/lib/contracts'


function isValidAddress(s: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(s)
}

export default function WalletExplorerPage() {
  const { address: connectedAddress } = useAccount()
  const [input, setInput] = useState('')
  const [activeAddress, setActiveAddress] = useState<string | undefined>(undefined)

  const { data: eligibility, isLoading } = useEligibility(activeAddress, CHAIN_ID)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValidAddress(input)) setActiveAddress(input.toLowerCase())
  }

  const useConnected = () => {
    if (connectedAddress) {
      setInput(connectedAddress)
      setActiveAddress(connectedAddress.toLowerCase())
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Wallet Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Campaign eligibility for any wallet
        </p>
      </div>

      <form onSubmit={submit} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter Ethereum address (0x...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="font-mono pr-32"
          />
          {connectedAddress && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-xs"
              onClick={useConnected}
            >
              Use Connected
            </Button>
          )}
        </div>
        <Button type="submit" disabled={!isValidAddress(input)}>
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {eligibility && !isLoading && (
        <div className="space-y-6">
          <WalletRewards address={activeAddress!} />
          <EligibilityCards eligibility={eligibility.campaigns} />
        </div>
      )}

      {!activeAddress && !isLoading && (
        <div className="text-center py-20 text-sm text-muted-foreground">
          Search for a wallet or use your connected wallet to view campaign eligibility.
        </div>
      )}
    </div>
  )
}