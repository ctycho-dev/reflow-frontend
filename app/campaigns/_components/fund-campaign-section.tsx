'use client'

import { useState } from 'react'
import { useConnection, useWriteContract, usePublicClient, useReadContract } from 'wagmi'
import { useQueryClient } from '@tanstack/react-query'
import { erc20Abi } from 'viem'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DISTRIBUTOR_ADDRESS,
  distributorAbi,
  REWARD_TOKEN_ADDRESS,
  REWARD_TOKEN_DECIMALS,
  REWARD_TOKEN_SYMBOL,
} from '@/lib/contracts'
import { CampaignDetail } from '@/lib/types'
import { toBaseUnits } from '@/app/utils/helpers'
import { formatRewardAmount } from '@/lib/format'

type FundStep = 'idle' | 'approving' | 'funding'

const STEP_LABEL: Record<FundStep, string> = {
  idle: 'Fund campaign',
  approving: 'Approving…',
  funding: 'Confirm funding…',
}

export function FundCampaignSection({ detail }: { detail: CampaignDetail }) {
  const { address } = useConnection()
  const { writeContractAsync } = useWriteContract()
  const publicClient = usePublicClient()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<FundStep>('idle')

  const remaining = detail.rewardAmount - (detail.fundedTotal ?? 0n)

  const { data: allowance } = useReadContract({
    address: REWARD_TOKEN_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, DISTRIBUTOR_ADDRESS] : undefined,
    query: { enabled: !!address },
  })

  const isCreator = !!address && detail.creatorWallet === address.toLowerCase()
  if (!isCreator || detail.isFunded || detail.onchainId == null || remaining <= 0n)
    return null

  const handleFund = async () => {
    if (!publicClient) return
    try {
      if ((allowance ?? 0n) < remaining) {
        setStep('approving')
        const approveTx = await writeContractAsync({
          address: REWARD_TOKEN_ADDRESS,
          abi: erc20Abi,
          functionName: 'approve',
          args: [DISTRIBUTOR_ADDRESS, remaining],
        })
        await publicClient.waitForTransactionReceipt({ hash: approveTx })
      }

      setStep('funding')
      const fundTx = await writeContractAsync({
        address: DISTRIBUTOR_ADDRESS,
        abi: distributorAbi,
        functionName: 'fundCampaign',
        args: [BigInt(detail.onchainId), remaining],
      })
      await publicClient.waitForTransactionReceipt({ hash: fundTx })

      toast.success('Campaign funded', {
        description: `${formatRewardAmount(remaining.toString())} ${REWARD_TOKEN_SYMBOL} escrowed`,
      })
      queryClient.invalidateQueries({ queryKey: ['campaign', detail.id] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    } catch (err) {
      toast.error('Funding failed', {
        description: err instanceof Error ? err.message : 'Transaction rejected',
      })
    } finally {
      setStep('idle')
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Fund this campaign</p>
        <p className="text-xs text-muted-foreground">
          Escrow {formatRewardAmount(remaining.toString())} {REWARD_TOKEN_SYMBOL} to
          activate. Rewards are claimable only from a fully funded campaign.
        </p>
      </div>
      <Button onClick={handleFund} disabled={step !== 'idle'} className="w-full">
        {step === 'idle'
          ? `Fund ${formatRewardAmount(remaining.toString())} ${REWARD_TOKEN_SYMBOL}`
          : STEP_LABEL[step]}
      </Button>
    </div>
  )
}