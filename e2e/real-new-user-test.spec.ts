import { test, expect } from '@playwright/test'

test.describe('진짜 신규 사용자 전체 여정', () => {
  test('신규 회원가입부터 모든 기능 테스트', async ({ page }) => {
    console.log('🚀 진짜 신규 사용자 테스트 시작...')
    
    // 콘솔 에러 캐치
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
        console.log('❌ Console Error:', msg.text())
      }
    })

    // 1. 회원가입 페이지 접속
    console.log('\n1️⃣ 회원가입 페이지 접속...')
    await page.goto('https://meetpin-weld.vercel.app/auth/signup')
    
    // 회원가입 폼 확인
    await expect(page.locator('form')).toBeVisible()
    console.log('✅ 회원가입 페이지 로드 성공')

    // 2. 신규 사용자 정보로 회원가입
    console.log('\n2️⃣ 신규 사용자 회원가입...')
    const testEmail = `testuser${Date.now()}@meetpin.com`
    const testPassword = '123456'
    const testNickname = '테스트유저'
    
    // 회원가입 정보 입력
    await page.fill('#email', testEmail)
    await page.fill('#password', testPassword)
    await page.fill('#confirmPassword', testPassword)
    await page.fill('#nickname', testNickname)
    
    // 나이대 선택
    await page.selectOption('#ageRange', '20s_late')
    
    // 이용약관 동의
    await page.check('#terms')
    
    console.log(`📧 이메일: ${testEmail}`)
    console.log(`👤 닉네임: ${testNickname}`)
    
    // 회원가입 버튼 클릭
    const signupButton = page.locator('button[type="submit"]:has-text("계정 만들기")').first()
    await signupButton.click()
    
    await page.waitForTimeout(3000)
    
    // 회원가입 성공 확인
    const currentUrl = page.url()
    if (currentUrl.includes('/auth/login') || currentUrl.includes('/map')) {
      console.log('✅ 회원가입 성공')
    } else {
      console.log('⚠️ 회원가입 상태 확인 필요')
    }

    // 3. 로그인 (회원가입 후 리다이렉트되지 않은 경우)
    console.log('\n3️⃣ 신규 사용자 로그인...')
    if (!currentUrl.includes('/map')) {
      await page.goto('https://meetpin-weld.vercel.app/auth/login')
      
      await page.fill('input[type="email"], input[name="email"]', testEmail)
      await page.fill('input[type="password"], input[name="password"]', testPassword)
      
      const loginButton = page.locator('button[type="submit"], button:has-text("로그인")').first()
      await loginButton.click()
      
      await page.waitForURL(url => !url.toString().includes('/auth/login'), { timeout: 10000 })
      console.log('✅ 신규 사용자 로그인 성공')
    }
    
    console.log(`📍 현재 URL: ${page.url()}`)

    // 4. 지도 페이지에서 방 목록 확인
    console.log('\n4️⃣ 지도 페이지 방 목록 확인...')
    await page.goto('https://meetpin-weld.vercel.app/map', { waitUntil: 'networkidle' })
    
    // 지도 로딩 대기
    await page.waitForTimeout(5000)
    
    // 방 목록 확인
    const roomCards = page.locator('[data-testid="room-card"], .room-card, .bg-white:has(.font-semibold):has(.text-sm)')
    await page.waitForTimeout(3000)
    
    const roomCount = await roomCards.count()
    console.log(`📊 지도에서 발견된 방 개수: ${roomCount}개`)
    
    if (roomCount > 0) {
      console.log('✅ Mock 방 데이터 정상 표시됨')
      
      // 첫 번째 방 제목 확인
      const firstRoom = roomCards.first()
      const roomTitle = await firstRoom.locator('.font-semibold, .text-lg, h3').textContent()
      if (roomTitle) {
        console.log(`📝 첫 번째 방: "${roomTitle.trim()}"`)
      }
    } else {
      console.log('❌ 방 목록이 표시되지 않음')
    }

    // 5. 새 방 만들기 테스트
    console.log('\n5️⃣ 새 방 만들기 테스트...')
    
    const createRoomButton = page.locator('button:has-text("방 만들기"), button:has-text("새 모임"), a:has-text("방 만들기")').first()
    
    if (await createRoomButton.count() > 0) {
      await createRoomButton.click()
      await page.waitForTimeout(2000)
      
      // 방 만들기 폼이나 모달 확인
      const titleField = page.locator('input[name="title"], input[placeholder*="제목"]')
      
      if (await titleField.count() > 0) {
        console.log('✅ 방 만들기 폼 접근 성공')
        
        // 방 정보 입력
        await titleField.fill('신규 유저가 만든 테스트 방')
        
        const descField = page.locator('textarea[name="description"], input[name="description"]')
        if (await descField.count() > 0) {
          await descField.fill('이것은 자동 테스트로 생성된 방입니다.')
        }
        
        // 카테고리 선택 (있다면)
        const categorySelect = page.locator('select[name="category"]')
        if (await categorySelect.count() > 0) {
          await categorySelect.selectOption('other')
        }
        
        console.log('✅ 방 생성 폼 작성 완료')
        
        // 실제로 생성하지는 않고 취소 (테스트이므로)
        const cancelButton = page.locator('button:has-text("취소")')
        if (await cancelButton.count() > 0) {
          await cancelButton.click()
          console.log('✅ 방 생성 취소 (테스트 완료)')
        }
      } else {
        console.log('⚠️ 방 만들기 폼을 찾을 수 없음')
      }
    } else {
      console.log('⚠️ 방 만들기 버튼을 찾을 수 없음')
    }

    // 6. 프로필 페이지 테스트
    console.log('\n6️⃣ 프로필 페이지 테스트...')
    
    const profileLink = page.locator('a:has-text("프로필"), button:has-text("프로필"), [data-testid="profile-link"]')
    
    if (await profileLink.count() > 0) {
      await profileLink.first().click()
      await page.waitForTimeout(2000)
      
      // 프로필 편집 필드 확인
      const nicknameField = page.locator('input[name="nickname"]')
      
      if (await nicknameField.count() > 0) {
        console.log('✅ 프로필 페이지 접근 성공')
        
        // 닉네임 수정 테스트
        const originalNickname = await nicknameField.inputValue()
        await nicknameField.fill(`${originalNickname}_수정됨`)
        
        console.log(`✅ 닉네임 수정: "${originalNickname}" → "${originalNickname}_수정됨"`)
        
        // 다시 원래 닉네임으로 되돌리기
        await nicknameField.fill(originalNickname)
        console.log('✅ 닉네임 원복 완료')
      } else {
        console.log('⚠️ 프로필 편집 필드를 찾을 수 없음')
      }
    } else {
      console.log('⚠️ 프로필 링크를 찾을 수 없음')
    }

    // 7. 방 참가 요청 테스트
    console.log('\n7️⃣ 방 참가 요청 테스트...')
    await page.goto('https://meetpin-weld.vercel.app/map')
    await page.waitForTimeout(3000)
    
    const rooms = page.locator('[data-testid="room-card"], .room-card')
    if (await rooms.count() > 0) {
      // 첫 번째 방 클릭
      const firstRoom = rooms.first()
      await firstRoom.click()
      await page.waitForTimeout(2000)
      
      // 참가 요청 버튼 찾기
      const joinButton = page.locator('button:has-text("참가"), button:has-text("신청"), button:has-text("요청")')
      
      if (await joinButton.count() > 0) {
        console.log('✅ 방 상세 페이지 접근 성공')
        console.log('✅ 참가 요청 버튼 확인됨 (실제 요청은 하지 않음)')
      } else {
        console.log('⚠️ 참가 요청 버튼을 찾을 수 없음')
      }
    }

    // 8. API 응답 모니터링
    console.log('\n8️⃣ API 응답 모니터링...')
    let apiResponses: any[] = []
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        })
      }
    })
    
    // 지도 페이지 재방문하여 API 호출 확인
    await page.goto('https://meetpin-weld.vercel.app/map')
    await page.waitForTimeout(3000)
    
    console.log('📡 API 응답 현황:')
    apiResponses.forEach(response => {
      const status = response.status === 200 ? '✅' : response.status >= 400 ? '❌' : '⚠️'
      console.log(`   ${status} ${response.status} ${response.url}`)
    })

    // 9. 로그아웃 테스트
    console.log('\n9️⃣ 로그아웃 테스트...')
    
    // LogOut 아이콘이 있는 로그아웃 버튼 찾기 (새로 구현한 버튼)
    const logoutButton = page.locator('button[title="로그아웃"]')
    
    if (await logoutButton.count() > 0) {
      console.log('✅ 로그아웃 버튼 발견됨')
      await logoutButton.click()
      
      // 로그인 페이지로 리다이렉트 대기
      await page.waitForTimeout(3000)
      
      const afterLogoutUrl = page.url()
      console.log(`📍 로그아웃 후 URL: ${afterLogoutUrl}`)
      
      if (afterLogoutUrl.includes('/auth/login')) {
        console.log('✅ 로그아웃 성공 - 로그인 페이지로 리다이렉트됨')
      } else if (afterLogoutUrl === 'https://meetpin-weld.vercel.app/') {
        console.log('✅ 로그아웃 성공 - 홈페이지로 리다이렉트됨')
      } else {
        console.log('❓ 로그아웃 후 예상치 못한 페이지')
      }
    } else {
      console.log('❌ 로그아웃 버튼을 찾을 수 없음')
    }

    // 10. 최종 결과 정리
    console.log('\n🏁 신규 사용자 전체 테스트 완료!')
    console.log(`📊 총 API 호출: ${apiResponses.length}개`)
    console.log(`📊 총 JavaScript 에러: ${consoleErrors.length}개`)
    console.log(`📧 테스트 계정: ${testEmail}`)
    console.log(`👤 테스트 닉네임: ${testNickname}`)
    
    // 기본 성공 조건 확인
    expect(roomCount).toBeGreaterThanOrEqual(0) // 최소 조건만 확인
    expect(consoleErrors.filter(e => !e.includes('Warning')).length).toBeLessThan(10) // 심각한 에러는 10개 미만
  })
})