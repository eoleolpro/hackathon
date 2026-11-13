import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
const failures = new WeakMap<Page, string[]>()
test.beforeEach(async ({ page }) => {
  failures.set(page, [])
  page.on('pageerror', error => failures.get(page)!.push(error.message))
})
test.afterEach(async ({ page }) => { expect(failures.get(page)).toEqual([]) })
async function actualBrowserLocation(page: Page) {
  await page.context().grantPermissions(['geolocation'])
  await page.context().setGeolocation({ latitude: 37.498, longitude: 127.0255, accuracy: 20 })
  await page.addInitScript(() => {
    const stats = { watch: 0, clear: 0 }
    ;(window as unknown as Record<string, unknown>).locationTestCounts = stats
    const watch = navigator.geolocation.watchPosition.bind(navigator.geolocation)
    const clear = navigator.geolocation.clearWatch.bind(navigator.geolocation)
    navigator.geolocation.watchPosition = (...args) => { stats.watch += 1; return watch(...args) }
    navigator.geolocation.clearWatch = id => { stats.clear += 1; clear(id) }
  })
}
async function mockLocation(page: Page, mode: 'valid' | 'stale' | 'poor' | 'permission' | 'timeout' | 'unavailable' | 'unsupported' | 'insecure' = 'valid') {
  await page.addInitScript(({ mode }) => {
    const state = { watches: 0, clears: 0, success: null as unknown as (value: unknown) => void }
    ;(window as unknown as Record<string, unknown>).geoTest = state
    if (mode === 'insecure') Object.defineProperty(window, 'isSecureContext', { value: false, configurable: true })
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: mode === 'unsupported' ? undefined : {
      watchPosition(success: (value: unknown) => void, error: (value: unknown) => void) {
        state.watches += 1; state.success = success
        window.setTimeout(() => {
          if (['permission','timeout','unavailable'].includes(mode)) error({ code: mode === 'permission' ? 1 : mode === 'timeout' ? 3 : 2 })
          else success({ coords: { latitude: 37.498, longitude: 127.0255, accuracy: mode === 'poor' ? 450 : 20 }, timestamp: Date.now() - (mode === 'stale' ? 120000 : 0) })
        }, 0)
        return state.watches
      },
      clearWatch() { state.clears += 1 },
    } })
  }, { mode })
}

test('브라우저 Geolocation API: 명시적 시작·갱신·지도·종료', async ({ page }) => {
  await actualBrowserLocation(page)
  await page.goto('/')
  await expect(page.getByRole('button', { name: '현재 위치 공유', exact: true })).toBeDisabled()
  expect(await page.evaluate(() => (window as unknown as { locationTestCounts: { watch: number } }).locationTestCounts.watch)).toBe(0)
  await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await expect(page.locator('.rescue-location-status')).toHaveText('위치 확인됨')
  await expect(page.locator('.rescue-current-marker')).toHaveCount(1)
  await expect(page.locator('.rescue-leaflet-map .leaflet-overlay-pane path')).toHaveCount(1)
  await page.locator('.rescue-current-marker').click()
  await expect(page.locator('.leaflet-popup-content')).toContainText('127.025500')
  await page.locator('.leaflet-popup-close-button').click()
  await page.context().setGeolocation({ latitude: 37.499, longitude: 127.027, accuracy: 35 })
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.499000')
  await expect(page.getByTestId('rescue-longitude')).toHaveText('127.027000')
  await page.getByRole('button', { name: '현재 위치로 이동', exact: true }).click()
  await page.locator('.rescue-current-marker').click()
  await expect(page.locator('.leaflet-popup-content')).toContainText('37.499000')
  await page.locator('.leaflet-popup-close-button').click()
  await page.locator('.rescue-active-bar').getByRole('button', { name: '긴급 모드 종료', exact: true }).click()
  await expect(page.locator('.rescue-current-marker')).toHaveCount(0)
  await expect(page.getByTestId('rescue-latitude')).toHaveText('미확인')
  await expect(page.getByRole('button', { name: '현재 위치 공유', exact: true })).toBeDisabled()
  expect(await page.evaluate(() => (window as unknown as { locationTestCounts: { clear: number } }).locationTestCounts.clear)).toBeGreaterThan(0)
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([])
})

