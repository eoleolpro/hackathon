import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
const runtimeErrors = new WeakMap<Page, string[]>()
import AxeBuilder from '@axe-core/playwright'

test.beforeEach(async ({ page }) => {
  runtimeErrors.set(page, [])
  page.on('pageerror', error => { if (!error.message.includes('QA_INJECTED_MAP_ERROR')) runtimeErrors.get(page)!.push(error.message) })
  await page.goto('/?mode=flood')
  await expect(page.locator('.shelter-card')).toHaveCount(3)
})

test.afterEach(async ({ page }) => { expect(runtimeErrors.get(page) ?? []).toEqual([]) })

test('지도 클릭·키보드 중심 선택·이동·줌·지점 초기화', async ({ page }) => {
  const map = page.locator('.leaflet-map')
  await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible()
  await map.click({ position: { x: 160, y: 180 } })
  await expect(page.locator('.origin-marker')).toHaveCount(1)
  await map.click({ position: { x: 230, y: 240 } })
  await expect(page.locator('.destination-marker')).toHaveCount(1)
  const first = await page.locator('.coordinate-field output').first().textContent()
  await map.click({ position: { x: 170, y: 220 } })
  await expect(page.locator('.coordinate-field output').first()).not.toHaveText(first!)
  await page.getByRole('button', { name: '지점 초기화', exact: true }).click()
  await map.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.origin-marker')).toHaveCount(1)
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(350)
  await page.keyboard.press('Enter')
  await expect(page.locator('.destination-marker')).toHaveCount(1)
  const points = await page.locator('.coordinate-field output').allTextContents()
  expect(points[0]).not.toBe(points[1])
  await page.locator('.leaflet-control-zoom-in').click()
  await page.locator('.leaflet-control-zoom-out').click()
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap')
})

test('시연 경로 선택·거리·역방향·임의 지점 계산 불가', async ({ page }) => {
  await page.getByRole('button', { name: '시연 출발·도착지 선택' }).click()
  await expect(page.locator('.route-option')).toHaveCount(2)
  await expect(page.locator('.route-option').first()).toContainText('353 m')
  await expect(page.locator('.route-option').last()).toContainText('709 m')
  const route = page.locator('.leaflet-overlay-pane path[role=button]')
  await expect(route).toHaveCount(2)
  await route.last().focus()
  await page.keyboard.press('Space')
  await expect(page.locator('.route-detail h3')).toHaveText('우회 후보 경로')
  await expect(route.last()).toHaveAttribute('aria-label', /실제 안전 미확인/)
  await page.getByRole('button', { name: '출발지·목적지 바꾸기' }).click()
  await expect(page.locator('.coordinate-field output').first()).toContainText('127.029500')
  await expect(page.locator('.route-option')).toHaveCount(2)
  await page.locator('.leaflet-map').click({ position: { x: 330, y: 400 } })
  await expect(page.locator('.route-message')).toContainText('경로 계산 불가')
  await expect(page.locator('.route-option')).toHaveCount(0)
})

test('시간별 침수·경로 재분석·팝업·숨김·전체 초기화', async ({ page }) => {
  await page.getByRole('button', { name: '시연 출발·도착지 선택' }).click()
  await expect(page.locator('.route-option')).toHaveCount(2)
  await page.getByRole('radio', { name: '집중호우', exact: true }).check()
  const slider = page.getByRole('slider', { name: '시뮬레이션 경과 시간' })
  const counts = [0, 1, 1, 2, 2]
  let previous = ''
  for (const [index, minute] of [0, 15, 30, 45, 60].entries()) {
    await slider.fill(String(minute))
    await expect(page.locator('.route-comparison .overlap-status.overlap')).toHaveCount(counts[index]!)
    const flood = page.locator('.leaflet-overlay-pane path[fill="#3b82f6"]')
    await expect(flood).toHaveCount(1)
    const path = await flood.getAttribute('d')
    if (index) expect(path).not.toBe(previous)
    previous = path!
  }
  await expect(page.locator('.candidate-empty')).toContainText('결과 없음')
  await page.getByRole('checkbox', { name: '가상 침수 구역 표시' }).uncheck()
  await expect(page.locator('.leaflet-overlay-pane path[fill="#3b82f6"]')).toHaveCount(0)
  await expect(page.locator('.route-comparison .overlap-status.overlap')).toHaveCount(2)
  await page.getByRole('checkbox', { name: '가상 침수 구역 표시' }).check()
  const flood = page.locator('.leaflet-overlay-pane path[fill="#3b82f6"]')
  await flood.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.leaflet-popup-content')).toContainText('60분')
  await page.getByRole('button', { name: '시뮬레이션 전체 초기화', exact: true }).click()
  await expect(slider).toHaveValue('0')
  await expect(page.getByRole('radio', { name: '평상시', exact: true })).toBeChecked()
  await expect(page.locator('.point-marker')).toHaveCount(0)
  await expect(page.locator('.route-option')).toHaveCount(0)
  await page.getByRole('button', { name: '시연 출발·도착지 선택' }).click()
  await expect(page.locator('.route-detail h3')).toHaveText('일반 경로')
})

