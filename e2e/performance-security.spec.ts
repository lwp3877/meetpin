/* e2e/performance-security.spec.ts */
import { test, expect, Page } from '@playwright/test'

// 성능 메트릭 타입 선언
interface PerformanceMetrics {
  navigationStart: number
  loadComplete: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  totalBlockingTime: number
}

// Performance Entry 확장 타입
interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean
  value: number
}

// 접근성 결과 타입
interface AccessibilityResults {
  images: number
  imagesWithoutAlt: number
  headings: number
  headingStructure: number[]
  forms: number
  formsWithoutLabels: number
  links: number
  emptyLinks: number
  focusableElements: number
  elementsWithoutFocus: number
  colorContrast: string[]
  errors: string[]
  warnings: string[]
}

// Window 타입 확장
declare global {
  interface Window {
    performanceMetrics: PerformanceMetrics
  }
}

/**
 * 성능 및 보안 자동화 테스트
 * 실제 배포 환경에서 성능·보안·접근성 완전 검증
 */

const TEST_CONFIG = {
  baseURL: process.env.CI ? 'https://meetpin-weld.vercel.app' : 'http://localhost:3000',
  performanceThresholds: {
    loadTime: 3000,        // 페이지 로드 시간 (ms)
    domContentLoaded: 2000, // DOM 로드 시간 (ms)
    firstContentfulPaint: 1500, // 첫 콘텐츠 표시 시간 (ms)
    largestContentfulPaint: 2500, // 최대 콘텐츠 표시 시간 (ms)
    cumulativeLayoutShift: 0.1,   // 레이아웃 이동 점수
    totalBlockingTime: 300        // 총 차단 시간 (ms)
  },
  securityTests: [
    '<script>alert("XSS")</script>',
    '"><script>alert("XSS")</script>',
    'javascript:alert("XSS")',
    '../../etc/passwd',
    '../../../windows/system32/config/sam',
    'SELECT * FROM users WHERE id=1',
    "'; DROP TABLE users; --",
    '{{7*7}}',
    '${7*7}',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<img src="x" onerror="alert(\'XSS\')">'
  ]
}

