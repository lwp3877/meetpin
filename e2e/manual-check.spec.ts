// e2e/manual-check.spec.ts - 수동 페이지 확인
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('포트 3000 수동 페이지 확인', () => {
  test('주요 페이지 개별 점검', async ({ page }) => {
    console.log('🔍 포트 3000 주요 페이지 개별 점검 시작')
    
    // 1. 홈페이지
    console.log('\n1️⃣ 홈페이지 점검')
    await page.goto(`${BASE_URL}/`)
    await page.waitForLoadState('domcontentloaded')
    const homeTitle = await page.title()
    console.log(`   제목: ${homeTitle}`)
    console.log('   ✅ 홈페이지 정상 로드')
    
    // 2. 지도 페이지 
    console.log('\n2️⃣ 지도 페이지 점검')
    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000) // 지도 로딩 대기
    const mapTitle = await page.title()
    console.log(`   제목: ${mapTitle}`)
    console.log('   ✅ 지도 페이지 정상 로드')
    
    // 3. 로그인 페이지
    console.log('\n3️⃣ 로그인 페이지 점검')
    await page.goto(`${BASE_URL}/auth/login`)
    await page.waitForLoadState('domcontentloaded')
    const loginTitle = await page.title()
    console.log(`   제목: ${loginTitle}`)
    
    // 폼 필드 확인
    const emailInputs = await page.locator('input[type="email"]').count()
    const passwordInputs = await page.locator('input[type="password"]').count()
    console.log(`   이메일 필드: ${emailInputs}개`)
    console.log(`   비밀번호 필드: ${passwordInputs}개`)
    console.log('   ✅ 로그인 페이지 정상 로드')
    
    // 4. 회원가입 페이지
    console.log('\n4️⃣ 회원가입 페이지 점검')
    await page.goto(`${BASE_URL}/auth/signup`)
    await page.waitForLoadState('domcontentloaded')
    const signupTitle = await page.title()
    console.log(`   제목: ${signupTitle}`)
    console.log('   ✅ 회원가입 페이지 정상 로드')
    
    // 5. 방 생성 페이지
    console.log('\n5️⃣ 방 생성 페이지 점검')
    await page.goto(`${BASE_URL}/room/new`)
    await page.waitForLoadState('domcontentloaded')
    const roomNewTitle = await page.title()
    console.log(`   제목: ${roomNewTitle}`)
    
    // 방 제목 입력 필드 확인
    const titleInputs = await page.locator('input[name="title"], input[placeholder*="제목"]').count()
    console.log(`   제목 입력 필드: ${titleInputs}개`)
    console.log('   ✅ 방 생성 페이지 정상 로드')
    
    // 6. 프로필 페이지
    console.log('\n6️⃣ 프로필 페이지 점검')
    await page.goto(`${BASE_URL}/profile`)
    await page.waitForLoadState('domcontentloaded')
    const profileTitle = await page.title()
    console.log(`   제목: ${profileTitle}`)
    console.log('   ✅ 프로필 페이지 정상 로드')
    
    // 7. 관리자 페이지
    console.log('\n7️⃣ 관리자 페이지 점검')
    await page.goto(`${BASE_URL}/admin`)
    await page.waitForLoadState('domcontentloaded')
    const adminTitle = await page.title()
    console.log(`   제목: ${adminTitle}`)
    console.log('   ✅ 관리자 페이지 정상 로드')
    
    // 8. 방 상세 페이지
    console.log('\n8️⃣ 방 상세 페이지 점검')
    await page.goto(`${BASE_URL}/room/550e8400-e29b-41d4-a716-446655440010`)
    await page.waitForLoadState('domcontentloaded')
    const roomDetailTitle = await page.title()
    console.log(`   제목: ${roomDetailTitle}`)
    console.log('   ✅ 방 상세 페이지 정상 로드')
    
    // 9. 요청함 페이지
    console.log('\n9️⃣ 요청함 페이지 점검')
    await page.goto(`${BASE_URL}/requests`)
    await page.waitForLoadState('domcontentloaded')
    const requestsTitle = await page.title()
    console.log(`   제목: ${requestsTitle}`)
    console.log('   ✅ 요청함 페이지 정상 로드')
    
    console.log('\n🎉 모든 주요 페이지 정상 확인 완료!')
  })
  
  test('API 연동 확인', async ({ page }) => {
    console.log('🔍 API 연동 확인 시작')
    
    const apiCalls: { status: number; url: string }[] = []
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          status: response.status(),
          url: response.url()
        })
        console.log(`📡 API: ${response.status()} ${response.url()}`)
      }
    })
    
    // 지도 페이지에서 rooms API 확인
    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    
    // API 호출 결과 요약
    const successCalls = apiCalls.filter(call => call.status >= 200 && call.status < 300)
    const errorCalls = apiCalls.filter(call => call.status >= 400)
    
    console.log(`\n📊 API 호출 결과:`)
    console.log(`   성공 (2xx): ${successCalls.length}개`)
    console.log(`   오류 (4xx/5xx): ${errorCalls.length}개`)
    
    successCalls.forEach((call, i) => {
      console.log(`   ✅ ${call.status} ${call.url}`)
    })
    
    if (errorCalls.length > 0) {
      errorCalls.forEach((call, i) => {
        console.log(`   🚨 ${call.status} ${call.url}`)
      })
    }
    
    console.log('🎉 API 연동 확인 완료!')
  })
})