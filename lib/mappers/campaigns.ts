// lib/mappers/campaigns.ts


import { ApiCampaign, CampaignListDTO, Campaign } from "@/lib/types"

export function mapCampaign(c: ApiCampaign): Campaign {
  return {
    ...c,
    minTotalVolume: BigInt(c.minTotalVolume),
    rewardAmount: BigInt(c.rewardAmount),
    startsAt: new Date(c.startsAt),
    endsAt: new Date(c.endsAt),
    createdAt: new Date(c.createdAt),
    isFull: c.enrolledCount >= c.maxRecipients,
    spotsRemaining: c.maxRecipients - c.enrolledCount,
  }
}

export const mapCampaigns = (data: CampaignListDTO): Campaign[] =>
  data.map(mapCampaign)