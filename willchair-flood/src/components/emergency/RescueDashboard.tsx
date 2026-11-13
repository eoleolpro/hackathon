import { useEffect, useState } from 'react'
import { Accessibility, LifeBuoy, MapPin, Radio, Settings, Waves } from 'lucide-react'
import { MockDeviceAdapter } from '../../adapters/mockDeviceAdapter'
import { useDeviceEvents } from '../../hooks/useDeviceEvents'
import { useEmergencyLocation } from '../../hooks/useEmergencyLocation'
import { useLocationShare } from '../../hooks/useLocationShare'
import { LocationCard } from './LocationCard'
import { ShareCard } from './ShareCard'
import { DevicePanel, DeviceSummary } from '../device/DevicePanel'
import { EmergencyPhone } from '../common/EmergencyPhone'
import { MapErrorBoundary } from '../map/MapErrorBoundary'
import { RescueMap } from '../map/RescueMap'
import { RescueSettings } from './RescueSettings'
import './rescue.css'
export function RescueDashboard() {
  const [adapter] = useState(() => new MockDeviceAdapter())
  const device = useDeviceEvents(adapter)
  const location = useEmergencyLocation()
  const sharing = useLocationShare()
  const resetSharing = sharing.reset
  useEffect(() => { if (!location.active) resetSharing() }, [location.active, resetSharing])
  const start = () => { sharing.reset(); device.dismissProposal(); location.start() }
  const stop = () => { location.stop(); sharing.reset(); device.dismissProposal() }
  const acceptDeviceProposal = () => {
    start()
    document.getElementById('rescue-home')?.scrollIntoView({ block: 'start' })
  }
  return <div className="rescue-app">
    <a className="skip-link" href="#rescue-main">본문으로 바로가기</a>
    <header className="rescue-header"><a className="rescue-brand" href="#rescue-home"><span className="rescue-brand-icon"><Accessibility size={25} aria-hidden="true"/><LifeBuoy size={20} aria-hidden="true"/></span><span>WILLCHAIR <strong>RESCUE</strong><small>위치를 확인하고, 필요한 사람에게.</small></span></a><span className="rescue-badge">프론트엔드 프로토타입</span></header>
    <nav className="rescue-nav" aria-label="서비스 화면"><a href="#rescue-home"><LifeBuoy size={17} aria-hidden="true"/>긴급 위치</a><a href="#rescue-map"><MapPin size={17} aria-hidden="true"/>위치 지도</a><a href="#rescue-device"><Radio size={17} aria-hidden="true"/>구명조끼 상태</a><a href="#rescue-settings"><Settings size={17} aria-hidden="true"/>설정·안내</a></nav>
    {location.active && <div className="rescue-active-bar"><p>긴급 위치 모드 실행 중 <span>{location.background ? '백그라운드에서는 갱신을 보장하지 않습니다.' : '필요하지 않으면 수신을 중지하세요.'}</span></p><button type="button" onClick={stop}>긴급 모드 종료</button></div>}
    <main id="rescue-main" tabIndex={-1}>
      <section id="rescue-home" className="rescue-intro"><p className="rescue-eyebrow">YOUR LOCATION. YOUR CHOICE.</p><h1>도움이 필요할 때,<br className="rescue-mobile-break"/> 내 위치부터 확인하세요.</h1><p>구명조끼 상태를 살펴보고, 위치를 직접 확인하고 공유합니다.<br/>위치 공유와 119 전화는 사용자가 선택할 때만 진행됩니다.</p><DeviceSummary snapshot={device.snapshot}/></section>
      <div className="rescue-workspace"><div className="rescue-actions-column"><LocationCard location={location} onStart={start} onStop={stop}/><ShareCard sample={location.sample} active={location.active} sharing={sharing}/><EmergencyPhone/></div><MapErrorBoundary><RescueMap sample={location.sample}/></MapErrorBoundary></div>
      <p className="rescue-limit-note">화면 잠금·백그라운드에서는 지속 추적을 보장하지 않습니다. 실제 구명조끼 착용, 구조기관 자동 연계, 상대방 수신 여부를 확인하는 서비스가 아닙니다.</p>
      <DevicePanel snapshot={device.snapshot} proposal={device.proposal} active={location.active}
        onStorage={state => adapter.simulateStorage(state)} onFailure={() => adapter.simulateFailure()}
        onAccept={acceptDeviceProposal} onDismiss={device.dismissProposal}/>
      <RescueSettings/>
      <details className="rescue-card rescue-flood-tools"><summary><Waves size={18} aria-hidden="true"/>침수 시나리오 보조 도구</summary><p>기존 WILLCHAIR FLOOD의 침수·경로·시간 범위·대피 후보 비교 기능을 별도 화면으로 유지합니다. 모든 침수 데이터는 시뮬레이션이며 현재 위치와 자동으로 연결하지 않습니다.</p><a href="?mode=flood" target="_blank" rel="noreferrer">WILLCHAIR FLOOD 보조 화면 열기 · 새 탭</a><p className="rescue-small">새 탭으로 이동하거나 화면이 잠기면 위치 갱신이 지연될 수 있습니다.</p></details>
      <footer className="rescue-footer"><strong>WILLCHAIR RESCUE</strong><p>실제 위치: 브라우저 위치 서비스 · 보관함 이벤트: 시뮬레이션 · 지도: OpenStreetMap contributors</p><p>개발용 프로토타입 · 실제 안전 장비로 사용 가능한 제품이라는 주장이 아닙니다.</p></footer>
    </main>
  </div>
}
