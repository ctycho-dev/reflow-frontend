'use client'

import { useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useCampaigns } from '@/hooks/use-campaigns'
import { useTokens } from '@/hooks/use-tokens'
import { useProtocols } from '@/hooks/use-protocols'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { useEligibility } from '@/hooks/use-eligibility'
import { useEnroll } from '@/hooks/use-enroll'
import { Campaign } from '@/lib/types'
import { CampaignCard } from '@/app/campaigns/_components/campaign-card'
import { CreateCampaignModal } from '@/app/campaigns/_components/create-campaign-modal'
import { LeaderboardDrawer } from '@/app/campaigns/_components/leaderboard-drawer'
import { CHAIN_ID } from '@/lib/contracts'

type CampaignStatus = 'Upcoming' | 'Active' | 'Ended'

function getCampaignStatus(c: Campaign, now: Date): CampaignStatus {
    if (now < c.startsAt) return 'Upcoming'
    if (now > c.endsAt) return 'Ended'
    return 'Active'
}

function Section({
    title,
    campaigns,
    renderCard,
}: {
    title: string
    campaigns: Campaign[]
    renderCard: (c: Campaign) => React.ReactNode
}) {
    if (campaigns.length === 0) return null
    return (
        <section className="mb-10 last:mb-0">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                {title} ({campaigns.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map(renderCard)}
            </div>
        </section>
    )
}

export default function CampaignsPage() {
    const { address, isConnected } = useAccount()

    const { data: campaigns = [], refresh } = useCampaigns(CHAIN_ID)
    const { data: tokens = [] } = useTokens()
    const { data: protocols = [] } = useProtocols()
    const { data: eligibility } = useEligibility(address, CHAIN_ID)

    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
    const { data: leaderboard = [], isLoading: leaderboardLoading } = useLeaderboard(
        selectedCampaign?.id,
    )

    const enroll = useEnroll()

    const tokensByAddress = useMemo(
        () => new Map(tokens.map((t) => [t.address.toLowerCase(), t])),
        [tokens],
    )

    const protocolsByAddress = useMemo(
        () => new Map(protocols.map((p) => [p.address.toLowerCase(), p])),
        [protocols],
    )

    // Per-campaign eligibility lookup
    const eligibilityByCampaignId = useMemo(
        () => new Map(eligibility?.campaigns.map((e) => [e.campaign.id, e]) ?? []),
        [eligibility],
    )

    const { upcoming, active, ended } = useMemo(() => {
        const now = new Date()
        const upcoming: Campaign[] = []
        const active: Campaign[] = []
        const ended: Campaign[] = []
        for (const c of campaigns) {
            const s = getCampaignStatus(c, now)
            if (s === 'Upcoming') upcoming.push(c)
            else if (s === 'Active') active.push(c)
            else ended.push(c)
        }
        return { upcoming, active, ended }
    }, [campaigns])

    const renderCard = (campaign: Campaign) => (
        <CampaignCard
            key={campaign.id}
            campaign={campaign}
            token={tokensByAddress.get(campaign.tokenAddress.toLowerCase())}
            protocol={
                campaign.targetContractAddress
                    ? protocolsByAddress.get(campaign.targetContractAddress.toLowerCase())
                    : undefined
            }
            eligibility={eligibilityByCampaignId.get(campaign.id)}
            walletConnected={isConnected}
            enrollPending={enroll.isPending && enroll.variables === campaign.id}
            onClick={() => setSelectedCampaign(campaign)}
            onEnroll={() => enroll.mutate(campaign.id)}
        />
    )

    const selectedToken = selectedCampaign
        ? tokensByAddress.get(selectedCampaign.tokenAddress.toLowerCase())
        : undefined

    const selectedProtocol = selectedCampaign?.targetContractAddress
        ? protocolsByAddress.get(selectedCampaign.targetContractAddress.toLowerCase())
        : undefined

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground">Campaigns</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Reward programs for on-chain activity
                    </p>
                </div>
                <CreateCampaignModal onCreated={refresh} />
            </div>

            <Section title="Active Campaigns" campaigns={active} renderCard={renderCard} />
            <Section title="Upcoming Campaigns" campaigns={upcoming} renderCard={renderCard} />
            <Section title="Ended Campaigns" campaigns={ended} renderCard={renderCard} />

            <LeaderboardDrawer
                campaign={selectedCampaign}
                token={selectedToken}
                protocol={selectedProtocol}
                leaderboard={leaderboard}
                loading={leaderboardLoading}
                open={selectedCampaign !== null}
                onOpenChange={(open) => {
                    if (!open) setSelectedCampaign(null)
                }}
            />
        </div>
    )
}