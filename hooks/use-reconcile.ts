// hooks/use-reconcile.ts
import { useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { campaignsApi } from '@/lib/api/campaigns'

export function useReconcileDraft(enabled: boolean) {
  const queryClient = useQueryClient()
  const fired = useRef(false)

  const mutation = useMutation({
    mutationFn: () => campaignsApi.reconcile(),
    onSuccess: (healed) => {
      if (healed) {
        toast.success('Campaign linked', {
          description: `"${healed.name}" was created on-chain and is now linked.`,
        })
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      }
    },
  })

  useEffect(() => {
    if (enabled && !fired.current) {
      fired.current = true
      mutation.mutate()
    }
  }, [enabled])

  return mutation
}