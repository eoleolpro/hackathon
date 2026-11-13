import { useEffect, useState } from 'react'
import type { Selection } from '../types'
import { PreparedRoutingProvider } from '../routing/PreparedRoutingProvider'
import type { RoutingProvider, RoutingState } from '../routing/types'
const defaultProvider = new PreparedRoutingProvider()
export function useRouting(selection: Selection, provider: RoutingProvider = defaultProvider) {
  const { origin, destination } = selection
  const key = JSON.stringify([origin, destination, provider.id])
  const [result, setResult] = useState<{ key: string; state: RoutingState } | null>(null)
  useEffect(() => {
    if (!origin || !destination) return
    const controller = new AbortController()
    provider.getRoutes({ origin, destination, signal: controller.signal })
      .then(state => { if (!controller.signal.aborted) setResult({ key, state }) })
      .catch((error: unknown) => { if (!controller.signal.aborted) setResult({ key, state: { status: 'error', message: error instanceof Error ? error.message : '시연 경로를 불러오지 못했습니다.' } }) })
    return () => controller.abort()
  }, [origin, destination, key, provider])
  if (!origin || !destination) return { key, state: { status: 'idle', message: '출발지와 목적지를 선택하세요. 시연 지점 선택 버튼으로 준비된 경로를 확인할 수 있습니다.' } as RoutingState }
  return { key, state: result?.key === key ? result.state : { status: 'loading', message: '사전 준비된 시연 경로 확인 중' } as RoutingState }
}
