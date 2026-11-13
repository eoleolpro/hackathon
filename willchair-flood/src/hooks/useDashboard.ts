import { useMemo, useState } from 'react'
import type { Coordinates, PointTarget, Selection } from '../types'
import type { ReachMinute } from '../isochrones/types'
import type { TimelineMinute } from '../data/timeline'
import type { RouteCandidate } from '../routing/types'
import { useFloodData } from './useFloodData'
import { useRouting } from './useRouting'
import { useIsochrones, useShelters } from './useIsochrones'
import { activeFloods } from '../utils/flood'
import { analyzeRoutes } from '../utils/routeAnalysis'
import { compareShelters } from '../utils/shelters'
import { demoEndpoints } from '../data/demoEndpoints'
const initial: Selection = { origin: null, destination: null, scenario: '평상시' }
const emptyRoutes: RouteCandidate[] = []
export function useDashboard() {
  const [selection, setSelection] = useState<Selection>(initial)
  const [target, setTarget] = useState<PointTarget>('origin')
  const [reachRange, setReachRange] = useState<ReachMinute>(5)
  const [selectedShelterId, setSelectedShelterId] = useState('')
  const [routeChoice, setRouteChoice] = useState({ key: '', id: '' })
  const [minute, setMinute] = useState<TimelineMinute>(0)
  const [resetVersion, setResetVersion] = useState(0)
  const [floodVisible, setFloodVisible] = useState(true)
  const routing = useRouting(selection)
  const isochrones = useIsochrones(selection.origin)
  const shelters = useShelters()
  const floodResource = useFloodData()
  const floodData = floodResource.frames?.[minute] ?? null
  const floodError = floodResource.error
  const floodReady = floodData !== null && !floodError
  const reachArea = isochrones.status === 'ready'
    ? isochrones.data.features.find(feature => feature.properties.minutes === reachRange) : undefined
  const routes = routing.state.status === 'ready' ? routing.state.routes : emptyRoutes
  const selectedRoute = routes.find(route => routeChoice.key === routing.key && route.id === routeChoice.id) ?? routes[0]
  const floods = useMemo(() => activeFloods(floodData, selection.scenario), [floodData, selection.scenario])
  const routeAnalyses = useMemo(() => analyzeRoutes(routes, floods, floodReady), [routes, floods, floodReady])
  const shelterComparisons = useMemo(() => compareShelters(shelters.data ?? [], reachArea, floods, floodReady), [shelters.data, reachArea, floods, floodReady])
  const chooseRoute = (id: string) => setRouteChoice({ key: routing.key, id })
  const chooseReachOrigin = () => {
    setSelection(current => ({ ...current, origin: demoEndpoints.origin }))
    setTarget('destination')
  }
  const chooseDemo = () => {
    setSelection(current => ({ ...current, ...demoEndpoints }))
    setTarget('origin')
  }
  const resetPoints = () => {
    setSelection(current => ({ ...current, origin: null, destination: null }))
    setRouteChoice({ key: '', id: '' })
    setTarget('origin')
  }
  const resetAll = () => {
    setReachRange(5)
    setSelectedShelterId('')
    setMinute(0)
    setRouteChoice({ key: '', id: '' })
    setResetVersion(version => version + 1)
    setFloodVisible(true)
    setSelection(initial)
    setTarget('origin')
  }
  const selectPoint = (point: Coordinates) => {
    setSelection(current => ({ ...current, [target]: point }))
    setTarget(target === 'origin' ? 'destination' : 'origin')
  }
  return {
    selection, setSelection, target, setTarget, reachRange, setReachRange,
    selectedShelterId, setSelectedShelterId, minute, setMinute, resetVersion,
    floodVisible, setFloodVisible, routing, isochrones, shelters, floodError,
    floodReady, reachArea, routes, selectedRoute, floods, routeAnalyses,
    shelterComparisons, chooseRoute, chooseReachOrigin, chooseDemo,
    resetPoints, resetAll, selectPoint,
  }
}
