import FloodDashboard from './FloodDashboard'
import { RescueDashboard } from './components/emergency/RescueDashboard'
import { RescueErrorBoundary } from './components/common/RescueErrorBoundary'
export default function App() {
  if (new URLSearchParams(window.location.search).get('mode') === 'flood') return <FloodDashboard/>
  return <RescueErrorBoundary><RescueDashboard/></RescueErrorBoundary>
}
