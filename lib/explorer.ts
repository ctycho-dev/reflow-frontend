// lib/explorer.ts
const EXPLORERS: Record<number, string> = {
  1: 'https://etherscan.io',
  8453: 'https://basescan.org',
  84532: 'https://sepolia.basescan.org',
  // 10: 'https://optimistic.etherscan.io',
}

export function explorerTokenUrl(chainId: number, address: string): string | null {
  const base = EXPLORERS[chainId]
  return base ? `${base}/token/${address}` : null
}

export function explorerAddressUrl(chainId: number, address: string): string | null {
  const base = EXPLORERS[chainId]
  return base ? `${base}/address/${address}` : null
}

export function explorerTxUrl(chainId: number, txHash: string): string | null {
  const base = EXPLORERS[chainId]
  return base ? `${base}/tx/${txHash}` : null
}