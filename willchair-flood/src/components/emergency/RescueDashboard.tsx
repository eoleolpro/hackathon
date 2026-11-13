import { useEffect, useState } from 'react'
import { Accessibility, LifeBuoy } from 'lucide-react'
import { MockDeviceAdapter } from '../../adapters/mockDeviceAdapter'
import { useDeviceEvents } from '../../hooks/useDeviceEvents'
import { useEmergencyLocation } from '../../hooks/useEmergencyLocation'
import { useLocationShare } from '../../hooks/useLocationShare'
import { LocationCard } from './LocationCard'
import { ShareCard } from './ShareCard'
import { DevicePanel } from '../device/DevicePanel'
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
  const retry = () => { sharing.reset(); device.dismissProposal(); location.retry() }
  const stop = () => { location.stop(); sharing.reset(); device.dismissProposal() }
  const acceptDeviceProposal = () => {
    start()
    document.getElementById('location-title')?.scrollIntoView({ block: 'start' })
  }
  return <div className="rescue-app">
    <a className="skip-link" href="#rescue-main">본문으로 바로가기</a>
    <header className="rescue-header">
      <a className="rescue-brand" href="#rescue-main"><span className="rescue-brand-icon"><Accessibility size={25} aria-hidden="true"/><LifeBuoy size={20} aria-hidden="true"/></span><span>WILLCHAIR <strong>RESCUE</strong><small>내 위치를 확인하고 공유하세요</small></span></a>
      <span className="rescue-badge">개발용 MVP</span>
    </header>
    {location.active && <div className="rescue-active-bar"><p>위치 수신 중<span>{location.background ? '백그라운드에서는 갱신을 보장하지 않습니다.' : '필요하지 않으면 수신을 중지하세요.'}</span></p><button type="button" onClick={stop}>긴급 모드 종료</button></div>}
    <main id="rescue-main" tabIndex={-1}>
      <h1 className="sr-only">긴급 위치 확인과 공유</h1>
      <DevicePanel snapshot={device.snapshot} proposal={device.proposal} active={location.active}
        onStorage={state => adapter.simulateStorage(state)} onFailure={() => adapter.simulateFailure()}
        onAccept={acceptDeviceProposal} onDismiss={device.dismissProposal}/>
      <div className="rescue-workspace">
        <LocationCard location={location} onStart={start} onRetry={retry} onStop={stop}/>
        <MapErrorBoundary><RescueMap sample={location.sample}/></MapErrorBoundary>
        <ShareCard sample={location.sample} active={location.active} sharing={sharing}/>
        <EmergencyPhone/>
      </div>
      <p className="rescue-limit-note">화면 잠금·백그라운드의 지속 추적은 보장하지 않습니다. 실제 안전 장비나 자동 구조 요청 서비스가 아닙니다.</p>
      <RescueSettings/>
    </main>
  </div>
}
