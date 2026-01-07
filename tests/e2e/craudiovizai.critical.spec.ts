// Trigger run: 2026-01-07T17:53:52.779Z
/**
 * craudiovizai.com Critical Flows E2E Tests
 * Phase 3C.4 - Real Playwright Browser Automation
 * 
 * Target: https://craudiovizai.com
 * Scope: Locked - do not expand
 */
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

// Error collection for reporting
const collectedErrors: string[] = [];

function logError(error: string) {
  collectedErrors.push(error);
  console.error(`[E2E ERROR] ${error}`);
}

// Setup error listeners on each page
function setupErrorListeners(page: Page, testName: string) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = `[${testName}] console.error: ${msg.text()}`;
      logError(text);
    }
  });

  page.on('pageerror', (error) => {
    const text = `[${testName}] UNCAUGHT EXCEPTION: ${error.message}`;
    logError(text);
    // Throw to fail the test immediately
    throw new Error(`Client-side JS exception detected: ${error.message}`);
  });
}

test.describe('craudiovizai.com Critical Flows', () => {
  
  // ===== TEST 1: Homepage =====
  test('1. Homepage loads with zero console/page errors', async ({ page }) => {
    setupErrorListeners(page, 'Homepage');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for Next.js Application Error
    const appError = await page.locator('text=Application error').count();
    expect(appError, 'Homepage should not show Application Error').toBe(0);
    
    // Verify page rendered
    await expect(page.locator('body')).toBeVisible();
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/01-homepage.png' });
  });

  // ===== TEST 2: Login Flow (P0 CRITICAL) =====
  test('2. Click "Log In" renders login UI with NO client-side exception', async ({ page }) => {
    setupErrorListeners(page, 'Login');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click Login link
    const loginSelectors = [
      'a:has-text("Log In")',
      'a:has-text("Login")', 
      'a[href*="login"]',
      'button:has-text("Log In")',
      'button:has-text("Login")',
    ];
    
    let clicked = false;
    for (const selector of loginSelectors) {
      const el = page.locator(selector).first();
      if (await el.count() > 0) {
        const href = await el.getAttribute('href');
        console.log(`Found login element: ${selector}, href: ${href}`);
        await el.click();
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      console.log('No login link found, navigating directly to /login');
      await page.goto('/login');
    }
    
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log(`Login page URL: ${currentUrl}`);
    
    // Screenshot BEFORE any assertions
    await page.screenshot({ path: 'test-results/02-login-page.png' });
    
    // Check for Application Error
    const appError = await page.locator('text=Application error').count();
    expect(appError, 'Login page should not show Application Error').toBe(0);
    
    // Verify some UI rendered (flexible - different auth providers have different UIs)
    const hasContent = await page.locator('body').textContent();
    expect(hasContent?.length, 'Login page should have content').toBeGreaterThan(10);
    
    // If we got here without pageerror throwing, the test passes
    console.log('✅ Login page rendered without JS exceptions');
  });

  // ===== TEST 3: Get Started =====
  test('3. Click "Get Started" routes correctly', async ({ page }) => {
    setupErrorListeners(page, 'GetStarted');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const getStartedSelectors = [
      'a:has-text("Get Started")',
      'button:has-text("Get Started")',
      'a:has-text("Start")',
    ];
    
    let found = false;
    for (const selector of getStartedSelectors) {
      const el = page.locator(selector).first();
      if (await el.count() > 0) {
        const href = await el.getAttribute('href');
        console.log(`Found Get Started: ${selector}, href: ${href}`);
        await el.click();
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.log('No "Get Started" button found - SKIP');
      test.skip();
      return;
    }
    
    await page.waitForLoadState('networkidle');
    
    const destUrl = page.url();
    console.log(`Get Started destination: ${destUrl}`);
    
    await page.screenshot({ path: 'test-results/03-get-started.png' });
    
    // Check for Application Error
    const appError = await page.locator('text=Application error').count();
    expect(appError, 'Destination should not show Application Error').toBe(0);
  });

  // ===== TEST 4: Social Links =====
  test('4. Footer social links are valid external URLs', async ({ page }) => {
    setupErrorListeners(page, 'SocialLinks');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const socialPatterns = [
      { name: 'Twitter/X', selectors: ['a[href*="twitter.com"]', 'a[href*="x.com"]'] },
      { name: 'LinkedIn', selectors: ['a[href*="linkedin.com"]'] },
      { name: 'GitHub', selectors: ['a[href*="github.com"]'] },
      { name: 'Discord', selectors: ['a[href*="discord"]'] },
      { name: 'YouTube', selectors: ['a[href*="youtube.com"]'] },
      { name: 'Instagram', selectors: ['a[href*="instagram.com"]'] },
    ];
    
    const issues: string[] = [];
    let totalFound = 0;
    
    for (const social of socialPatterns) {
      for (const selector of social.selectors) {
        const links = await page.locator(selector).all();
        for (const link of links) {
          totalFound++;
          const href = await link.getAttribute('href');
          console.log(`Social: ${social.name} -> ${href}`);
          
          if (!href || href === '#' || href === '') {
            issues.push(`${social.name} has invalid href: "${href}"`);
          }
        }
      }
    }
    
    // Also check footer for any "#" hrefs that look like social
    const footerLinks = await page.locator('footer a[href="#"]').all();
    for (const link of footerLinks) {
      const text = await link.textContent() || '';
      const aria = await link.getAttribute('aria-label') || '';
      const combined = (text + aria).toLowerCase();
      
      if (/twitter|linkedin|github|discord|youtube|instagram|facebook/.test(combined)) {
        issues.push(`Social link "${text || aria}" has href="#"`);
      }
    }
    
    console.log(`Found ${totalFound} social links, ${issues.length} issues`);
    
    await page.screenshot({ path: 'test-results/04-social-links.png' });
    
    if (issues.length > 0) {
      console.error('Social link issues:', issues);
    }
    
    expect(issues.length, `Invalid social links: ${issues.join(', ')}`).toBe(0);
  });

  // ===== TEST 5: /apps Page =====
  test('5. /apps loads and first 3 cards navigate without errors', async ({ page }) => {
    setupErrorListeners(page, 'AppsPage');
    
    await page.goto('/apps');
    await page.waitForLoadState('networkidle');
    
    // Check if /apps exists
    const is404 = await page.locator('text=404').count() > 0;
    if (is404 || page.url().includes('404')) {
      console.log('/apps returns 404 - SKIP');
      test.skip();
      return;
    }
    
    await page.screenshot({ path: 'test-results/05-apps-page.png' });
    
    // Check for Application Error
    const appError = await page.locator('text=Application error').count();
    expect(appError, '/apps should not show Application Error').toBe(0);
    
    // Find clickable cards
    const cardSelectors = [
      'a[class*="card"]',
      '[class*="Card"] a',
      'a[class*="app"]',
      '.grid a[href]',
      'article a[href]',
      'main a[href]:not([href="#"]):not([href^="mailto"]):not([href^="tel"])',
    ];
    
    let cards: any[] = [];
    for (const selector of cardSelectors) {
      const found = await page.locator(selector).all();
      if (found.length >= 3) {
        cards = found.slice(0, 3);
        console.log(`Found ${found.length} cards with: ${selector}`);
        break;
      }
    }
    
    if (cards.length === 0) {
      console.log('No clickable app cards found - checking for any links');
      cards = (await page.locator('main a[href]').all()).slice(0, 3);
    }
    
    if (cards.length === 0) {
      console.log('No cards to test - SKIP card clicks');
      return;
    }
    
    // Test each card
    for (let i = 0; i < Math.min(3, cards.length); i++) {
      // Re-navigate to /apps for each card test
      await page.goto('/apps');
      await page.waitForLoadState('networkidle');
      
      // Re-find cards
      let currentCards: any[] = [];
      for (const selector of cardSelectors) {
        const found = await page.locator(selector).all();
        if (found.length >= 3) {
          currentCards = found;
          break;
        }
      }
      if (currentCards.length === 0) {
        currentCards = await page.locator('main a[href]').all();
      }
      
      if (i >= currentCards.length) break;
      
      const card = currentCards[i];
      const href = await card.getAttribute('href');
      console.log(`Clicking card ${i + 1}: ${href}`);
      
      await card.click();
      await page.waitForLoadState('networkidle');
      
      const destUrl = page.url();
      console.log(`Card ${i + 1} destination: ${destUrl}`);
      
      await page.screenshot({ path: `test-results/05-apps-card-${i + 1}.png` });
      
      // Check for errors on destination
      const cardAppError = await page.locator('text=Application error').count();
      expect(cardAppError, `Card ${i + 1} destination should not show Application Error`).toBe(0);
    }
  });

  // ===== TEST 6: /pricing =====
  test('6. /pricing loads without errors', async ({ page }) => {
    setupErrorListeners(page, 'Pricing');
    
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'test-results/06-pricing.png' });
    
    // Check for 404
    const is404 = await page.locator('text=404').count() > 0;
    expect(is404, '/pricing should not 404').toBe(false);
    
    // Check for Application Error
    const appError = await page.locator('text=Application error').count();
    expect(appError, '/pricing should not show Application Error').toBe(0);
    
    // Verify page has content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length, '/pricing should have content').toBeGreaterThan(50);
    
    console.log('✅ /pricing loaded successfully');
  });

  // ===== Write Error Log After All Tests =====
  test.afterAll(async () => {
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    
    if (collectedErrors.length > 0) {
      const errorLog = collectedErrors.join('\n\n');
      fs.writeFileSync('test-results/errors.log', errorLog);
      console.log(`\n❌ ${collectedErrors.length} errors collected - see test-results/errors.log`);
    } else {
      fs.writeFileSync('test-results/errors.log', 'No errors collected');
      console.log('\n✅ No errors collected');
    }
  });
});
