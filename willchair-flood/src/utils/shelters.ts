import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon'
import type { IsochroneFeature, ShelterComparison, ShelterFeature } from '../isochrones/types'
import type { FloodFeature } from './flood'
export function compareShelters(shelters: ShelterFeature[], area: IsochroneFeature | undefined, floods: FloodFeature[], floodReady: boolean): ShelterComparison[] {
  return shelters.map(feature => {
    const overlaps = floodReady ? floods.filter(flood => booleanPointInPolygon(feature, flood, { ignoreBoundary: false })) : []
    return { feature, inRange: area ? booleanPointInPolygon(feature, area, { ignoreBoundary: false }) : null, floodOverlap: floodReady ? overlaps.length > 0 : null, overlappingAreas: overlaps.map(f => f.properties.name) }
  })
}
export const candidateField = (value: string | null | undefined) => value?.trim() || '미확인'
export const shelterFloodLabel = (candidate: ShelterComparison) => candidate.floodOverlap === null ? '침수 중첩 미확인' : candidate.floodOverlap ? '가상 침수 구역 중첩 · 안전 미확인' : '가상 침수 중첩 없음 · 실제 안전 미확인'
