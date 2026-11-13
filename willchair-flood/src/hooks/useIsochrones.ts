import { readJson } from '../utils/readJson'
import { useEffect, useState } from 'react'
import { reachMinutes } from '../isochrones/types'
import type { IsochroneProvider, IsochroneState, ShelterFeature } from '../isochrones/types'
import { PreparedIsochroneProvider, validateShelters } from '../isochrones/PreparedIsochroneProvider'
import type { Coordinates } from '../types'
const defaultProvider = new PreparedIsochroneProvider()
export function useIsochrones(origin: Coordinates | null, provider: IsochroneProvider = defaultProvider): IsochroneState {
  const key = JSON.stringify([origin, provider.id])
  const [result, setResult] = useState<{ key: string; state: IsochroneState } | null>(null)
  useEffect(() => {
    if (!origin) return
    const controller = new AbortController()
    provider.getIsochrones({ origin, ranges: reachMinutes, signal: controller.signal })
      .then(state => { if (!controller.signal.aborted) setResult({ key, state }) })
      .catch((error: unknown) => { if (!controller.signal.aborted) setResult({ key, state: { status: 'error', message: error instanceof Error ? error.message : '등시간선 로드 실패' } }) })
    return () => controller.abort()
  }, [origin, provider, key])
  if (!origin) return { status: 'idle', message: '출발지를 선택하세요. 가상 범위 기준 출발지 선택 버튼으로 준비된 영역을 볼 수 있습니다.' }
  return result?.key === key ? result.state : { status: 'loading', message: '가상 시간 범위 불러오는 중' }
}
export function useShelters() {
  const [data, setData] = useState<ShelterFeature[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    readJson('data/demo-shelters.geojson', '대피 후보지 파일', controller.signal)
      .then(value => { if (!controller.signal.aborted) setData(validateShelters(value)) })
      .catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : '대피 후보지 로드 실패') })
    return () => controller.abort()
  }, [])
  return { data, error }
}
