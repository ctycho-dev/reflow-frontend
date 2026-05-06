import { Transfer, TokenStats, Campaign, LeaderboardEntry, WalletData, Token } from './types'

// Generate random Ethereum addresses
function randomAddress(): string {
  const chars = '0123456789abcdef'
  let addr = '0x'
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)]
  }
  return addr
}

// Known protocol addresses
const protocolAddresses: Record<string, { name: 'Aave' | 'Uniswap' | 'Compound'; address: string }> = {
  aave: { name: 'Aave', address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9' },
  uniswap: { name: 'Uniswap', address: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45' },
  compound: { name: 'Compound', address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3' },
}

// Generate mock transfers
export function generateMockTransfers(count: number): Transfer[] {
  const transfers: Transfer[] = []
  const now = Date.now()
  const tokens: Token[] = ['USDC', 'weETH']
  const protocols = [null, null, null, 'Aave', 'Uniswap', 'Compound'] as const

  for (let i = 0; i < count; i++) {
    const token = tokens[Math.floor(Math.random() * tokens.length)]
    const protocol = protocols[Math.floor(Math.random() * protocols.length)]
    const isUsdc = token === 'USDC'
    const amount = isUsdc
      ? Math.floor(Math.random() * 50000) + 100
      : Math.random() * 10 + 0.1

    transfers.push({
      id: `tx-${now}-${i}`,
      block: 19500000 + Math.floor(Math.random() * 10000),
      token,
      from: randomAddress(),
      to: protocol ? protocolAddresses[protocol.toLowerCase()].address : randomAddress(),
      amount: Number(amount.toFixed(isUsdc ? 2 : 4)),
      amountUsd: isUsdc ? amount : amount * 3200,
      protocol,
      timestamp: new Date(now - Math.random() * 3600000),
    })
  }

  return transfers.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Mock token stats
export function getMockTokenStats(): TokenStats[] {
  return [
    {
      token: 'USDC',
      transfersToday: 1240,
      volume: 4.2,
      volumeUnit: 'M',
    },
    {
      token: 'weETH',
      transfersToday: 38,
      volume: 120.4,
      volumeUnit: 'ETH',
    },
  ]
}

// Mock campaigns
export function getMockCampaigns(): Campaign[] {
  const now = new Date()
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  return [
    {
      id: 'campaign-1',
      name: 'USDC Power Users',
      token: 'USDC',
      ruleDescription: 'Transfer >= $500 USDC in May',
      threshold: 500,
      startDate: new Date(2024, 4, 1),
      endDate: new Date(2024, 4, 31),
      enrolled: 847,
      totalEligible: 1200,
      rewardPoints: 100,
      status: 'Active',
    },
    {
      id: 'campaign-2',
      name: 'weETH Holders',
      token: 'weETH',
      ruleDescription: 'Hold >= 0.5 weETH for 7 days',
      threshold: 0.5,
      startDate: new Date(2024, 4, 1),
      endDate: nextMonth,
      enrolled: 234,
      totalEligible: 500,
      rewardPoints: 250,
      status: 'Active',
    },
    {
      id: 'campaign-3',
      name: 'Aave Depositors',
      token: 'USDC',
      ruleDescription: 'Deposit >= $1000 USDC to Aave',
      threshold: 1000,
      startDate: lastMonth,
      endDate: now,
      enrolled: 156,
      totalEligible: 200,
      rewardPoints: 500,
      status: 'Active',
    },
    {
      id: 'campaign-4',
      name: 'Early Adopters',
      token: 'USDC',
      ruleDescription: 'First 100 users to transfer',
      threshold: 100,
      startDate: new Date(2024, 2, 1),
      endDate: new Date(2024, 3, 15),
      enrolled: 100,
      totalEligible: 100,
      rewardPoints: 1000,
      status: 'Ended',
    },
    {
      id: 'campaign-5',
      name: 'Uniswap Traders',
      token: 'weETH',
      ruleDescription: 'Trade >= 1 weETH on Uniswap',
      threshold: 1,
      startDate: new Date(2024, 4, 10),
      endDate: nextMonth,
      enrolled: 89,
      totalEligible: 300,
      rewardPoints: 150,
      status: 'Active',
    },
    {
      id: 'campaign-6',
      name: 'Compound Suppliers',
      token: 'USDC',
      ruleDescription: 'Supply >= $2000 USDC to Compound',
      threshold: 2000,
      startDate: lastMonth,
      endDate: nextMonth,
      enrolled: 67,
      totalEligible: 150,
      rewardPoints: 750,
      status: 'Active',
    },
  ]
}

// Mock leaderboard
export function getMockLeaderboard(campaignId: string): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = []
  const basePoints = campaignId.includes('1') ? 100 : campaignId.includes('2') ? 250 : 500

  for (let i = 0; i < 20; i++) {
    const volume = Math.floor(Math.random() * 50000) + 1000
    entries.push({
      rank: i + 1,
      address: randomAddress(),
      qualifyingVolume: volume,
      pointsEarned: Math.floor((volume / 1000) * basePoints),
    })
  }

  return entries.sort((a, b) => b.qualifyingVolume - a.qualifyingVolume).map((e, i) => ({ ...e, rank: i + 1 }))
}

// Mock wallet data
export function getMockWalletData(address: string): WalletData {
  const transfers = generateMockTransfers(15).map((t) => ({
    ...t,
    from: Math.random() > 0.5 ? address : t.from,
    to: Math.random() > 0.5 ? address : t.to,
  }))

  const usdcVolume = transfers
    .filter((t) => t.token === 'USDC')
    .reduce((sum, t) => sum + t.amountUsd, 0)

  const weethVolume = transfers
    .filter((t) => t.token === 'weETH')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    address,
    transfers,
    volumeByToken: {
      USDC: usdcVolume,
      weETH: weethVolume,
    },
    campaignEligibility: [
      {
        campaignId: 'campaign-1',
        campaignName: 'USDC Power Users',
        token: 'USDC',
        eligible: usdcVolume >= 500,
        currentVolume: usdcVolume,
        requiredVolume: 500,
        potentialPoints: 100,
      },
      {
        campaignId: 'campaign-2',
        campaignName: 'weETH Holders',
        token: 'weETH',
        eligible: weethVolume >= 0.5,
        currentVolume: weethVolume,
        requiredVolume: 0.5,
        potentialPoints: 250,
      },
      {
        campaignId: 'campaign-3',
        campaignName: 'Aave Depositors',
        token: 'USDC',
        eligible: usdcVolume >= 1000,
        currentVolume: usdcVolume,
        requiredVolume: 1000,
        potentialPoints: 500,
      },
    ],
  }
}
