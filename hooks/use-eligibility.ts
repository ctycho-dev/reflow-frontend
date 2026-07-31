// hooks/use-eligibility.ts
import { useQuery } from '@tanstack/react-query'
import { walletsApi } from '@/lib/api/wallets'
import { WalletEligibility } from '@/lib/types'

const REFRESH_INTERVAL_MS = 60_000

export function useEligibility(
  address: string | undefined,
  chainId: number,
) {
  return useQuery<WalletEligibility>({
    queryKey: ['eligibility', address, chainId],
    queryFn: () => walletsApi.eligibility(address!, chainId),
    enabled: !!address,
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 30_000,
  })
}