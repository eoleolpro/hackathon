import type { DeviceSnapshot, StorageState } from '../../types/device'
import { formatLocationTime } from '../../utils/location'
import { storageLabels } from '../../utils/device'
export function DeviceSummary({ snapshot }: { snapshot: DeviceSnapshot }) {
  return <div className="rescue-device-summary"><span className="rescue-badge">시뮬레이션</span><strong>{storageLabels[snapshot.storage]}</strong><span>실제 센서 미연결 · 착용 여부 미확인</span><a href="#rescue-device">구명조끼 상태 보기</a></div>
}
interface Props { snapshot: DeviceSnapshot; proposal: boolean; active: boolean; onStorage: (state: StorageState) => void; onFailure: () => void; onAccept: () => void; onDismiss: () => void }
export function DevicePanel({ snapshot, proposal, active, onStorage, onFailure, onAccept, onDismiss }: Props) {
  const connection = snapshot.connection === 'FAILED' ? '연결 실패 시뮬레이션 · 실제 BLE 연결 시도 없음' : snapshot.connection === 'DISCONNECTED' ? '연결 끊김 시뮬레이션 · 실제 센서 미연결' : '시뮬레이션 어댑터 · 실제 센서 미연결'
  return <section id="rescue-device" className="rescue-card device-panel" aria-labelledby="device-title"><div className="rescue-section-heading"><h2 id="device-title">구명조끼 보관함 상태</h2><span className="rescue-badge">시뮬레이션 전용</span></div>
    <dl className="device-state-grid"><div><dt>보관함 상태</dt><dd className="storage-state" aria-live="polite">{storageLabels[snapshot.storage]} <span>({snapshot.storage})</span></dd></div><div><dt>센서 연결 상태</dt><dd>{connection}</dd></div><div><dt>실제 착용 여부</dt><dd>미확인 · 탈착 상태만으로 확인할 수 없음</dd></div><div><dt>마지막 가상 이벤트</dt><dd>{snapshot.occurredAt ? formatLocationTime(snapshot.occurredAt) : '이벤트 없음'}</dd></div></dl>
    <p>아래 버튼은 테스트용 상태만 바꿉니다. 장치 검색·BLE 연결·실제 착용 감지를 수행하지 않습니다.</p>
    <div className="device-controls"><button type="button" onClick={() => onStorage('REMOVED')}>보관함에서 분리 · 시뮬레이션</button><button type="button" onClick={() => onStorage('STORED')}>보관함에 수납 · 시뮬레이션</button><button type="button" onClick={() => onStorage('DISCONNECTED')}>연결 끊김 · 시뮬레이션</button><button type="button" onClick={onFailure}>연결 실패 · 시뮬레이션</button><button type="button" onClick={() => onStorage('UNKNOWN')}>상태 미확인 · 시뮬레이션</button></div>
    {proposal && !active && <div className="device-proposal" role="status"><h3>보관함 분리 이벤트가 발생했습니다 · 시뮬레이션</h3><p>긴급 위치 모드를 시작할까요? 확인을 눌러야 위치 권한을 요청합니다.</p><div><button type="button" className="rescue-primary" onClick={onAccept}>위치 모드 활성화</button><button type="button" className="rescue-secondary" onClick={onDismiss}>나중에</button></div></div>}
    {active && snapshot.storage === 'REMOVED' && <p className="rescue-small">위치 모드가 실행 중입니다. 보관함 분리 상태가 실제 착용 또는 구조 요청을 뜻하지 않습니다.</p>}
    <p className="rescue-small">향후 4단계에서 ESP32 BLE 어댑터를 별도로 연결합니다. 모드 종료는 보관함 상태를 수납으로 바꾸지 않습니다.</p>
  </section>
}
