# 4단계 경로 기능 보고

## 생성 파일

- public/data/demo-routes.geojson: 일반·우회 후보 시연 LineString
- src/data/demoEndpoints.ts: 고정 시연 출발·도착 좌표
- src/routing/types.ts: RoutingProvider, 요청·결과·경로 타입
- src/routing/PreparedRoutingProvider.ts: 데이터 검증, 좌표 일치 및 역방향 처리, Turf 거리 계산
- src/hooks/useRouting.ts: 비동기 경로 조회, 요청 취소 및 이전 결과 숨김
- src/components/map/RouteLayer.tsx: 경로 레이어·선택 강조·지도 범위
- src/components/RouteInformation.tsx: 경로 선택 및 상세 정보

App, 지도, 입력·정보 패널, CSS, README와 의존성도 수정했습니다.

## 검증

- npm run build: TypeScript 검사 및 Vite 빌드 성공.
- Chrome 데스크톱 1440px / 모바일 화면 390px 검증 통과.
- 준비된 양방향 좌표와 LineString 양 끝점 일치.
- 일반 경로 약 353m, 우회 후보 약 709m. Turf.js 좌표 길이로 계산.
- 임의 두 점 및 동일 지점은 경로 계산 불가.
- 위경도 역전 데이터 검증 실패 확인.
- 시연 지점 선택 후 경로 2개와 마커 2개 표시.
- 지도 경로 클릭과 패널 경로 버튼 선택 시 상세 정보 갱신.
- 경로 클릭이 출발·도착 좌표를 변경하지 않음.
- 출발·도착 교환, 침수 시나리오 변경, 임의 위치 변경 후 이전 경로 제거, 초기화 확인.
- 모바일 가로 넘침과 브라우저 런타임 예외 없음.

실제 도로망 탐색·침수 회피 경로 계산을 수행하지 않습니다. 모든 표시 경로는 사전 준비된 시연 경로입니다.
