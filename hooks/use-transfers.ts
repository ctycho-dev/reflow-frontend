// hooks/use-transfers.ts
import { useEffect, useRef, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { transfersApi, StreamHandle } from '@/lib/api/transfers'
import { ApiTransfer, Transfer } from '@/lib/types'
import { mapTransfer } from '@/lib/mappers'

const MAX_TRANSFERS = 100
const NEW_HIGHLIGHT_MS = 3000

const queryKey = ['transfers', 'recent'] as const

export function useTransfers() {
  const queryClient = useQueryClient()

  // Initial snapshot. TanStack handles loading, errors, and caching for us.
  const snapshot = useQuery<Transfer[]>({
    queryKey,
    queryFn: async () => {
      const incoming = await transfersApi.list({ limit: 50 })
      const fresh = incoming.map(mapTransfer)

      // Merge with anything SSE already wrote during the fetch
      const existing = queryClient.getQueryData<Transfer[]>(queryKey) ?? []
      const existingIds = new Set(existing.map((t) => t.id))
      const novel = fresh.filter((t) => !existingIds.has(t.id))

      return [...existing, ...novel]
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, MAX_TRANSFERS)
    },
    staleTime: Infinity,  // never auto-refetch; SSE keeps us live
  })

  const [newTransferIds, setNewTransferIds] = useState<Set<string>>(new Set())
  const [connected, setConnected] = useState(false)
  const streamRef = useRef<StreamHandle | null>(null)

  const markAsNew = useCallback((id: string) => {
    setNewTransferIds((prev) => new Set(prev).add(id))
    window.setTimeout(() => {
      setNewTransferIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, NEW_HIGHLIGHT_MS)
  }, [])

  // Append SSE arrivals to the cache, deduped against what's already there.
  const handleStreamMessage = useCallback(
    (dto: ApiTransfer) => {
      const incoming = mapTransfer(dto)

      queryClient.setQueryData<Transfer[]>(queryKey, (current = []) => {
        if (current.some((t) => t.id === incoming.id)) return current
        return [incoming, ...current].slice(0, MAX_TRANSFERS)
      })

      markAsNew(incoming.id)
    },
    [queryClient, markAsNew],
  )

  useEffect(() => {
    streamRef.current = transfersApi.stream({
      onOpen: () => setConnected(true),
      onMessage: handleStreamMessage,
      onError: () => setConnected(false),
    })
    return () => streamRef.current?.close()
  }, [handleStreamMessage])

  return {
    transfers: snapshot.data ?? [],
    isLoading: snapshot.isLoading,
    error: snapshot.error,
    newTransferIds,
    connected,
  }
}