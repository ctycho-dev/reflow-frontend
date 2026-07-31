// hooks/use-leaderboard.ts
import { useQuery } from '@tanstack/react-query'
import { campaignsApi } from '@/lib/api/campaigns'
import { LeaderboardEntry } from '@/lib/types'

const REFRESH_INTERVAL_MS = 60_000

export function useLeaderboard(campaignId: number | null | undefined) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', campaignId],
    queryFn: () => campaignsApi.leaderboard(campaignId!),
    enabled: campaignId != null,
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 30_000,
  })
}