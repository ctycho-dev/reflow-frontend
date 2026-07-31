// lib/api/stats.ts
import { apiFetch, assertOk } from './index'
import { ApiProtocolStats } from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const statsApi = {
  get(): Promise<ApiProtocolStats[]> {
    return apiFetch(`${API_BASE}/api/v1/stats`)
      .then(assertOk)
      .then((r): Promise<ApiProtocolStats[]> => r.json())
  },
}