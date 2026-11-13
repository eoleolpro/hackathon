import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import type { Feature, FeatureCollection, Polygon } from 'geojson'
import type { Coordinates, Scenario } from '../types'
import { toGeoJSONPosition } from './selection'
export interface FloodProperties {
  source: 'simulation'
  name: string
  description: string
  scenarios: Scenario[]
}
export type FloodFeature = Feature<Polygon, FloodProperties>
export type FloodData = FeatureCollection<Polygon, FloodProperties>
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const cross = (a: number[], b: number[], c: number[]) => (b[0]! - a[0]!) * (c[1]! - a[1]!) - (b[1]! - a[1]!) * (c[0]! - a[0]!)
const onSegment = (a: number[], b: number[], p: number[]) => cross(a, b, p) === 0 && p[0]! >= Math.min(a[0]!, b[0]!) && p[0]! <= Math.max(a[0]!, b[0]!) && p[1]! >= Math.min(a[1]!, b[1]!) && p[1]! <= Math.max(a[1]!, b[1]!)
function intersects(a: number[], b: number[], c: number[], d: number[]) {
  return (cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0) || onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b)
}
// 이 로더는 구멍 없는 단순 Polygon만 지원하며 다른 형태는 거부합니다.
export function validateFloodData(value: unknown): FloodData {
  const fail = (): never => { throw new Error('침수 GeoJSON 형식 또는 좌표가 올바르지 않습니다. 분석을 중단합니다.') }
  if (!record(value) || value.type !== 'FeatureCollection' || value.source !== 'simulation' || !Array.isArray(value.features) || value.features.length !== 3) return fail()
  const ids = new Set()
  for (const feature of value.features) {
    if (!record(feature) || feature.type !== 'Feature' || typeof feature.id !== 'string' || ids.has(feature.id)) return fail()
    ids.add(feature.id)
    const p = feature.properties
    const g = feature.geometry
    if (!record(p) || p.source !== 'simulation' || typeof p.name !== 'string' || !p.name.trim() || typeof p.description !== 'string' || !p.description.trim() || !Array.isArray(p.scenarios) || p.scenarios.length === 0 || !p.scenarios.every(s => s === '집중호우' || s === '침수 발생')) return fail()
    if (!record(g) || g.type !== 'Polygon' || !Array.isArray(g.coordinates) || g.coordinates.length !== 1) return fail()
    const ring = g.coordinates[0]
    if (!Array.isArray(ring) || ring.length < 4) return fail()
    for (const position of ring) {
      // GeoJSON [lng, lat]. 강남역 주변 범위 검사로 순서가 뒤집힌 좌표도 거부합니다.
      if (!Array.isArray(position) || position.length !== 2 || !position.every(n => typeof n === 'number' && Number.isFinite(n)) || position[0] < 126.99 || position[0] > 127.07 || position[1] < 37.46 || position[1] > 37.54) return fail()
    }
    const points = ring as number[][]
    if (points[0]![0] !== points.at(-1)![0] || points[0]![1] !== points.at(-1)![1]) return fail()
    if (new Set(points.slice(0, -1).map(p => p.join(','))).size !== points.length - 1) return fail()
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[(i + points.length - 2) % (points.length - 1)]!, b = points[i]!, c = points[i + 1]!
      if (onSegment(a, b, c) || onSegment(b, c, a)) return fail()
    }
    let area = 0
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]!, b = points[i + 1]!
      area += (a[0]! - points[0]![0]!) * (b[1]! - points[0]![1]!) - (b[0]! - points[0]![0]!) * (a[1]! - points[0]![1]!)
      for (let j = i + 2; j < points.length - 1; j++) {
        if (i === 0 && j === points.length - 2) continue
        if (intersects(a, b, points[j]!, points[j + 1]!)) return fail()
      }
    }
    if (area <= 0) return fail() // 외곽 링은 반시계 방향이며 면적이 0보다 커야 합니다.
  }
  return value as unknown as FloodData
}
export function activeFloods(data: FloodData | null, scenario: Scenario): FloodFeature[] {
  return data?.features.filter(feature => feature.properties.scenarios.includes(scenario)) ?? []
}
export function pointFloodStatus(point: Coordinates | null, features: FloodFeature[], ready: boolean): string {
  if (!point) return '위치 선택 전'
  if (!ready) return '데이터 미확인 · 포함 여부 판정 불가'
  const matches = features.filter(feature => booleanPointInPolygon(toGeoJSONPosition(point), feature, { ignoreBoundary: false }))
  return matches.length ? `가상 침수 구역 포함 (경계 포함) · ${matches.map(f => f.properties.name).join(', ')}` : '선택 시나리오의 가상 침수 구역 밖 · 실제 안전 여부 미확인'
}


