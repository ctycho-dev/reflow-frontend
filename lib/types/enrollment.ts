// lib/types/enrollment.ts
export interface Enrollment {
  id: number
  walletChainId: number
  walletAddress: string
  campaignId: number
  totalVolume: string         // serialized as plain integer string ("0", "45000000000")
  qualifiedAt: string | null  // ISO datetime or null
  createdAt: string           // ISO datetime
}