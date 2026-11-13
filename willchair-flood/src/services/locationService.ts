import type { LocationErrorCode, LocationSample } from '../types/location'
export const locationOptions: PositionOptions = { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
export function locationSupportError(): LocationErrorCode | null {
  if (!window.isSecureContext) return 'insecure'
  if (!navigator.geolocation) return 'unsupported'
  return null
}
export function normalizePosition(position: GeolocationPosition): LocationSample | null {
  const { latitude, longitude, accuracy } = position.coords
  if (![latitude, longitude, accuracy, position.timestamp].every(Number.isFinite) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || accuracy < 0 || position.timestamp < 0 || position.timestamp > Date.now() + 5000) return null
  return { latitude, longitude, accuracy, measuredAt: position.timestamp }
}
export function watchLocation(onPosition: (position: GeolocationPosition) => void, onError: (code: LocationErrorCode) => void): () => void {
  const id = navigator.geolocation.watchPosition(onPosition, error => onError(error.code === 1 ? 'permission-denied' : error.code === 3 ? 'timeout' : 'unavailable'), locationOptions)
  return () => navigator.geolocation.clearWatch(id)
}
