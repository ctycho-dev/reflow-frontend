// lib/api/transfers.ts
import { ApiTransfer } from '@/lib/types'
import { apiFetch, assertOk } from './index'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export interface StreamHandle {
  close: () => void
}

export interface StreamOptions {
  onMessage: (event: ApiTransfer) => void
  onError?: (err: Event) => void
  onOpen?: () => void
}

export const transfersApi = {
  list(params?: {
    limit?: number
    token?: string
    protocol?: string
  }): Promise<ApiTransfer[]> {
    const qs = new URLSearchParams()
    if (params?.limit != null) qs.set('limit', String(params.limit))
    if (params?.token) qs.set('token', params.token)
    if (params?.protocol) qs.set('protocol', params.protocol)

    return apiFetch(`${API_BASE}/api/v1/transfer?${qs.toString()}`)
      .then(assertOk)
      .then((r): Promise<ApiTransfer[]> => r.json())
  },

  stream({ onMessage, onError, onOpen }: StreamOptions): StreamHandle {
    const es = new EventSource(`${API_BASE}/api/v1/transfer/stream`, {
      withCredentials: true,  // include cookie for SSE auth (will matter post-SIWE)
    })

    es.onopen = (_ev: Event): void => { onOpen?.() }
    es.onmessage = (ev: MessageEvent<string>): void => {
      if (!ev.data) return
      try {
        onMessage(JSON.parse(ev.data) as ApiTransfer)
      } catch {
        // malformed frame — skip
      }
    }
    es.onerror = (ev: Event): void => { onError?.(ev) }

    return { close: () => es.close() }
  },
}