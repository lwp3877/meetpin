import { Page, Locator } from '@playwright/test';
import fs from 'fs';
import path from 'path';

interface SmartLocatorOptions {
  fallback?: RegExp;
  timeout?: number;
}

type LocatorPatterns = {
  [key: string]: (() => Locator)[];
};

export async function by(page: Page, key: string, opts: SmartLocatorOptions = {}) {
  const timeout = opts.timeout || 10000;
  
  console.log(`🔍 Smart locator searching for: ${key}`);
  
  // Step 1: Try data-testid
  try {
    const testIdLocator = page.getByTestId(key);
    await testIdLocator.waitFor({ state: 'visible', timeout: 2000 });
    console.log(`✅ Found by testid: ${key}`);
    return testIdLocator;
  } catch (e) {
    console.log(`❌ testid not found: ${key}`);
  }
  
  // Step 2: Try semantic role-based matching
  const patterns: LocatorPatterns = {
    'login-email': [
      () => page.getByRole('textbox', { name: /email|이메일/i }),
      () => page.getByPlaceholder(/email|이메일|your@email/i),
      () => page.getByLabel(/email|이메일/i),
      () => page.locator('input[type="email"]')
    ],
    'login-password': [
      () => page.getByRole('textbox', { name: /password|비밀번호/i }),
      () => page.locator('input[type="password"]'),
      () => page.getByPlaceholder(/password|비밀번호|••••••••/i),
      () => page.getByLabel(/password|비밀번호/i)
    ],
    'login-submit': [
      () => page.getByRole('button', { name: /로그인|login|sign in/i }),
      () => page.locator('button').filter({ hasText: /로그인|login/i }),
      () => page.locator('button[type="submit"]')
    ],
    'home-cta': [
      () => page.locator('button').filter({ hasText: '🗺️지도에서 시작하기' }),
      () => page.locator('button').filter({ hasText: '🚀밋핀 시작하기' }),
      () => page.locator('button').filter({ hasText: '밋핀 시작하기' }),
      () => page.getByRole('button', { name: /🗺️.*지도.*시작|🚀.*밋핀.*시작/i }),
      () => page.getByRole('button', { name: /시작|start|지도|map/i }),
      () => page.locator('a[href*="/map"], button[onclick*="map"]')
    ],
    'map-container': [
      () => page.locator('#map'),
      () => page.locator('.map-container'),
      () => page.locator('[class*="map"]').first(),
      () => page.locator('div[style*="height"]').filter({ hasText: '' })
    ]
  };
  
  // Step 3: Try pattern-specific selectors
  if (patterns[key]) {
    for (const getLocator of patterns[key]) {
      try {
        const locator = getLocator();
        await locator.waitFor({ state: 'visible', timeout: 2000 });
        console.log(`✅ Found by pattern for ${key}`);
        return locator;
      } catch (e) {
        continue;
      }
    }
  }
  
  // Step 4: Try fallback regex if provided
  if (opts.fallback) {
    try {
      const fallbackLocator = page.getByText(opts.fallback).first();
      await fallbackLocator.waitFor({ state: 'visible', timeout: 2000 });
      console.log(`✅ Found by fallback regex for ${key}`);
      return fallbackLocator;
    } catch (e) {
      console.log(`❌ Fallback regex failed for ${key}`);
    }
  }
  
  // Step 5: Get recommendations from DOM snapshot
  try {
    const domSnapshotPath = path.resolve('docs/cleanup/DOM_SNAPSHOT.json');
    if (fs.existsSync(domSnapshotPath)) {
      const snapshot = JSON.parse(fs.readFileSync(domSnapshotPath, 'utf-8'));
      console.log(`💡 Recommendations for ${key}:`);
      
      for (const pageData of snapshot) {
        const allElements = [
          ...pageData.elements.inputs,
          ...pageData.elements.buttons,
          ...pageData.elements.links
        ];
        
        const candidates = allElements.filter(el => 
          el.textContent?.toLowerCase().includes(key.split('-')[0]) ||
          el.placeholder?.toLowerCase().includes(key.split('-')[0]) ||
          el.ariaLabel?.toLowerCase().includes(key.split('-')[0]) ||
          el.id?.toLowerCase().includes(key.split('-')[0])
        );
        
        if (candidates.length > 0) {
          console.log(`   Page ${pageData.url}:`);
          candidates.slice(0, 3).forEach(el => {
            if (el.id) console.log(`     #${el.id}`);
            if (el.placeholder) console.log(`     [placeholder="${el.placeholder}"]`);
            if (el.textContent) console.log(`     text: "${el.textContent.slice(0, 50)}"`);
          });
        }
      }
    }
  } catch (e) {
    console.log('Could not load DOM snapshot for recommendations');
  }
  
  // Final fallback: return a locator that will fail with helpful message
  console.log(`❌ Could not find element for key: ${key}`);
  return page.locator(`[data-testid="${key}"]`); // This will fail but with clear error
}
