// lib/api/rewards.ts
import { apiFetch, assertOk } from './index'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export interface WalletClaim {
  campaignId: number
  campaignName: string
  chainId: number
  amount: string
  claimed: boolean
  claimTxHash: string | null
  rootStatus: 'pending' | 'submitting' | 'confirmed' | 'no_winners' | 'failed'
}

export interface ClaimProof {
  campaignId: number
  walletAddress: string
  amount: string
  leafIndex: number
  proof: `0x${string}`[]
  claimed: boolean
}

export const rewardsApi = {
  listClaims: async (address: string): Promise<WalletClaim[]> => {
    const res = await apiFetch(`${BASE}/api/v1/wallet/${address}/claims`)
    await assertOk(res)
    return res.json()
  },

  getProof: async (campaignId: number, address: string): Promise<ClaimProof> => {
    const res = await apiFetch(`${BASE}/api/v1/campaign/${campaignId}/proof/${address}`)
    await assertOk(res)
    return res.json()
  },
}