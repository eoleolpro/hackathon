import type { LocationErrorCode, LocationSample } from '../types/location'
// 앱의 주의 표시 기준이며 안전·구조 판단 기준이 아닙니다.
export const staleAfterMs = 60000
export const poorAccuracyMeters = 100
export function locationQuality(sample: LocationSample, now = Date.now()) {
  return { stale: now - sample.measuredAt >= staleAfterMs, poorAccuracy: sample.accuracy > poorAccuracyMeters }
}
export function formatLocationTime(time: number) {
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Seoul' }).format(new Date(time)) + ' KST'
}
export const locationErrors: Record<LocationErrorCode, string> = {
  'permission-denied': '위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 확인한 뒤 다시 시작해 주세요.',
  unsupported: '이 브라우저는 위치 서비스를 지원하지 않습니다.',
  timeout: '위치 확인 시간이 초과되었습니다. 새 위치 수신을 기다리거나 다시 요청해 주세요.',
  unavailable: '위치 측정에 실패했습니다. 기기 위치 설정과 수신 환경을 확인해 주세요.',
  insecure: '위치 수신에는 HTTPS가 필요합니다. 개발용 localhost 외의 HTTP 주소에서는 사용할 수 없습니다.',
  invalid: '유효한 위치정보를 확인하지 못했습니다. 새 위치 수신을 기다려 주세요.',
}
