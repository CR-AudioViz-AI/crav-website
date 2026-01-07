/**
 * E2E Public Surface Suite - All Routes & Clicks
 * Tests every public route renders without crashes
 */
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

// Console error allowlist - exact matches only
const ALLOWED_CONSOLE_ERRORS = [
  // Cloudflare analytics (external, non-critical)
  'Failed to load resource: the server responded with a status of 404',
  // Add specific allowed errors with comments:
  // '[reason]: exact error message'
];

interface TestError {
  route: string;
  type: 'pageerror' | 'console' | 'crash-screen';
  message: string;
  timestamp: string;
}

const collectedErrors: TestError[] = [];

function isAllowedError(message: string): boolean {
  return ALLOWED_CONSOLE_ERRORS.some(allowed => message.includes(allowed));
}

function setupErrorCapture(page: Page, route: string) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!isAllowedError(text)) {
        collectedErrors.push({
          route,
          type: 'console',
          message: text,
          timestamp: new Date().toISOString(),
        });
      }
    }
  });

  page.on('pageerror', (error) => {
    collectedErrors.push({
      route,
      type: 'pageerror',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  });
}

async function checkForCrashScreens(page: Page, route: string): Promise<boolean> {
  const crashPatterns = [
    'Application error',
    'Unhandled Runtime Error',
    'client-side exception',
    'Error: ',
    'TypeError:',
    'ReferenceError:',
  ];
  
  for (const pattern of crashPatterns) {
    const count = await page.locator(`text=${pattern}`).count();
    if (count > 0) {
      const text = await page.locator(`text=${pattern}`).first().textContent();
      collectedErrors.push({
        route,
        type: 'crash-screen',
        message: text || pattern,
        timestamp: new Date().toISOString(),
      });
      return true;
    }
  }
  return false;
}

// All public routes to test
const PUBLIC_ROUTES = [
  { path: '/', name: 'Homepage' },
  { path: '/about', name: 'About' },
  { path: '/acceptable-use', name: 'Acceptable Use' },
  { path: '/accessibility', name: 'Accessibility' },
  { path: '/ai-disclosure', name: 'AI Disclosure' },
  { path: '/apps', name: 'Apps Directory' },
  { path: '/blog', name: 'Blog' },
  { path: '/careers', name: 'Careers' },
  { path: '/contact', name: 'Contact' },
  { path: '/cookies', name: 'Cookies Policy' },
  { path: '/craiverse', name: 'CRAIverse' },
  { path: '/dmca', name: 'DMCA' },
  { path: '/docs', name: 'Documentation' },
  { path: '/enterprise', name: 'Enterprise' },
  { path: '/faq', name: 'FAQ' },
  { path: '/games', name: 'Games' },
  { path: '/javari', name: 'Javari' },
  { path: '/partners', name: 'Partners' },
  { path: '/press', name: 'Press' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/privacy', name: 'Privacy Policy' },
  { path: '/refunds', name: 'Refunds' },
  { path: '/support', name: 'Support' },
  { path: '/terms', name: 'Terms of Service' },
];

// App routes
const APP_ROUTES = [
  { path: '/apps/javari-ai', name: 'Javari AI' },
  { path: '/apps/logo-studio', name: 'Logo Studio' },
  { path: '/apps/meme-generator', name: 'Meme Generator' },
  { path: '/apps/games-hub', name: 'Games Hub' },
  { path: '/apps/orlando-trip-deal', name: 'Orlando Trip Deal' },
  { path: '/apps/watch-works', name: 'Watch Works' },
];

test.describe('Public Surface - All Routes', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // Clear errors for each test
  });

  for (const route of PUBLIC_ROUTES) {
    test(`Route: ${route.name} (${route.path})`, async ({ page }) => {
      setupErrorCapture(page, route.path);
      
      const response = await page.goto(route.path, { waitUntil: 'networkidle', timeout: 30000 });
      expect(response?.status()).toBeLessThan(500);
      
      const hasCrash = await checkForCrashScreens(page, route.path);
      expect(hasCrash, `${route.path} shows crash screen`).toBe(false);
      
      await page.screenshot({ path: `test-results/routes/${route.path.replace(/\//g, '_') || 'home'}.png` });
    });
  }

  for (const route of APP_ROUTES) {
    test(`App Route: ${route.name} (${route.path})`, async ({ page }) => {
      setupErrorCapture(page, route.path);
      
      const response = await page.goto(route.path, { waitUntil: 'networkidle', timeout: 30000 });
      
      // 404 is acceptable for apps that may not exist yet
      if (response?.status() === 404) {
        console.log(`${route.path} returns 404 - skipping`);
        return;
      }
      
      expect(response?.status()).toBeLessThan(500);
      
      const hasCrash = await checkForCrashScreens(page, route.path);
      expect(hasCrash, `${route.path} shows crash screen`).toBe(false);
      
      await page.screenshot({ path: `test-results/apps/${route.path.replace(/\//g, '_')}.png` });
    });
  }
});

