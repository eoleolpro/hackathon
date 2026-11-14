export function RescueSettings() {
  return <details id="rescue-settings" className="rescue-settings"><summary>이용·개인정보 안내</summary>
    <p>위치 수신은 HTTPS(개발용 localhost 예외)와 사용자 권한이 필요합니다. 공유 기능과 복사는 브라우저 정책에 따라 제한될 수 있습니다.</p>
    <p>좌표·메시지·연락처는 서버, localStorage, 분석 도구, 콘솔에 저장하지 않습니다. 지도 표시 지역의 타일 요청은 OpenStreetMap에 전달됩니다.</p>
    <p>종료·페이지 이탈 시 위치 관찰과 현재 위치·공유 내용을 정리합니다. 이미 공유된 내용·클립보드·브라우저 캐시는 앱에서 회수할 수 없습니다.</p>
    <p>위치 정확도는 실제 오차를 보장하지 않습니다. 구명조끼 탈착은 착용 확인이 아니며, 실제 센서는 연결하지 않았습니다. 119 버튼은 전화 앱만 열고 신고 접수를 확인하지 않습니다.</p>
  </details>
}
