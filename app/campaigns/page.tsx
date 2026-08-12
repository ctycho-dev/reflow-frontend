'use client'

import { useState, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useReconcileDraft } from '@/hooks/use-reconcile'
import { useAuthMe } from '@/hooks/use-auth'
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

const SECTION_ORDER = [
    { title: 'Active Campaigns', statuses: ['live'] },
    { title: 'Upcoming Campaigns', statuses: ['funded'] },
    { title: 'Awaiting Funding', statuses: ['created'] },
    { title: 'Ended Campaigns', statuses: ['ended', 'settling', 'settled'] },
] as const

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
    const { data: session } = useAuthMe()

    const { data: campaigns = [], refresh } = useCampaigns(CHAIN_ID)
    const { data: tokens = [] } = useTokens()
    const { data: protocols = [] } = useProtocols()
    const { data: eligibility } = useEligibility(address, CHAIN_ID)

    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
    const { data: leaderboard = [], isLoading: leaderboardLoading } = useLeaderboard(
        selectedCampaign?.id,
    )

    useReconcileDraft(isConnected && !!session)

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

    const sections = useMemo(
        () =>
            SECTION_ORDER.map((s) => ({
                title: s.title,
                campaigns: campaigns.filter((c) => s.statuses.includes(c.status as never)),
            })),
        [campaigns],
    )


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

            {sections.map((s) => (
                <Section key={s.title} title={s.title} campaigns={s.campaigns} renderCard={renderCard} />
            ))}

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