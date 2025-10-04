import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupNetworkMocks } from '../setup/network';
import { injectMapsMock } from '../setup/maps-mock';

test.describe('Accessibility (A11Y) Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await setupNetworkMocks(page);
    // Inject Kakao Maps mock before page load
    await page.addInitScript(injectMapsMock());
  });

  test('homepage accessibility scan - WCAG 2.1 AA compliance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Assert no violations of CRITICAL or SERIOUS level
    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical'
    );
    const seriousViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'serious'
    );

    console.log(`🔍 A11Y Scan Results:
      - Critical violations: ${criticalViolations.length}
      - Serious violations: ${seriousViolations.length}
      - Moderate violations: ${accessibilityScanResults.violations.filter(v => v.impact === 'moderate').length}
      - Minor violations: ${accessibilityScanResults.violations.filter(v => v.impact === 'minor').length}
    `);

    if (criticalViolations.length > 0) {
      console.error('❌ CRITICAL A11Y VIOLATIONS:', criticalViolations);
    }
    if (seriousViolations.length > 0) {
      console.error('❌ SERIOUS A11Y VIOLATIONS:', seriousViolations);
    }

    // High severity issues (critical + serious) must be 0
    expect(criticalViolations.length, 'Critical accessibility violations must be 0').toBe(0);
    expect(seriousViolations.length, 'Serious accessibility violations must be 0').toBe(0);

    console.log('✅ High severity accessibility issues: 0');
  });

  test('map page accessibility scan', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow map to initialize

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const highSeverityViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical' || violation.impact === 'serious'
    );

    console.log(`🗺️ Map A11Y Scan: ${highSeverityViolations.length} high severity violations`);

    expect(highSeverityViolations.length, 'High severity violations on map page must be 0').toBe(0);
  });

  test('auth forms accessibility scan', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const highSeverityViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical' || violation.impact === 'serious'
    );

    console.log(`📝 Auth Forms A11Y Scan: ${highSeverityViolations.length} high severity violations`);

    expect(highSeverityViolations.length, 'High severity violations on auth forms must be 0').toBe(0);
  });

  test('keyboard navigation support', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test tab navigation
    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.locator(':focus').first();
    expect(await firstFocusedElement.count()).toBeGreaterThan(0);

    // Test skip link functionality (if exists)
    const skipLink = page.locator('.skip-link').first(); // Use .first() to avoid strict mode violation
    if (await skipLink.count() > 0) {
      await skipLink.focus();
      expect(await skipLink.isVisible()).toBe(true);
    }

    console.log('✅ Keyboard navigation support verified');
  });

  test('aria labels and roles verification', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for essential ARIA landmarks
    const main = await page.locator('main, [role="main"]').count();
    const navigation = await page.locator('nav, [role="navigation"]').count();

    expect(main, 'Main content area should have proper role').toBeGreaterThan(0);

    // Check buttons have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.getAttribute('aria-label')
        || await button.textContent()
        || await button.getAttribute('title');

      if (await button.isVisible()) {
        expect(accessibleName, `Button ${i} should have accessible name`).toBeTruthy();
      }
    }

    console.log('✅ ARIA labels and roles verification passed');
  });

  test('color contrast verification', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Run color contrast specific checks
    const contrastResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();

    const contrastViolations = contrastResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    console.log(`🎨 Color Contrast Check: ${contrastViolations.length} violations`);

    expect(contrastViolations.length, 'Color contrast violations must be 0 for WCAG AA compliance').toBe(0);
  });
});