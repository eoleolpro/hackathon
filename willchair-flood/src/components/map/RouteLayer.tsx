import { useEffect } from 'react'
import { DomEvent } from 'leaflet'
import { Tooltip, useMap } from 'react-leaflet'
import { AccessibleGeoJSON } from './AccessibleGeoJSON'
import { overlapLabel } from '../../utils/routeAnalysis'
import type { RouteAnalysis } from '../../utils/routeAnalysis'
import type { RouteCandidate } from '../../routing/types'
interface Props {
  routes: RouteCandidate[]
  selectedId: string
  onSelect: (id: string) => void
  analyses: RouteAnalysis[]
}
export function RouteLayer({ routes, selectedId, onSelect, analyses }: Props) {
  const map = useMap()
  useEffect(() => {
    const points = routes.flatMap(route => route.feature.geometry.coordinates.map(([lng, lat]) => [lat!, lng!] as [number, number]))
    if (points.length) map.fitBounds(points, { padding: [35, 35], maxZoom: 16 })
  }, [map, routes])
  return <>{routes.map(route => {
    const analysis = analyses.find(item => item.routeId === route.id)
    return <AccessibleGeoJSON
      key={route.id + JSON.stringify(route.feature.geometry.coordinates)}
      keyboardLabel={`${route.feature.properties.name}. ${overlapLabel(analysis)}. 접근성 미확인.`}
      onKeyboardActivate={() => onSelect(route.id)}
      data={route.feature}
      style={{
        color: analysis?.overlap === 'overlap' ? '#b84432' : route.feature.properties.kind === 'regular' ? '#a34d15' : '#6c4fb3',
        weight: route.id === selectedId ? 7 : 4,
        opacity: route.id === selectedId ? 1 : 0.65,
        dashArray: route.feature.properties.kind === 'detour' ? '9 7' : undefined,
      }}
      eventHandlers={{ click: event => { DomEvent.stopPropagation(event.originalEvent); onSelect(route.id) } }}
      bubblingMouseEvents={false}
    ><Tooltip sticky>{route.feature.properties.name} · {overlapLabel(analysis)}</Tooltip></AccessibleGeoJSON>
  })}</>
}
