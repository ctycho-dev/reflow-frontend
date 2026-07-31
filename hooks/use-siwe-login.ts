// hooks/use-siwe-login.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useConnection, useChainId, useSignMessage } from 'wagmi'
import { SiweMessage } from 'siwe'
import { authApi, AuthenticatedWallet } from '@/lib/api/auth'

const MESSAGE_EXPIRATION_MS = 5 * 60_000  // 5 minutes — should outlive the user clicking "Sign"

/**
 * Performs the full SIWE login flow as a single mutation:
 *   1. Fetch nonce from backend
 *   2. Build EIP-4361 message
 *   3. Ask wallet to sign (opens MetaMask prompt)
 *   4. POST message + signature to backend
 *   5. Backend sets httpOnly JWT cookie, returns authenticated wallet
 *   6. Invalidate the ['auth', 'me'] query so the UI re-reads logged-in state
 *
 * Returns the standard useMutation interface — `mutate`, `mutateAsync`,
 * `isPending`, `error`, etc.
 */
export function useSiweLogin() {
  const { address } = useConnection()
  const chainId = useChainId()
  const signMessage = useSignMessage()
  const queryClient = useQueryClient()

  return useMutation<AuthenticatedWallet, Error, void>({
    mutationFn: async () => {
      if (!address) {
        throw new Error('No wallet connected')
      }

      // 1. Get a fresh nonce, address-keyed in Redis
      const { nonce } = await authApi.nonce({ address })

      // 2. Build the SIWE message. `domain` must match settings.siwe.domain on
      //    the backend — locally that's "localhost:3000". window.location.host
      //    gives us that automatically across environments.
      const now = new Date()
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Sign in to Reflow.',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
        issuedAt: now.toISOString(),
        expirationTime: new Date(now.getTime() + MESSAGE_EXPIRATION_MS).toISOString(),
      })
      const preparedMessage = message.prepareMessage()

      // 3. Ask the wallet to sign. This opens the MetaMask popup.
      //    EIP-191 personal_sign path — matches what the backend verifies.
      const signature = await signMessage.mutateAsync({ message: preparedMessage })

      // 4. Send to backend; on success it sets the httpOnly cookie.
      const { wallet } = await authApi.verify({
        message: preparedMessage,
        signature,
      })

      return wallet
    },
    onSuccess: () => {
      // Make the auth/me query refetch so any subscribed component sees the
      // new logged-in state immediately.
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })
}