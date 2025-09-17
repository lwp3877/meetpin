const { chromium } = require('playwright');

async function testSignupFlow() {
  const browser = await chromium.launch({ headless: false }); // Show browser for verification
  const page = await browser.newPage();
  
  console.log('🆕 신규 가입 테스트 시작...');
  
  try {
    // 1. 회원가입 페이지 접속
    console.log('\n1️⃣ 회원가입 페이지 접속 중...');
    await page.goto('https://meetpin-weld.vercel.app/auth/signup', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ 회원가입 페이지 로드 성공');
    
    // 페이지 타이틀 확인
    const title = await page.title();
    console.log(`📄 페이지 타이틀: ${title}`);
    
    // 회원가입 폼 요소 확인
    await page.waitForSelector('form', { timeout: 10000 });
    const hasEmailField = await page.locator('input[type="email"], input[name="email"]').count() > 0;
    const hasPasswordField = await page.locator('input[type="password"], input[name="password"]').count() > 0;
    const hasNicknameField = await page.locator('input[name="nickname"], input[placeholder*="닉네임"]').count() > 0;
    const hasAgeField = await page.locator('select[name="ageRange"], select:has(option:text("20대"))').count() > 0;
    
    console.log(`📧 이메일 필드 존재: ${hasEmailField ? '✅' : '❌'}`);
    console.log(`🔒 비밀번호 필드 존재: ${hasPasswordField ? '✅' : '❌'}`);
    console.log(`👤 닉네임 필드 존재: ${hasNicknameField ? '✅' : '❌'}`);
    console.log(`🎂 나이대 선택 존재: ${hasAgeField ? '✅' : '❌'}`);
    
    // 2. 신규 사용자 정보로 회원가입 시도
    if (hasEmailField && hasPasswordField) {
      console.log('\n2️⃣ 신규 사용자 회원가입 시도 중...');
      
      const testEmail = `test.user.${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      const testNickname = `테스터${Math.floor(Math.random() * 1000)}`;
      
      console.log(`📧 테스트 이메일: ${testEmail}`);
      console.log(`👤 테스트 닉네임: ${testNickname}`);
      
      await page.fill('input[type="email"], input[name="email"]', testEmail);
      await page.fill('input[type="password"], input[name="password"]', testPassword);
      
      if (hasNicknameField) {
        await page.fill('input[name="nickname"], input[placeholder*="닉네임"]', testNickname);
      }
      
      if (hasAgeField) {
        await page.selectOption('select[name="ageRange"], select:has(option:text("20대"))', '20s_early');
      }
      
      // 회원가입 버튼 클릭
      const signupButton = page.locator('button[type="submit"], button:has-text("회원가입")').first();
      await signupButton.click();
      
      // 응답 대기 (최대 15초)
      await page.waitForTimeout(10000);
      
      const currentUrl = page.url();
      console.log(`📍 현재 URL: ${currentUrl}`);
      
      if (currentUrl.includes('/map') || currentUrl.includes('/profile') || !currentUrl.includes('/auth')) {
        console.log('✅ 회원가입 성공 (페이지 리다이렉션 확인됨)');
        
        // 3. 지도 페이지에서 기능 테스트
        console.log('\n3️⃣ 지도 페이지 기능 테스트 중...');
        
        if (!currentUrl.includes('/map')) {
          await page.goto('https://meetpin-weld.vercel.app/map', { 
            waitUntil: 'networkidle',
            timeout: 30000 
          });
        }
        
        // 사용자 정보 표시 확인
        await page.waitForTimeout(3000);
        const userInfo = await page.locator('[data-testid="user-nickname"], .user-info, .profile').count() > 0;
        console.log(`👤 사용자 정보 표시: ${userInfo ? '✅' : '❌'}`);
        
        // 방 목록 확인
        const roomList = await page.locator('[data-testid="room-list"], .room-card, .meeting-card').count();
        console.log(`🏠 표시된 방 개수: ${roomList}`);
        
        // 방 만들기 버튼 확인
        const createRoomButton = await page.locator('button:has-text("방 만들기"), button:has-text("새 모임"), [data-testid="create-room"]').count();
        console.log(`➕ 방 만들기 버튼: ${createRoomButton > 0 ? '✅' : '❌'}`);
        
        // 4. 프로필 페이지 테스트
        console.log('\n4️⃣ 프로필 페이지 테스트 중...');
        await page.goto('https://meetpin-weld.vercel.app/profile', { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        const profileNickname = await page.locator('input[value*="테스터"], h1:has-text("테스터"), .nickname').count() > 0;
        console.log(`👤 프로필 닉네임 표시: ${profileNickname ? '✅' : '❌'}`);
        
        // 5. 로그아웃 테스트
        console.log('\n5️⃣ 로그아웃 테스트 중...');
        const logoutButton = page.locator('button:has-text("로그아웃"), a:has-text("로그아웃"), [data-testid="logout"]');
        const logoutCount = await logoutButton.count();
        
        if (logoutCount > 0) {
          await logoutButton.first().click();
          await page.waitForTimeout(3000);
          
          const afterLogoutUrl = page.url();
          console.log(`📍 로그아웃 후 URL: ${afterLogoutUrl}`);
          
          if (afterLogoutUrl.includes('/auth') || afterLogoutUrl === 'https://meetpin-weld.vercel.app/') {
            console.log('✅ 로그아웃 성공');
            
            // 6. 로그인으로 재접속 테스트
            console.log('\n6️⃣ 신규 계정으로 재로그인 테스트 중...');
            await page.goto('https://meetpin-weld.vercel.app/auth/login', { 
              waitUntil: 'networkidle',
              timeout: 30000 
            });
            
            await page.fill('input[type="email"], input[name="email"]', testEmail);
            await page.fill('input[type="password"], input[name="password"]', testPassword);
            
            const loginButton = page.locator('button[type="submit"], button:has-text("로그인")').first();
            await loginButton.click();
            
            await page.waitForTimeout(5000);
            const loginUrl = page.url();
            
            if (loginUrl.includes('/map') || !loginUrl.includes('/auth/login')) {
              console.log('✅ 신규 계정 재로그인 성공');
            } else {
              console.log('❌ 신규 계정 재로그인 실패');
            }
            
          } else {
            console.log('❓ 로그아웃 상태 불분명');
          }
        } else {
          console.log('❌ 로그아웃 버튼을 찾을 수 없음');
        }
        
      } else {
        console.log('❌ 회원가입 실패 또는 페이지 리다이렉션 없음');
        
        // 에러 메시지 확인
        const errorMessage = await page.locator('.error, [role="alert"], .text-red, .alert-error').textContent().catch(() => '');
        if (errorMessage) {
          console.log(`❗ 에러 메시지: ${errorMessage}`);
        }
      }
    } else {
      console.log('❌ 필수 입력 필드가 누락됨');
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 에러 발생:', error.message);
  } finally {
    // 브라우저를 5초 후에 닫음 (확인을 위해)
    console.log('\n⏰ 5초 후 브라우저를 닫습니다...');
    await page.waitForTimeout(5000);
    await browser.close();
    console.log('\n🏁 신규 가입 테스트 완료');
  }
}

testSignupFlow();