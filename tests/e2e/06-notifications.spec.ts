import { test, expect } from '@playwright/test';
import { setupNetworkMocks } from '../setup/network';

test.describe('Notifications & Refresh', () => {
  test.beforeEach(async ({ page }) => {
    await setupNetworkMocks(page);
  });

  test('notification handling and page persistence', async ({ page, context }) => {
    // Block notification permission to test denial case
    await context.grantPermissions([], { origin: 'https://meetpin-weld.vercel.app' });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test notification permission handling
    await page.evaluate(() => {
      if ('Notification' in window && Notification.permission === 'default') {
        // Mock a denied permission result
        Object.defineProperty(Notification, 'permission', { value: 'denied' });
      }
    });

    // Look for notification banners or buttons
    const notificationElements = page.locator('button:has-text("알림"), .notification-banner, [class*="notification"]');

    if (await notificationElements.count() > 0) {
      // Try to close notification banner if it exists
      const closeButton = page.locator('button:has-text("닫기"), button[aria-label*="닫기"]');
      if (await closeButton.count() > 0) {
        await closeButton.first().click();
      }
    }

    // Test page refresh persistence
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify page still loads properly
    await expect(page.locator('body')).toBeVisible();
  });
});
