import type { StorageState } from '../types/device'
export const storageLabels: Record<StorageState, string> = {
  STORED: '보관함에 수납됨',
  REMOVED: '보관함에서 분리됨',
  DISCONNECTED: '센서 연결 끊김',
  UNKNOWN: '상태 확인 불가',
}
