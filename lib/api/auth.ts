// lib/api/auth.ts
import { apiFetch, assertOk } from './index'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

// ─── Request/response shapes ────────────────────────────────────────────────
// These live here (next to the calls) rather than lib/types/ — they're API
// contracts, not domain entities.

export interface NonceRequest {
  address: string
}

export interface NonceResponse {
  nonce: string
}

export interface VerifyRequest {
  message: string
  signature: string
}

export interface AuthenticatedWallet {
  chainId: number
  address: string
}

export interface VerifyResponse {
  wallet: AuthenticatedWallet
}

// ─── API methods ────────────────────────────────────────────────────────────

export const authApi = {
  nonce(body: NonceRequest): Promise<NonceResponse> {
    return apiFetch(`${API_BASE}/api/v1/auth/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(assertOk)
      .then((r): Promise<NonceResponse> => r.json())
  },

  verify(body: VerifyRequest): Promise<VerifyResponse> {
    return apiFetch(`${API_BASE}/api/v1/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(assertOk)
      .then((r): Promise<VerifyResponse> => r.json())
  },

  /**
   * Returns the current authenticated wallet, or null if not signed in.
   *
   * Special-cases 401: the backend returns 401 when there's no valid session,
   * which is *not* an error — it's just "you're not logged in." Translating
   * to `null` lets TanStack treat it as data, not as a failed query.
   */
  me(): Promise<AuthenticatedWallet | null> {
    return apiFetch(`${API_BASE}/api/v1/auth/me`).then((r) => {
      if (r.status === 401) return null
      if (!r.ok) {
        throw new Error(`HTTP ${r.status}`)
      }
      return r.json() as Promise<AuthenticatedWallet>
    })
  },

  logout(): Promise<void> {
    return apiFetch(`${API_BASE}/api/v1/auth/logout`, {
      method: 'POST',
    }).then(() => undefined)
  },
}