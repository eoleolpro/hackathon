import { readJson } from '../utils/readJson'
import { demoEndpoints } from '../data/demoEndpoints'
import { reachMinutes } from './types'
import type { IsochroneData, IsochroneProvider, IsochroneRequest, IsochroneResult, ShelterFeature } from './types'
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const position = (p: unknown): p is [number, number] => Array.isArray(p) && p.length === 2 && p.every(n => typeof n === 'number' && Number.isFinite(n)) && p[0] >= 126.99 && p[0] <= 127.07 && p[1] >= 37.46 && p[1] <= 37.54
export function validateIsochrones(value: unknown): IsochroneData {
  const fail = (): never => { throw new Error('가상 등시간선 GeoJSON 형식 또는 좌표 오류') }
  if (!record(value) || value.type !== 'FeatureCollection' || value.source !== 'simulation' || !Array.isArray(value.features) || value.features.length !== 3) return fail()
  const times = new Set()
  const ids = new Set()
  for (const f of value.features) {
    if (!record(f) || f.type !== 'Feature' || typeof f.id !== 'string' || ids.has(f.id)) return fail()
    ids.add(f.id)
    const p = f.properties, g = f.geometry
    if (!record(p) || p.source !== 'simulation' || !reachMinutes.some(t => t === p.minutes) || times.has(p.minutes) || !position(p.origin) || p.origin[0] !== demoEndpoints.origin.lng || p.origin[1] !== demoEndpoints.origin.lat) return fail()
    times.add(p.minutes)
    if (!record(g) || g.type !== 'Polygon' || !Array.isArray(g.coordinates) || g.coordinates.length !== 1) return fail()
    const ring = g.coordinates[0]
    if (!Array.isArray(ring) || ring.length < 4 || !ring.every(position) || ring[0].join(',') !== ring.at(-1)!.join(',')) return fail()
    // 이 시연 파일은 반시계 방향의 직사각형만 지원합니다.
    if (ring.length !== 5 || ring[0][0] >= ring[1][0] || ring[0][1] >= ring[2][1] || ring[0][1] !== ring[1][1] || ring[1][0] !== ring[2][0] || ring[2][1] !== ring[3][1] || ring[3][0] !== ring[0][0]) return fail()
  }
  return value as unknown as IsochroneData
}
export function validateShelters(value: unknown): ShelterFeature[] {
  const fail = (): never => { throw new Error('가상 대피 후보지 GeoJSON 형식 또는 좌표 오류') }
  if (!record(value) || value.type !== 'FeatureCollection' || !Array.isArray(value.features) || !value.features.length) return fail()
  const ids = new Set()
  for (const f of value.features) {
    if (!record(f) || f.type !== 'Feature' || typeof f.id !== 'string' || ids.has(f.id)) return fail()
    ids.add(f.id)
    const p = f.properties, g = f.geometry
    if (!record(p) || p.source !== 'simulation' || typeof p.name !== 'string' || !p.name.trim() || !['entrance','accessibility','operation'].every(key => p[key] == null || typeof p[key] === 'string')) return fail()
    if (!record(g) || g.type !== 'Point' || !position(g.coordinates)) return fail()
  }
  return value.features as ShelterFeature[]
}
export class PreparedIsochroneProvider implements IsochroneProvider {
  readonly id = 'prepared-isochrones'
  async getIsochrones(request: IsochroneRequest): Promise<IsochroneResult> {
    if (Math.abs(request.origin.lat - demoEndpoints.origin.lat) >= 1e-8 || Math.abs(request.origin.lng - demoEndpoints.origin.lng) >= 1e-8) return { status: 'unavailable', message: '선택한 출발지의 준비된 등시간선 없음 · 실제 이동시간은 계산하지 않습니다.' }
    const value = await readJson('data/demo-isochrones.geojson', '가상 등시간선 파일', request.signal)
    const data = validateIsochrones(value)
    return { status: 'ready', data: { ...data, features: data.features.filter(feature => request.ranges.includes(feature.properties.minutes)) } }
  }
}
