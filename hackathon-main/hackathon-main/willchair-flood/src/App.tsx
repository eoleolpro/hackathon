import { RescueDashboard } from './components/emergency/RescueDashboard'
import { RescueErrorBoundary } from './components/common/RescueErrorBoundary'
export default function App() {
  return <RescueErrorBoundary><RescueDashboard/></RescueErrorBoundary>
}
