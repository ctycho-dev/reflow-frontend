// lib/types/transfers.ts
import { ApiProtocol, Protocol } from "@/lib/types"
import { ApiToken, Token } from "@/lib/types"


export interface ApiCounterparty {
  address: string
  protocol?: ApiProtocol | null
  label?: string | null
}

export interface ApiTransfer {
  chainId: number
  txHash: string
  logIndex: number
  blockNumber: number
  blockTimestamp: string
  fromAddress: string
  toAddress: string
  amountRaw: string
  token: ApiToken
  counterparty?: ApiCounterparty | null
}


export interface Transfer {
  id: string
  chainId: number
  txHash: string
  logIndex: number
  blockNumber: number
  timestamp: Date

  from: { address: string }
  to: { address: string }

  token: Token

  amountRaw: string
  amountDecimal: number

  counterparty?: {
    address: string
    label?: string | null
    protocol?: Protocol | null
  } | null
}