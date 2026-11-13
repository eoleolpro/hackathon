import { Copy, Share2 } from 'lucide-react'
import type { LocationSample, ShareStatus } from '../../types/location'
import type { useLocationShare } from '../../hooks/useLocationShare'
const messages: Record<ShareStatus, string> = {
  idle: '현재 세션에서 공유 요청 전 · 상대방 수신 여부 미확인',
  opening: '시스템 공유 화면 요청 중 · 전송·수신 여부 미확인',
  returned: '시스템 공유 절차 반환됨 · 실제 전송·상대방 수신 여부 미확인',
  cancelled: '공유가 취소되었습니다. 상대방 수신 여부는 미확인입니다.',
  unsupported: '이 브라우저는 Web Share를 지원하지 않습니다. 메시지를 복사해 직접 전달할 수 있습니다.',
  copied: '공유 메시지를 클립보드에 복사했습니다. 전송되거나 수신이 확인된 것은 아닙니다.',
  error: '시스템 공유 화면을 열지 못했습니다. 아래 메시지를 복사해 직접 전달할 수 있습니다.',
  'copy-failed': '자동 복사를 사용할 수 없습니다. 아래 메시지를 직접 선택해 복사해 주세요.',
}
export function ShareCard({ sample, active, sharing }: { sample: LocationSample | null; active: boolean; sharing: ReturnType<typeof useLocationShare> }) {
  return <section className="rescue-card share-card" aria-labelledby="share-title"><div className="rescue-section-heading"><h2 id="share-title">필요한 사람에게 위치 공유</h2><Share2 size={20} aria-hidden="true"/></div>
    <p>연락 대상은 기기의 공유 화면에서 직접 선택합니다. 위치는 좌표 스냅샷이며 실시간 추적 링크가 아닙니다.</p>
    <button type="button" className="rescue-primary" disabled={!active || !sample || sharing.status === 'opening'} onClick={() => { if (active && sample) sharing.share(sample) }}><Share2 size={20} aria-hidden="true"/>현재 위치 공유</button>
    <p className="share-status" role="status">{messages[sharing.status]}</p><p className="rescue-receipt">상대방 수신 상태: <strong>미확인</strong></p>
    {sharing.snapshot && <div className="share-preview"><label htmlFor="share-message">공유 시점 메시지 · 이후 위치 갱신은 반영되지 않습니다</label><textarea id="share-message" readOnly value={sharing.snapshot.message} rows={11}/><button type="button" className="rescue-secondary" disabled={sharing.status === 'opening'} onClick={sharing.copy}><Copy size={17} aria-hidden="true"/>공유 메시지 복사</button><p className="rescue-small">클립보드에 복사하면 다른 앱에서 붙여넣을 수 있습니다. 모드 종료 후에도 운영체제 클립보드 내용은 남을 수 있습니다.</p></div>}
  </section>
}