test('등시간선 5/10/15분·대피 후보·침수 중첩·미확인 정보', async ({ page }) => {
  await page.getByRole('button', { name: '가상 범위 기준 출발지 선택', exact: true }).click()
  await expect(page.locator('.leaflet-reachability-pane path')).toHaveCount(1)
  for (const [minute, count] of [[5,1],[10,2],[15,3]]) {
    await page.getByRole('button', { name: `${minute}분 가상 범위`, exact: true }).click()
    await expect(page.locator('.range-status').filter({ hasText: '범위 안' })).toHaveCount(count!)
  }
  await expect(page.locator('.shelter-card').last()).toContainText('미확인')
  await page.locator('.shelter-marker').nth(1).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.leaflet-popup-content')).toContainText('가상 운영 중 설정')
  await expect(page.locator('.shelter-card.selected')).toContainText('북측')
  await page.getByRole('radio', { name: '침수 발생', exact: true }).check()
  await page.getByRole('button', { name: '60분', exact: true }).click()
  await expect(page.locator('.shelter-flood.overlap')).toHaveCount(1)
  await page.getByRole('button', { name: '출발지 지정', exact: true }).click()
  await page.locator('.leaflet-map').focus()
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(350)
  await page.keyboard.press('Enter')
  await expect(page.locator('.reach-state')).toContainText('준비된 등시간선 없음')
  await expect(page.locator('.leaflet-reachability-pane path')).toHaveCount(0)
})

test('화면 크기·접이식 패널·본문 바로가기·출처와 갱신 시각', async ({ page }, testInfo) => {
  await expect(page.locator('.source-information tbody tr')).toHaveCount(4)
  await expect(page.locator('.source-information')).toContainText('로컬 파일의 마지막 수정 시각')
  await expect(page.locator('.source-information')).toContainText('원본 지도 갱신 시각은 미확인')
  for (const width of [320,390,600,768,1024,1440]) {
    await page.setViewportSize({ width, height: 950 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.locator('.leaflet-map')).toHaveCSS('height', width <= 600 ? '410px' : /[5-9][0-9]{2}px/)
  }
  await page.locator('.location-panel summary').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.location-panel')).not.toHaveAttribute('open')
  await page.keyboard.press('Enter')
  await expect(page.locator('.location-panel')).toHaveAttribute('open', '')
  await page.keyboard.press('Control+Home')
  await page.locator('.skip-link').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#main')).toBeFocused()
  await page.getByRole('button', { name: '시연 출발·도착지 선택' }).click()
  await page.getByRole('radio', { name: '침수 발생', exact: true }).check()
  await page.getByRole('button', { name: '15분', exact: true }).click()
  await expect(page.locator('.route-option')).toHaveCount(2)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.locator('.map-panel').scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('desktop.png') })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('.map-panel').scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath('mobile.png') })
  await page.locator('.source-information').scrollIntoViewIfNeeded()
  const banner = await page.locator('.persistent-simulation-notice').boundingBox()
  expect(banner!.y).toBeGreaterThanOrEqual(0)
})

