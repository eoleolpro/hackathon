// HTTP 오류, 네트워크 단절, JSON 파싱 실패를 자료 이름과 함께 전달합니다.
export async function readJson(path: string, label: string, signal?: AbortSignal): Promise<unknown> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}${path}`, { signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (cause) {
    if (signal?.aborted) throw cause
    throw new Error(`${label} 로드 실패 · 네트워크 또는 파일 형식을 확인하세요.`)
  }
}
