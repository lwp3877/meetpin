import { test, expect } from '@playwright/test';
import { setupNetworkMocks } from '../setup/network';
import { by } from '../utils/smartLocator';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await setupNetworkMocks(page);
  });

  test('loads home page with key elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for main CTA button with smart locator
    const ctaButton = await by(page, 'home-cta', { fallback: /시작|start|만들기|create|지도/i });
    await expect(ctaButton).toBeVisible();

    // Basic verification
    await expect(page.locator('body')).toBeVisible();
  });
});
