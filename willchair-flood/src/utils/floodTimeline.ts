import type { TimelineMinute } from '../data/timeline'
import { validateFloodData } from './flood'
import type { FloodData } from './flood'
export type FloodTimeline = Record<TimelineMinute, FloodData>
export function validateTimelineFrame(value: unknown, minute: TimelineMinute): FloodData {
  const data = validateFloodData(value)
  const metadata = value as Record<string, unknown>
  if (metadata.minute !== minute || !data.features.every(feature => (feature.properties as unknown as Record<string, unknown>).minute === minute)) {
    throw new Error(`${minute}분 침수 파일의 시간 정보가 올바르지 않습니다.`)
  }
  return data
}
