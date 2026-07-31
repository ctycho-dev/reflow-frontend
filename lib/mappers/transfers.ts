import { ApiTransfer, Transfer } from '@/lib/types'

export function mapTransfer(dto: ApiTransfer): Transfer {
  return {
    id: `${dto.txHash}:${dto.logIndex}`,
    chainId: dto.chainId,
    txHash: dto.txHash,
    logIndex: dto.logIndex,
    blockNumber: dto.blockNumber,
    timestamp: new Date(dto.blockTimestamp),

    from: {
      address: dto.fromAddress,
    },

    to: {
      address: dto.toAddress,
    },

    token: {
      address: dto.token.address,
      symbol: dto.token.symbol,
      name: dto.token.name,
      decimals: dto.token.decimals,
      color: dto.token.color ?? null,
    },

    amountRaw: dto.amountRaw,
    amountDecimal: Number(BigInt(dto.amountRaw)) / 10 ** dto.token.decimals,

    counterparty: dto.counterparty
      ? {
          address: dto.counterparty.address,
          label: dto.counterparty.label ?? null,
          protocol: dto.counterparty.protocol
            ? {
                slug: dto.counterparty.protocol.slug,
                name: dto.counterparty.protocol.name,
                color: dto.counterparty.protocol.color ?? null,
              }
            : null,
        }
      : null,
  }
}
