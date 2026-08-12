// lib/mappers/campaigns.ts

import {
  ApiCampaign,
  CampaignListDTO,
  Campaign,
  ApiCampaignDetail,
  CampaignDetail,
} from '@/lib/types'

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

export function mapCampaignDetail(c: ApiCampaignDetail): CampaignDetail {
  return {
    ...mapCampaign(c),
    creatorWallet: c.creatorWallet,
    createTxHash: c.createTxHash,
    fundedTotal: c.fundedTotal !== null ? BigInt(c.fundedTotal) : null,
    isFunded: c.isFunded,
  }
}