test('보관함 시뮬레이션은 자동 위치 요청 없이 제안하고 착용을 구분', async ({ page }) => {
  await mockLocation(page)
  await page.goto('/')
  await expect(page.locator('.storage-state')).toContainText('UNKNOWN')
  await page.locator('.device-test-controls summary').click()
  await page.getByRole('button', { name: '보관함에서 분리 · 시뮬레이션', exact: true }).click()
  await expect(page.locator('.device-proposal')).toBeVisible()
  expect(await page.evaluate(() => (window as unknown as { geoTest: { watches: number } }).geoTest.watches)).toBe(0)
  await expect(page.locator('.device-panel')).toContainText('실제 착용 여부')
  await expect(page.locator('.device-panel')).toContainText('실제 센서 미연결')
  await page.getByRole('button', { name: '위치 모드 활성화', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await page.locator('.rescue-active-bar').getByRole('button', { name: '긴급 모드 종료', exact: true }).click()
  await expect(page.locator('.device-proposal')).toHaveCount(0)
  await expect(page.locator('.storage-state')).toContainText('REMOVED')
  await page.getByRole('button', { name: '보관함에 수납 · 시뮬레이션', exact: true }).click()
  await expect(page.locator('.storage-state')).toContainText('STORED')
  await page.getByRole('button', { name: '연결 끊김 · 시뮬레이션', exact: true }).click()
  await expect(page.locator('.storage-state')).toContainText('DISCONNECTED')
  await page.getByRole('button', { name: '연결 실패 · 시뮬레이션', exact: true }).click()
  await expect(page.locator('.device-panel')).toContainText('연결 실패 시뮬레이션')
  await page.getByRole('button', { name: '상태 미확인 · 시뮬레이션', exact: true }).click()
  await expect(page.locator('.storage-state')).toContainText('UNKNOWN')
})

for (const [mode, text] of [
  ['permission', '위치 권한이 거부되었습니다'], ['timeout', '위치 확인 시간이 초과되었습니다'],
  ['unavailable', '위치 측정에 실패했습니다'], ['unsupported', '위치 서비스를 지원하지 않습니다'],
  ['insecure', 'HTTPS가 필요합니다'], ['stale', '오래된 위치정보입니다'], ['poor', '위치 정확도가 낮습니다'],
] as const) {
  test(`위치 상태: ${mode}`, async ({ page }) => {
    await mockLocation(page, mode)
    await page.goto('/')
    await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
    await expect(page.locator('.location-card')).toContainText(text)
    if (['timeout','unavailable','stale','poor'].includes(mode)) {
      await expect(page.locator('.rescue-active-bar')).toBeVisible()
      await page.locator('.rescue-active-bar').getByRole('button', { name: '긴급 모드 종료', exact: true }).click()
    } else await expect(page.getByRole('button', { name: '현재 위치 공유', exact: true })).toBeDisabled()
  })
}

test('Web Share 스냅샷·사용자 동작·전송/수신 미확인·모드 종료 정리', async ({ page }) => {
  await actualBrowserLocation(page)
  await page.addInitScript(() => {
    const requests: unknown[] = []
    ;(window as unknown as Record<string, unknown>).shareRequests = requests
    Object.defineProperty(navigator, 'share', { configurable: true, value: (data: unknown) => { requests.push(data); return Promise.resolve() } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  expect(await page.evaluate(() => (window as unknown as { shareRequests: unknown[] }).shareRequests.length)).toBe(0)
  await page.getByRole('button', { name: '현재 위치 공유', exact: true }).click()
  await expect(page.locator('.share-status')).toContainText('실제 전송·상대방 수신 여부 미확인')
  const text = await page.locator('#share-message').inputValue()
  for (const expected of ['WILLCHAIR RESCUE','긴급 위치 공유 요청','위도: 37.498000','경도: 127.025500','위치 측정 시각','위치 정확도','openstreetmap.org','실시간 추적 링크가 아닙니다']) expect(text).toContain(expected)
  await page.context().setGeolocation({ latitude: 37.5, longitude: 127.03, accuracy: 12 })
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.500000')
  await expect(page.locator('#share-message')).toHaveValue(text)
  await page.locator('.rescue-active-bar').getByRole('button', { name: '긴급 모드 종료', exact: true }).click()
  await expect(page.locator('#share-message')).toHaveCount(0)
  await expect(page.locator('.rescue-receipt')).toContainText('미확인')
})

test('공유 미지원 시 명시적 복사와 실패 시 수동 선택 제공', async ({ page }) => {
  await mockLocation(page)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
    const copied: string[] = []
    ;(window as unknown as Record<string, unknown>).copiedMessages = copied
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text: string) => { copied.push(text) } } })
  })
  await page.goto('/')
  await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await page.getByRole('button', { name: '현재 위치 공유', exact: true }).click()
  await expect(page.locator('.share-status')).toContainText('Web Share를 지원하지 않습니다')
  expect(await page.evaluate(() => (window as unknown as { copiedMessages: string[] }).copiedMessages.length)).toBe(0)
  await page.getByRole('button', { name: '위치 링크 복사', exact: true }).click()
  await expect(page.locator('.share-status')).toContainText('클립보드에 복사했습니다')
  const copied = await page.evaluate(() => (window as unknown as { copiedMessages: string[] }).copiedMessages)
  expect(copied).toHaveLength(1)
  expect(copied[0]).toMatch(/^https:/)
  expect(copied[0]).not.toContain('WILLCHAIR')
  await page.locator('.share-preview summary').click()
  await page.getByRole('button', { name: '공유 메시지 복사', exact: true }).click()
  await expect(page.locator('.share-status')).toContainText('클립보드에 복사했습니다')
  expect(await page.evaluate(() => (window as unknown as { copiedMessages: string[] }).copiedMessages.length)).toBe(2)
  await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }) })
  await page.getByRole('button', { name: '공유 메시지 복사', exact: true }).click()
  await expect(page.locator('.share-status')).toContainText('직접 선택해 복사')
  await expect(page.locator('#share-message')).toHaveAttribute('readonly', '')
  await page.getByRole('button', { name: '위치 링크 복사', exact: true }).click()
  await expect(page.locator('#share-link')).toBeVisible()
  await expect(page.locator('#share-link')).toHaveValue(/openstreetmap.org/)
})

