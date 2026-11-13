import { useEffect } from 'react'
import { GeoJSON, Pane, useMap } from 'react-leaflet'
import { ShelterMarker } from './ShelterMarker'
import type { IsochroneFeature, ShelterComparison } from '../../isochrones/types'
interface Props { area: IsochroneFeature | undefined; candidates: ShelterComparison[]; selectedId: string; onSelect: (id: string) => void }
export function ReachabilityLayer({ area, candidates, selectedId, onSelect }: Props) {
  const map = useMap()
  useEffect(() => {
    if (area) map.fitBounds(area.geometry.coordinates[0]!.map(([lng, lat]) => [lat!, lng!] as [number, number]), { padding: [30, 30], maxZoom: 16 })
  }, [area, map])
  return <>
    <Pane name="reachability" style={{ zIndex: 350, pointerEvents: 'none' }}>
      {area && <GeoJSON key={String(area.id)} data={area} interactive={false}
        style={{ color: '#9d731a', fillColor: '#d4b15e', fillOpacity: 0.09, weight: 2, dashArray: '6 6' }}/>}
    </Pane>
    {candidates.map(candidate => <ShelterMarker key={candidate.feature.id} candidate={candidate}
      selected={selectedId === String(candidate.feature.id)} onSelect={onSelect}/>)}
  </>
}
