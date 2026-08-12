import { apiFetch, assertOk } from './index'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export interface FaucetClaimResponse {
  status: string
  amount: string
}

export interface FaucetStatus {
  retryAfterSeconds: number
  canClaim: boolean
}

export const faucetApi = {
  claim(): Promise<FaucetClaimResponse> {
    return apiFetch(`${API_BASE}/api/v1/faucet/claim`, { method: 'POST' })
      .then(assertOk)
      .then((r): Promise<FaucetClaimResponse> => r.json())
  },
  status(): Promise<FaucetStatus> {
    return apiFetch(`${API_BASE}/api/v1/faucet/status`)
      .then(assertOk)
      .then((r): Promise<FaucetStatus> => r.json())
  },
}
