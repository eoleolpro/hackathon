import { Component } from 'react'
import type { ReactNode } from 'react'
export class MapErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean; attempt: number }> {
  state = { failed: false, attempt: 0 }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <section className="map-panel map-error" role="alert"><h2>지도를 표시하지 못했습니다</h2><p>선택 상태와 정보 패널은 유지됩니다. 지도 다시 시도로 복구할 수 있습니다.</p><button type="button" onClick={() => this.setState(state => ({ failed: false, attempt: state.attempt + 1 }))}>지도 다시 시도</button></section>
    return <div className="map-boundary-content" key={this.state.attempt}>{this.props.children}</div>
  }
}
