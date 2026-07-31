// lib/api/tokens.ts
import { apiFetch, assertOk } from './index'
import { Token } from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const tokensApi = {
  list(chainId: number): Promise<Token[]> {
    return apiFetch(`${API_BASE}/api/v1/token?chainId=${chainId}`)
      .then(assertOk)
      .then((r): Promise<Token[]> => r.json())
  },
}