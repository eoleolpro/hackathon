import { useEffect, useMemo, useState } from 'react'
export interface TileStatus { phase: 'loading' | 'ready' | 'error'; failures: number; receivedAt: string | null }
const initial: TileStatus = { phase: 'loading', failures: 0, receivedAt: null }
export function useMapTiles() {
  const [status, setStatus] = useState<TileStatus>(initial)
  const [attempt, setAttempt] = useState(0)
  const handlers = useMemo(() => ({
    loading: () => setStatus(current => ({ ...current, phase: current.failures ? 'error' : 'loading' })),
    tileload: () => setStatus(current => ({ ...current, receivedAt: new Date().toISOString() })),
    tileerror: () => setStatus(current => ({ ...current, phase: 'error', failures: current.failures + 1 })),
    load: () => setStatus(current => ({ ...current, phase: current.failures ? 'error' : 'ready' })),
  }), [])
  useEffect(() => {
    if (status.phase !== 'loading') return
    const timer = window.setTimeout(() => setStatus(current => current.phase === 'loading' ? { ...current, phase: 'error' } : current), 15000)
    return () => window.clearTimeout(timer)
  }, [attempt, status.phase])
  const retry = () => { setStatus(initial); setAttempt(current => current + 1) }
  return { status, attempt, handlers, retry }
}
