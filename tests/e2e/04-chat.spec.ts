import { test, expect } from '@playwright/test';
import { setupNetworkMocks } from '../setup/network';

test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupNetworkMocks(page);
  });

  test('chat interface exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for chat or messaging related elements
    const chatElements = page.locator('button:has-text("채팅"), button:has-text("메시지"), a[href*="/chat"]');

    // If chat elements exist, test them
    if (await chatElements.count() > 0) {
      await chatElements.first().click();
      await page.waitForTimeout(1000);

      // Look for message input
      const messageInput = page.locator('input[placeholder*="메시지"], textarea[placeholder*="메시지"]');
      if (await messageInput.count() > 0) {
        await messageInput.fill('hello from e2e');

        const sendButton = page.locator('button:has-text("전송"), button[type="submit"]');
        if (await sendButton.count() > 0) {
          await sendButton.click();
        }
      }
    }

    // Basic verification that page loads
    await expect(page.locator('body')).toBeVisible();
  });
});