test('공유 취소와 오류를 완료로 표현하지 않음', async ({ page }) => {
  await mockLocation(page)
  await page.addInitScript(() => { Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new DOMException('test', 'AbortError') } }) })
  await page.goto('/')
  await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await page.getByRole('button', { name: '현재 위치 공유', exact: true }).click()
  await expect(page.locator('.share-status')).toContainText('공유가 취소되었습니다')
  await page.evaluate(() => { Object.defineProperty(navigator, 'share', { configurable: true, value: async () => { throw new DOMException('test','NotAllowedError') } }) })
  await page.getByRole('button', { name: '현재 위치 공유', exact: true }).click()
  await expect(page.locator('.share-status')).toContainText('공유 화면을 열지 못했습니다')
  await expect(page.locator('.rescue-receipt')).toContainText('미확인')
})

test('종료 후 늦은 위치 콜백 무시 및 컴포넌트 해제 정리', async ({ page }) => {
  await mockLocation(page)
  await page.goto('/')
  await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await page.locator('.rescue-active-bar').getByRole('button', { name: '긴급 모드 종료', exact: true }).click()
  await page.evaluate(() => { (window as unknown as { geoTest: { success: (p: unknown) => void } }).geoTest.success({ coords: { latitude: 36, longitude: 128, accuracy: 10 }, timestamp: Date.now() }) })
  await expect(page.getByTestId('rescue-latitude')).toHaveText('미확인')
  const counts = await page.evaluate(async () => {
    const { default: React } = await import('/node_modules/.vite/deps/react.js')
    const { default: ReactDOM } = await import('/node_modules/.vite/deps/react-dom_client.js')
    const { useEmergencyLocation } = await import('/src/hooks/useEmergencyLocation.ts')
    const node = document.createElement('div'); document.body.append(node)
    let api: ReturnType<typeof useEmergencyLocation>
    function Harness() { api = useEmergencyLocation(); return null }
    const root = ReactDOM.createRoot(node); root.render(React.createElement(Harness))
    await new Promise(resolve => setTimeout(resolve, 50))
    api!.start(); await new Promise(resolve => setTimeout(resolve, 20))
    const before = (window as unknown as { geoTest: { clears: number } }).geoTest.clears
    root.unmount()
    return [before, (window as unknown as { geoTest: { clears: number } }).geoTest.clears]
  })
  expect(counts[1]).toBeGreaterThan(counts[0]!)
})

