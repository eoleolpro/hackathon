import { Clock3, RotateCcw } from 'lucide-react'
import { timelineMinutes, timelineDisclaimer } from '../data/timeline'
import type { TimelineMinute } from '../data/timeline'
interface Props { minute: TimelineMinute; onChange: (minute: TimelineMinute) => void; onReset: () => void }
export function FloodTimeline({ minute, onChange, onReset }: Props) {
  return <section className="timeline-panel" aria-labelledby="timeline-title">
    <div className="timeline-heading"><h2 id="timeline-title"><Clock3 size={18}/> 시간별 가상 침수 변화</h2><output htmlFor="flood-minute" className="timeline-value" aria-live="polite">{minute}분</output><button type="button" className="timeline-reset" onClick={onReset}><RotateCcw size={14}/> 시뮬레이션 전체 초기화</button></div>
    <label className="sr-only" htmlFor="flood-minute">시뮬레이션 경과 시간</label>
    <input id="flood-minute" type="range" min="0" max="60" step="15" value={minute} aria-valuetext={`${minute}분 · 가상 데이터`} onChange={event => { const next = Number(event.target.value); if (timelineMinutes.some(time => time === next)) onChange(next as TimelineMinute) }}/>
    <div className="timeline-ticks">{timelineMinutes.map(time => <button type="button" key={time} aria-pressed={minute === time} onClick={() => onChange(time)}>{time}분</button>)}</div>
    <p className="timeline-hint">선택한 침수 시나리오에 해당 시점의 가상 영역을 적용합니다. 평상시는 모든 시점에서 표시 구역이 0개입니다.</p>
    <p className="timeline-disclaimer">{timelineDisclaimer}</p>
  </section>
}
