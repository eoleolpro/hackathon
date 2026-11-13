export interface SourceRecord { id: string; name: string; source: 'simulation'; updatedAt: string; paths: string[] }
export function validateSourceMetadata(value: unknown): SourceRecord[] {
  if (typeof value !== 'object' || value === null || !('timestampMeaning' in value) || value.timestampMeaning !== 'local-file-modified' || !('sources' in value) || !Array.isArray(value.sources) || !value.sources.length) throw new Error('출처 정보 형식 오류')
  for (const source of value.sources) {
    if (!source || typeof source.id !== 'string' || typeof source.name !== 'string' || source.source !== 'simulation' || typeof source.updatedAt !== 'string' || !Number.isFinite(Date.parse(source.updatedAt)) || !Array.isArray(source.paths) || !source.paths.length || !source.paths.every((path: unknown) => typeof path === 'string' && /^data\/[a-z0-9/.-]+\.geojson$/.test(path))) throw new Error('출처 정보 형식 오류')
  }
  return value.sources as SourceRecord[]
}
