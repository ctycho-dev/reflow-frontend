// lib/api/index.ts

export async function assertOk(res: Response): Promise<Response> {
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${body}`)
  }
  return res
}

/**
 * Wrapper around fetch that always sends cookies for backend calls.
 * Use for any call to the Reflow API so SIWE session cookies flow.
 */
export function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    credentials: 'include',
    ...init,
  })
}

export { transfersApi } from './transfers'
export { statsApi } from './stats'
export { campaignsApi } from './campaigns'
export { protocolsApi } from './protocols'
export { tokensApi } from './tokens'
export { walletsApi } from './wallets'