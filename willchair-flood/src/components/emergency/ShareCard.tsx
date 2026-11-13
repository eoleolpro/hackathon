import { Copy, Share2 } from 'lucide-react'
import type { LocationSample, ShareStatus } from '../../types/location'
import type { useLocationShare } from '../../hooks/useLocationShare'
const messages: Record<ShareStatus, string> = {
  idle: '공유 요청 전 · 상대방 수신 여부 미확인',
  opening: '시스템 공유 화면 요청 중 · 전송·수신 여부 미확인',
  returned: '시스템 공유 절차 반환됨 · 실제 전송·상대방 수신 여부 미확인',
  cancelled: '공유가 취소되었습니다. 상대방 수신 여부는 미확인입니다.',
  unsupported: 'Web Share를 지원하지 않습니다. 위치 링크를 복사해 직접 전달하세요.',
  copying: '클립보드 복사 요청 중 · 상대방에게 전송하는 동작이 아닙니다.',
  copied: '클립보드에 복사했습니다. 상대방 전송·수신이 확인된 것은 아닙니다.',
  error: '공유 화면을 열지 못했습니다. 위치 링크를 복사해 전달할 수 있습니다.',
  'copy-failed': '자동 복사를 사용할 수 없습니다. 아래 내용을 직접 선택해 복사해 주세요.',
}
export function ShareCard({ sample, active, sharing }: { sample: LocationSample | null; active: boolean; sharing: ReturnType<typeof useLocationShare> }) {
  const busy = sharing.status === 'opening' || sharing.status === 'copying'
  return <section className="rescue-card share-card" aria-labelledby="share-title">
    <h2 id="share-title">현재 위치 공유</h2>
    <p className="rescue-small">측정 시각·정확도·지도 링크를 공유합니다. 단일 시점의 좌표이며 실시간 추적 링크가 아닙니다.</p>
    <button type="button" className="rescue-share-button" disabled={!active || !sample || busy} onClick={() => { if (active && sample) sharing.share(sample) }}><Share2 size={20} aria-hidden="true"/>현재 위치 공유</button>
    <p className="share-status" role="status">{messages[sharing.status]}</p>
    <p className="rescue-receipt">상대방 수신 상태: <strong>미확인</strong></p>
    {sharing.snapshot && <>
      <button type="button" className="rescue-secondary link-copy-button" disabled={busy} onClick={() => sharing.copy('link')}><Copy size={17} aria-hidden="true"/>위치 링크 복사</button>
      {sharing.status === 'copy-failed' && sharing.copyTarget === 'link' && <div className="manual-link"><label htmlFor="share-link">직접 선택할 위치 링크</label><input id="share-link" readOnly value={sharing.snapshot.link}/></div>}
      <details className="share-preview" open={sharing.status === 'copy-failed' && sharing.copyTarget === 'message'}><summary>공유 메시지 확인</summary>
        <label htmlFor="share-message">공유 시점 메시지 · 이후 위치 갱신은 반영되지 않습니다</label>
        <textarea id="share-message" readOnly value={sharing.snapshot.message} rows={10}/>
        <button type="button" className="rescue-secondary" disabled={busy} onClick={() => sharing.copy('message')}>공유 메시지 복사</button>
      </details>
    </>}
  </section>
}
