import type { DeviceEventAdapter } from './deviceAdapter'
import type { DeviceEvent, DeviceSnapshot, StorageState } from '../types/device'
export class MockDeviceAdapter implements DeviceEventAdapter {
  readonly id = 'mock-storage-sensor'
  private snapshot: DeviceSnapshot = { storage: 'UNKNOWN', connection: 'SIMULATION', source: 'simulation', occurredAt: null }
  private listeners = new Set<(event: DeviceEvent) => void>()
  getSnapshot() { return { ...this.snapshot } }
  subscribe(listener: (event: DeviceEvent) => void) { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private emit(event: DeviceEvent) {
    this.snapshot = { ...this.snapshot, occurredAt: event.occurredAt, ...(event.type === 'storage-changed' ? { storage: event.storage } : { connection: event.connection }) }
    this.listeners.forEach(listener => listener(event))
  }
  simulateStorage(storage: StorageState) {
    this.emit({ type: 'connection-changed', connection: storage === 'DISCONNECTED' ? 'DISCONNECTED' : 'SIMULATION', source: 'simulation', occurredAt: Date.now() })
    this.emit({ type: 'storage-changed', storage, source: 'simulation', occurredAt: Date.now() })
  }
  simulateFailure() {
    this.emit({ type: 'connection-changed', connection: 'FAILED', source: 'simulation', occurredAt: Date.now() })
    this.emit({ type: 'storage-changed', storage: 'UNKNOWN', source: 'simulation', occurredAt: Date.now() })
  }
  disconnect() { this.simulateStorage('DISCONNECTED') }
}
