import { readJson } from '../utils/readJson'
import { length } from '@turf/length'
import type { FeatureCollection, LineString } from 'geojson'
import type { Coordinates } from '../types'
import type { RouteProperties, RoutingProvider, RoutingRequest, RoutingResult } from './types'
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
export function validateRoutes(value: unknown): FeatureCollection<LineString, RouteProperties> {
  const fail = (): never => { throw new Error('시연 경로 GeoJSON 형식 또는 좌표 오류') }
  if (!record(value) || value.type !== 'FeatureCollection' || !Array.isArray(value.features) || !value.features.length) return fail()
  const ids = new Set()
  for (const f of value.features) {
    if (!record(f) || f.type !== 'Feature' || typeof f.id !== 'string' || ids.has(f.id)) return fail()
    ids.add(f.id)
    const p = f.properties, g = f.geometry
    if (!record(p) || p.source !== 'simulation' || (p.kind !== 'regular' && p.kind !== 'detour') || typeof p.name !== 'string' || typeof p.description !== 'string') return fail()
    if (!record(g) || g.type !== 'LineString' || !Array.isArray(g.coordinates) || g.coordinates.length < 2) return fail()
    for (const c of g.coordinates) {
      if (!Array.isArray(c) || c.length !== 2 || !c.every(n => typeof n === 'number' && Number.isFinite(n)) || c[0] < 126.99 || c[0] > 127.07 || c[1] < 37.46 || c[1] > 37.54) return fail()
    }
  }
  return value as unknown as FeatureCollection<LineString, RouteProperties>
}
// 부동소수점 오차만 허용합니다. 근처 지점으로 이동시키거나 임의 연결선을 만들지 않습니다.
const matches = (point: Coordinates, position: number[]) => Math.abs(point.lng - position[0]!) < 1e-8 && Math.abs(point.lat - position[1]!) < 1e-8
export function matchPreparedRoutes(data: FeatureCollection<LineString, RouteProperties>, request: RoutingRequest): RoutingResult {
  const routes = data.features.flatMap(feature => {
    const coordinates = feature.geometry.coordinates
    const forward = matches(request.origin, coordinates[0]!) && matches(request.destination, coordinates.at(-1)!)
    const backward = matches(request.origin, coordinates.at(-1)!) && matches(request.destination, coordinates[0]!)
    if (!forward && !backward) return []
    const oriented = { ...feature, geometry: { ...feature.geometry, coordinates: backward ? [...coordinates].reverse() : coordinates } }
    const distanceMeters = length(oriented, { units: 'kilometers' }) * 1000
    if (!Number.isFinite(distanceMeters) || distanceMeters <= 0) throw new Error('시연 경로 거리가 올바르지 않습니다.')
    return [{ id: String(feature.id), feature: oriented, distanceMeters }]
  })
  return routes.length ? { status: 'ready', routes } : { status: 'unavailable', message: '경로 계산 불가 · 선택한 두 지점을 연결하는 사전 준비 경로가 없습니다.' }
}
export class PreparedRoutingProvider implements RoutingProvider {
  readonly id = 'prepared-demo'
  async getRoutes(request: RoutingRequest): Promise<RoutingResult> {
    const value = await readJson('data/demo-routes.geojson', '시연 경로 파일', request.signal)
    return matchPreparedRoutes(validateRoutes(value), request)
  }
}
