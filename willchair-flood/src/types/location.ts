export interface LocationSample {
  latitude: number
  longitude: number
  accuracy: number
  measuredAt: number
}
export type LocationErrorCode = 'permission-denied' | 'unsupported' | 'timeout' | 'unavailable' | 'insecure' | 'invalid'
export type LocationStatus = 'idle' | 'requesting' | 'confirmed' | 'error' | 'stopped'
export interface EmergencyLocationState {
  active: boolean
  status: LocationStatus
  sample: LocationSample | null
  errorCode: LocationErrorCode | null
}
export interface ShareSnapshot { sample: LocationSample; message: string; createdAt: number }
export type ShareStatus = 'idle' | 'opening' | 'returned' | 'cancelled' | 'unsupported' | 'copied' | 'error' | 'copy-failed'
// 시스템 공유와 상대방 수신 확인을 구분합니다. 이번 단계는 수신 확인을 제공하지 않습니다.
export type RecipientReceiptStatus = 'unknown'
export interface LocationShareResult { status: 'returned' | 'cancelled' | 'unsupported' | 'error' }
export interface LocationShareProvider { share(snapshot: ShareSnapshot): Promise<LocationShareResult> }
// 후속 5단계용 계약. 실제 전송·수신 확인 구현은 포함하지 않습니다.
export interface RecipientReceiptEvent { shareId: string; status: 'delivered' | 'failed'; occurredAt: number }
export interface RecipientReceiptAdapter { subscribe(shareId: string, listener: (event: RecipientReceiptEvent) => void): () => void }
