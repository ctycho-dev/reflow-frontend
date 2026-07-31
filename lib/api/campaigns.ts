// lib/api/campaigns.ts
import { apiFetch, assertOk } from './index'
import {
  CampaignListDTO,
  ApiCampaign,
  LeaderboardEntry,
  Enrollment
} from '@/lib/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'


interface CreateCampaignBody {
  name: string
  description: string | null
  chainId: number
  tokenAddress: string
  targetContractAddress: string | null
  minTotalVolume: string
  rewardAmount: string
  durationDays: number
  startsAt: string
  maxRecipients: number
}


export const campaignsApi = {
  list(chainId: number): Promise<CampaignListDTO> {
    return apiFetch(`${API_BASE}/api/v1/campaign?chainId=${chainId}`)
      .then(assertOk)
      .then((r): Promise<CampaignListDTO> => r.json())
  },

  create(body: CreateCampaignBody): Promise<ApiCampaign> {
    return apiFetch(`${API_BASE}/api/v1/campaign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(assertOk)
      .then((r): Promise<ApiCampaign> => r.json())
  },

  leaderboard(campaignId: number, limit = 100): Promise<LeaderboardEntry[]> {
    const url = `${API_BASE}/api/v1/campaign/${campaignId}/leaderboard?limit=${limit}`
    return apiFetch(url)
      .then(assertOk)
      .then((r): Promise<LeaderboardEntry[]> => r.json())
  },

  enroll(campaignId: number): Promise<Enrollment> {
    return apiFetch(`${API_BASE}/api/v1/campaign/${campaignId}/enroll`, {
      method: 'POST',
    })
      .then(assertOk)
      .then((r): Promise<Enrollment> => r.json())
  },

  
}