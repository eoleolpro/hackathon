import { useEffect, useRef } from 'react'
import { Circle, Marker, Popup, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import type { LocationSample } from '../../types/location'
const currentIcon = divIcon({ className: 'rescue-current-marker', html: '<span>내 위치</span>', iconSize: [48, 48], iconAnchor: [24, 24] })
export function CurrentLocationLayer({ sample, recenter }: { sample: LocationSample | null; recenter: number }) {
  const map = useMap()
  const initialized = useRef(false)
  const previousRecenter = useRef(recenter)
  useEffect(() => {
    if (!sample) { initialized.current = false; map.setView([37.4979, 127.0276], 15); return }
    if (!initialized.current || previousRecenter.current !== recenter) {
      map.setView([sample.latitude, sample.longitude], 16)
      initialized.current = true
    }
    previousRecenter.current = recenter
  }, [map, sample, recenter])
  useEffect(() => {
    map.getContainer().setAttribute('role', 'region')
    map.getContainer().setAttribute('aria-label', '현재 위치 지도. 방향키로 이동하고 더하기 빼기로 확대 축소할 수 있습니다.')
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  if (!sample) return null
  const position: [number, number] = [sample.latitude, sample.longitude]
  return <><Circle center={position} radius={sample.accuracy} interactive={false} pathOptions={{ color: '#087f83', fillColor: '#087f83', fillOpacity: 0.12, weight: 1 }}/><Marker position={position} icon={currentIcon} title="내 위치 · 마지막 수신 좌표" alt="내 위치 · 마지막 수신 좌표"><Popup>마지막 수신 위치<br/>위도 {sample.latitude.toFixed(6)} · 경도 {sample.longitude.toFixed(6)}<br/>정확도 약 {Math.round(sample.accuracy)}m · 실제 오차를 보장하지 않습니다.</Popup></Marker></>
}
