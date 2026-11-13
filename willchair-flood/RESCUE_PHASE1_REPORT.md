# WILLCHAIR RESCUE — 1차 개발 보고

## 구현된 기능

### 기존 프로젝트 분석 및 보존

기존 React/Vite/TypeScript 구조, Leaflet 레이어, 타일 로딩·오류 처리, 디자인 토큰, FLOOD 분석 기능과 테스트를 확인한 후 확장했습니다.
기존 App 코드는 `src/FloodDashboard.tsx`로 보존하고 `/?mode=flood` 보조 화면으로 제공합니다.
침수·경로·타임라인·등시간선·후보 비교는 삭제하지 않았으며 실제 위치 서비스에 자동 연결하지 않습니다.
추가 런타임 라이브러리, 자체 백엔드, DB, 로그인은 없습니다.

### 1단계: 긴급 위치 모드

- 사용자 시작 동작에서만 watchPosition 호출 및 권한 요청.
- 위도·경도·정확도·측정 시각·수신 상태 표시 및 갱신.
- clearWatch로 종료/컴포넌트 해제 정리, 늦은 콜백과 이전 측정 시각의 결과 무시.
- 권한 거부/미지원/시간 초과/측정 실패/유효하지 않은 위치/HTTPS 미충족 구분.
- 측정 60초 경과 및 정확도 수치 100m 초과 시 주의. 앱 표시 기준임을 안내.
- 종료 시 현재 위치·공유 상태 제거 및 초기 지도 복원. 백그라운드 갱신 비보장 안내.

### 2단계: 지도·공유·긴급 전화

- 실제 브라우저 위치 수신 값의 마커 및 accuracy 원, 첫 위치 중심 이동 및 수동 재중심.
- OpenStreetMap 출처, 타일 로딩·실패·재시도 재사용.
- 명시적 공유 클릭에서 메시지 생성 및 Web Share 호출. 미지원/실패 시 복사와 수동 선택 제공.
- 서비스명·요청 문구·좌표·측정 시각·정확도·OSM 링크·품질 경고를 포함한 좌표 스냅샷.
- 위치 수신/시스템 공유 요청·반환/취소·오류/복사/상대방 수신 미확인을 구분.
- tel:119 연결 및 React 밖 정적 HTML의 119 안내. 실제 신고 접수·자동 구조 연계 표현 없음.

### 3단계 및 후속 계약

- MockDeviceAdapter의 STORED/REMOVED/DISCONNECTED/UNKNOWN 및 연결 실패 시뮬레이션.
- REMOVED 이벤트는 제안만 표시하며, 사용자가 활성화해야 위치 수신 시작.
- 실제 센서 미연결, 착용 미확인을 항상 별도로 표시.
- 종료는 제안·위치 세션만 정리하고 보관함 상태를 수납으로 임의 변경하지 않음.
- DeviceEvent/DeviceConnectionStatus/DeviceEventAdapter 계약 분리. 실제 BLE 검색·연결·착용 감지 미구현.
- LocationShareProvider/RecipientReceiptAdapter 계약만 설계. 실제 상대방 수신 확인 채널은 미구현.

## 변경한 파일

변경:
- src/App.tsx: 기본 RESCUE / FLOOD 보조 화면 분기
- index.html: 서비스 메타정보·아이콘·정적 119 안내
- e2e/quality.spec.ts: 기존 FLOOD 테스트를 보조 주소에 적용
- README.md: 설치·실행·정책·스마트폰 검증 절차

추가:
- src/FloodDashboard.tsx: 기존 화면 보존
- src/components/emergency/RescueDashboard.tsx
- src/components/emergency/LocationCard.tsx
- src/components/emergency/ShareCard.tsx
- src/components/emergency/RescueSettings.tsx
- src/components/emergency/rescue.css
- src/components/device/DevicePanel.tsx
- src/components/common/EmergencyPhone.tsx
- src/components/common/RescueErrorBoundary.tsx
- src/components/map/CurrentLocationLayer.tsx
- src/components/map/RescueMap.tsx
- src/hooks/useEmergencyLocation.ts
- src/hooks/useLocationShare.ts
- src/hooks/useDeviceEvents.ts
- src/services/locationService.ts
- src/services/shareService.ts
- src/adapters/deviceAdapter.ts
- src/adapters/mockDeviceAdapter.ts
- src/types/location.ts
- src/types/device.ts
- src/utils/location.ts
- src/utils/device.ts
- public/rescue-icon.svg
- e2e/rescue.spec.ts
- FLOOD_README.md: 기존 기능 문서 보존
- RESCUE_PHASE1_REPORT.md: 이 보고서

## 테스트한 기능

환경: Windows / Node.js 26.13.0 / Chrome / Playwright / axe.

| 검사 | 결과 | 범위 |
| --- | --- | --- |
| npm run build | 통과 | TypeScript strict 및 Vite 프로덕션 빌드 |
| npm run lint | 통과 | 오류·경고 없음 |
| 전체 브라우저 회귀 | 33개 통과 | 기존 FLOOD 16 + RESCUE 17 |
| 추가 콘솔 회귀 | 1개 통과 | 기본 아이콘 404 수정 후 정상 화면 콘솔/아이콘 응답 |
| 프로덕션 미리보기 | 통과 | RESCUE 시작·수신·마커·종료·제안·119 링크와 FLOOD 보존 |
| 정상 프로덕션 콘솔 | 오류 0건 | 별도 콘솔 오류 수집. 좌표 내용 출력 없음 |
| 자동 접근성 | 위반 0건 | RESCUE 초기/활성, 기존 FLOOD 초기/시연 상태 |
| 반응형 | 통과 | RESCUE 320/390/768/1024/1440px 가로 넘침 없음 |
| 화면 직접 검토 | 확인 | 데스크톱·모바일 스크린샷의 정보/버튼/위치 지도 표시 |

