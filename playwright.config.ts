import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration - craudiovizai.com
 * Phase 4A: Frozen baseline - deterministic, no retries
 * 
 * PINNED VERSIONS:
 * - @playwright/test: 1.48.0 (exact)
 * - Container: mcr.microsoft.com/playwright:v1.48.0-jammy
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Deterministic execution - no parallelism, no retries
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,  // ZERO retries - failures must be real
  workers: 1,  // Single worker - deterministic order
  
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  use: {
    baseURL: 'https://craudiovizai.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  
  timeout: 60000,
  
  expect: {
    timeout: 10000,
  },
  
  outputDir: 'test-results',
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
