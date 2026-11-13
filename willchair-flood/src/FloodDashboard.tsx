import { Accessibility, Waves } from 'lucide-react'
import { LocationPanel } from './components/LocationPanel'
import { InteractiveMap } from './components/InteractiveMap'
import { InformationPanel } from './components/InformationPanel'
import { FloodTimeline } from './components/FloodTimeline'
import { ReachabilityControls, ShelterComparisonPanel } from './components/ReachabilityPanel'
import { SourceInformation } from './components/SourceInformation'
import { MapErrorBoundary } from './components/map/MapErrorBoundary'
import { timelineDisclaimer } from './data/timeline'
import { useDashboard } from './hooks/useDashboard'
import './App.css'

export default function App() {
  const dashboard = useDashboard()
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">본문으로 바로가기</a>
      <header className="site-header">
        <a className="brand" href="#main">
          <span className="brand-symbol"><Accessibility size={29}/><Waves size={20}/></span>
          <span>WILLCHAIR <strong>FLOOD</strong><small>누구에게나, 이동의 가능성을.</small></span>
        </a>
        <p className="header-description">휠체어 사용자를 위한 침수 시나리오 탐색</p>
        <span className="stage-badge">● 침수 시뮬레이션</span>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="page-intro">
          <div>
            <p className="eyebrow">ACCESSIBLE MOBILITY, EVERY DAY</p>
            <h1>이동의 시작에, 안심을 더하다<span>.</span></h1>
            <p>출발지와 목적지를 선택하고, 침수 상황에 따른 이동 정보를 준비하세요.</p>
          </div>
          <span className="intro-note"><Waves size={18}/> 침수 시나리오 시뮬레이션</span>
        </section>
        <p className="persistent-simulation-notice">{timelineDisclaimer}</p>
        <FloodTimeline minute={dashboard.minute} onChange={dashboard.setMinute} onReset={dashboard.resetAll}/>
        <ReachabilityControls range={dashboard.reachRange} onRange={dashboard.setReachRange}
          state={dashboard.isochrones} onDemoOrigin={dashboard.chooseReachOrigin}/>
        <div className="workspace">
          <LocationPanel selection={dashboard.selection} target={dashboard.target}
            onTarget={dashboard.setTarget} onChange={dashboard.setSelection}
            onReset={dashboard.resetAll} onDemo={dashboard.chooseDemo}/>
          <MapErrorBoundary key={dashboard.resetVersion}>
            <InteractiveMap minute={dashboard.minute} selection={dashboard.selection}
              target={dashboard.target} onSelect={dashboard.selectPoint} onReset={dashboard.resetPoints}
              floods={dashboard.floods} floodVisible={dashboard.floodVisible}
              onVisibilityChange={dashboard.setFloodVisible} floodReady={dashboard.floodReady}
              floodError={dashboard.floodError} routes={dashboard.routes}
              selectedRouteId={dashboard.selectedRoute?.id ?? ''} onRouteSelect={dashboard.chooseRoute}
              routeAnalyses={dashboard.routeAnalyses} reachArea={dashboard.reachArea}
              shelterComparisons={dashboard.shelterComparisons}
              selectedShelterId={dashboard.selectedShelterId} onShelterSelect={dashboard.setSelectedShelterId}/>
          </MapErrorBoundary>
          <InformationPanel minute={dashboard.minute} selection={dashboard.selection}
            floods={dashboard.floods} floodReady={dashboard.floodReady} floodError={dashboard.floodError}
            routing={dashboard.routing.state} selectedRoute={dashboard.selectedRoute}
            onRouteSelect={dashboard.chooseRoute} routeAnalyses={dashboard.routeAnalyses}/>
        </div>
        <ShelterComparisonPanel candidates={dashboard.shelterComparisons}
          ready={dashboard.shelters.data !== null} error={dashboard.shelters.error}
          selectedId={dashboard.selectedShelterId} onSelect={dashboard.setSelectedShelterId}
          range={dashboard.reachRange}/>
        <aside className="notice">
          <strong>이용 안내</strong>
          <p>파란 구역은 가상 침수 시뮬레이션입니다. 구역 밖도 실제 안전 여부는 미확인입니다.
            경로는 사전 준비된 시연 경로이며 실제 API 계산 결과가 아닙니다.
            실제 침수 정보·위험도·이동 안전성은 미확인입니다.</p>
        </aside>
        <SourceInformation/>
      </main>
      <footer>
        <span className="footer-brand">WILLCHAIR FLOOD</span>
        <p>지도: © OpenStreetMap contributors · 침수·경로·시간 범위·대피 후보는 시뮬레이션입니다.</p>
        <span>QUALITY REVIEW</span>
      </footer>
    </div>
  )
}