test('반응형·키보드·접근성·119 링크', async ({ page }, testInfo) => {
  await mockLocation(page)
  await page.goto('/')
  await expect(page.locator('.emergency-fallback a')).toHaveAttribute('href', 'tel:119')
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({ width, height: 950 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  }
  await page.locator('.rescue-app .skip-link').focus(); await page.keyboard.press('Enter')
  await expect(page.locator('#rescue-main')).toBeFocused()
  const audit = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
  expect(audit.violations).toEqual([])
  await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  const activeAudit = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()
  expect(activeAudit.violations).toEqual([])
  await page.keyboard.press('Control+Home')
  await page.screenshot({ path: testInfo.outputPath('rescue-desktop.png'), fullPage: false })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: testInfo.outputPath('rescue-mobile.png'), fullPage: false })
})

test('JavaScript 없이도 119 전화 안내가 남아 있음', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage(); await page.goto('http://localhost:5173/')
  await expect(page.locator('.emergency-fallback a')).toBeVisible()
  await expect(page.locator('.emergency-fallback a')).toHaveAttribute('href','tel:119')
  await context.close()
})

test('공유 절차 대기 중 종료하면 늦은 결과가 위치·메시지를 복원하지 않음', async ({ page }) => {
  await mockLocation(page)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: () => new Promise<void>(resolve => { (window as unknown as Record<string, unknown>).finishShareTest = resolve }) })
  })
  await page.goto('/')
  await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await page.getByRole('button', { name: '현재 위치 공유', exact: true }).click()
  await expect(page.locator('.share-status')).toContainText('공유 화면 요청 중')
  await page.locator('.rescue-active-bar').getByRole('button', { name: '긴급 모드 종료', exact: true }).click()
  await page.evaluate(() => (window as unknown as { finishShareTest: () => void }).finishShareTest())
  await expect(page.locator('#share-message')).toHaveCount(0)
  await expect(page.getByTestId('rescue-latitude')).toHaveText('미확인')
  await expect(page.locator('.share-status')).toContainText('공유 요청 전')
})

test('이전 측정 시각의 위치 무시·유효하지 않은 좌표·백그라운드 안내', async ({ page }) => {
  await mockLocation(page)
  await page.goto('/')
  await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await page.evaluate(() => (window as unknown as { geoTest: { success: (p: unknown) => void } }).geoTest.success({ coords: { latitude: 36, longitude: 128, accuracy: 10 }, timestamp: Date.now() - 10000 }))
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator('.rescue-active-bar')).toContainText('백그라운드에서는 갱신을 보장하지 않습니다')
  await page.evaluate(() => (window as unknown as { geoTest: { success: (p: unknown) => void } }).geoTest.success({ coords: { latitude: NaN, longitude: 128, accuracy: 10 }, timestamp: Date.now() }))
  await expect(page.locator('.location-card')).toContainText('유효한 위치정보를 확인하지 못했습니다')
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await page.locator('.rescue-active-bar').getByRole('button', { name: '긴급 모드 종료', exact: true }).click()
})

test('정상 화면 콘솔 오류와 불필요한 기본 아이콘 요청 없음', async ({ page }) => {
  const errors: string[] = []
  page.on('console', message => { if (message.type() === 'error') errors.push(/favicon/.test(message.location().url) ? 'favicon error' : 'browser console error') })
  await page.goto('/')
  await expect(page.locator('.rescue-leaflet-map .leaflet-tile-loaded').first()).toBeVisible()
  const icon = await page.request.get('/rescue-icon.svg')
  expect(icon.status()).toBe(200)
  expect(errors).toEqual([])
})

