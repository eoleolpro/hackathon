import type { TimelineMinute } from '../data/timeline'
import type { RouteCandidate, RoutingState } from '../routing/types'
import type { RouteAnalysis } from '../utils/routeAnalysis'
import { overlapLabel } from '../utils/routeAnalysis'
interface Props { minute: TimelineMinute; state: RoutingState; selected: RouteCandidate | undefined; onSelect: (id: string) => void; analyses: RouteAnalysis[]; floodReady: boolean }
export function RouteInformation({ minute, state, selected, onSelect, analyses, floodReady }: Props) {
  const selectedAnalysis = analyses.find(item => item.routeId === selected?.id)
  const candidates = state.status === 'ready' ? state.routes.filter(route => analyses.some(item => item.routeId === route.id && item.eligibleDetour)) : []
  return <div className="route-information" aria-live="polite">
    <span className="tiny-badge">사전 준비된 시연 경로</span><p className="analysis-time">분석 시점: {minute}분 · 가상 데이터 · 지형 기반 예측 아님</p>
    {state.status !== 'ready' ? <p className="route-message" role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p> : <>
      <div className="route-options">{state.routes.map(route => {
        const analysis = analyses.find(item => item.routeId === route.id)
        return <div className="route-comparison" key={route.id}>
          <button type="button" className={`route-option ${route.feature.properties.kind}`} aria-pressed={selected?.id === route.id} onClick={() => onSelect(route.id)}><span>{route.feature.properties.name}</span><strong>{Math.round(route.distanceMeters).toLocaleString('ko-KR')} m</strong></button>
          <p className={`overlap-status ${analysis?.overlap ?? 'unknown'}`}>{overlapLabel(analysis)}</p>
          <p className="accessibility-status">접근성 미확인 · 경사도·턱·보도 데이터 없음</p>
        </div>
      })}</div>
      {selected && <div className="route-detail"><h3>{selected.feature.properties.name}</h3><p>{selected.feature.properties.description}</p><p>거리: {Math.round(selected.distanceMeters).toLocaleString('ko-KR')} m · Turf.js 좌표 길이</p><p className={`overlap-status ${selectedAnalysis?.overlap ?? 'unknown'}`}>{overlapLabel(selectedAnalysis)}</p>{Boolean(selectedAnalysis?.overlappingAreas.length) && <p>겹친 구역: {selectedAnalysis!.overlappingAreas.join(', ')}</p>}<p>접근성: 미확인 · 휠체어 이동 가능 여부를 판정하지 않습니다.</p></div>}
      <section className="detour-results" aria-label="조건에 맞는 우회 후보"><h3>조건에 맞는 우회 후보</h3><p className="field-hint">조건: 사전 준비된 우회 후보 중 선택 시나리오의 가상 침수 영역과 겹치지 않음 (경계 접촉 포함).</p>{!floodReady ? <p className="candidate-empty">침수 데이터 미확인 · 후보 판정 불가</p> : candidates.length ? candidates.map(route => <button type="button" className="candidate-button" key={route.id} onClick={() => onSelect(route.id)}>{route.feature.properties.name} 선택 · {Math.round(route.distanceMeters)} m</button>) : <p className="candidate-empty">결과 없음 · 조건에 맞는 사전 준비 우회 후보가 없습니다.</p>}<p className="field-hint">중첩 없음은 실제 안전 또는 접근성 확보를 의미하지 않습니다. 새 경로를 계산하지 않습니다.</p></section>
    </>}
    <p className="field-hint">실제 API 계산 경로가 아닙니다. 이 분석은 가상 영역과의 공간 중첩 비교이며 실제 침수 안전 판정이 아닙니다.</p>
  </div>
}
