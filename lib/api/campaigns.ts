// lib/api/campaigns.ts
import { apiFetch, assertOk } from './index'
import {
  CampaignListDTO,
  ApiCampaign,
  LeaderboardEntry,
  Enrollment,
  ApiCampaignDetail
} from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface CampaignDraftBody {
  name: string
  description: string | null
  chainId: number
  tokenAddress: string
  targetContractAddress: string   // required now
  minTotalVolume: string
  rewardAmount: string
  startsAt: string
  endsAt: string
  maxRecipients: number
}

interface LinkBody {
  onchainId: number
  txHash: string
}

export const campaignsApi = {
  list(chainId: number): Promise<CampaignListDTO> {
    return apiFetch(`${API_BASE}/api/v1/campaign?chainId=${chainId}`)
      .then(assertOk)
      .then((r): Promise<CampaignListDTO> => r.json())
  },

  get(campaignId: number): Promise<ApiCampaignDetail> {
    return apiFetch(`${API_BASE}/api/v1/campaign/${campaignId}`)
      .then(assertOk)
      .then((r): Promise<ApiCampaignDetail> => r.json())
  },

  createDraft(body: CampaignDraftBody): Promise<ApiCampaign> {
    return apiFetch(`${API_BASE}/api/v1/campaign/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(assertOk)
      .then((r): Promise<ApiCampaign> => r.json())
  },

  link(campaignId: number, body: LinkBody): Promise<ApiCampaign> {
    return apiFetch(`${API_BASE}/api/v1/campaign/${campaignId}/link`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(assertOk)
      .then((r): Promise<ApiCampaign> => r.json())
  },

  reconcile(): Promise<ApiCampaign | null> {
    return apiFetch(`${API_BASE}/api/v1/campaign/reconcile`, { method: 'POST' })
      .then(assertOk)
      .then((r): Promise<ApiCampaign | null> => r.json())
  },

  deleteDraft(campaignId: number): Promise<void> {
    return apiFetch(`${API_BASE}/api/v1/campaign/${campaignId}`, { method: 'DELETE' })
      .then(assertOk)
      .then(() => undefined)
  },

  leaderboard(campaignId: number, limit = 100): Promise<LeaderboardEntry[]> {
    return apiFetch(`${API_BASE}/api/v1/campaign/${campaignId}/leaderboard?limit=${limit}`)
      .then(assertOk)
      .then((r): Promise<LeaderboardEntry[]> => r.json())
  },

  enroll(campaignId: number): Promise<Enrollment> {
    return apiFetch(`${API_BASE}/api/v1/campaign/${campaignId}/enroll`, { method: 'POST' })
      .then(assertOk)
      .then((r): Promise<Enrollment> => r.json())
  },
}