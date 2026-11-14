import type { CopyTarget, LocationSample, LocationShareResult, ShareSnapshot } from '../types/location'
import { formatLocationTime, locationQuality } from '../utils/location'
export function openStreetMapLink(sample: LocationSample) {
  return `https://www.openstreetmap.org/?mlat=${sample.latitude.toFixed(6)}&mlon=${sample.longitude.toFixed(6)}#map=18/${sample.latitude.toFixed(6)}/${sample.longitude.toFixed(6)}`
}
export function createShareSnapshot(sample: LocationSample, now = Date.now()): ShareSnapshot {
  const captured = { ...sample }
  const quality = locationQuality(captured, now)
  const warnings = [quality.stale ? '주의: 측정 후 60초 이상 지난 위치입니다.' : '', quality.poorAccuracy ? '주의: 정확도 수치가 100m보다 커 위치가 부정확할 수 있습니다.' : ''].filter(Boolean)
  const message = [
    'WILLCHAIR RESCUE',
    '긴급 위치 공유 요청입니다. 제 위치를 확인하고 연락해 주세요.',
    `위도: ${captured.latitude.toFixed(6)}`,
    `경도: ${captured.longitude.toFixed(6)}`,
    `위치 측정 시각: ${formatLocationTime(captured.measuredAt)}`,
    `위치 정확도: 약 ${Math.round(captured.accuracy)}m (실제 오차를 보장하지 않음)`,
    ...warnings,
    `OpenStreetMap 위치: ${openStreetMapLink(captured)}`,
    '이 메시지는 작성 시점 좌표의 스냅샷이며 실시간 추적 링크가 아닙니다.',
    '자동 구조 요청 또는 신고 접수 확인이 아닙니다.',
  ].join('\n')
  return { sample: captured, message, link: openStreetMapLink(captured), createdAt: now }
}
export async function openSystemShare(snapshot: ShareSnapshot): Promise<LocationShareResult> {
  if (!navigator.share) return { status: 'unsupported' }
  try {
    await navigator.share({ title: 'WILLCHAIR RESCUE 긴급 위치 공유', text: snapshot.message })
    return { status: 'returned' }
  } catch (cause) {
    return { status: cause instanceof DOMException && cause.name === 'AbortError' ? 'cancelled' : 'error' }
  }
}
export async function copyShareSnapshot(snapshot: ShareSnapshot, target: CopyTarget = 'message'): Promise<boolean> {
  if (!window.isSecureContext || !navigator.clipboard?.writeText) return false
  try { await navigator.clipboard.writeText(target === 'link' ? snapshot.link : snapshot.message); return true } catch { return false }
}
