import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAccount, usePublicClient, useWriteContract } from 'wagmi'
import { BaseError, ContractFunctionRevertedError } from 'viem'
import { rewardsApi } from '@/lib/api/rewards'
import { CHAIN_ID, DISTRIBUTOR_ADDRESS, distributorAbi } from '@/lib/contracts'

export interface ClaimArgs {
  campaignId: number // internal id — API proof fetch
  onchainId: number  // contract id — claim() call
}

export interface ClaimResult {
  txHash: `0x${string}`
  campaignId: number
  alreadyClaimed?: boolean
}

/**
 * Claims a reward on-chain:
 *   1. Fetch amount + Merkle proof from the backend (INTERNAL campaign id —
 *      reward_claims is keyed by it)
 *   2. claim(onchainId, account, amount, proof) on the RewardDistributor
 *      (ONCHAIN id — the contract has never heard of our PKs; translation
 *      happens exactly here, the chain boundary)
 *   3. Wait for inclusion so the UI flip is truthful
 *   4. Invalidate wallet-claims to converge on backend truth
 *
 * AlreadyClaimed reverts are treated as reconciliation (stale UI), not errors.
 */
export function useClaimReward() {
  const { address } = useAccount()
  const publicClient = usePublicClient({ chainId: CHAIN_ID })
  const { writeContractAsync } = useWriteContract()
  const queryClient = useQueryClient()

  return useMutation<ClaimResult, Error, ClaimArgs>({
    mutationFn: async ({ campaignId, onchainId }) => {
      if (!address) throw new Error('No wallet connected')
      if (!publicClient) throw new Error('No client for claim chain')

      const proof = await rewardsApi.getProof(campaignId, address)
      if (proof.claimed) {
        // backend already knows it's claimed — stale list, skip the tx
        return { txHash: '0x' as `0x${string}`, campaignId, alreadyClaimed: true }
      }

      const txHash = await writeContractAsync({
        address: DISTRIBUTOR_ADDRESS,
        abi: distributorAbi,
        functionName: 'claim',
        chainId: CHAIN_ID, // pinned — wagmi prompts a network switch if needed
        args: [
          BigInt(onchainId),
          address,
          BigInt(proof.amount),
          proof.proof,
        ],
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
      if (receipt.status !== 'success') {
        throw new Error('Claim transaction reverted')
      }
      return { txHash, campaignId }
    },

    onSettled: () => {
      // success or failure, converge on backend truth
      queryClient.invalidateQueries({ queryKey: ['wallet-claims', address?.toLowerCase()] })
    },
  })
}

/** True if the error is the distributor's AlreadyClaimed revert. */
export function isAlreadyClaimedError(err: unknown): boolean {
  if (!(err instanceof BaseError)) return false
  const revert = err.walk((e) => e instanceof ContractFunctionRevertedError)
  return revert instanceof ContractFunctionRevertedError
    && revert.data?.errorName === 'AlreadyClaimed'
}