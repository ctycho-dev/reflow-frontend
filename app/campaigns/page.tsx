'use client'

import { useState } from 'react'
import { Campaign, Token } from '@/lib/types'
import { getMockCampaigns, getMockLeaderboard } from '@/lib/mock-data'
import { CampaignCard } from '@/components/campaign-card'
import { CreateCampaignModal } from '@/components/create-campaign-modal'
import { LeaderboardDrawer } from '@/components/leaderboard-drawer'

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(getMockCampaigns())
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const leaderboard = selectedCampaign
    ? getMockLeaderboard(selectedCampaign.id)
    : []

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setDrawerOpen(true)
  }

  const handleCreateCampaign = (data: {
    name: string
    token: Token
    threshold: number
    startDate: string
    endDate: string
    rewardPoints: number
  }) => {
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: data.name,
      token: data.token,
      ruleDescription: `Transfer >= ${data.token === 'USDC' ? '$' : ''}${data.threshold}${data.token === 'weETH' ? ' ETH' : ''}`,
      threshold: data.threshold,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      enrolled: 0,
      totalEligible: Math.floor(Math.random() * 500) + 100,
      rewardPoints: data.rewardPoints,
      status: 'Active',
    }
    setCampaigns((prev) => [newCampaign, ...prev])
  }

  const activeCampaigns = campaigns.filter((c) => c.status === 'Active')
  const endedCampaigns = campaigns.filter((c) => c.status === 'Ended')

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reward programs for on-chain activity
          </p>
        </div>
        <CreateCampaignModal onSubmit={handleCreateCampaign} />
      </div>

      {activeCampaigns.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Active Campaigns ({activeCampaigns.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onClick={() => handleCampaignClick(campaign)}
              />
            ))}
          </div>
        </section>
      )}

      {endedCampaigns.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Ended Campaigns ({endedCampaigns.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {endedCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onClick={() => handleCampaignClick(campaign)}
              />
            ))}
          </div>
        </section>
      )}

      <LeaderboardDrawer
        campaign={selectedCampaign}
        leaderboard={leaderboard}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
