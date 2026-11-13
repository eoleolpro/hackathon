import { divIcon } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import type { Coordinates, PointTarget } from '../../types'
import { locationName } from '../../utils/selection'
const icons = {
  origin: divIcon({ className: 'point-marker origin-marker', html: '<span>출발</span>', iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -42] }),
  destination: divIcon({ className: 'point-marker destination-marker', html: '<span>도착</span>', iconSize: [42, 42], iconAnchor: [21, 42], popupAnchor: [0, -42] }),
}
export function LocationMarker({ point, kind }: { point: Coordinates | null; kind: PointTarget }) {
  if (!point) return null
  const label = kind === 'origin' ? '출발지' : '목적지'
  return <Marker position={[point.lat, point.lng]} icon={icons[kind]} alt={label} title={label}><Popup><strong>{label}</strong><br/>위도, 경도: {locationName(point)}</Popup></Marker>
}
