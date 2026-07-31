// hooks/use-enroll.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { campaignsApi } from '@/lib/api/campaigns'
import { Campaign, Enrollment } from '@/lib/types'
import { useCurrentWallet } from './use-current-wallet'
import { useSiweLogin } from './use-siwe-login'

const MIN_ENROLL_DURATION_MS = 600

export function useEnroll() {
  const queryClient = useQueryClient()
  const { address, chainId } = useAccount()
  const { data: currentWallet, refetch: refetchMe } = useCurrentWallet()
  const login = useSiweLogin()

  return useMutation<Enrollment, Error, number>({
    mutationFn: async (campaignId: number) => {
      if (!currentWallet) {
        await login.mutateAsync()
        await refetchMe()
      }

      // Fire enrollment + a minimum-duration timer in parallel,
      // wait for both. Network can't finish faster than the timer.
      const [enrollment] = await Promise.all([
        campaignsApi.enroll(campaignId),
        new Promise((resolve) => setTimeout(resolve, MIN_ENROLL_DURATION_MS)),
      ])
      return enrollment
    },
    onSuccess: (_data, campaignId) => {
      queryClient.setQueryData<Campaign[]>(
        ['campaigns', chainId],
        (campaigns) =>
          campaigns?.map((c) =>
            c.id === campaignId
              ? {
                  ...c,
                  enrolledCount: c.enrolledCount + 1,
                  isFull: c.enrolledCount + 1 >= c.maxRecipients,
                  spotsRemaining: c.maxRecipients - (c.enrolledCount + 1),
                }
              : c,
          ),
      )
      queryClient.invalidateQueries({ queryKey: ['eligibility', address, chainId] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard', campaignId] })
    },
  })
}