test('접근성 자동 검사: 초기 화면 및 시연 전체 상태', async ({ page }, testInfo) => {
  for (const state of ['initial', 'demo']) {
    if (state === 'demo') {
      await page.getByRole('button', { name: '시연 출발·도착지 선택' }).click()
      await page.getByRole('radio', { name: '침수 발생', exact: true }).check()
      await page.getByRole('button', { name: '60분', exact: true }).click()
      await expect(page.locator('.route-option')).toHaveCount(2)
    }
    const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
    await testInfo.attach(`axe-${state}`, { body: JSON.stringify(result.violations, null, 2), contentType: 'application/json' })
    expect(result.violations).toEqual([])
  }
})

test('지도 타일 일부 실패를 성공 타일이 덮지 않으며 재시도로 복구', async ({ page }) => {
  let failed = false
  await page.route('https://tile.openstreetmap.org/**', async route => {
    if (!failed) { failed = true; await route.abort() } else await route.continue()
  })
  await page.reload()
  await expect(page.locator('.map-tile-status [role=alert]')).toContainText('로드 실패')
  await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible()
  await expect(page.locator('.map-tile-status [role=alert]')).toContainText('로드 실패')
  await page.unroute('https://tile.openstreetmap.org/**')
  await page.getByRole('button', { name: '지도 타일 다시 시도', exact: true }).click()
  await expect(page.locator('.map-tile-status')).toContainText('지도 타일 표시 완료')
  await expect(page.locator('.tile-received')).toContainText('원본 갱신 시각 아님')
})

for (const [path, action, selector, message] of [
  ['**/data/flood-timeline/30.geojson', null, '.flood-controls', '30분 침수 파일'],
  ['**/data/demo-routes.geojson', '시연 출발·도착지 선택', '.route-message', '시연 경로 파일 로드 실패'],
  ['**/data/demo-isochrones.geojson', '가상 범위 기준 출발지 선택', '.reach-state', '가상 등시간선 파일 로드 실패'],
  ['**/data/demo-shelters.geojson', null, '.shelter-panel', '대피 후보지 파일 로드 실패'],
  ['**/data/metadata.json', null, '.source-information', '갱신 시각 미확인'],
] as const) {
  test(`데이터 요청 실패: ${path}`, async ({ page }) => {
    await page.route(path, route => route.abort())
    await page.reload()
    if (action) await page.getByRole('button', { name: action, exact: true }).click()
    await expect(page.locator(selector)).toContainText(message)
    if (path.includes('flood-timeline')) {
      await page.getByRole('button', { name: '시연 출발·도착지 선택', exact: true }).click()
      await expect(page.locator('.route-options')).toContainText('중첩 여부 미확인')
      await expect(page.locator('.candidate-empty')).toContainText('후보 판정 불가')
    }
  })
}

test('지도 타일 응답이 멈추면 대기 시간 초과 안내', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', () => new Promise<void>(() => {}))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('.map-tile-status')).toContainText('지도 타일 불러오는 중')
  await expect(page.locator('.map-tile-status [role=alert]')).toContainText('대기 시간 초과', { timeout: 18000 })
  await expect(page.getByRole('button', { name: '지도 타일 다시 시도', exact: true })).toBeVisible()
})

test('지도 렌더 오류 경계가 다른 UI를 유지하고 재시도로 복구', async ({ page }) => {
  await page.evaluate(async () => {
    const { default: React } = await import('/node_modules/.vite/deps/react.js')
    const { default: ReactDOM } = await import('/node_modules/.vite/deps/react-dom_client.js')
    const { MapErrorBoundary } = await import('/src/components/map/MapErrorBoundary.tsx')
    const state = { fail: true }
    ;(window as unknown as Record<string, unknown>).qaBoundaryState = state
    const container = document.createElement('div')
    container.id = 'qa-boundary'
    document.body.append(container)
    const Child = () => { if (state.fail) throw new Error('QA_INJECTED_MAP_ERROR'); return React.createElement('p', null, '지도 렌더링 복구') }
    ReactDOM.createRoot(container).render(React.createElement(MapErrorBoundary, null, React.createElement(Child)))
  })
  await expect(page.locator('#qa-boundary')).toContainText('지도를 표시하지 못했습니다')
  await expect(page.locator('.shelter-card')).toHaveCount(3)
  await page.evaluate(() => { (window as unknown as { qaBoundaryState: { fail: boolean } }).qaBoundaryState.fail = false })
  await page.locator('#qa-boundary').getByRole('button', { name: '지도 다시 시도' }).click()
  await expect(page.locator('#qa-boundary')).toContainText('지도 렌더링 복구')
})

