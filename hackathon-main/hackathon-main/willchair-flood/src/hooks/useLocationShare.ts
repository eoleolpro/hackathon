import { useCallback, useEffect, useRef, useState } from 'react'
import { copyShareSnapshot, createShareSnapshot, openSystemShare } from '../services/shareService'
import type { CopyTarget, LocationSample, RecipientReceiptStatus, ShareSnapshot, ShareStatus } from '../types/location'
export function useLocationShare() {
  const [snapshot, setSnapshot] = useState<ShareSnapshot | null>(null)
  const [status, setStatus] = useState<ShareStatus>('idle')
  const [copyTarget, setCopyTarget] = useState<CopyTarget>('message')
  const generation = useRef(0)
  const busy = useRef(false)
  const reset = useCallback(() => { generation.current += 1; busy.current = false; setSnapshot(null); setStatus('idle'); setCopyTarget('message') }, [])
  useEffect(() => () => { generation.current += 1 }, [])
  const share = (sample: LocationSample) => {
    if (busy.current) return
    const session = ++generation.current
    const captured = createShareSnapshot(sample)
    busy.current = true
    setSnapshot(captured)
    setStatus('opening')
    // 사용자 클릭 안에서 바로 호출하여 Web Share의 사용자 활성화 조건을 유지합니다.
    void openSystemShare(captured).then(result => {
      if (generation.current !== session) return
      busy.current = false
      setStatus(result.status)
    })
  }
  const copy = (target: CopyTarget = 'message') => {
    if (!snapshot || busy.current) return
    const session = generation.current
    busy.current = true
    setCopyTarget(target)
    setStatus('copying')
    void copyShareSnapshot(snapshot, target).then(ok => {
      if (generation.current !== session) return
      busy.current = false
      setStatus(ok ? 'copied' : 'copy-failed')
    })
  }
  return { snapshot, status, copyTarget, receiptStatus: 'unknown' as RecipientReceiptStatus, share, copy, reset }
}
