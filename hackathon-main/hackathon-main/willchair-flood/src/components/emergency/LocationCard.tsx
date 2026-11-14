import { LocateFixed, Square } from 'lucide-react'
import type { useEmergencyLocation } from '../../hooks/useEmergencyLocation'
import { formatLocationTime, locationErrors, locationQuality } from '../../utils/location'
interface Props {
  location: ReturnType<typeof useEmergencyLocation>
  onStart: () => void
  onRetry: () => void
  onStop: () => void
}
export function LocationCard({ location, onStart, onRetry, onStop }: Props) {
  const { sample } = location
  const quality = sample ? locationQuality(sample, location.now) : null
  const label = location.status === 'idle' ? '위치 수신 전' : location.status === 'requesting' ? '위치 수신 중 · 권한 요청 또는 위치 확인 대기' : location.status === 'confirmed' ? (quality?.stale ? '마지막 위치가 오래됨 · 새 위치 수신 대기' : '위치 확인됨') : location.status === 'stopped' ? '긴급 모드 종료 · 위치 관찰 중지됨' : '위치 확인 실패'
  return <section className="rescue-card location-card" aria-labelledby="location-title">
    <h2 id="location-title">긴급 위치 모드</h2>
    <p className="rescue-small location-consent">시작 후 위치 권한을 요청합니다. 좌표를 저장하지 않으며 지도 표시 지역의 타일은 OpenStreetMap에 요청합니다.</p>
    {!location.active ? <button type="button" className="rescue-primary emergency-start" onClick={onStart}><LocateFixed size={22} aria-hidden="true"/>긴급 위치 모드 시작</button> : <div className="rescue-location-actions"><button type="button" className="rescue-stop" onClick={onStop}><Square size={16} aria-hidden="true"/>긴급 모드 종료</button>{location.status === 'error' && <button type="button" className="rescue-secondary" onClick={onRetry}>위치 다시 요청</button>}</div>}
    <p className="rescue-location-status" role="status">{label}</p>
    {location.errorCode && <p role="alert" className="rescue-warning">{locationErrors[location.errorCode]}</p>}
    {location.errorCode && sample && <p className="rescue-small">아래 좌표는 마지막 수신 값이며 현재 위치가 확인된 것은 아닙니다.</p>}
    <dl className="rescue-coordinates">
      <div><dt>현재 위도</dt><dd data-testid="rescue-latitude">{sample ? sample.latitude.toFixed(6) : '미확인'}</dd></div>
      <div><dt>현재 경도</dt><dd data-testid="rescue-longitude">{sample ? sample.longitude.toFixed(6) : '미확인'}</dd></div>
      <div><dt>위치 정확도</dt><dd>{sample ? `약 ${Math.round(sample.accuracy)} m` : '미확인'}</dd></div>
      <div><dt>마지막 갱신</dt><dd>{sample ? <time dateTime={new Date(sample.measuredAt).toISOString()}>{formatLocationTime(sample.measuredAt)}</time> : '아직 수신하지 않음'}</dd></div>
    </dl>
    {quality?.poorAccuracy && <p className="rescue-warning">위치 정확도가 낮습니다. 정확도 수치가 100m를 초과합니다.</p>}
    {quality?.stale && <p className="rescue-warning">오래된 위치정보입니다. 측정 후 60초 이상 경과했습니다.</p>}
    <p className="rescue-small">60초·100m는 앱의 주의 표시 기준이며 실제 오차나 안전을 보장하지 않습니다.</p>
  </section>
}
