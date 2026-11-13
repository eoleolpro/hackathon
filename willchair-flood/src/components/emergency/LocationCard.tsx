import { LocateFixed, Square } from 'lucide-react'
import type { useEmergencyLocation } from '../../hooks/useEmergencyLocation'
import { formatLocationTime, locationErrors, locationQuality } from '../../utils/location'
export function LocationCard({ location, onStart, onStop }: { location: ReturnType<typeof useEmergencyLocation>; onStart: () => void; onStop: () => void }) {
  const { sample } = location
  const quality = sample ? locationQuality(sample, location.now) : null
  const label = location.status === 'idle' ? '위치 수신 전' : location.status === 'requesting' ? '위치 수신 중 · 권한 요청 또는 위치 확인 대기' : location.status === 'confirmed' ? (quality?.stale ? '마지막 위치가 오래됨 · 새 위치 수신 대기' : '위치 확인됨') : location.status === 'stopped' ? '긴급 모드 종료 · 위치 관찰 중지됨' : '위치 확인 실패'
  return <section className="rescue-card location-card" aria-labelledby="location-title"><div className="rescue-section-heading"><h2 id="location-title">내 위치 확인</h2><span className="rescue-badge">스마트폰 위치 서비스</span></div>
    <p className="rescue-location-status" role="status">{label}</p>
    {location.errorCode && <p role="alert" className="rescue-warning">{locationErrors[location.errorCode]}</p>}
    {!location.active ? <button type="button" className="rescue-primary" onClick={onStart}><LocateFixed size={20} aria-hidden="true"/>긴급 위치 모드 시작</button> : <div className="rescue-location-actions"><button type="button" className="rescue-stop" onClick={onStop}><Square size={16} aria-hidden="true"/>긴급 모드 종료</button>{location.status === 'error' && <button type="button" className="rescue-secondary" onClick={onStart}>위치 다시 요청</button>}</div>}
    <dl className="rescue-coordinates"><div><dt>현재 위도</dt><dd data-testid="rescue-latitude">{sample ? sample.latitude.toFixed(6) : '미확인'}</dd></div><div><dt>현재 경도</dt><dd data-testid="rescue-longitude">{sample ? sample.longitude.toFixed(6) : '미확인'}</dd></div><div><dt>위치 정확도</dt><dd>{sample ? `약 ${Math.round(sample.accuracy)} m` : '미확인'}</dd></div><div><dt>마지막 위치 갱신</dt><dd>{sample ? <time dateTime={new Date(sample.measuredAt).toISOString()}>{formatLocationTime(sample.measuredAt)}</time> : '아직 수신하지 않음'}</dd></div></dl>
    {quality?.poorAccuracy && <p className="rescue-warning">위치 정확도가 낮습니다. 정확도 수치가 100m를 초과해 실제 위치와 차이가 클 수 있습니다.</p>}
    {quality?.stale && <p className="rescue-warning">오래된 위치정보입니다. 측정 후 60초 이상 경과했으며 현재 위치와 다를 수 있습니다.</p>}
    <p className="rescue-small">60초·100m는 앱의 주의 표시 기준입니다. 정확도 수치는 실제 오차를 완전히 보장하지 않습니다.</p>
    
    <p className="rescue-small">시작하면 위치 권한을 요청합니다. 좌표는 저장하지 않으며, 지도 표시를 위해 OpenStreetMap에 해당 지역 타일을 요청합니다. 연락 대상 공유는 별도 버튼을 눌러야 진행됩니다.</p>
  </section>
}
