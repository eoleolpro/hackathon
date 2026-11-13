import { booleanIntersects } from '@turf/boolean-intersects'
import type { RouteCandidate } from '../routing/types'
import type { FloodFeature } from './flood'
export interface RouteAnalysis {
  routeId: string
  overlap: 'overlap' | 'clear' | 'unknown'
  overlappingAreas: string[]
  accessibility: 'unknown'
  eligibleDetour: boolean
}
// 레이어 표시 여부와 무관하게 선택 시나리오 전체를 분석합니다.
// 접촉·경계·완전 포함도 중첩이며, clear는 실제 안전을 뜻하지 않습니다.
export function analyzeRoutes(routes: RouteCandidate[], floods: FloodFeature[], ready: boolean): RouteAnalysis[] {
  return routes.map(route => {
    if (!ready) return { routeId: route.id, overlap: 'unknown', overlappingAreas: [], accessibility: 'unknown', eligibleDetour: false }
    const overlappingAreas = floods.filter(flood => booleanIntersects(route.feature, flood)).map(flood => flood.properties.name)
    return {
      routeId: route.id,
      overlap: overlappingAreas.length ? 'overlap' : 'clear',
      overlappingAreas,
      accessibility: 'unknown',
      eligibleDetour: route.feature.properties.kind === 'detour' && overlappingAreas.length === 0,
    }
  })
}
export function overlapLabel(analysis: RouteAnalysis | undefined) {
  if (!analysis || analysis.overlap === 'unknown') return '중첩 여부 미확인'
  return analysis.overlap === 'overlap' ? '위험 중첩 (시뮬레이션)' : '가상 침수 중첩 없음 · 실제 안전 미확인'
}
