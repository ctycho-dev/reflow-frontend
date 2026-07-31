// lib/types/campaigns.ts

export interface ApiCampaign {
  id: number
  name: string
  description: string
  chainId: number
  tokenAddress: string
  targetContractAddress: string | null
  minTotalVolume: string
  rewardAmount: string
  durationDays: number
  startsAt: string
  endsAt: string
  maxRecipients: number
  enrolledCount: number
  createdAt: string
}

// UI format — only diverges where the wire format is awkward to consume
export interface Campaign {
  id: number
  name: string
  description: string
  chainId: number
  tokenAddress: string
  targetContractAddress: string | null
  minTotalVolume: bigint      // parsed
  rewardAmount: bigint
  durationDays: number
  startsAt: Date              // parsed
  endsAt: Date
  maxRecipients: number
  enrolledCount: number
  createdAt: Date
  // derived
  isFull: boolean
  spotsRemaining: number
}

export type CampaignListDTO = ApiCampaign[]

export interface ApiLeaderboardEntry {
  rank: number
  walletAddress: string
  totalVolume: string
  qualified: boolean
}

export type LeaderboardEntry = ApiLeaderboardEntry


export interface CampaignEligibility {
  campaign: Campaign
  enrolled: boolean
  qualified: boolean
  totalVolume: string    // wei-scale bigint as string, like LeaderboardEntry.totalVolume
  progress: number       // 0–1 (or 0–100, depending on backend — confirm)
}

export interface WalletEligibility {
  walletAddress: string
  chainId: number
  campaigns: CampaignEligibility[]
}