// lib/format.ts
import { formatUnits } from 'viem'
/**
 * Convert a wei-scale bigint string into a human-readable decimal string.
 *
 * formatVolume("35000000000", 6)       → "35,000.00"
 * formatVolume("33000000000000000000", 18) → "33.00"
 * formatVolume("0", 6)                  → "0"
 */

export const REWARD_TOKEN_DECIMALS = 18 // REFLOW — single source, shared with the create form

export function formatVolume(
  wei: string | bigint,
  decimals: number = 18,
  fractionDigits: number = 2,
): string {
  let value: bigint
  if (typeof wei === 'bigint') {
    value = wei
  } else {
    if (!wei || wei === '0') return '0'
    try {
      value = BigInt(wei)
    } catch {
      return wei // fallback: show raw if it's not a valid bigint
    }
  }
  if (value === 0n) return '0'

  const divisor = 10n ** BigInt(decimals)
  const whole = value / divisor
  const fraction = value % divisor

  const fractionStr = fraction
    .toString()
    .padStart(decimals, '0')
    .slice(0, fractionDigits)

  return `${whole.toLocaleString('en-US')}.${fractionStr}`
}

/**
 * Wei-string → compact human display: "1000", "0.5", "1.2M".
 * Trims trailing zeros; abbreviates above 1M to keep cards tidy.
 */
export function formatTokenAmount(
  baseUnits: string | bigint,
  decimals: number,
  opts: { compact?: boolean } = {},
): string {
  const s = formatUnits(BigInt(baseUnits), decimals) // exact decimal string
  const n = Number(s)                                 // display only — precision loss OK here
  if (opts.compact && n >= 1_000_000) {
    return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
  }
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(n)
}

export function formatRewardAmount(baseUnits: string | bigint): string {
  return formatTokenAmount(baseUnits, REWARD_TOKEN_DECIMALS, { compact: true })
}