'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { cookieStorage, createStorage } from 'wagmi'
import { mainnet, baseSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { ThemeProvider } from 'next-themes'
import { useState } from 'react'


const config = createConfig({
  chains: [mainnet, baseSepolia],
  connectors: [
    injected({
      target: 'metaMask',  // pin to MetaMask specifically, ignore other injected providers
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={['light', 'dark']}
      disableTransitionOnChange
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  )
}