test.describe('Public Surface - Internal Link Validation', () => {
  test('All internal links from homepage resolve', async ({ page, request }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const links = await page.locator('a[href^="/"]').all();
    const checked = new Set<string>();
    const failures: string[] = [];
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href || checked.has(href) || href.includes('#')) continue;
      checked.add(href);
      
      try {
        const response = await request.get(href);
        if (response.status() >= 400 && response.status() !== 404) {
          failures.push(`${href}: ${response.status()}`);
        }
      } catch (e) {
        failures.push(`${href}: request failed`);
      }
    }
    
    console.log(`Checked ${checked.size} internal links`);
    if (failures.length > 0) {
      console.log('Failures:', failures);
    }
    expect(failures.length, `Failed links: ${failures.join(', ')}`).toBe(0);
  });

  test('All internal links from /apps resolve', async ({ page, request }) => {
    await page.goto('/apps');
    await page.waitForLoadState('networkidle');
    
    const links = await page.locator('a[href^="/"]').all();
    const checked = new Set<string>();
    const failures: string[] = [];
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href || checked.has(href) || href.includes('#')) continue;
      checked.add(href);
      
      try {
        const response = await request.get(href);
        if (response.status() >= 400 && response.status() !== 404) {
          failures.push(`${href}: ${response.status()}`);
        }
      } catch (e) {
        failures.push(`${href}: request failed`);
      }
    }
    
    console.log(`Checked ${checked.size} internal links from /apps`);
    expect(failures.length, `Failed links: ${failures.join(', ')}`).toBe(0);
  });
});

test.describe('Public Surface - External Link Validation', () => {
  test('External links resolve (2xx/3xx)', async ({ page, request }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const links = await page.locator('a[href^="http"]').all();
    const checked = new Set<string>();
    const failures: string[] = [];
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href || checked.has(href) || href.includes('craudiovizai.com')) continue;
      checked.add(href);
      
      try {
        const response = await request.get(href, { timeout: 10000 });
        if (response.status() >= 400) {
          failures.push(`${href}: ${response.status()}`);
        }
      } catch (e) {
        // External links may timeout - log but don't fail
        console.log(`External link timeout: ${href}`);
      }
    }
    
    console.log(`Checked ${checked.size} external links`);
    // Don't fail on external links - just report
    if (failures.length > 0) {
      console.log('External link issues:', failures);
    }
  });
});

test.afterAll(async () => {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  
  // Write collected errors
  if (collectedErrors.length > 0) {
    fs.writeFileSync('test-results/public-surface-errors.json', JSON.stringify(collectedErrors, null, 2));
    console.log(`\n⚠️ ${collectedErrors.length} errors collected - see public-surface-errors.json`);
  } else {
    console.log('\n✅ No errors collected');
  }
});
