import { useQuery } from '@tanstack/react-query'
import { campaignsApi } from '@/lib/api/campaigns'
import { CampaignDetail } from '@/lib/types'
import { mapCampaignDetail } from '@/lib/mappers'

const STALE_TIME_MS = 10_000

export function useCampaignDetail(campaignId: number | undefined) {
  return useQuery<CampaignDetail>({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsApi.get(campaignId!).then(mapCampaignDetail),
    enabled: campaignId !== undefined,
    staleTime: STALE_TIME_MS,
  })
}