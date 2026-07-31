// lib/types/stats.ts

export interface ApiProtocolTokenStats {
  token: string
  name: string
  symbol: string
  decimals: number
  color: string
  transfer_count: number
  total_volume_raw: string
}

export interface ApiProtocolStats {
  protocol: string
  protocol_name: string
  protocol_color: string
  tokens: ApiProtocolTokenStats[]
}

export interface TokenStats {
  id: string
  protocol: {
    slug: string
    name: string
    color: string
  }
  token: {
    address: string
    symbol: string
    name: string
    decimals: number
    color: string
  }
  transferCount: number
  totalVolumeRaw: string
  totalVolumeDecimal: number
}