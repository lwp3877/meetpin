import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://meetpin-weld.vercel.app';

test.describe('간단한 프로덕션 테스트', () => {
  
  test('홈페이지에서 지도 페이지로 이동', async ({ page }) => {
    // 홈페이지 접속
    await page.goto(PRODUCTION_URL);
    
    // 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    
    console.log('현재 페이지 URL:', page.url());
    console.log('페이지 타이틀:', await page.title());
    
    // 스크린샷 저장
    await page.screenshot({ path: 'test-results/homepage-real.png', fullPage: true });
    
    // 지도 페이지로 이동하는 버튼이나 링크 찾기
    const mapButton = page.locator('a[href="/map"], button:has-text("지도"), a:has-text("지도")');
    if (await mapButton.count() > 0) {
      await mapButton.first().click();
      await page.waitForLoadState('networkidle');
      console.log('지도 페이지로 이동 성공');
    } else {
      // 직접 지도 페이지로 이동
      await page.goto(`${PRODUCTION_URL}/map`);
      await page.waitForLoadState('networkidle');
      console.log('직접 지도 페이지로 이동');
    }
    
    await page.screenshot({ path: 'test-results/map-page-real.png', fullPage: true });
  });
  
  test('API 응답 확인', async ({ page }) => {
    let roomsResponse;
    
    try {
      // Rooms API 직접 호출
      roomsResponse = await page.request.get(`${PRODUCTION_URL}/api/rooms?bbox=37.4,126.8,37.6,127.1`);
      console.log('Rooms API 상태:', roomsResponse.status());
      
      if (roomsResponse.ok()) {
        const roomsData = await roomsResponse.json();
        console.log('응답 데이터:', JSON.stringify(roomsData, null, 2));
        
        if (roomsData.data) {
          console.log('방 개수:', roomsData.data.length);
          if (roomsData.data.length > 0) {
            console.log('첫 번째 방:', roomsData.data[0]);
          } else {
            console.log('⚠️ 데이터베이스에 방이 없습니다');
          }
        }
      }
    } catch (error) {
      console.log('API 호출 오류:', error);
    }
  });
  
  test('실제 데이터베이스 연결 확인', async ({ page }) => {
    // 지도 페이지에서 실제 API 호출을 관찰
    await page.goto(`${PRODUCTION_URL}/map`);
    
    // API 호출 대기
    const responses: any[] = [];
    
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        console.log(`API 호출: ${response.url()} - ${response.status()}`);
        responses.push({
          url: response.url(),
          status: response.status()
        });
        
        if (response.url().includes('/api/rooms')) {
          try {
            const data = await response.json();
            console.log('Rooms API 응답:', data);
          } catch (e) {
            console.log('JSON 파싱 실패');
          }
        }
      }
    });
    
    // 페이지 로딩 완료 대기
    await page.waitForTimeout(10000);
    
    console.log('관찰된 API 호출들:', responses);
  });
  
  test('환경변수 상태 확인', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/map`);
    
    // window 객체에서 환경변수 확인
    const envCheck = await page.evaluate(() => {
      const nextData = (window as any).__NEXT_DATA__;
      const env = nextData?.buildId ? 'production' : 'development';
      
      return {
        buildId: nextData?.buildId,
        environment: env,
        href: window.location.href
      };
    });
    
    console.log('환경변수 확인:', envCheck);
  });
  
  test('네트워크 상태 체크', async ({ page }) => {
    const requests: string[] = [];
    const failures: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('meetpin-weld.vercel.app')) {
        requests.push(request.url());
      }
    });
    
    page.on('requestfailed', request => {
      failures.push(request.url());
    });
    
    await page.goto(`${PRODUCTION_URL}/map`);
    await page.waitForTimeout(5000);
    
    console.log('성공한 요청들:', requests);
    console.log('실패한 요청들:', failures);
  });
});