// components/connect-wallet-button.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAccount, useAccountEffect, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSiweLogin } from '@/hooks/use-siwe-login'
import { useCurrentWallet } from '@/hooks/use-current-wallet'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const MetaMaskIcon = () => (
  <svg viewBox="0 0 35 33" className="h-4 w-4" fill="currentColor">
    <path d="M32.9582 1L19.8241 10.7183L22.2665 4.99099L32.9582 1Z" />
    <path d="M2.66296 1L15.6852 10.809L13.3541 4.99098L2.66296 1Z" />
    <path d="M28.2295 23.5334L24.7346 29.1333L32.2865 31.2L34.4164 23.6334L28.2295 23.5334Z" />
    <path d="M1.21582 23.6334L3.33543 31.2L10.8873 29.1333L7.39241 23.5334L1.21582 23.6334Z" />
    <path d="M10.4706 14.5149L8.39307 17.7082L15.8241 18.0483L15.5635 10.0666L10.4706 14.5149Z" />
    <path d="M25.1505 14.5149L19.9876 9.97656L19.8241 18.0483L27.2282 17.7082L25.1505 14.5149Z" />
    <path d="M10.8873 29.1333L15.3623 27.0066L11.4823 23.6833L10.8873 29.1333Z" />
    <path d="M20.2588 27.0066L24.7346 29.1333L24.1388 23.6833L20.2588 27.0066Z" />
  </svg>
)

function useInjectedAvailable(): boolean {
  const [available, setAvailable] = useState(false)
  useEffect(() => {
    setAvailable(
      typeof window !== 'undefined' &&
      Boolean((window as { ethereum?: unknown }).ethereum)
    )
  }, [])
  return available
}

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { mutate: connect, connectors } = useConnect()
  const { mutate: disconnect } = useDisconnect()
  const queryClient = useQueryClient()
  const injectedAvailable = useInjectedAvailable()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // On wallet disconnect, also clear the backend session.
  // Fires regardless of whether the user clicked "Disconnect" in our UI
  // or disconnected from inside MetaMask directly.
  useAccountEffect({
    onDisconnect() {
      authApi.logout().finally(() =>
        queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      )
    },
  })

  if (!mounted) {
    return (
      <Button variant="outline" className="gap-2 font-mono text-sm">
        <MetaMaskIcon />
        Connect Wallet
      </Button>
    )
  }

  // State 1a: no wallet installed in browser
  if (!injectedAvailable) {
    return (
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => window.open('https://metamask.io/download/', '_blank')}
      >
        <MetaMaskIcon />
        Install MetaMask
      </Button>
    )
  }

  // State 1b: wallet installed but not connected
  if (!isConnected || !address) {
    return (
      <Button
        onClick={() => connect({ connector: connectors[0] })}
        className="gap-2"
      >
        <MetaMaskIcon />
        Connect Wallet
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-mono text-sm">
          <div className="mr-2 h-2 w-2 rounded-full bg-success" />
          {truncateAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => disconnect()}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}