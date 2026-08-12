// hooks/use-faucet.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api'
import { faucetApi, FaucetStatus } from '@/lib/api/faucet'

export function useFaucetStatus(enabled: boolean) {
  return useQuery<FaucetStatus>({
    queryKey: ['faucet', 'status'],
    queryFn: () => faucetApi.status(),
    enabled,
    staleTime: 30_000,
  })
}

export function useFaucetClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => faucetApi.claim(),
    onSuccess: () => {
      toast.success('100 REFLOW on the way', {
        description: 'The mint lands within a minute.',
      })
      queryClient.invalidateQueries({ queryKey: ['faucet', 'status'] })
    },
    onError: (err) => {
      toast.error('Could not claim', {
        description: err instanceof ApiError ? err.detail : err.message,
      })
      queryClient.invalidateQueries({ queryKey: ['faucet', 'status'] })
    },
  })
}