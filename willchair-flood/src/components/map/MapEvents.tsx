import { useEffect } from 'react'
import { useMapEvents } from 'react-leaflet'
import type { Coordinates } from '../../types'
export function MapEvents({ onSelect }: { onSelect: (point: Coordinates) => void }) {
  const map = useMapEvents({ click: ({ latlng }) => onSelect({ lat: latlng.lat, lng: latlng.wrap().lng }) })
  useEffect(() => {
    const container = map.getContainer()
    container.setAttribute('role', 'region')
    container.setAttribute('aria-label', '강남역 지도. 방향키로 이동, 더하기와 빼기로 확대 축소, Enter로 중심 지점 선택')
    container.setAttribute('aria-describedby', 'map-keyboard-help')
    const selectCenter = (event: KeyboardEvent) => {
      if (event.target !== container || event.key !== 'Enter') return
      event.preventDefault()
      event.stopPropagation()
      const center = map.getCenter().wrap()
      onSelect({ lat: center.lat, lng: center.lng })
    }
    container.addEventListener('keydown', selectCenter)
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)
    return () => { observer.disconnect(); container.removeEventListener('keydown', selectCenter) }
  }, [map, onSelect])
  return null
}
