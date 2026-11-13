import { stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const root = new URL('../', import.meta.url)
const groups = [
  { id: 'flood', name: '시간별 가상 침수', paths: [0,15,30,45,60].map(t => `data/flood-timeline/${t}.geojson`) },
  { id: 'routes', name: '사전 준비된 시연 경로', paths: ['data/demo-routes.geojson'] },
  { id: 'isochrones', name: '가상 시간 범위', paths: ['data/demo-isochrones.geojson'] },
  { id: 'shelters', name: '가상 대피 후보', paths: ['data/demo-shelters.geojson'] },
]
const sources = await Promise.all(groups.map(async group => {
  const stamps = await Promise.all(group.paths.map(path => stat(new URL(`public/${path}`, root))))
  return { ...group, source: 'simulation', updatedAt: new Date(Math.max(...stamps.map(s => s.mtimeMs))).toISOString() }
}))
await writeFile(fileURLToPath(new URL('public/data/metadata.json', root)), JSON.stringify({ timestampMeaning: 'local-file-modified', sources }, null, 2) + '\n')
console.log('Data metadata updated from local file modification times.')
