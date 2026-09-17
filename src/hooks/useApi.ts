import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/client'

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
  options?: { enabled?: boolean; pollMs?: number },
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

  useEffect(() => {
    if (!options?.pollMs || !enabled) return
    const interval = setInterval(() => setTick((t) => t + 1), options.pollMs)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.pollMs, enabled])

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
