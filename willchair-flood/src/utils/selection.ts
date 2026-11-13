import type { Coordinates, Selection } from '../types'
export function locationName(point: Coordinates | null) {
  return point ? `${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}` : '선택 전'
}
// Leaflet은 [lat, lng], GeoJSON Point는 [lng, lat] 순서입니다.
export function toGeoJSONPosition(point: Coordinates): [number, number] {
  return [point.lng, point.lat]
}
export function selectionMessage({ origin, destination }: Selection) {
  if (!origin || !destination) return '지도를 눌러 출발지와 목적지를 선택해 주세요.'
  if (origin.lat === destination.lat && origin.lng === destination.lng) return '출발지와 목적지를 서로 다르게 선택해 주세요.'
  return '좌표가 선택되었습니다. 준비된 시연 경로와 일치하는지 확인합니다.'
}
