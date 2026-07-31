// hooks/use-tokens.ts
import { useQuery } from '@tanstack/react-query'
import { tokensApi } from '@/lib/api/tokens'
import { CHAIN_ID } from '@/lib/contracts'

export function useTokens() {
  return useQuery({
    queryKey: ['tokens', CHAIN_ID],
    queryFn: () => tokensApi.list(CHAIN_ID),
    staleTime: 5 * 60_000,
  })
}