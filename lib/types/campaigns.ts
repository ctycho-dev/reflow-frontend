// lib/types/campaigns.ts

export type CampaignStatus =
  | 'draft'
  | 'created'
  | 'funded'
  | 'live'
  | 'ended'
  | 'settling'
  | 'settled'

export interface ApiCampaign {
  id: number
  name: string
  description: string | null
  chainId: number
  tokenAddress: string
  targetContractAddress: string | null
  minTotalVolume: string
  rewardAmount: string
  startsAt: string
  endsAt: string
  maxRecipients: number
  enrolledCount: number
  status: CampaignStatus
  onchainId: number | null
  createdAt: string
}

// UI format — only diverges where the wire format is awkward to consume
export interface Campaign {
  id: number
  name: string
  description: string | null
  chainId: number
  tokenAddress: string
  targetContractAddress: string | null
  minTotalVolume: bigint      // parsed
  rewardAmount: bigint
  startsAt: Date              // parsed
  endsAt: Date
  maxRecipients: number
  enrolledCount: number
  status: CampaignStatus
  onchainId: number | null
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

export interface ApiCampaignDetail extends ApiCampaign {
  creatorWallet: string | null
  createTxHash: string | null   // 0x-prefixed, ready for explorer links
  fundedTotal: string | null    // wei string; null until linked/indexed
  isFunded: boolean
}

export interface CampaignDetail extends Campaign {
  onchainData: bigint | null
  creatorWallet: string | null
  createTxHash: string | null
  fundedTotal: bigint | null    // parsed, matches rewardAmount convention
  isFunded: boolean
}