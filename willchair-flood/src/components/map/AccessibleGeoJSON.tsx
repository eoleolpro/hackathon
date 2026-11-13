import { useEffect, useRef } from 'react'
import type { ComponentProps } from 'react'
import { GeoJSON as LeafletGeoJSON, Path } from 'leaflet'
import type { LatLng } from 'leaflet'
import { GeoJSON } from 'react-leaflet'
interface KeyboardProps { keyboardLabel: string; onKeyboardActivate: (center: LatLng) => void }
export function AccessibleGeoJSON({ keyboardLabel, onKeyboardActivate, ...props }: ComponentProps<typeof GeoJSON> & KeyboardProps) {
  const ref = useRef<LeafletGeoJSON>(null)
  useEffect(() => {
    const group = ref.current
    if (!group) return
    const cleanups: (() => void)[] = []
    group.eachLayer(layer => {
      if (!(layer instanceof Path)) return
      const element = layer.getElement()
      if (!element) return
      element.setAttribute('tabindex', '0')
      element.setAttribute('role', 'button')
      element.setAttribute('aria-label', keyboardLabel)
      const activate = (event: Event) => {
        const key = (event as KeyboardEvent).key
        if (key !== 'Enter' && key !== ' ') return
        event.preventDefault()
        event.stopPropagation()
        onKeyboardActivate(group.getBounds().getCenter())
        layer.openPopup()
      }
      element.addEventListener('keydown', activate)
      cleanups.push(() => element.removeEventListener('keydown', activate))
    })
    return () => cleanups.forEach(cleanup => cleanup())
  }, [keyboardLabel, onKeyboardActivate])
  return <GeoJSON {...props} ref={ref}/>
}
