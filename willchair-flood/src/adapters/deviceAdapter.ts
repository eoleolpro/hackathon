import type { DeviceEvent, DeviceSnapshot } from '../types/device'
// 후속 BLEDeviceAdapter가 이 계약을 구현합니다. UI나 위치 서비스는 BLE API에 의존하지 않습니다.
export interface DeviceEventAdapter {
  readonly id: string
  getSnapshot(): DeviceSnapshot
  subscribe(listener: (event: DeviceEvent) => void): () => void
  disconnect(): void
}
