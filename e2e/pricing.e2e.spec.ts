/**
 * CR AudioViz AI - Pricing Pages E2E Tests (v6.2)
 * Tests UI contract compliance and key content presence
 * 
 * @version 6.2
 * @timestamp January 8, 2026
 */

import { test, expect } from '@playwright/test';

const PRICING_PAGES = [
  { path: '/pricing', name: 'Core Pricing', h1: 'Simple, Transparent Pricing' },
  { path: '/pricing/realtors', name: 'Realtors Pricing', h1: 'Professional Real Estate Websites' },
  { path: '/pricing/collectors', name: 'Collectors Pricing', h1: 'Organize Your Collections with AI' },
  { path: '/pricing/hobbyists', name: 'Hobbyists Pricing', h1: 'Bring Your Creative Projects to Life' },
];

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

test.describe('v6.2 Pricing Pages - UI Contract', () => {
  for (const page of PRICING_PAGES) {
    test(`${page.name}: has exactly one Header and Footer`, async ({ page: browserPage }) => {
      await browserPage.goto(`${BASE_URL}${page.path}`);
      
      // Check for exactly one header
      const headers = await browserPage.locator('header').count();
      expect(headers).toBe(1);
      
      // Check for exactly one footer
      const footers = await browserPage.locator('footer').count();
      expect(footers).toBe(1);
    });

    test(`${page.name}: has expected H1`, async ({ page: browserPage }) => {
      await browserPage.goto(`${BASE_URL}${page.path}`);
      
      const h1 = await browserPage.locator('h1').first();
      await expect(h1).toContainText(page.h1);
    });
  }
});

test.describe('v6.2 Pricing Pages - Cross-Links', () => {
  test('Core pricing links to all verticals', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    
    // Should have links to realtors, collectors, hobbyists
    await expect(page.locator('a[href="/pricing/realtors"]')).toBeVisible();
    await expect(page.locator('a[href="/pricing/collectors"]')).toBeVisible();
    await expect(page.locator('a[href="/pricing/hobbyists"]')).toBeVisible();
  });

  test('Realtors page links back to core and to other verticals', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing/realtors`);
    
    await expect(page.locator('a[href="/pricing"]')).toBeVisible();
    await expect(page.locator('a[href="/pricing/collectors"]')).toBeVisible();
    await expect(page.locator('a[href="/pricing/hobbyists"]')).toBeVisible();
  });

  test('Collectors page links back to core and to other verticals', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing/collectors`);
    
    await expect(page.locator('a[href="/pricing"]')).toBeVisible();
    await expect(page.locator('a[href="/pricing/realtors"]')).toBeVisible();
    await expect(page.locator('a[href="/pricing/hobbyists"]')).toBeVisible();
  });

  test('Hobbyists page links back to core and to other verticals', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing/hobbyists`);
    
    await expect(page.locator('a[href="/pricing"]')).toBeVisible();
    await expect(page.locator('a[href="/pricing/realtors"]')).toBeVisible();
    await expect(page.locator('a[href="/pricing/collectors"]')).toBeVisible();
  });
});

test.describe('v6.2 Pricing Pages - Key Content', () => {
  test('Core pricing shows credit price', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    
    // Should show credit price ($0.03)
    await expect(page.getByText('$0.03')).toBeVisible();
    await expect(page.getByText('1 credit = $0.03')).toBeVisible();
  });

  test('Core pricing shows grace period rules', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    
    // Should mention 10-day grace period
    await expect(page.getByText('10-Day Grace Period')).toBeVisible();
    await expect(page.getByText(/10-day grace period/i)).toBeVisible();
  });

  test('Core pricing shows refund policy', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    
    // Should show refund statement
    await expect(page.getByText(/All credit purchases are final/i)).toBeVisible();
  });

  test('Core pricing shows auto-reload tiers', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    
    // Should show auto-reload section with tiers
    await expect(page.getByText('Auto-Reload')).toBeVisible();
    await expect(page.getByText('+100')).toBeVisible();
    await expect(page.getByText('+250')).toBeVisible();
    await expect(page.getByText('+500')).toBeVisible();
  });

  test('Core pricing shows plan prices (v6.2 values)', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    
    // v6.2 plan prices: Starter $29, Pro $79, Business $199
    await expect(page.getByText('$29')).toBeVisible();
    await expect(page.getByText('$79')).toBeVisible();
    await expect(page.getByText('$199')).toBeVisible();
  });

  test('Core pricing shows credit pack prices', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    
    // Credit pack prices: $30, $150, $300, $700
    await expect(page.getByText('$30')).toBeVisible();
    await expect(page.getByText('$150')).toBeVisible();
    await expect(page.getByText('$300')).toBeVisible();
    await expect(page.getByText('$700')).toBeVisible();
  });

  test('Hobbyists page shows project capacity', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing/hobbyists`);
    
    // Should explain what a project is
    await expect(page.getByText(/What counts as a "project"/i)).toBeVisible();
    
    // Should show hobby plan project counts
    await expect(page.getByText('20 projects')).toBeVisible();
    await expect(page.getByText('75 projects')).toBeVisible();
    await expect(page.getByText('200 projects')).toBeVisible();
    await expect(page.getByText('1,000 projects')).toBeVisible();
  });

  test('Collectors page shows free tier info', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing/collectors`);
    
    // Should show free tier available
    await expect(page.getByText('Free Tier Available')).toBeVisible();
    await expect(page.getByText(/10 items/i)).toBeVisible();
  });

  test('Realtors page shows JavariKeys branding', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing/realtors`);
    
    // Should show JavariKeys product name
    await expect(page.getByText('JavariKeys')).toBeVisible();
    
    // Should mention Zoyzy
    await expect(page.getByText('Zoyzy')).toBeVisible();
    
    // Should mention standard hosting included
    await expect(page.getByText('Standard Hosting')).toBeVisible();
  });
});

test.describe('v6.2 Pricing Pages - Trial Section', () => {
  for (const pageInfo of PRICING_PAGES) {
    test(`${pageInfo.name}: shows 30-day trial banner`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pageInfo.path}`);
      
      // Should show 30-day trial
      await expect(page.getByText('30-Day Free Trial')).toBeVisible();
    });
  }
});

test.describe('v6.2 Pricing Pages - Pack Rules', () => {
  test('Core pricing shows pack rules', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);
    
    // Key pack rules
    await expect(page.getByText(/Pack credits stay usable while subscription is active/i)).toBeVisible();
    await expect(page.getByText(/Packs do NOT extend subscription term/i)).toBeVisible();
  });
});
