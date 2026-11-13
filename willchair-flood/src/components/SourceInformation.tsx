import { readJson } from '../utils/readJson'
import { useEffect, useState } from 'react'
import { validateSourceMetadata } from '../utils/sources'
import type { SourceRecord } from '../utils/sources'
export function SourceInformation() {
  const [sources, setSources] = useState<SourceRecord[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    readJson('data/metadata.json', '출처·수정 시각 정보', controller.signal)
      .then(value => { if (!controller.signal.aborted) setSources(validateSourceMetadata(value)) })
      .catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : '출처 정보 오류') })
    return () => controller.abort()
  }, [])
  return <section className="source-information" aria-labelledby="source-heading"><h2 id="source-heading">데이터 출처 및 갱신 정보</h2><p><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a> · 외부 지도 타일. 원본 지도 갱신 시각은 미확인입니다. 타일 수신 시각은 지도 하단에 별도로 표시합니다.</p><p>아래 자료는 모두 프로젝트에서 직접 작성한 시뮬레이션입니다. 갱신 시각은 로컬 파일의 마지막 수정 시각(KST)이며 관측·예측 시각이 아닙니다.</p>{error ? <p role="alert">{error} · 갱신 시각 미확인</p> : !sources ? <p role="status">출처 정보 불러오는 중</p> : <div className="source-table-wrap"><table><caption className="sr-only">시뮬레이션 자료별 출처 및 로컬 수정 시각</caption><thead><tr><th scope="col">자료</th><th scope="col">출처</th><th scope="col">로컬 수정 시각 (KST)</th></tr></thead><tbody>{sources.map(source => <tr key={source.id}><th scope="row"><a href={`${import.meta.env.BASE_URL}${source.paths[0]}`}>{source.name}</a></th><td>시뮬레이션 · 직접 작성</td><td><time dateTime={source.updatedAt}>{new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(source.updatedAt))}</time></td></tr>)}</tbody></table></div>}</section>
}