위치 테스트는 Chrome Geolocation API의 에뮬레이션 좌표 또는 테스트 전용 콜백을 사용했습니다.
실제 개인의 위치를 수집하거나 콘솔에 좌표를 출력하지 않았습니다.
Web Share·Clipboard는 테스트 대체 구현으로 결과/취소/오류를 검증했으며 실제 외부 대상 전송이나 운영체제 클립보드를 변경하지 않았습니다.
마지막 전체 실행 후 아이콘만 추가했고, 해당 리소스/콘솔 검사 및 프로덕션 검사를 별도로 재실행했습니다.
현재 테스트 파일에는 총 34개(기존 16 + RESCUE 18) 시나리오가 있습니다.

검증 세부:
- 시작 전 watch 호출 0회, 위치 없음 시 공유 비활성.
- 시작 후 위치/정확도 수신, 새 측정 반영, 마커 팝업 좌표 일치, 현재 위치로 이동.
- 종료 및 컴포넌트 해제 시 clearWatch, 종료 후 늦은 위치 무시.
- 권한 거부·시간 초과·미지원·HTTPS·오래됨·낮은 정확도 표시.
- 이전 측정 시각 무시, 유효하지 않은 좌표 거부, 백그라운드 안내.
- 공유 메시지 필수 항목, 수신 미확인, 위치 갱신 후 기존 공유 스냅샷 유지.
- 공유 미지원·취소·오류, 명시적 복사·복사 실패 시 수동 선택.
- 공유 대기 중 모드 종료 후 늦은 결과가 좌표·메시지를 복원하지 않음.
- 모든 보관함 상태·연결 실패 시뮬레이션, 분리 이벤트의 자동 위치 요청 없음, 사용자 수락 후 시작.
- 종료 시 분리 제안 제거 및 보관함 상태 유지.
- localStorage에 저장한 데이터 없음.
- JavaScript 비활성 상태에서도 정적 tel:119 링크 표시. 실제 통화는 하지 않음.
- 기존 지도·경로·침수·타임라인·대피 후보 기능 회귀 통과.

## 테스트하지 못한 기능

- 실제 스마트폰의 위치 권한 팝업 수락/거부와 실측 위치 정확도.
- 실제 iOS/Android의 Web Share 화면, 외부 연락 대상 전달, 운영체제 복사 권한.
- 실제 화면 잠금·장시간 백그라운드·배터리 절약 환경의 수신 지속성.
- 실제 ESP32/BLE 센서, 실제 탈착·착용 여부.
- 실제 119 전화 연결/통화/신고 접수, 구조기관 연계.
- VoiceOver/TalkBack의 실제 청취, 실제 손가락 제스처 및 실기기 사용성.

실제 스마트폰에서 확인할 안전한 절차는 README의 별도 체크리스트에 있습니다.
실제 긴급 전화나 구조 요청을 시험 목적으로 실행하지 않습니다.

## 알려진 오류 및 제약

수정 후 테스트 범위 내 미해결 기능 오류는 발견되지 않았습니다.
발견했던 보관함 상태의 접근성 의미 구조와 기본 아이콘 404를 수정하고 재검증했습니다.

- HTTPS 및 브라우저 권한/정책에 따라 위치·공유·복사가 제한됩니다.
- 위치 정확도는 실제 오차를 보장하지 않습니다. stale/poor 기준은 자체 주의 표시 기준입니다.
- 공유 절차 반환은 전송·수신 확인이 아닙니다. 상대방 수신 상태는 미확인만 제공합니다.
- 위치 링크는 스냅샷이며 실시간 추적이 아닙니다.
- 모드 종료로 이미 외부 공유된 정보·클립보드·브라우저 캐시를 회수할 수 없습니다.
- 지도 표시 시 해당 지역의 외부 타일 요청이 발생합니다. 시작 전과 정책 화면에 안내합니다.
- 현재 백그라운드 지속 추적과 실제 안전 장비로서의 성능을 보장하지 않습니다.
- FLOOD는 시뮬레이션 보조 도구이며 실제 현재 위치·구조 판단과 자동 연결하지 않습니다.

## 다음 개발 단계

1. 실제 스마트폰 HTTPS 환경에서 README 절차로 권한·위치·공유·잠금/복귀 검증.
2. ESP32 센서 UUID·이벤트 형식·재연결·전원/오류 정책 확정 후 BLEDeviceAdapter 구현.
3. 탈착과 착용을 구분하는 하드웨어 검증 및 접근 가능한 알림 UX 검토.
4. 전달/수신 확인에 사용할 외부 채널과 사용자 동의를 정의하고 5단계 인터페이스 구체화.
5. 실제 사용자·스크린리더·실기기 평가 후 문구와 위치 품질 안내 개선.
