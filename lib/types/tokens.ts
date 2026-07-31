// lib/types/tokens.ts
export interface Token {
  address: string
  chainId: number
  symbol: string
  name: string
  decimals: number
  color: string
  isActive: boolean
}