import { readJson } from '../utils/readJson'
import { useEffect, useState } from 'react'
import { timelineMinutes } from '../data/timeline'
import { validateTimelineFrame } from '../utils/floodTimeline'
import type { FloodTimeline } from '../utils/floodTimeline'
export function useFloodData() {
  const [frames, setFrames] = useState<FloodTimeline | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    Promise.all(timelineMinutes.map(async minute => {
      const value = await readJson(`data/flood-timeline/${minute}.geojson`, `${minute}분 침수 파일`, controller.signal)
      return [minute, validateTimelineFrame(value, minute)] as const
    })).then(entries => {
      if (!controller.signal.aborted) setFrames(Object.fromEntries(entries) as FloodTimeline)
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : '시간별 침수 데이터를 확인할 수 없습니다.')
    })
    return () => controller.abort()
  }, [])
  return { frames, error }
}
