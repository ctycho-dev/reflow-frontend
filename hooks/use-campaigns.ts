// hooks/use-campaigns.ts
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { campaignsApi } from '@/lib/api/campaigns'
import { Campaign } from '@/lib/types'
import { mapCampaigns } from '@/lib/mappers'

const REFRESH_INTERVAL_MS = 60_000

export function useCampaigns(chainId: number) {
  const queryClient = useQueryClient()

  const query = useQuery<Campaign[]>({
    queryKey: ['campaigns', chainId],
    queryFn: () => campaignsApi.list(chainId).then(mapCampaigns),
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 30_000,
  })

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['campaigns', chainId] })

  return { ...query, refresh }
}