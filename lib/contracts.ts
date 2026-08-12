import type { Abi } from 'viem'
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID)

export const DISTRIBUTOR_ADDRESS = process.env.NEXT_PUBLIC_DISTRIBUTOR_ADDRESS as `0x${string}`

export const REWARD_TOKEN_ADDRESS = process.env
  .NEXT_PUBLIC_REWARD_TOKEN_ADDRESS as `0x${string}`   // 0xDE41...fB1d
export const REWARD_TOKEN_SYMBOL = 'REFLOW'
export const REWARD_TOKEN_DECIMALS = 18

// Minimal fragment: the claim fn + errors we decode.
// For the full ABI, copy from foundry: out/RewardDistributor.sol/RewardDistributor.json
export const distributorAbi = [
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'campaignId', type: 'uint256' },
      { name: 'account', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'proof', type: 'bytes32[]' },
    ],
    outputs: [],
  },
  { type: 'error', name: 'AlreadyClaimed', inputs: [] },
  { type: 'error', name: 'InvalidProof', inputs: [] },
  {
    type: 'function',
    name: 'createCampaign',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'targetToken', type: 'address' },
      { name: 'target', type: 'address' },
      { name: 'startTime', type: 'uint64' },
      { name: 'endTime', type: 'uint64' },
      { name: 'rewardTotal', type: 'uint256' },
    ],
    outputs: [{ name: 'campaignId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'fundCampaign',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'campaignId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'event',
    name: 'CampaignCreated',
    inputs: [
      { name: 'campaignId', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'targetToken', type: 'address', indexed: true },
      { name: 'target', type: 'address', indexed: false },
      { name: 'startTime', type: 'uint64', indexed: false },
      { name: 'endTime', type: 'uint64', indexed: false },
      { name: 'rewardTotal', type: 'uint256', indexed: false },
    ],
  },
  
] as const satisfies Abi