import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/client'

// Extra random delay (0..this) added on top of `pollMs` for hooks polling
// live data. Keeps concurrent clients from all missing the server-side blob
// cache at the same instant — see the `jitterMs` comment below.
export const LIVE_DATA_JITTER_MS = 60_000

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Runs `fetcher` whenever `deps` change, tracking loading/error state and
 * aborting the in-flight request if deps change again before it resolves.
 * Pass `null` from `fetcher` factory (via `enabled`) to skip fetching.
 */
export function useApi<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
  options?: { enabled?: boolean; pollMs?: number; jitterMs?: number },
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({ data: null, loading: true, error: null })
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const [tick, setTick] = useState(0)
  const enabled = options?.enabled ?? true

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null })
      return
    }
    const controller = new AbortController()
    setState((prev) => ({ ...prev, loading: true, error: null }))

    fetcherRef
      .current(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (controller.signal.aborted) return
        const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Something went wrong'
        setState({ data: null, loading: false, error: message })
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, tick])

  const pollMs = options?.pollMs
  const jitterMs = options?.jitterMs
  useEffect(() => {
    if (!pollMs || !enabled) return
    let timeoutId: ReturnType<typeof setTimeout>

    // Re-rolled every cycle (rather than a single fixed per-mount offset) so
    // many concurrent clients polling the same live data stay decorrelated
    // over time instead of drifting back into lockstep. This gives the
    // server-side blob cache a real chance to absorb repeat requests: the
    // first client to land after the cache goes stale refreshes it, and
    // others land within the jitter window and get a cache hit instead of
    // each independently hitting the upstream API.
    const schedule = () => {
      const jitter = jitterMs ? Math.random() * jitterMs : 0
      timeoutId = setTimeout(() => {
        setTick((t) => t + 1)
        schedule()
      }, pollMs + jitter)
    }

    schedule()
    return () => clearTimeout(timeoutId)
  }, [pollMs, jitterMs, enabled])

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  return { ...state, refetch }
}

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}
