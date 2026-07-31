// hooks/use-stats.ts
import { useQuery } from '@tanstack/react-query'
import { statsApi } from '@/lib/api/stats'
import { TokenStats } from '@/lib/types'
import { mapStats } from '@/lib/mappers'

const REFRESH_INTERVAL_MS = 60_000

export function useStats() {
  return useQuery<TokenStats[]>({
    queryKey: ['stats'],
    queryFn: () => statsApi.get().then(mapStats),
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 30_000,
  })
}