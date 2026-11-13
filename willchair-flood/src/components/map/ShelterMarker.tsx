import { useEffect, useRef } from 'react'
import { divIcon, DomEvent } from 'leaflet'
import type { Marker as LeafletMarker } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import type { ShelterComparison } from '../../isochrones/types'
import { candidateField, shelterFloodLabel } from '../../utils/shelters'
export function ShelterMarker({ candidate, selected, onSelect }: { candidate: ShelterComparison; selected: boolean; onSelect: (id: string) => void }) {
  const ref = useRef<LeafletMarker>(null)
  const feature = candidate.feature
  const p = feature.properties
  const id = String(feature.id)
  useEffect(() => {
    const marker = ref.current
    const element = marker?.getElement()
    if (!marker || !element) return
    element.setAttribute('aria-label', `${p.name}. ${shelterFloodLabel(candidate)}. 가상 후보지 정보 보기`)
    const activate = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      event.stopPropagation()
      onSelect(id)
      marker.openPopup()
    }
    element.addEventListener('keydown', activate)
    return () => element.removeEventListener('keydown', activate)
  }, [candidate, id, onSelect, p.name])
  return <Marker ref={ref} position={[feature.geometry.coordinates[1]!, feature.geometry.coordinates[0]!]}
    title={p.name} alt={p.name}
    icon={divIcon({ className: `shelter-marker ${selected ? 'selected' : ''}`, html: '<span aria-hidden="true">S</span>', iconSize: [32, 32], iconAnchor: [16, 16] })}
    bubblingMouseEvents={false} eventHandlers={{ click: event => { DomEvent.stopPropagation(event.originalEvent); onSelect(id) } }}>
    <Popup><strong>{p.name}</strong><p>시나리오 기반 가상 후보지 · 실제 시설 아님</p>
      <p>출입구: {candidateField(p.entrance)}<br/>접근성: {candidateField(p.accessibility)}<br/>운영 상태: {candidateField(p.operation)}</p>
      <p>{candidate.inRange === null ? '가상 범위 포함 여부 미확인' : candidate.inRange ? '선택 가상 범위 안 · 실제 도달 미확인' : '선택 가상 범위 밖 · 실제 도달 미확인'}</p>
      <p>{shelterFloodLabel(candidate)}</p>
    </Popup>
  </Marker>
}
