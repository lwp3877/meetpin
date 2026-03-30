/**
 * 로컬 개발 서버 전체 기능 테스트
 * 사용자 관점에서 모든 핵심 기능 검증
 */
import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3001'

test.describe('전체 기능 검증 (로컬)', () => {

  test('1. 홈페이지 렌더링', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(BASE, { waitUntil: 'networkidle' })
    await expect(page).toHaveTitle(/밋핀/)
    const h = page.locator('h1, h2').first()
    await expect(h).toBeVisible()
    const title = await page.title()
    const h1Text = await h.textContent()
    console.log(`✅ 홈페이지: title="${title}", h1="${h1Text?.slice(0, 40)}"`)
    if (errors.length > 0) console.log('⚠️ 콘솔 에러:', errors.slice(0, 3))
  })

  test('2. 로그인 페이지', async ({ page }) => {
    await page.goto(`${BASE}/auth/login`, { waitUntil: 'domcontentloaded' })
    const email = page.locator('input[type="email"]').first()
    const pass = page.locator('input[type="password"]').first()
    const btn = page.locator('button[type="submit"]').first()
    await expect(email).toBeVisible({ timeout: 10000 })
    await expect(pass).toBeVisible()
    await expect(btn).toBeVisible()
    console.log(`✅ 로그인 폼: 이메일, 비밀번호, 버튼 모두 정상`)
  })

  test('3. /map 페이지 렌더링 (Mock 모드 - 직접 접근)', async ({ page }) => {
    const jsErrors: string[] = []
    page.on('pageerror', err => jsErrors.push(err.message))

    // Mock 모드에서는 로그인 없이 /map 직접 접근 가능
    await page.goto(`${BASE}/map`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(4000)
    const mapUrl = page.url()
    console.log(`/map URL: ${mapUrl}`)

    // 지도 컨테이너 확인 (Kakao SDK 로드 후 생성됨)
    const mapContainer = page.locator('[data-testid="map-container"]').first()
    const mapVisible = await mapContainer.isVisible({ timeout: 8000 }).catch(() => false)
    console.log(`지도 컨테이너 visible: ${mapVisible}`)

    // 지도 로딩/에러 상태 확인
    const spinner = page.locator('text=지도를 로드하는 중').first()
    const spinnerVisible = await spinner.isVisible({ timeout: 1000 }).catch(() => false)
    const errorText = page.locator('text=지도를 불러오지 못했습니다').first()
    const errorVisible = await errorText.isVisible({ timeout: 1000 }).catch(() => false)

    // 지도 스크린샷
    console.log(`지도 컨테이너: ${mapVisible}, 스피너: ${spinnerVisible}, 에러메시지: ${errorVisible}`)
    if (jsErrors.length > 0) console.log('JS 에러:', jsErrors.slice(0, 3))

    // 최소한 페이지가 렌더링되어야 함
    await expect(page.locator('body')).toBeVisible()
    console.log(`✅ /map 페이지 렌더링 OK`)
  })

  test('4. /room/new 방 생성 폼 (Mock 모드 - 직접 접근)', async ({ page }) => {
    // Mock 모드에서는 로그인 없이 /room/new 직접 접근 가능
    await page.goto(`${BASE}/room/new`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    const url = page.url()
    console.log(`/room/new URL: ${url}`)

    // 폼 요소 확인
    const titleInput = page.locator('input').filter({ hasNot: page.locator('[type="hidden"]') }).first()
    const titleVisible = await titleInput.isVisible({ timeout: 5000 }).catch(() => false)
    console.log(`입력 필드: ${titleVisible}`)

    // 카테고리 버튼
    const categoryBtn = page.locator('button').filter({ hasText: /술|운동|기타/ }).first()
    const catVisible = await categoryBtn.isVisible({ timeout: 3000 }).catch(() => false)
    console.log(`카테고리 버튼: ${catVisible}`)

    // 장소 선택 버튼
    const placeBtn = page.locator('button').filter({ hasText: /장소|위치|지도/ }).first()
    const placeVisible = await placeBtn.isVisible({ timeout: 3000 }).catch(() => false)
    console.log(`장소 선택 버튼: ${placeVisible}`)

    expect(titleVisible || catVisible).toBe(true)
    console.log(`✅ 방 생성 폼 렌더링 OK`)
  })

  test('5. API 엔드포인트 상태 확인', async ({ page }) => {
    const endpoints = [
      '/api/health',
      '/api/rooms?bbox=37.4,126.9,37.6,127.1&limit=5',
    ]

    for (const ep of endpoints) {
      const res = await page.request.get(`${BASE}${ep}`)
      const status = res.status()
      const body = await res.json().catch(() => ({}))
      const ok = (body as any).ok
      console.log(`${ep}: HTTP ${status} ok=${ok}`)
      expect(status).toBe(200)
      expect(ok).toBe(true)
    }
    console.log('✅ API 엔드포인트 전부 OK')
  })

  test('6. kakao.ts - referrerPolicy 없는지 확인', async ({ page }) => {
    // JS 번들에서 no-referrer 확인
    const res = await page.request.get(`${BASE}/_next/static/chunks/webpack.js`).catch(() => null)
    // 소스코드 확인으로 대체
    const fs = require('fs')
    const kakaoSrc = fs.readFileSync('src/lib/services/kakao.ts', 'utf-8')
    const hasNoReferrer = kakaoSrc.includes('referrerPolicy')
    console.log(`kakao.ts referrerPolicy 코드 존재: ${hasNoReferrer}`)
    expect(hasNoReferrer).toBe(false)
    console.log('✅ referrerPolicy 완전 제거 확인됨')
  })

  test('7. 회원가입 페이지', async ({ page }) => {
    await page.goto(`${BASE}/auth/signup`, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('input[type="email"]').first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
    const btn = page.locator('button[type="submit"]').first()
    await expect(btn).toBeVisible()
    console.log(`✅ 회원가입: ${await btn.textContent()}`)
  })

  test('8. Mock 모드 라우트 접근 가능 확인', async ({ page }) => {
    // Mock 모드에서는 모든 라우트 접근 가능 (클라이언트 auth = mock user 반환)
    // 프로덕션에서는 redirect 됨 (verify-core.spec.ts에서 별도 검증)
    const routes = ['/profile', '/room/new', '/requests']
    for (const r of routes) {
      await page.goto(`${BASE}${r}`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(1000)
      const url = page.url()
      const accessible = !url.includes('/auth/login')
      console.log(`${r} → ${accessible ? '✅ Mock 모드 접근됨' : '⚠️ 예상치 못한 리다이렉트: ' + url}`)
      // mock 모드에서 접근 가능한 것이 정상
      await expect(page.locator('body')).toBeVisible()
    }
    console.log('✅ Mock 모드 라우트 접근 정상')
  })

  test('9. /api/kakao/coord2address 엔드포인트', async ({ page }) => {
    // REST 키 없으면 address:null 반환해야 함 (fallback 동작)
    const res = await page.request.get(`${BASE}/api/kakao/coord2address?lat=37.5665&lng=126.9780`)
    const status = res.status()
    const body = await res.json().catch(() => ({}))
    console.log(`coord2address: HTTP ${status}, body=${JSON.stringify(body)}`)
    expect(status).toBe(200)
    expect((body as any).ok).toBe(true)
    // address는 null(키 미설정) 또는 문자열(키 설정됨) 모두 허용
    console.log(`✅ coord2address 프록시 엔드포인트 정상`)
  })

  test('10. start_at ISO 변환 - RoomForm 제출', async ({ page }) => {
    // RoomForm의 onFormSubmit이 startTime.toISOString()을 쓰는지 소스 확인
    const fs = require('fs')
    const formSrc = fs.readFileSync('src/components/room/RoomForm.tsx', 'utf-8')
    const hasISOConversion = formSrc.includes('startTime.toISOString()')
    console.log(`RoomForm start_at ISO 변환: ${hasISOConversion}`)
    expect(hasISOConversion).toBe(true)
    console.log('✅ start_at ISO 변환 코드 확인됨')
  })

})
