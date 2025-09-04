const { chromium } = require('playwright');

async function testDeployedSite() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🚀 배포된 사이트 테스트 시작...');
  
  try {
    // 1. 메인 페이지 접속
    console.log('\n1️⃣ 메인 페이지 접속 중...');
    await page.goto('https://meetpin-weld.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ 메인 페이지 로드 성공');
    
    // 페이지 타이틀 확인
    const title = await page.title();
    console.log(`📄 페이지 타이틀: ${title}`);
    
    // 2. 로그인 페이지로 이동
    console.log('\n2️⃣ 로그인 페이지로 이동 중...');
    await page.goto('https://meetpin-weld.vercel.app/auth/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ 로그인 페이지 로드 성공');
    
    // 로그인 폼 요소 확인
    await page.waitForSelector('form', { timeout: 10000 });
    const hasEmailField = await page.locator('input[type="email"], input[name="email"]').count() > 0;
    const hasPasswordField = await page.locator('input[type="password"], input[name="password"]').count() > 0;
    
    console.log(`📧 이메일 필드 존재: ${hasEmailField ? '✅' : '❌'}`);
    console.log(`🔒 비밀번호 필드 존재: ${hasPasswordField ? '✅' : '❌'}`);
    
    // 소셜 로그인 버튼 확인
    const kakaoButton = await page.locator('button:has-text("카카오")').count();
    const googleButton = await page.locator('button:has-text("구글")').count();
    const naverButton = await page.locator('button:has-text("네이버")').count();
    
    console.log(`🟡 카카오 로그인 버튼: ${kakaoButton > 0 ? '✅' : '❌'}`);
    console.log(`🔴 구글 로그인 버튼: ${googleButton > 0 ? '✅' : '❌'}`);
    console.log(`🟢 네이버 로그인 버튼: ${naverButton > 0 ? '✅' : '❌'}`);
    
    // 3. 이메일 로그인 시도
    if (hasEmailField && hasPasswordField) {
      console.log('\n3️⃣ 이메일 로그인 시도 중...');
      await page.fill('input[type="email"], input[name="email"]', 'admin@meetpin.com');
      await page.fill('input[type="password"], input[name="password"]', '123456');
      
      // 로그인 버튼 클릭
      const loginButton = page.locator('button[type="submit"], button:has-text("로그인")').first();
      await loginButton.click();
      
      // 응답 대기 (최대 10초)
      await page.waitForTimeout(5000);
      
      const currentUrl = page.url();
      console.log(`📍 현재 URL: ${currentUrl}`);
      
      if (currentUrl.includes('/map') || currentUrl.includes('/profile') || !currentUrl.includes('/auth/login')) {
        console.log('✅ 로그인 성공 (페이지 리다이렉션 확인됨)');
        
        // 4. 지도 페이지 테스트
        console.log('\n4️⃣ 지도 페이지 테스트 중...');
        await page.goto('https://meetpin-weld.vercel.app/map', { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // 카카오 지도 로드 확인
        await page.waitForTimeout(3000);
        const hasMap = await page.locator('#map, .map-container, [data-testid="kakao-map"]').count() > 0;
        console.log(`🗺️ 지도 컨테이너 존재: ${hasMap ? '✅' : '❌'}`);
        
        // 방 만들기 버튼 확인
        const createRoomButton = await page.locator('button:has-text("방 만들기"), button:has-text("새 모임")').count();
        console.log(`➕ 방 만들기 버튼: ${createRoomButton > 0 ? '✅' : '❌'}`);
        
        // 5. 로그아웃 테스트
        console.log('\n5️⃣ 로그아웃 테스트 중...');
        const logoutButton = page.locator('button:has-text("로그아웃"), a:has-text("로그아웃")');
        const logoutCount = await logoutButton.count();
        
        if (logoutCount > 0) {
          await logoutButton.first().click();
          await page.waitForTimeout(2000);
          
          const afterLogoutUrl = page.url();
          if (afterLogoutUrl.includes('/auth') || afterLogoutUrl === 'https://meetpin-weld.vercel.app/') {
            console.log('✅ 로그아웃 성공');
          } else {
            console.log('❓ 로그아웃 상태 불분명');
          }
        } else {
          console.log('❌ 로그아웃 버튼을 찾을 수 없음');
        }
        
      } else {
        console.log('❌ 로그인 실패 또는 페이지 리다이렉션 없음');
        
        // 에러 메시지 확인
        const errorMessage = await page.locator('.error, [role="alert"], .text-red').textContent().catch(() => '');
        if (errorMessage) {
          console.log(`❗ 에러 메시지: ${errorMessage}`);
        }
      }
    }
    
    // 6. JavaScript 에러 확인
    console.log('\n6️⃣ JavaScript 에러 확인...');
    const jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    
    await page.waitForTimeout(2000);
    
    if (jsErrors.length === 0) {
      console.log('✅ JavaScript 에러 없음');
    } else {
      console.log('❌ JavaScript 에러 발견:');
      jsErrors.forEach(error => console.log(`   - ${error}`));
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 에러 발생:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 테스트 완료');
  }
}

testDeployedSite();