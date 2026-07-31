// hooks/use-protocols.ts
import { useQuery } from '@tanstack/react-query'
import { protocolsApi } from '@/lib/api/protocols'
import { CHAIN_ID } from '@/lib/contracts'

export function useProtocols() {
  return useQuery({
    queryKey: ['protocols', CHAIN_ID],
    queryFn: () => protocolsApi.list(CHAIN_ID),
    staleTime: 5 * 60_000,
  })
}