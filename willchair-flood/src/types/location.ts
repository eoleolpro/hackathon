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
export interface ShareSnapshot { sample: LocationSample; message: string; link: string; createdAt: number }
export type CopyTarget = 'message' | 'link'
export type ShareStatus = 'idle' | 'opening' | 'returned' | 'cancelled' | 'unsupported' | 'copying' | 'copied' | 'error' | 'copy-failed'
export type RecipientReceiptStatus = 'unknown'
export interface LocationShareResult { status: 'returned' | 'cancelled' | 'unsupported' | 'error' }
