'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { WalletData } from '@/lib/types'
import { getMockWalletData } from '@/lib/mock-data'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TransferTable } from '@/components/transfer-table'
import { VolumeStats } from '@/components/volume-stats'
import { EligibilityCards } from '@/components/eligibility-cards'

export default function WalletExplorerPage() {
  const { address: connectedAddress } = useAccount()
  const [searchAddress, setSearchAddress] = useState('')
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Auto-load connected wallet data
  useEffect(() => {
    if (connectedAddress && !walletData) {
      loadWalletData(connectedAddress)
    }
  }, [connectedAddress, walletData])

  const loadWalletData = (address: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setWalletData(getMockWalletData(address))
      setIsLoading(false)
    }, 500)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      loadWalletData(searchAddress)
    }
  }

  const handleUseConnected = () => {
    if (connectedAddress) {
      setSearchAddress(connectedAddress)
      loadWalletData(connectedAddress)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Wallet Explorer</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View transfer history and campaign eligibility for any wallet
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter Ethereum address (0x...)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="font-mono pr-24"
          />
          {connectedAddress && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-xs"
              onClick={handleUseConnected}
            >
              Use Connected
            </Button>
          )}
        </div>
        <Button type="submit" disabled={!searchAddress.match(/^0x[a-fA-F0-9]{40}$/)}>
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {walletData && !isLoading && (
        <div className="space-y-8">
          <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M1 4.75C1 3.784 1.784 3 2.75 3h14.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0117.25 17H2.75A1.75 1.75 0 011 15.25V4.75zm3 1.5a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4zm0 3a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Viewing wallet</p>
              <p className="font-mono text-foreground">{walletData.address}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <VolumeStats volumeByToken={walletData.volumeByToken} />

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Transfer History ({walletData.transfers.length})
                </h3>
                <TransferTable transfers={walletData.transfers} />
              </div>
            </div>

            <div>
              <EligibilityCards eligibility={walletData.campaignEligibility} />
            </div>
          </div>
        </div>
      )}

      {!walletData && !isLoading && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-secondary mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            Search for a wallet
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enter any Ethereum address to view its transfer history, volume stats, and
            campaign eligibility.
            {connectedAddress && ' Or use your connected wallet.'}
          </p>
        </div>
      )}
    </div>
  )
}
