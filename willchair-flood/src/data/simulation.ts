import type { Scenario } from '../types'
// 실제 기상·침수 정보를 포함하지 않는 화면 구성용 시뮬레이션입니다.
export const scenarios: Scenario[] = ['평상시', '집중호우', '침수 발생']
export const scenarioDescriptions: Record<Scenario, string> = {
  '평상시': '가상 침수 영역 0개를 표시합니다. 실제 안전 여부는 미확인입니다.',
  '집중호우': '선택 시점의 서측 가상 침수 영역 1개를 표시합니다. 실제 관측 데이터가 아닙니다.',
  '침수 발생': '선택 시점의 서측·동측·남측 가상 침수 영역 3개를 표시합니다. 실제 관측 데이터가 아닙니다.',
}
