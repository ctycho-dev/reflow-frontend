import { useAuthenticatedAction } from '@/hooks/use-authenticated-action'
import { campaignsApi } from '@/lib/api/campaigns'
import { Button } from '@/components/ui/button'

function EnrollButton({ campaignId }: { campaignId: number }) {
  const enroll = useAuthenticatedAction(async () => {
    return await campaignsApi.enroll(campaignId)
  })

  return (
    <Button onClick={() => enroll()}>
      Enroll
    </Button>
  )
}