test('모바일 터치 에뮬레이션: 지도 탭과 드래그', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  await page.goto('http://localhost:5173/?mode=flood')
  const map = page.locator('.leaflet-map')
  await map.scrollIntoViewIfNeeded()
  await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible()
  const box = (await map.boundingBox())!
  await page.touchscreen.tap(box.x + 110, box.y + 130)
  await expect(page.locator('.origin-marker')).toHaveCount(1)
  const pane = page.locator('.leaflet-map-pane')
  const before = await pane.getAttribute('style')
  const client = await context.newCDPSession(page)
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + 180, y: box.y + 250, id: 0 }] })
  for (let i = 1; i <= 5; i++) {
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + 180 + i * 12, y: box.y + 250, id: 0 }] })
    await page.waitForTimeout(50)
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(pane).not.toHaveAttribute('style', before!)
  await context.close()
})

test('공간 분석과 데이터 검증: 내부·외부·경계·역방향·미확인', async ({ page }) => {
  const results = await page.evaluate(async () => {
    const { validateTimelineFrame } = await import('/src/utils/floodTimeline.ts')
    const { activeFloods } = await import('/src/utils/flood.ts')
    const { analyzeRoutes } = await import('/src/utils/routeAnalysis.ts')
    const { validateRoutes, matchPreparedRoutes } = await import('/src/routing/PreparedRoutingProvider.ts')
    const { demoEndpoints } = await import('/src/data/demoEndpoints.ts')
    const { validateIsochrones } = await import('/src/isochrones/PreparedIsochroneProvider.ts')
    const raw = await (await fetch('/data/demo-routes.geojson')).json()
    const data = validateRoutes(raw)
    const forward = matchPreparedRoutes(data, demoEndpoints)
    const backward = matchPreparedRoutes(data, { origin: demoEndpoints.destination, destination: demoEndpoints.origin })
    if (forward.status !== 'ready' || backward.status !== 'ready') return false
    const expected = ['clear,clear', 'overlap,clear', 'overlap,clear', 'overlap,overlap', 'overlap,overlap']
    for (const [index, minute] of [0,15,30,45,60].entries()) {
      const frame = await (await fetch(`/data/flood-timeline/${minute}.geojson`)).json()
      const parsed = validateTimelineFrame(frame, minute)
      if (analyzeRoutes(forward.routes, activeFloods(parsed, '집중호우'), true).map(item => item.overlap).join(',') !== expected[index]) return false
      const invalid = structuredClone(frame); invalid.features[0].properties.minute = 99
      try { validateTimelineFrame(invalid, minute); return false } catch { /* expected */ }
    }
    if (backward.routes[0].feature.geometry.coordinates[0].join(',') !== [demoEndpoints.destination.lng, demoEndpoints.destination.lat].join(',')) return false
    if (!analyzeRoutes(forward.routes, [], false).every(a => a.overlap === 'unknown' && !a.eligibleDetour)) return false
    const polygon = { type: 'Feature', properties: { source: 'simulation', name: 'test polygon', description: 'unit test', scenarios: ['집중호우'] }, geometry: { type: 'Polygon', coordinates: [[[0,0],[2,0],[2,2],[0,2],[0,0]]] } }
    const paths = [[[-1,0],[0,0]],[[0.5,0.5],[1,1]],[[-1,1],[3,1]],[[-2,-2],[-1,-1]]]
    const variants = paths.map((coordinates, i) => ({ ...forward.routes[0], id: String(i), feature: { ...forward.routes[0].feature, geometry: { type: 'LineString', coordinates } } }))
    if (analyzeRoutes(variants, [polygon], true).map(a => a.overlap).join(',') !== 'overlap,overlap,overlap,clear') return false
    const bad = structuredClone(raw); bad.features[0].geometry.coordinates[0].reverse()
    try { validateRoutes(bad); return false } catch { /* expected */ }
    const iso = await (await fetch('/data/demo-isochrones.geojson')).json(); iso.features[0].properties.origin.reverse()
    try { validateIsochrones(iso); return false } catch { /* expected */ }
    return true
  })
  expect(results).toBe(true)
})
