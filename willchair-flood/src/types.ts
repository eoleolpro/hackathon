export type Scenario = '평상시' | '집중호우' | '침수 발생'
export interface Coordinates { lat: number; lng: number }
export type PointTarget = 'origin' | 'destination'
export interface Selection { origin: Coordinates | null; destination: Coordinates | null; scenario: Scenario }
