import { ReachabilityLayer } from './map/ReachabilityLayer'
import type { IsochroneFeature, ShelterComparison } from '../isochrones/types'
import type { TimelineMinute } from '../data/timeline'
import type { RouteAnalysis } from '../utils/routeAnalysis'
import { RouteLayer } from './map/RouteLayer'
import type { RouteCandidate } from '../routing/types'
import { useMapTiles } from '../hooks/useMapTiles'
import { MapLoadingStatus } from './map/MapLoadingStatus'
import { Map, RotateCcw } from 'lucide-react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coordinates, PointTarget, Selection } from '../types'
import { MapEvents } from './map/MapEvents'
import { FloodLayer } from './map/FloodLayer'
import type { FloodFeature } from '../utils/flood'
import { LocationMarker } from './map/LocationMarker'
interface Props { minute: TimelineMinute; selection: Selection; target: PointTarget; onSelect: (point: Coordinates) => void; onReset: () => void; floods: FloodFeature[]; floodVisible: boolean; onVisibilityChange: (visible: boolean) => void; floodReady: boolean; floodError: string | null; routes: RouteCandidate[]; selectedRouteId: string; onRouteSelect: (id: string) => void; routeAnalyses: RouteAnalysis[]; reachArea: IsochroneFeature | undefined; shelterComparisons: ShelterComparison[]; selectedShelterId: string; onShelterSelect: (id: string) => void }
export function InteractiveMap({ minute, selection, target, onSelect, onReset, floods, floodVisible, onVisibilityChange, floodReady, floodError, routes, selectedRouteId, onRouteSelect, routeAnalyses, reachArea, shelterComparisons, selectedShelterId, onShelterSelect }: Props) {
  const tiles = useMapTiles()
  return <section className="map-panel" aria-label="강남역 일대 지도"><div className="map-toolbar"><span><Map size={17}/> 강남역 일대</span><button type="button" className="map-reset" onClick={onReset}><RotateCcw size={14}/> 지점 초기화</button></div><p className="map-instruction" aria-live="polite">지도를 누르면 <strong>{target === 'origin' ? '출발지' : '목적지'}</strong>가 지정됩니다. 이후 출발·도착을 번갈아 변경합니다.</p>
  <div className="flood-controls"><label><input type="checkbox" checked={floodVisible} onChange={event => onVisibilityChange(event.target.checked)}/> 가상 침수 구역 표시</label><span aria-live="polite">{floodError ?? (floodReady ? `선택 시나리오 ${minute}분 · ${floods.length}개 구역` : '침수 데이터 불러오는 중')}</span></div><div className="flood-legend"><span className="flood-swatch"/> 파란 영역: 가상 침수 (시뮬레이션)<small>영역 밖: 실제 안전 여부 미확인 · 숨겨도 포함 여부 분석은 유지</small></div>
  <p className="reach-map-legend">황토색 점선: {reachArea ? `${reachArea.properties.minutes}분 가상 시간 범위` : "가상 시간 범위 미표시"} · S: 가상 대피 후보 · 실제 이동시간 미계산</p>
  {routes.length > 0 && <p className="route-map-legend"><span className="regular-key"/> 일반 경로 <span className="detour-key"/> 우회 후보 <span className="overlap-key"/> 위험 중첩 (시뮬레이션) · 안전 판정 아님</p>}
  <p id="map-keyboard-help" className="map-keyboard-help">키보드: 지도에 Tab으로 이동 → 방향키로 이동 → Enter로 중심 좌표 지정. 경로·침수 구역은 Tab 후 Enter 또는 Space로 선택할 수 있습니다.</p>
  <MapContainer center={[37.4979, 127.0276]} zoom={16} minZoom={3} maxZoom={19} className="leaflet-map" scrollWheelZoom touchZoom dragging keyboard aria-label="클릭하여 출발지와 목적지를 선택하는 지도">
    <TileLayer key={tiles.attempt} url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'} eventHandlers={tiles.handlers}/>
    <ReachabilityLayer area={reachArea} candidates={shelterComparisons} selectedId={selectedShelterId} onSelect={onShelterSelect}/>
    {floodVisible && <FloodLayer features={floods} onSelect={onSelect}/>}
    <RouteLayer routes={routes} selectedId={selectedRouteId} onSelect={onRouteSelect} analyses={routeAnalyses}/>
    <MapEvents onSelect={onSelect}/><LocationMarker point={selection.origin} kind="origin"/><LocationMarker point={selection.destination} kind="destination"/>
  </MapContainer><MapLoadingStatus status={tiles.status} onRetry={tiles.retry}/><p className="map-load-status">침수 시나리오: {selection.scenario} · {minute}분 (가상 데이터 · 지형 기반 예측 아님)</p></section>
}
