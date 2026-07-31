// hooks/use-current-wallet.ts
import { useQuery } from '@tanstack/react-query'
import { authApi, AuthenticatedWallet } from '@/lib/api/auth'

export function useCurrentWallet() {
  return useQuery<AuthenticatedWallet | null>({
    queryKey: ['auth', 'me'],
    queryFn: authApi.me,
    staleTime: 30_000,
  })
}