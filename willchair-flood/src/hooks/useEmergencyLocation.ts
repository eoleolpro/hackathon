import { useCallback, useEffect, useRef, useState } from 'react'
import { locationSupportError, normalizePosition, watchLocation } from '../services/locationService'
import type { EmergencyLocationState, LocationErrorCode } from '../types/location'
const initial: EmergencyLocationState = { active: false, status: 'idle', sample: null, errorCode: null }
export function useEmergencyLocation() {
  const [state, setState] = useState<EmergencyLocationState>(initial)
  const [now, setNow] = useState(Date.now)
  const [background, setBackground] = useState(document.hidden)
  const cleanup = useRef<(() => void) | null>(null)
  const generation = useRef(0)
  const active = useRef(false)
  const clear = useCallback(() => {
    generation.current += 1
    active.current = false
    cleanup.current?.()
    cleanup.current = null
  }, [])
  const stop = useCallback(() => {
    clear()
    setState({ ...initial, status: 'stopped' })
  }, [clear])
  const start = useCallback(() => {
    clear()
    const supportError = locationSupportError()
    if (supportError) { setState({ ...initial, status: 'error', errorCode: supportError }); return }
    const session = generation.current
    active.current = true
    setNow(Date.now())
    setState({ active: true, status: 'requesting', sample: null, errorCode: null })
    const onError = (errorCode: LocationErrorCode) => {
      if (!active.current || generation.current !== session) return
      if (errorCode === 'permission-denied') {
        clear()
        setState({ ...initial, status: 'error', errorCode })
      } else setState(current => ({ ...current, status: 'error', errorCode }))
    }
    try {
      const dispose = watchLocation(position => {
        if (!active.current || generation.current !== session) return
        const sample = normalizePosition(position)
        if (!sample) { onError('invalid'); return }
        setNow(Date.now())
        setState(current => current.sample && sample.measuredAt < current.sample.measuredAt ? current : { active: true, status: 'confirmed', sample, errorCode: null })
      }, onError)
      if (!active.current || generation.current !== session) dispose()
      else cleanup.current = dispose
    } catch {
      clear()
      setState({ ...initial, status: 'error', errorCode: 'unavailable' })
    }
  }, [clear])
  useEffect(() => clear, [clear])
  useEffect(() => {
    if (!state.active) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [state.active])
  useEffect(() => {
    const update = () => { setBackground(document.hidden); setNow(Date.now()) }
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])
  return { ...state, now, background, start, stop }
}
