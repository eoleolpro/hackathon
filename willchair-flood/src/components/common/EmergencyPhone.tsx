import { Phone } from 'lucide-react'
export function EmergencyPhone() {
  return <div className="rescue-phone"><a href="tel:119"><Phone size={20} aria-hidden="true"/>119 전화 연결</a><p>전화 앱을 엽니다. 자동 구조 요청이나 신고 접수 완료가 아닙니다.</p></div>
}
