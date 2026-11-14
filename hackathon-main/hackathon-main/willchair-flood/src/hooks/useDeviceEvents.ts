import { useEffect, useState } from 'react'
import type { DeviceEventAdapter } from '../adapters/deviceAdapter'
export function useDeviceEvents(adapter: DeviceEventAdapter) {
  const [snapshot, setSnapshot] = useState(() => adapter.getSnapshot())
  const [proposal, setProposal] = useState(false)
  useEffect(() => adapter.subscribe(event => {
    setSnapshot(adapter.getSnapshot())
    if (event.type === 'storage-changed') setProposal(event.storage === 'REMOVED')
  }), [adapter])
  return { snapshot, proposal, dismissProposal: () => setProposal(false) }
}
