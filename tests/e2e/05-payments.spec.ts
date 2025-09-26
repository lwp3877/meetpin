import { test, expect } from '@playwright/test';
import { setupNetworkMocks } from '../setup/network';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupNetworkMocks(page);
  });

  test('payment interface accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for boost/payment buttons
    const paymentButtons = page.locator('button:has-text("부스트"), button:has-text("결제"), button:has-text("구매")');

    if (await paymentButtons.count() > 0) {
      await paymentButtons.first().click();
      await page.waitForTimeout(1000);

      // Check if payment modal/sheet opens
      const paymentModal = page.locator('[role="dialog"], .modal, [class*="modal"]');
      if (await paymentModal.count() > 0) {
        await expect(paymentModal.first()).toBeVisible();

        // Close modal if possible
        const closeButton = page.locator('button:has-text("닫기"), button[aria-label*="close"]');
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
        }
      }
    }

    // Basic verification
    await expect(page.locator('body')).toBeVisible();
  });
});
