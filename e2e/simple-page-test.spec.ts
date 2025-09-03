/* e2e/simple-page-test.spec.ts */
import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

// 테스트할 핵심 페이지들
const CORE_PAGES = [
  { path: '/', name: '홈페이지' },
  { path: '/map', name: '지도 페이지' },
  { path: '/auth/login', name: '로그인 페이지' },
  { path: '/profile/550e8400-e29b-41d4-a716-446655440001', name: '프로필 페이지' },
  { path: '/room/550e8400-e29b-41d4-a716-446655440010', name: '방 상세 페이지' },
]

test.describe('⚡ 간단한 페이지 동작 확인', () => {
  test('📋 핵심 페이지들이 모두 로드되는지 확인', async ({ page }) => {
    console.log('⚡ 간단한 페이지 테스트 시작')
    
    for (const pageInfo of CORE_PAGES) {
      console.log(`\\n🔍 ${pageInfo.name} 테스트 중...`)
      
      try {
        // 페이지 접속 (타임아웃 시간 늘림)
        await page.goto(`${BASE_URL}${pageInfo.path}`, { 
          waitUntil: 'load',
          timeout: 30000 
        })
        
        // 페이지 타이틀 확인
        const title = await page.title()
        expect(title).toContain('밋핀')
        
        // body 요소 존재 확인
        const body = page.locator('body')
        await expect(body).toBeAttached()
        
        console.log(`✅ ${pageInfo.name}: 성공 (${title})`)
        
        // 잠시 대기
        await page.waitForTimeout(1000)
        
      } catch (error) {
        console.log(`❌ ${pageInfo.name}: 실패 - ${error}`)
        throw error
      }
    }
    
    console.log('\\n🎉 모든 핵심 페이지 테스트 완료!')
  })

  test('🔘 기본 UI 요소들 확인', async ({ page }) => {
    console.log('🔘 기본 UI 요소 테스트 시작')
    
    // 홈페이지
    await page.goto(`${BASE_URL}/`)
    await page.waitForLoadState('load')
    
    // 버튼이나 링크가 있는지 확인
    const links = page.locator('a')
    const linkCount = await links.count()
    expect(linkCount).toBeGreaterThan(0)
    console.log(`✅ 홈페이지에서 ${linkCount}개의 링크 발견`)
    
    // 지도 페이지
    await page.goto(`${BASE_URL}/map`)
    await page.waitForLoadState('load')
    
    // 필터나 버튼 확인
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(0)
    console.log(`✅ 지도 페이지에서 ${buttonCount}개의 버튼 발견`)
    
    console.log('\\n🎉 UI 요소 테스트 완료!')
  })
})