test('중복 시작 차단·명시적 재요청·페이지 이탈 정리', async ({ page }) => {
  await mockLocation(page)
  await page.goto('/')
  const result = await page.evaluate(async () => {
    const { default: React } = await import('/node_modules/.vite/deps/react.js')
    const { default: ReactDOM } = await import('/node_modules/.vite/deps/react-dom_client.js')
    const { useEmergencyLocation } = await import('/src/hooks/useEmergencyLocation.ts')
    const node = document.createElement('div'); document.body.append(node)
    let api: ReturnType<typeof useEmergencyLocation>
    function Harness() { api = useEmergencyLocation(); return null }
    const root = ReactDOM.createRoot(node); root.render(React.createElement(Harness))
    await new Promise(resolve => setTimeout(resolve, 50))
    const state = (window as unknown as { geoTest: { watches: number; clears: number } }).geoTest
    const baseline = state.watches
    api!.start(); api!.start(); api!.start()
    const first = state.watches - baseline
    api!.retry(); api!.start()
    const second = state.watches - baseline
    root.unmount()
    return { first, second, clears: state.clears }
  })
  expect(result.first).toBe(1)
  expect(result.second).toBe(2)
  expect(result.clears).toBeGreaterThanOrEqual(2)
  await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await expect(page.locator('.rescue-active-bar')).toHaveCount(0)
  await expect(page.getByTestId('rescue-latitude')).toHaveText('미확인')
  await expect(page.getByRole('button', { name: '현재 위치 공유', exact: true })).toBeDisabled()
})

test('위치가 더 들어오지 않으면 60초 후 오래됨으로 전환', async ({ page }) => {
  await page.clock.install()
  await mockLocation(page)
  await page.goto('/')
  await page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true }).click()
  await expect(page.getByTestId('rescue-latitude')).toHaveText('37.498000')
  await page.clock.fastForward(61000)
  await expect(page.locator('.rescue-location-status')).toContainText('오래됨')
  await expect(page.locator('.location-card')).toContainText('오래된 위치정보입니다')
})

test('핵심 화면 순서와 이전 시뮬레이션 진입점 제거', async ({ page }) => {
  const oldDataRequests: string[] = []
  page.on('request', request => { if (/\.(geojson)(?:\?|$)/.test(request.url())) oldDataRequests.push('legacy-data') })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/?mode=flood')
  await expect(page.locator('.rescue-brand')).toContainText('WILLCHAIR RESCUE')
  await expect(page.getByRole('button', { name: '긴급 위치 모드 시작', exact: true })).toBeVisible()
  for (const selector of ['.workspace','.route-options','.timeline-panel','.reach-controls','.shelter-panel','.rescue-flood-tools']) await expect(page.locator(selector)).toHaveCount(0)
  await expect(page.locator('.device-test-controls')).not.toHaveAttribute('open')
  const tops = await page.evaluate(() => ['.rescue-header','.device-panel','.location-card','.rescue-map-card','.share-card','.rescue-phone'].map(selector => document.querySelector(selector)!.getBoundingClientRect().top))
  for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1]!)
  expect(oldDataRequests).toEqual([])
})

test('타일 일부 실패 안내 유지 및 재시도', async ({ page }) => {
  let failed = false
  await page.route('https://tile.openstreetmap.org/**', async route => { if (!failed) { failed = true; await route.abort() } else await route.continue() })
  await page.goto('/')
  await expect(page.locator('.map-tile-status [role=alert]')).toContainText('로드 실패')
  await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible()
  await expect(page.locator('.map-tile-status [role=alert]')).toContainText('로드 실패')
  await page.unroute('https://tile.openstreetmap.org/**')
  await page.getByRole('button', { name: '지도 타일 다시 시도', exact: true }).click()
  await expect(page.locator('.map-tile-status')).toContainText('표시 완료')
})
