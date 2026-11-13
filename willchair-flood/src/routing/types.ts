import type { Feature, LineString } from 'geojson'
import type { Coordinates } from '../types'
export interface RouteProperties {
  source: 'simulation' | 'openrouteservice'
  kind: 'regular' | 'detour'
  name: string
  description: string
}
export interface RouteCandidate {
  id: string
  feature: Feature<LineString, RouteProperties>
  distanceMeters: number
}
export interface RoutingRequest { origin: Coordinates; destination: Coordinates; signal?: AbortSignal }
export type RoutingResult = { status: 'ready'; routes: RouteCandidate[] } | { status: 'unavailable'; message: string }
// OpenRouteService 구현체도 같은 요청·결과 형식을 구현합니다. 현재 API 호출은 없습니다.
export interface RoutingProvider {
  readonly id: string
  getRoutes(request: RoutingRequest): Promise<RoutingResult>
}
export type RoutingState = RoutingResult | { status: 'idle' | 'loading' | 'error'; message: string }
