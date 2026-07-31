// lib/api/wallets.ts
import { apiFetch, assertOk } from './index'
import { WalletEligibility, Enrollment } from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const walletsApi = {
  eligibility(address: string, chainId: number): Promise<WalletEligibility> {
    const url = `${API_BASE}/api/v1/wallet/${address}/eligibility?chainId=${chainId}`
    return apiFetch(url)
      .then(assertOk)
      .then((r): Promise<WalletEligibility> => r.json())
  },
}