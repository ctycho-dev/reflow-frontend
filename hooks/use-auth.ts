import { useQuery } from '@tanstack/react-query'
import { authApi, AuthenticatedWallet } from '@/lib/api/auth'

const STALE_TIME_MS = 60_000

/**
 * Current SIWE session, or null when not signed in.
 * authApi.me() already maps 401 → null, so "logged out" is data, not an error.
 */
export function useAuthMe() {
  return useQuery<AuthenticatedWallet | null>({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    staleTime: STALE_TIME_MS,
    retry: false,
  })
}