
export function toBaseUnits(humanValue: string, decimals: number): string {
  // Convert "0.5" + 18 → "500000000000000000"
  // Done with string ops to avoid float precision loss.
  const [whole, frac = ''] = humanValue.split('.')
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals)
  const combined = (whole + fracPadded).replace(/^0+(?=\d)/, '')
  return combined === '' ? '0' : combined
}