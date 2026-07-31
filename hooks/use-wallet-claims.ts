// hooks/use-wallet-claims.ts
import { useQuery } from '@tanstack/react-query'
import { rewardsApi, WalletClaim } from '@/lib/api/rewards'

/**
 * All reward claims for a wallet across campaigns.
 *
 * `claimed` is live truth — mirrored from on-chain Claimed events by
 * chainwatch — so this refetches into correctness after a claim without
 * any optimistic bookkeeping. `rootStatus === 'confirmed'` is the gate
 * for showing a Claim button; anything else is still settling.
 */
export function useWalletClaims(address: string | undefined) {
  return useQuery<WalletClaim[]>({
    queryKey: ['wallet-claims', address?.toLowerCase()],
    queryFn: () => rewardsApi.listClaims(address!),
    enabled: !!address,
  })
}