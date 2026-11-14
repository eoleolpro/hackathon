import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { LocateFixed } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './map.css'
import { CurrentLocationLayer } from './CurrentLocationLayer'
import { useMapTiles } from '../../hooks/useMapTiles'
import { MapLoadingStatus } from './MapLoadingStatus'
import type { LocationSample } from '../../types/location'
import { formatLocationTime } from '../../utils/location'
export function RescueMap({ sample }: { sample: LocationSample | null }) {
  const tiles = useMapTiles()
  const [recenter, setRecenter] = useState(0)
  return <section id="rescue-map" className="rescue-card rescue-map-card" aria-labelledby="rescue-map-title"><div className="rescue-section-heading"><h2 id="rescue-map-title">마지막 수신 위치 지도</h2><button type="button" className="rescue-secondary" disabled={!sample} onClick={() => setRecenter(value => value + 1)}><LocateFixed size={17} aria-hidden="true"/>현재 위치로 이동</button></div><p className="rescue-small">{sample ? '내 위치 마커: 마지막 수신 좌표 · 청록색 원: 제공된 정확도 반경' : '현재 위치 미확인 · 초기 지도는 강남역 일대이며 사용자 위치가 아닙니다.'}</p>
    <MapContainer center={[37.4979, 127.0276]} zoom={15} className="rescue-leaflet-map" keyboard scrollWheelZoom touchZoom aria-label="현재 위치 지도. 방향키 이동, 더하기 빼기로 확대 축소">
      <TileLayer key={tiles.attempt} url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'} eventHandlers={tiles.handlers}/>
      <CurrentLocationLayer sample={sample} recenter={recenter}/>
    </MapContainer><p className="rescue-map-updated">마지막 위치 업데이트: {sample ? formatLocationTime(sample.measuredAt) : '수신 전'}</p><MapLoadingStatus status={tiles.status} onRetry={tiles.retry}/>
    <p className="rescue-small">정확도 원은 기기가 제공한 수치이며 실제 오차·안전 범위를 보장하지 않습니다. 지도 원본 갱신 시각은 미확인입니다.</p>
  </section>
}
