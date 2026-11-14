import { Component } from 'react'
import type { ReactNode } from 'react'
export class RescueErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <main className="rescue-fatal" role="alert"><h1>화면을 표시하지 못했습니다</h1><p>위치 관찰은 중지됩니다. 필요하면 아래 전화 안내를 이용하세요.</p><a href="tel:119">119 전화 연결</a><p>전화 연결은 자동 신고 접수 확인이 아닙니다.</p><button type="button" onClick={() => this.setState({ failed: false })}>화면 다시 열기</button></main>
    return this.props.children
  }
}