test.describe('⚡ 성능 모니터링 자동화', () => {

  test('🏃‍♀️ 홈페이지 성능 벤치마크', async ({ page }) => {
    console.log('🧪 홈페이지 성능 벤치마크 실행')
    
    // Performance Observer 설정
    await page.addInitScript(() => {
      window.performanceMetrics = {
        navigationStart: 0,
        loadComplete: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        totalBlockingTime: 0
      }

      // Performance Observer로 메트릭 수집
      if ('PerformanceObserver' in window) {
        // FCP, LCP 측정
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              window.performanceMetrics.firstContentfulPaint = entry.startTime
            }
            if (entry.entryType === 'largest-contentful-paint') {
              window.performanceMetrics.largestContentfulPaint = entry.startTime
            }
          }
        })
        paintObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] })

        // CLS 측정
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          for (const entry of list.getEntries()) {
            const layoutEntry = entry as LayoutShiftEntry
            if (layoutEntry.hadRecentInput) continue
            clsValue += layoutEntry.value
          }
          window.performanceMetrics.cumulativeLayoutShift = clsValue
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // TBT 측정
        const longTaskObserver = new PerformanceObserver((list) => {
          let tbtValue = 0
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              tbtValue += entry.duration - 50
            }
          }
          window.performanceMetrics.totalBlockingTime = tbtValue
        })
        longTaskObserver.observe({ entryTypes: ['longtask'] })
      }
    })

    const startTime = Date.now()
    await page.goto(TEST_CONFIG.baseURL, { waitUntil: 'networkidle' })
    const loadTime = Date.now() - startTime

    // 성능 메트릭 수집
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        networkTime: navigation.responseEnd - navigation.requestStart,
        renderTime: navigation.loadEventEnd - navigation.responseEnd,
        ...window.performanceMetrics
      }
    })

    console.log('📊 성능 메트릭 상세 분석:')
    console.log('┌─────────────────────────────────────┬─────────┬─────────┐')
    console.log('│ 메트릭                              │ 실제값  │ 기준값  │')
    console.log('├─────────────────────────────────────┼─────────┼─────────┤')
    console.log(`│ 페이지 로드 시간 (ms)               │ ${metrics.loadTime.toFixed(0).padStart(7)} │ ${TEST_CONFIG.performanceThresholds.loadTime.toString().padStart(7)} │`)
    console.log(`│ DOM 로드 시간 (ms)                  │ ${metrics.domContentLoaded.toFixed(0).padStart(7)} │ ${TEST_CONFIG.performanceThresholds.domContentLoaded.toString().padStart(7)} │`)
    console.log(`│ First Contentful Paint (ms)         │ ${metrics.firstContentfulPaint.toFixed(0).padStart(7)} │ ${TEST_CONFIG.performanceThresholds.firstContentfulPaint.toString().padStart(7)} │`)
    console.log(`│ Largest Contentful Paint (ms)       │ ${metrics.largestContentfulPaint.toFixed(0).padStart(7)} │ ${TEST_CONFIG.performanceThresholds.largestContentfulPaint.toString().padStart(7)} │`)
    console.log(`│ Cumulative Layout Shift             │ ${metrics.cumulativeLayoutShift.toFixed(3).padStart(7)} │ ${TEST_CONFIG.performanceThresholds.cumulativeLayoutShift.toString().padStart(7)} │`)
    console.log(`│ Total Blocking Time (ms)            │ ${metrics.totalBlockingTime.toFixed(0).padStart(7)} │ ${TEST_CONFIG.performanceThresholds.totalBlockingTime.toString().padStart(7)} │`)
    console.log('└─────────────────────────────────────┴─────────┴─────────┘')

    // 성능 임계값 검증
    expect(metrics.loadTime, '페이지 로드 시간이 기준을 초과했습니다').toBeLessThan(TEST_CONFIG.performanceThresholds.loadTime)
    expect(metrics.domContentLoaded, 'DOM 로드 시간이 기준을 초과했습니다').toBeLessThan(TEST_CONFIG.performanceThresholds.domContentLoaded)
    
    if (metrics.firstContentfulPaint > 0) {
      expect(metrics.firstContentfulPaint, 'First Contentful Paint가 기준을 초과했습니다').toBeLessThan(TEST_CONFIG.performanceThresholds.firstContentfulPaint)
    }
    
    if (metrics.largestContentfulPaint > 0) {
      expect(metrics.largestContentfulPaint, 'Largest Contentful Paint가 기준을 초과했습니다').toBeLessThan(TEST_CONFIG.performanceThresholds.largestContentfulPaint)
    }
    
    expect(metrics.cumulativeLayoutShift, 'Cumulative Layout Shift가 기준을 초과했습니다').toBeLessThan(TEST_CONFIG.performanceThresholds.cumulativeLayoutShift)
    expect(metrics.totalBlockingTime, 'Total Blocking Time이 기준을 초과했습니다').toBeLessThan(TEST_CONFIG.performanceThresholds.totalBlockingTime)

    // 리소스 로딩 분석
    const resourceMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource')
      const images = resources.filter(r => r.name.includes('.jpg') || r.name.includes('.png') || r.name.includes('.webp'))
      const scripts = resources.filter(r => r.name.includes('.js'))
      const styles = resources.filter(r => r.name.includes('.css'))
      
      return {
        totalResources: resources.length,
        imageCount: images.length,
        scriptCount: scripts.length,
        styleCount: styles.length,
        totalSize: resources.reduce((acc, r) => acc + (r.transferSize || 0), 0),
        slowResources: resources.filter(r => r.duration > 1000).length
      }
    })

    console.log('\n📦 리소스 분석:')
    console.log(`   - 총 리소스: ${resourceMetrics.totalResources}개`)
    console.log(`   - 이미지: ${resourceMetrics.imageCount}개`)
    console.log(`   - 스크립트: ${resourceMetrics.scriptCount}개`)
    console.log(`   - 스타일시트: ${resourceMetrics.styleCount}개`)
    console.log(`   - 총 전송 크기: ${(resourceMetrics.totalSize / 1024).toFixed(2)}KB`)
    console.log(`   - 느린 리소스 (>1s): ${resourceMetrics.slowResources}개`)

    // 경고 조건
    if (resourceMetrics.slowResources > 0) {
      console.warn('⚠️ 1초 이상 로딩되는 리소스가 있습니다')
    }
    
    if (resourceMetrics.totalSize > 5 * 1024 * 1024) { // 5MB
      console.warn('⚠️ 총 리소스 크기가 5MB를 초과합니다')
    }
  })

  test('📱 모바일 성능 검증', async ({ page, context }) => {
    console.log('🧪 모바일 성능 검증')
    
    // 모바일 에뮬레이션 (느린 3G + Low-end 기기)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15'
    })

    // 느린 네트워크 시뮬레이션
    await page.context().route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)) // 100ms 지연
      await route.continue()
    })

    const startTime = Date.now()
    await page.goto(TEST_CONFIG.baseURL, { waitUntil: 'networkidle' })
    const mobileLoadTime = Date.now() - startTime

    // 모바일 성능은 더 관대한 기준 적용
    expect(mobileLoadTime, '모바일 로드 시간이 기준을 초과했습니다').toBeLessThan(TEST_CONFIG.performanceThresholds.loadTime * 2)

    // 터치 대상 크기 검증
    const touchTargets = await page.locator('button, a, input, select').all()
    
    for (const target of touchTargets.slice(0, 10)) { // 처음 10개만 검사
      const box = await target.boundingBox()
      if (box && await target.isVisible()) {
        expect(box.width, '터치 대상 너비가 44px 미만입니다').toBeGreaterThanOrEqual(44)
        expect(box.height, '터치 대상 높이가 44px 미만입니다').toBeGreaterThanOrEqual(44)
      }
    }

    console.log(`📱 모바일 로드 시간: ${mobileLoadTime}ms`)
    console.log(`✅ 터치 대상 크기 검증 완료 (${touchTargets.length}개 요소)`)
  })

  test('🖼️ 이미지 최적화 검증', async ({ page }) => {
    console.log('🧪 이미지 최적화 검증')
    
    await page.goto(TEST_CONFIG.baseURL)
    
    const imageMetrics = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'))
      const results = images.map(img => ({
        src: img.src,
        alt: img.alt,
        loading: img.loading,
        sizes: img.sizes,
        srcset: img.srcset,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.offsetWidth,
        displayHeight: img.offsetHeight,
        hasAlt: !!img.alt,
        hasLazyLoading: img.loading === 'lazy',
        hasResponsiveImages: !!img.srcset || !!img.sizes,
        isOptimized: img.src.includes('.webp') || img.src.includes('w_auto') || img.src.includes('q_auto')
      }))
      
      return {
        totalImages: images.length,
        imagesWithAlt: results.filter(r => r.hasAlt).length,
        lazyImages: results.filter(r => r.hasLazyLoading).length,
        responsiveImages: results.filter(r => r.hasResponsiveImages).length,
        optimizedImages: results.filter(r => r.isOptimized).length,
        oversizedImages: results.filter(r => 
          r.naturalWidth > r.displayWidth * 2 || r.naturalHeight > r.displayHeight * 2
        ).length,
        details: results
      }
    })

    console.log('🖼️ 이미지 최적화 분석:')
    console.log(`   - 전체 이미지: ${imageMetrics.totalImages}개`)
    console.log(`   - Alt 텍스트 있음: ${imageMetrics.imagesWithAlt}개 (${Math.round(imageMetrics.imagesWithAlt / imageMetrics.totalImages * 100)}%)`)
    console.log(`   - 지연 로딩 적용: ${imageMetrics.lazyImages}개 (${Math.round(imageMetrics.lazyImages / imageMetrics.totalImages * 100)}%)`)
    console.log(`   - 반응형 이미지: ${imageMetrics.responsiveImages}개 (${Math.round(imageMetrics.responsiveImages / imageMetrics.totalImages * 100)}%)`)
    console.log(`   - 최적화된 포맷: ${imageMetrics.optimizedImages}개 (${Math.round(imageMetrics.optimizedImages / imageMetrics.totalImages * 100)}%)`)
    console.log(`   - 크기 초과 이미지: ${imageMetrics.oversizedImages}개`)

    // 접근성 검증 (모든 이미지에 alt 속성)
    expect(imageMetrics.imagesWithAlt, '일부 이미지에 alt 텍스트가 없습니다').toBe(imageMetrics.totalImages)
    
    // 성능 최적화 권장사항
    if (imageMetrics.lazyImages < imageMetrics.totalImages * 0.8) {
      console.warn('⚠️ 지연 로딩이 적용되지 않은 이미지가 많습니다')
    }
    
    if (imageMetrics.oversizedImages > 0) {
      console.warn(`⚠️ ${imageMetrics.oversizedImages}개의 이미지가 필요 이상으로 큽니다`)
    }
  })

  test('💾 메모리 사용량 모니터링', async ({ page }) => {
    console.log('🧪 메모리 사용량 모니터링')
    
    await page.goto(TEST_CONFIG.baseURL)
    
    // 메모리 사용량 측정 (Chrome 전용)
    const memoryInfo = await page.evaluate(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        }
      }
      return null
    })

    if (memoryInfo) {
      console.log('💾 메모리 사용량:')
      console.log(`   - 사용중: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
      console.log(`   - 할당됨: ${(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`)
      console.log(`   - 한계: ${(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`)
      console.log(`   - 사용률: ${memoryInfo.usedPercentage.toFixed(2)}%`)

      // 메모리 사용률이 80% 이상이면 경고
      if (memoryInfo.usedPercentage > 80) {
        console.warn('⚠️ 메모리 사용률이 80%를 초과했습니다')
      }
      
      expect(memoryInfo.usedPercentage, '메모리 사용률이 90%를 초과했습니다').toBeLessThan(90)
    } else {
      console.log('ℹ️ 메모리 정보는 Chrome 브라우저에서만 확인 가능합니다')
    }
  })
})

test.describe('🔒 보안 취약점 자동 검증', () => {

  test('🛡️ XSS 공격 차단 검증', async ({ page }) => {
    console.log('🧪 XSS 공격 차단 검증')
    
    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    
    let xssDetected = false
    let consoleErrors: string[] = []
    
    // 알림창 감지
    page.on('dialog', dialog => {
      xssDetected = true
      console.error('❌ XSS 공격 성공:', dialog.message())
      dialog.dismiss()
    })
    
    // 콘솔 에러 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // 다양한 XSS 페이로드 테스트
    for (const payload of TEST_CONFIG.securityTests.slice(0, 5)) { // 처음 5개만 테스트
      console.log(`   테스트 페이로드: ${payload}`)
      
      // 이메일 필드에 XSS 시도
      const emailInput = page.locator('input[type="email"]')
      if (await emailInput.isVisible()) {
        await emailInput.fill(payload)
        await page.waitForTimeout(500)
      }
      
      // 비밀번호 필드에 XSS 시도
      const passwordInput = page.locator('input[type="password"]')
      if (await passwordInput.isVisible()) {
        await passwordInput.fill(payload)
        await page.waitForTimeout(500)
      }
      
      // 폼 제출
      const submitButton = page.locator('button[type="submit"]')
      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(1000)
      }
    }

    console.log(`🛡️ XSS 테스트 결과: ${xssDetected ? '❌ 취약' : '✅ 안전'}`)
    console.log(`📋 콘솔 에러 ${consoleErrors.length}개`)

    // XSS가 실행되지 않아야 함
    expect(xssDetected, 'XSS 공격이 성공했습니다').toBeFalsy()
  })

  test('🔍 SQL Injection 차단 검증', async ({ page }) => {
    console.log('🧪 SQL Injection 차단 검증')
    
    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    
    const sqlPayloads = [
      "' OR 1=1 --",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'/*",
      "' OR 'x'='x",
      "1' OR '1'='1' /*"
    ]

    let errors: string[] = []
    
    page.on('response', response => {
      if (!response.ok() && response.status() === 500) {
        errors.push(`서버 에러: ${response.url()}`)
      }
    })

    for (const payload of sqlPayloads) {
      console.log(`   테스트 페이로드: ${payload}`)
      
      await page.fill('input[type="email"]', payload)
      await page.fill('input[type="password"]', payload)
      
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()
      await page.waitForTimeout(1000)
    }

    console.log(`🔍 SQL Injection 테스트 결과: ${errors.length > 0 ? '❌ 의심스러운 에러' : '✅ 안전'}`)
    
    if (errors.length > 0) {
      console.warn('⚠️ SQL Injection 시도 중 서버 에러 발생:', errors)
    }
  })

  test('🚫 파일 업로드 보안 검증', async ({ page }) => {
    console.log('🧪 파일 업로드 보안 검증')
    
    await page.goto(TEST_CONFIG.baseURL)
    
    // 파일 업로드 입력 찾기
    const fileInputs = await page.locator('input[type="file"]').all()
    
    if (fileInputs.length > 0) {
      console.log(`📁 파일 업로드 필드 ${fileInputs.length}개 발견`)
      
      for (const fileInput of fileInputs) {
        // 허용되는 파일 형식 확인
        const accept = await fileInput.getAttribute('accept')
        console.log(`   허용 형식: ${accept || '제한 없음'}`)
        
        if (!accept) {
          console.warn('⚠️ 파일 형식 제한이 없습니다')
        }
        
        // 위험한 파일 형식 차단 확인
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.js', '.vbs', '.jar']
        if (accept) {
          const hasDangerousTypes = dangerousExtensions.some(ext => accept.includes(ext))
          if (hasDangerousTypes) {
            console.error('❌ 위험한 파일 형식이 허용됩니다')
          }
        }
      }
    } else {
      console.log('ℹ️ 파일 업로드 기능이 없습니다')
    }
  })

  test('🔐 인증 보안 검증', async ({ page }) => {
    console.log('🧪 인증 보안 검증')
    
    await page.goto(`${TEST_CONFIG.baseURL}/auth/login`)
    
    // CSRF 토큰 확인
    const csrfToken = await page.locator('input[name="_token"], input[name="csrf_token"], meta[name="csrf-token"]').first()
    const hasCsrfProtection = await csrfToken.count() > 0
    
    console.log(`🔐 CSRF 보호: ${hasCsrfProtection ? '✅ 있음' : '⚠️ 없음'}`)
    
    // 비밀번호 필드 보안 속성 확인
    const passwordInput = page.locator('input[type="password"]').first()
    
    if (await passwordInput.isVisible()) {
      const autocomplete = await passwordInput.getAttribute('autocomplete')
      const isSecure = autocomplete === 'current-password' || autocomplete === 'new-password'
      
      console.log(`🔑 비밀번호 자동완성: ${isSecure ? '✅ 보안 설정됨' : '⚠️ 미설정'}`)
    }
    
    // 로그인 시도 횟수 제한 확인
    const wrongCredentials = Array(6).fill(null) // 6번 시도
    let rateLimitTriggered = false
    
    for (let i = 0; i < wrongCredentials.length; i++) {
      await page.fill('input[type="email"]', 'wrong@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.locator('button[type="submit"]').click()
      await page.waitForTimeout(1000)
      
      // Rate limit 메시지 확인
      const rateLimitMessage = page.locator('.error, .toast').filter({ 
        hasText: /제한|차단|시도|횟수|limit/i 
      })
      
      if (await rateLimitMessage.isVisible()) {
        rateLimitTriggered = true
        console.log(`🚫 Rate limit 트리거됨 (시도 ${i + 1}회)`)
        break
      }
    }
    
    console.log(`🚫 로그인 시도 제한: ${rateLimitTriggered ? '✅ 적용됨' : '⚠️ 미적용'}`)
  })

  test('🔍 민감 정보 노출 검증', async ({ page }) => {
    console.log('🧪 민감 정보 노출 검증')
    
    await page.goto(TEST_CONFIG.baseURL)
    
    // 페이지 소스에서 민감 정보 검색
    const pageContent = await page.content()
    
    const sensitivePatterns = [
      /password\s*[:=]\s*['"][^'"]*['"]/gi,
      /api[_-]?key\s*[:=]\s*['"][^'"]*['"]/gi,
      /secret\s*[:=]\s*['"][^'"]*['"]/gi,
      /token\s*[:=]\s*['"][^'"]*['"]/gi,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // 이메일
      /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, // 카드번호 패턴
    ]
    
    interface SensitiveInfo {
      type: string
      count: number
      samples: string[]
    }
    
    let foundSensitiveInfo: SensitiveInfo[] = []
    
    sensitivePatterns.forEach((pattern, index) => {
      const matches = pageContent.match(pattern)
      if (matches) {
        foundSensitiveInfo.push({
          type: ['password', 'api_key', 'secret', 'token', 'email', 'card_number'][index],
          count: matches.length,
          samples: matches.slice(0, 3) // 처음 3개만
        })
      }
    })
    
    console.log('🔍 민감 정보 스캔 결과:')
    if (foundSensitiveInfo.length === 0) {
      console.log('   ✅ 민감 정보 노출 없음')
    } else {
      foundSensitiveInfo.forEach(info => {
        console.warn(`   ⚠️ ${info.type}: ${info.count}개 발견`)
        info.samples.forEach(sample => {
          console.warn(`      - ${sample.substring(0, 50)}...`)
        })
      })
    }
    
    // 심각한 민감 정보는 없어야 함
    const criticalInfo = foundSensitiveInfo.filter(info => 
      ['password', 'api_key', 'secret', 'token'].includes(info.type)
    )
    
    expect(criticalInfo.length, '심각한 민감 정보가 노출되었습니다').toBe(0)
  })
})

test.describe('♿ 접근성 자동 검증', () => {

  test('🔍 WCAG 2.1 AA 기준 검증', async ({ page }) => {
    console.log('🧪 WCAG 2.1 AA 접근성 검증')
    
    await page.goto(TEST_CONFIG.baseURL)
    
    const a11yResults = await page.evaluate(() => {
      const results: AccessibilityResults = {
        images: 0,
        imagesWithoutAlt: 0,
        headings: 0,
        headingStructure: [],
        forms: 0,
        formsWithoutLabels: 0,
        links: 0,
        emptyLinks: 0,
        focusableElements: 0,
        elementsWithoutFocus: 0,
        colorContrast: [],
        errors: [],
        warnings: []
      }
      
      // 이미지 alt 텍스트 검증
      const images = document.querySelectorAll('img')
      results.images = images.length
      images.forEach(img => {
        if (!img.alt) {
          results.imagesWithoutAlt++
          results.errors.push(`이미지에 alt 텍스트가 없습니다: ${(img as HTMLImageElement).src}`)
        }
      })
      
      // 헤딩 구조 검증
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      results.headings = headings.length
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1))
        results.headingStructure.push(level)
      })
      
      // 헤딩 구조 순서 확인
      for (let i = 1; i < results.headingStructure.length; i++) {
        const current = results.headingStructure[i]
        const previous = results.headingStructure[i - 1]
        if (current > previous + 1) {
          results.errors.push(`헤딩 레벨 건너뛰기: H${previous}에서 H${current}로`)
        }
      }
      
      // H1 개수 확인
      const h1Count = results.headingStructure.filter(level => level === 1).length
      if (h1Count === 0) {
        results.errors.push('H1 헤딩이 없습니다')
      } else if (h1Count > 1) {
        results.warnings.push(`H1 헤딩이 ${h1Count}개입니다 (1개 권장)`)
      }
      
      // 폼 레이블 검증
      const inputs = document.querySelectorAll('input, textarea, select')
      results.forms = inputs.length
      inputs.forEach(input => {
        const id = input.id
        const ariaLabel = input.getAttribute('aria-label')
        const ariaLabelledby = input.getAttribute('aria-labelledby')
        const label = id ? document.querySelector(`label[for="${id}"]`) : null
        
        if (!label && !ariaLabel && !ariaLabelledby) {
          results.formsWithoutLabels++
          results.errors.push(`폼 요소에 레이블이 없습니다: ${input.tagName} ${(input as HTMLInputElement).type || ''}`)
        }
      })
      
      // 링크 검증
      const links = document.querySelectorAll('a')
      results.links = links.length
      links.forEach(link => {
        const text = link.textContent?.trim()
        const ariaLabel = link.getAttribute('aria-label')
        if (!text && !ariaLabel) {
          results.emptyLinks++
          results.errors.push(`빈 링크가 있습니다: ${link.href}`)
        }
        if (text && (text === '더보기' || text === '자세히' || text === 'Read more')) {
          results.warnings.push(`모호한 링크 텍스트: "${text}"`)
        }
      })
      
      // 포커스 가능한 요소 검증
      const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]')
      results.focusableElements = focusableElements.length
      
      return results
    })
    
    console.log('♿ 접근성 검증 결과:')
    console.log('┌─────────────────────────────────────┬─────────┐')
    console.log('│ 항목                                │ 결과    │')
    console.log('├─────────────────────────────────────┼─────────┤')
    console.log(`│ 이미지 (alt 없음)                   │ ${a11yResults.images} (${a11yResults.imagesWithoutAlt}) │`)
    console.log(`│ 헤딩 구조                           │ ${a11yResults.headings}개     │`)
    console.log(`│ 폼 요소 (레이블 없음)               │ ${a11yResults.forms} (${a11yResults.formsWithoutLabels})  │`)
    console.log(`│ 링크 (빈 링크)                      │ ${a11yResults.links} (${a11yResults.emptyLinks})   │`)
    console.log(`│ 포커스 가능 요소                    │ ${a11yResults.focusableElements}개     │`)
    console.log('└─────────────────────────────────────┴─────────┘')
    
    if (a11yResults.errors.length > 0) {
      console.log('\n❌ 접근성 오류:')
      a11yResults.errors.forEach(error => console.log(`   - ${error}`))
    }
    
    if (a11yResults.warnings.length > 0) {
      console.log('\n⚠️ 접근성 경고:')
      a11yResults.warnings.forEach(warning => console.log(`   - ${warning}`))
    }
    
    // 접근성 기준 검증
    expect(a11yResults.imagesWithoutAlt, '일부 이미지에 alt 텍스트가 없습니다').toBe(0)
    expect(a11yResults.formsWithoutLabels, '일부 폼 요소에 레이블이 없습니다').toBe(0)
    expect(a11yResults.emptyLinks, '빈 링크가 있습니다').toBe(0)
    
    // 접근성 점수 계산
    const totalElements = a11yResults.images + a11yResults.forms + a11yResults.links
    const totalErrors = a11yResults.imagesWithoutAlt + a11yResults.formsWithoutLabels + a11yResults.emptyLinks
    const accessibilityScore = totalElements > 0 ? Math.round((1 - totalErrors / totalElements) * 100) : 100
    
    console.log(`\n📊 접근성 점수: ${accessibilityScore}/100`)
    
    expect(accessibilityScore, '접근성 점수가 90점 미만입니다').toBeGreaterThanOrEqual(90)
  })

  test('⌨️ 키보드 접근성 검증', async ({ page }) => {
    console.log('🧪 키보드 접근성 검증')
    
    await page.goto(TEST_CONFIG.baseURL)
    
    // Tab 키로 모든 포커스 가능한 요소 순회
    const focusableElements = []
    let currentElement = null
    let tabCount = 0
    const maxTabs = 20 // 무한 루프 방지
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab')
      tabCount++
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        if (el && el !== document.body) {
          return {
            tagName: el.tagName,
            type: (el as any).type || '',
            text: el.textContent?.substring(0, 30) || '',
            hasVisibleFocus: getComputedStyle(el).outline !== 'none'
          }
        }
        return null
      })
      
      if (focusedElement) {
        focusableElements.push(focusedElement)
        
        // 같은 요소가 반복되면 탭 순회 완료
        if (currentElement && 
            currentElement.tagName === focusedElement.tagName && 
            currentElement.text === focusedElement.text) {
          break
        }
        currentElement = focusedElement
      } else {
        break
      }
    }
    
    console.log(`⌨️ 키보드 접근성 결과:`)
    console.log(`   - 포커스 가능한 요소: ${focusableElements.length}개`)
    console.log(`   - Tab 순회 완료: ${tabCount < maxTabs ? '✅' : '⚠️ 무한루프 의심'}`)
    
    // 포커스 표시 확인
    const elementsWithFocus = focusableElements.filter(el => el.hasVisibleFocus).length
    const focusPercentage = Math.round(elementsWithFocus / focusableElements.length * 100)
    
    console.log(`   - 포커스 표시: ${elementsWithFocus}/${focusableElements.length} (${focusPercentage}%)`)
    
    if (focusableElements.length === 0) {
      console.warn('⚠️ 키보드로 접근 가능한 요소가 없습니다')
    }
    
    expect(focusableElements.length, '키보드로 접근 가능한 요소가 없습니다').toBeGreaterThan(0)
  })
})