export type StorageState = 'STORED' | 'REMOVED' | 'DISCONNECTED' | 'UNKNOWN'
export type DeviceConnectionStatus = 'NOT_CONNECTED' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED' | 'SIMULATION'
export interface DeviceSnapshot {
  storage: StorageState
  connection: DeviceConnectionStatus
  source: 'simulation' | 'ble'
  occurredAt: number | null
}
export type DeviceEvent =
  | { type: 'storage-changed'; storage: StorageState; source: 'simulation' | 'ble'; occurredAt: number }
  | { type: 'connection-changed'; connection: DeviceConnectionStatus; source: 'simulation' | 'ble'; occurredAt: number }
