import { ApiProtocolStats, TokenStats } from '@/lib/types'

export function mapStats(data: ApiProtocolStats[]): TokenStats[] {
  return data.flatMap((group) =>
    group.tokens.map((token) => ({
      id: `${group.protocol}:${token.token}`,
      protocol: {
        slug: group.protocol,
        name: group.protocol_name,
        color: group.protocol_color, 
      },
      token: {
        address: token.token,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        color: token.color,          
      },
      transferCount: token.transfer_count,
      totalVolumeRaw: token.total_volume_raw,
      totalVolumeDecimal:
        Number(BigInt(token.total_volume_raw)) / 10 ** token.decimals,
    }))
  )
}