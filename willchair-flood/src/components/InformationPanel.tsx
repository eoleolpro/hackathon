import type { TimelineMinute } from '../data/timeline'
import type { RouteAnalysis } from '../utils/routeAnalysis'
import { RouteInformation } from './RouteInformation'
import type { RouteCandidate, RoutingState } from '../routing/types'
import { Accessibility, ChevronDown, CircleHelp, Info, Route, ShieldCheck, Waves } from 'lucide-react'
import type { Selection } from '../types'
import { locationName } from '../utils/selection'
import { pointFloodStatus } from '../utils/flood'
import type { FloodFeature } from '../utils/flood'
import { scenarioDescriptions } from '../data/simulation'
export function InformationPanel({ minute, selection, floods, floodReady, floodError, routing, selectedRoute, onRouteSelect, routeAnalyses }: { minute: TimelineMinute; selection: Selection; floods: FloodFeature[]; floodReady: boolean; floodError: string | null; routing: RoutingState; selectedRoute: RouteCandidate | undefined; onRouteSelect: (id: string) => void; routeAnalyses: RouteAnalysis[] }) {
  return <details className="panel information-panel" open><summary className="panel-heading"><span><Info size={19}/> 이동 정보</span><ChevronDown size={16}/></summary><div className="panel-body"><div className="section-caption"><h2>선택한 이동 조건</h2><p>입력한 조건을 한눈에 확인하세요.</p></div><dl className="selection-summary" aria-live="polite"><div><dt><i/>출발지</dt><dd>{locationName(selection.origin)}</dd></div><div><dt><i/>목적지</dt><dd>{locationName(selection.destination)}</dd></div></dl>
  <section className="info-section"><div className="subheading"><h2><Route size={17}/> 경로 정보</h2><span className="muted-label">시연</span></div><RouteInformation minute={minute} state={routing} selected={selectedRoute} onSelect={onRouteSelect} analyses={routeAnalyses} floodReady={floodReady && !floodError}/></section>
  <section className="info-section"><div className="subheading"><h2><Waves size={17}/> 침수 위험 정보</h2><span className="tiny-badge">시뮬레이션</span></div><div className="scenario-summary" aria-live="polite"><strong>{selection.scenario} · {minute}분</strong><p>{scenarioDescriptions[selection.scenario]}</p></div><div className="flood-results" aria-live="polite">{floodError && <p role="alert">{floodError}</p>}{(["origin", "destination"] as const).map(kind => <div key={kind}><h3>{kind === "origin" ? "출발지" : "목적지"}</h3><p>{pointFloodStatus(selection[kind], floods, floodReady)}</p></div>)}</div><p className="field-hint">점의 포함 여부와 경로의 공간 중첩만 분석합니다. 실제 침수·안전·위험도는 미확인입니다.</p></section>
  <div className="accessibility-note"><Accessibility size={20}/><div><h3>접근성 정보도 함께</h3><p>경사도, 턱, 보도 접근성 정보는<br/>데이터 연결 후 확인할 수 있습니다.</p></div></div><p className="safety-note"><ShieldCheck size={16}/> 현재 실제 이동 안전성을 평가하지 않습니다.</p><div className="development-note"><CircleHelp size={15}/><p>이 화면은 무엇을 보여주나요?<br/><small>지도에서 선택한 좌표와 입력 조건을 보여줍니다.</small></p></div></div></details>
}
