# 7단계 도달 가능 영역·대피 후보 비교

## 추가 파일

- public/data/demo-isochrones.geojson: 5·10·15분 가상 시간 범위
- public/data/demo-shelters.geojson: 가상 후보 3곳 및 미확인/가상 설정 속성
- src/isochrones/types.ts: 등시간선 제공자 및 후보 타입
- src/isochrones/PreparedIsochroneProvider.ts: 고정 출발지 매칭·정적 파일 검증
- src/hooks/useIsochrones.ts: 등시간선/후보 로딩, 요청 취소 및 오류 처리
- src/utils/shelters.ts: 가상 범위 포함 및 현재 침수 중첩 판정
- src/components/ReachabilityPanel.tsx: 범위 선택·기준 출발지 설정·후보 비교
- src/components/map/ReachabilityLayer.tsx: 등시간선 및 후보 마커/팝업

App, 지도, CSS와 README도 수정했습니다.

## 범위 및 해석

실제 이동시간을 계산하지 않습니다. 모든 등시간선은 사전 준비된 가상 시간 범위입니다.
고정 출발지 외에는 등시간선이 없음을 안내합니다. 후보지는 모두 가상이며 실제 시설이 아닙니다.
출입구·접근성·운영 상태는 null/빈 값이면 미확인, 임의 설정값이면 가상 설정이라고 표시합니다.
범위 안이거나 침수 중첩이 없어도 실제 도달·운영·접근성·안전 여부는 미확인입니다.
후속 OpenRouteService API는 IsochroneProvider 인터페이스 구현으로 교체할 수 있습니다.

## 검증

- npm run build: 타입 검사 및 프로덕션 빌드 성공.
- Chrome 데스크톱 1440px / 모바일 화면 390px 검증 통과.
- 정적 등시간선·후보 GeoJSON 검증 및 기준 외 출발지 거부 확인.
- 5/10/15분 선택 시 범위 안 후보 1/2/3곳 확인.
- 초기·지원하지 않는 출발지는 후보 범위 포함 여부 미확인.
- 미확인 출입구·접근성·운영 상태 표시 확인.
- 후보 마커 3개와 비교 카드 3개 표시 확인.
- 마커 팝업에 후보 속성·중첩 여부 표시 및 선택 카드 강조 확인.
- 후보 마커 클릭이 출발지 좌표를 변경하지 않음.
- 침수 발생 60분에서 A 후보 중첩, B/C는 가상 중첩 없음 확인.
- 침수 영역 숨김에도 후보 중첩 분석 유지.
- 임의 출발지 선택 시 기존 등시간선 제거.
- 전체 초기화 시 5분 및 후보 선택 해제 확인.
- 모바일 가로 넘침 및 브라우저 런타임 예외 없음.
