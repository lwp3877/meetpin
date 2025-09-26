import { Page } from '@playwright/test';

export async function setupNetworkMocks(page: Page) {
  // Block external API calls that can cause timeouts
  await page.route('**/*kakao*', route => route.abort());
  await page.route('**/*stripe*', route => route.abort());
  await page.route('**/*google*', route => route.abort());
  
  // Mock API responses for critical endpoints
  await page.route('**/api/**', route => {
    const url = route.request().url();
    
    // Mock successful responses for most API calls
    if (url.includes('/api/')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, data: {} })
      });
    } else {
      route.continue();
    }
  });
  
  console.log('Network mocks setup completed');
}
