import { chromium } from 'playwright';
import fs from 'fs';

const baseURL = 'https://meetpin-weld.vercel.app';
const pages = ['/', '/auth/login', '/map'];

async function scanDOM() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = [];
  
  for (const url of pages) {
    console.log(`Scanning ${url}...`);
    const pageResult = {
      url,
      consoleErrors: [],
      elements: {
        inputs: [],
        buttons: [],
        links: []
      }
    };
    
    // Console error collection
    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageResult.consoleErrors.push(msg.text());
      }
    });
    
    try {
      await page.goto(baseURL + url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000); // Wait for dynamic content
      
      // Scan input elements
      const inputs = await page.$$eval('input, textarea, select', elements => 
        elements.map(el => ({
          tagName: el.tagName.toLowerCase(),
          type: el.type || '',
          name: el.name || '',
          id: el.id || '',
          placeholder: el.placeholder || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          labelText: el.labels?.[0]?.textContent?.trim() || '',
          className: el.className || '',
          testId: el.getAttribute('data-testid') || '',
          outerHTML: el.outerHTML.slice(0, 200)
        }))
      );
      
      // Scan button elements
      const buttons = await page.$$eval('button, a[role="button"], [onclick]', elements =>
        elements.map(el => ({
          tagName: el.tagName.toLowerCase(),
          type: el.type || '',
          textContent: el.textContent?.trim().slice(0, 100) || '',
          ariaLabel: el.getAttribute('aria-label') || '',
          role: el.role || '',
          className: el.className || '',
          testId: el.getAttribute('data-testid') || '',
          href: el.href || '',
          outerHTML: el.outerHTML.slice(0, 200)
        }))
      );
      
      // Scan clickable links
      const links = await page.$$eval('a:not([role="button"])', elements =>
        elements.map(el => ({
          tagName: 'a',
          textContent: el.textContent?.trim().slice(0, 100) || '',
          href: el.href || '',
          className: el.className || '',
          testId: el.getAttribute('data-testid') || '',
          outerHTML: el.outerHTML.slice(0, 200)
        }))
      );
      
      pageResult.elements.inputs = inputs;
      pageResult.elements.buttons = buttons;
      pageResult.elements.links = links;
      
    } catch (error) {
      console.log(`Error scanning ${url}:`, error.message);
      pageResult.error = error.message;
    }
    
    results.push(pageResult);
  }
  
  await browser.close();
  
  // Save results
  fs.writeFileSync('docs/cleanup/DOM_SNAPSHOT.json', JSON.stringify(results, null, 2));
  console.log('DOM scan completed. Results saved to docs/cleanup/DOM_SNAPSHOT.json');
  
  return results;
}

scanDOM().catch(console.error);
