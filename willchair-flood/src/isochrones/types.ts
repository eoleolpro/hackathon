import type { Feature, FeatureCollection, Point, Polygon } from 'geojson'
import type { Coordinates } from '../types'
export const reachMinutes = [5, 10, 15] as const
export type ReachMinute = typeof reachMinutes[number]
export interface IsochroneProperties { source: 'simulation' | 'openrouteservice'; minutes: ReachMinute; origin: [number, number] }
export type IsochroneFeature = Feature<Polygon, IsochroneProperties>
export type IsochroneData = FeatureCollection<Polygon, IsochroneProperties>
export interface IsochroneRequest { origin: Coordinates; ranges: readonly ReachMinute[]; signal?: AbortSignal }
export type IsochroneResult = { status: 'ready'; data: IsochroneData } | { status: 'unavailable'; message: string }
export interface IsochroneProvider { readonly id: string; getIsochrones(request: IsochroneRequest): Promise<IsochroneResult> }
export type IsochroneState = IsochroneResult | { status: 'idle' | 'loading' | 'error'; message: string }
export interface ShelterProperties { source: 'simulation'; name: string; entrance: string | null; accessibility: string | null; operation: string | null }
export type ShelterFeature = Feature<Point, ShelterProperties>
export interface ShelterComparison { feature: ShelterFeature; inRange: boolean | null; floodOverlap: boolean | null; overlappingAreas: string[] }
