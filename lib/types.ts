export type Token = 'USDC' | 'weETH'
export type Protocol = 'Aave' | 'Uniswap' | 'Compound' | null

export interface Transfer {
  id: string
  block: number
  token: Token
  from: string
  to: string
  amount: number
  amountUsd: number
  protocol: Protocol
  timestamp: Date
}

export interface TokenStats {
  token: Token
  transfersToday: number
  volume: number
  volumeUnit: string
}

export interface Campaign {
  id: string
  name: string
  token: Token
  ruleDescription: string
  threshold: number
  startDate: Date
  endDate: Date
  enrolled: number
  totalEligible: number
  rewardPoints: number
  status: 'Active' | 'Ended'
}

export interface LeaderboardEntry {
  rank: number
  address: string
  qualifyingVolume: number
  pointsEarned: number
}

export interface WalletData {
  address: string
  transfers: Transfer[]
  volumeByToken: Record<Token, number>
  campaignEligibility: CampaignEligibility[]
}

export interface CampaignEligibility {
  campaignId: string
  campaignName: string
  token: Token
  eligible: boolean
  currentVolume: number
  requiredVolume: number
  potentialPoints: number
}
