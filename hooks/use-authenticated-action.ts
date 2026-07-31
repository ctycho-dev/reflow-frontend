// hooks/use-authenticated-action.ts
import { useCallback } from 'react'
import { useSiweLogin } from './use-siwe-login'
import { useCurrentWallet } from './use-current-wallet'

/**
 * Wraps an async action so that the user is signed in (SIWE) before it runs.
 * - If already signed in (cookie alive), runs the action directly.
 * - If not signed in, fires SIWE first (MetaMask sign prompt), then runs.
 *
 * Use for any backend write that requires authenticated wallet — enrollment,
 * claims, anything that calls a protected endpoint.
 */
export function useAuthenticatedAction<T>(action: () => Promise<T>) {
  const { data: currentWallet, refetch: refetchMe } = useCurrentWallet()
  const login = useSiweLogin()

  return useCallback(async (): Promise<T> => {
    if (!currentWallet) {
      await login.mutateAsync()
      // login mutation invalidates ['auth', 'me'], but we want the resolved
      // result for the next call. The cookie is set by now, so calling
      // the action will work regardless of whether currentWallet has updated yet.
      await refetchMe()
    }
    return action()
  }, [currentWallet, login, action, refetchMe])
}