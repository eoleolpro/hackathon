import type { DeviceSnapshot, StorageState } from '../../types/device'
import { formatLocationTime } from '../../utils/location'
import { storageLabels } from '../../utils/device'
interface Props {
  snapshot: DeviceSnapshot
  proposal: boolean
  active: boolean
  onStorage: (state: StorageState) => void
  onFailure: () => void
  onAccept: () => void
  onDismiss: () => void
}
export function DevicePanel({ snapshot, proposal, active, onStorage, onFailure, onAccept, onDismiss }: Props) {
  const connection = snapshot.connection === 'FAILED' ? '연결 실패 시뮬레이션 · 실제 BLE 연결 시도 없음' : snapshot.connection === 'DISCONNECTED' ? '연결 끊김 시뮬레이션 · 실제 센서 미연결' : '실제 센서 미연결'
  return <section id="rescue-device" className="device-panel" aria-labelledby="device-title">
    <div className="rescue-section-heading"><h2 id="device-title">구명조끼 보관 상태</h2><span className="rescue-badge">시뮬레이션</span></div>
    <dl className="device-state-grid">
      <div><dt>보관함 상태</dt><dd className="storage-state" aria-live="polite">{storageLabels[snapshot.storage]} <span>({snapshot.storage})</span></dd></div>
      <div><dt>센서 연결 상태</dt><dd>{connection}</dd></div>
      <div><dt>실제 착용 여부</dt><dd>미확인 · 탈착으로 판단할 수 없음</dd></div>
    </dl>
    <details className="device-test-controls"><summary>테스트 모드 · 보관함 시뮬레이션</summary>
      <p className="rescue-small">실제 센서 연결이나 착용 감지가 아닌 테스트 이벤트입니다.</p>
      <div className="device-controls">
        <button type="button" onClick={() => onStorage('REMOVED')}>보관함에서 분리 · 시뮬레이션</button>
        <button type="button" onClick={() => onStorage('STORED')}>보관함에 수납 · 시뮬레이션</button>
        <button type="button" onClick={() => onStorage('DISCONNECTED')}>연결 끊김 · 시뮬레이션</button>
        <button type="button" onClick={onFailure}>연결 실패 · 시뮬레이션</button>
        <button type="button" onClick={() => onStorage('UNKNOWN')}>상태 미확인 · 시뮬레이션</button>
      </div>
      <p className="rescue-small">마지막 가상 이벤트: {snapshot.occurredAt ? formatLocationTime(snapshot.occurredAt) : '없음'}</p>
    </details>
    {proposal && !active && <div className="device-proposal" role="status"><h3>보관함에서 분리됨 · 시뮬레이션</h3><p>긴급 위치 모드를 시작할까요?</p><div><button type="button" className="rescue-primary" onClick={onAccept}>위치 모드 활성화</button><button type="button" className="rescue-secondary" onClick={onDismiss}>나중에</button></div></div>}
  </section>
}
