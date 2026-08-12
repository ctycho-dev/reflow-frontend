// lib/api/index.ts
export class ApiError extends Error {
  status: number
  detail: string
  retryAfter: number | null

  constructor(status: number, detail: string, retryAfter: number | null = null) {
    super(detail || `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
    this.retryAfter = retryAfter
  }
}

export async function assertOk(res: Response): Promise<Response> {
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = body?.detail ?? JSON.stringify(body)
    } catch {
      detail = await res.text().catch(() => '')
    }
    const ra = res.headers.get('Retry-After')
    throw new ApiError(res.status, detail, ra !== null ? parseInt(ra, 10) : null)
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