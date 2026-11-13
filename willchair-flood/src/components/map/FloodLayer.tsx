import { useLayoutEffect, useRef } from 'react'
import { DomEvent } from 'leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import type { Coordinates } from '../../types'
import { AccessibleGeoJSON } from './AccessibleGeoJSON'
import type { FloodFeature } from '../../utils/flood'
export function FloodLayer({ features, onSelect }: { features: FloodFeature[]; onSelect: (point: Coordinates) => void }) {
  const selectRef = useRef(onSelect)
  useLayoutEffect(() => { selectRef.current = onSelect }, [onSelect])
  return <>{features.map(feature => <AccessibleGeoJSON keyboardLabel={`${feature.properties.name}. 시뮬레이션 침수 구역. 선택하면 중심 좌표를 지정합니다.`} onKeyboardActivate={center => selectRef.current({ lat: center.lat, lng: center.lng })} key={feature.id} data={feature} bubblingMouseEvents={false} style={{ color: '#2563b4', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.3 }} onEachFeature={(_, layer) => {
    const content = document.createElement('div')
    const title = document.createElement('strong')
    title.textContent = feature.properties.name
    const description = document.createElement('p')
    description.textContent = feature.properties.description
    const source = document.createElement('small')
    source.textContent = '시뮬레이션 · source: simulation · 실제 관측 데이터 아님'
    content.append(title, description, source)
    layer.bindTooltip(feature.properties.name + ' · 시뮬레이션')
    layer.bindPopup(content)
    layer.on('click', (event: LeafletMouseEvent) => {
      DomEvent.stopPropagation(event.originalEvent)
      selectRef.current({ lat: event.latlng.lat, lng: event.latlng.wrap().lng })
    })
  }}/> )}</>
}
