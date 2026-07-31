// lib/api/protocols.ts
import { apiFetch, assertOk } from './index'
import { Protocol } from '@/lib/types'


const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const protocolsApi = {
  list(chainId: number): Promise<Protocol[]> {
    return apiFetch(`${API_BASE}/api/v1/contract?chainId=${chainId}`)
      .then(assertOk)
      .then((r): Promise<Protocol[]> => r.json())
  },
}