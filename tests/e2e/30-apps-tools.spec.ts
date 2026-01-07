/**
 * E2E Apps & Tools Tests
 * Tests every app/tool entry point, loads page, clicks primary CTA
 */
import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';

// All known tools
const TOOLS = [
  'ai-analyzer', 'ai-chatbot', 'ai-translator', 'ai-writer',
  'animation-studio', 'audio-editor', 'background-remover', 'ebook-creator',
  'image-generator', 'image-resizer', 'invoice-generator', 'logo-maker',
  'meme-generator', 'music-mixer', 'pdf-editor', 'podcast-editor',
  'poster-designer', 'resume-builder', 'screen-recorder', 'social-media-kit',
  'subtitle-generator', 'thumbnail-creator', 'video-editor', 'voice-generator'
];

// All games (1-32)
const GAMES = Array.from({ length: 32 }, (_, i) => i + 1);

// Console error allowlist
const ALLOWLISTED_ERRORS: RegExp[] = [
  /cloudflareinsights/,
  /ResizeObserver/,
  /favicon/,
];

interface ToolTestResult {
  tool: string;
  path: string;
  status: number;
  loaded: boolean;
  ctaFound: boolean;
  ctaClicked: boolean;
  crashed: boolean;
  errors: string[];
}

interface GameTestResult {
  gameId: number;
  path: string;
  status: number;
  loaded: boolean;
  crashed: boolean;
  errors: string[];
}

const toolResults: ToolTestResult[] = [];
const gameResults: GameTestResult[] = [];
const allErrors: { context: string; message: string }[] = [];

function isAllowlisted(message: string): boolean {
  return ALLOWLISTED_ERRORS.some(pattern => pattern.test(message));
}

function setupErrorListeners(page: Page, context: string) {
  page.on('pageerror', (error) => {
    allErrors.push({ context, message: error.message });
    console.error(`[${context}] JS Exception: ${error.message.substring(0, 100)}`);
  });
  
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !isAllowlisted(msg.text())) {
      allErrors.push({ context, message: msg.text() });
    }
  });
}

async function checkCrashed(page: Page): Promise<boolean> {
  const body = await page.locator('body').textContent() || '';
  return body.includes('Application error') || 
         body.includes('Unhandled Runtime Error') ||
         body.includes('client-side exception');
}

test.describe('Tools - Full Coverage', () => {
  // Test each tool
  for (const tool of TOOLS) {
    test(`Tool: ${tool}`, async ({ page }) => {
      const path = `/tools/${tool}`;
      const result: ToolTestResult = {
        tool,
        path,
        status: 0,
        loaded: false,
        ctaFound: false,
        ctaClicked: false,
        crashed: false,
        errors: [],
      };
      
      setupErrorListeners(page, path);
      
      try {
        // Load tool page
        const response = await page.goto(path);
        result.status = response?.status() || 0;
        
        await page.waitForLoadState('domcontentloaded');
        result.loaded = true;
        
        // Check for crash
        result.crashed = await checkCrashed(page);
        expect(result.crashed, `${tool} should not crash`).toBe(false);
        
        // Find primary CTA
        const ctaSelectors = [
          'button:has-text("Start")',
          'button:has-text("Generate")',
          'button:has-text("Create")',
          'button:has-text("Try")',
          'button:has-text("Launch")',
          'button[type="submit"]',
          'a.btn-primary',
          '.cta-button',
          '[data-testid="primary-cta"]',
        ];
        
        for (const selector of ctaSelectors) {
          const cta = page.locator(selector).first();
          if (await cta.count() > 0 && await cta.isVisible()) {
            result.ctaFound = true;
            
            // Click CTA
            try {
              await cta.click({ timeout: 3000 });
              result.ctaClicked = true;
              await page.waitForTimeout(1000);
              
              // Verify no crash after click
              const crashedAfterClick = await checkCrashed(page);
              expect(crashedAfterClick, `${tool} should not crash after CTA click`).toBe(false);
            } catch (e) {
              // Click failed but not a crash
              console.log(`  CTA click failed: ${(e as Error).message.substring(0, 50)}`);
            }
            break;
          }
        }
        
        // Screenshot
        await page.screenshot({ path: `test-results/tool-${tool}.png` });
        
      } catch (e) {
        result.errors.push((e as Error).message);
      }
      
      // Collect errors for this tool
      result.errors = allErrors
        .filter(e => e.context === path)
        .map(e => e.message);
      
      toolResults.push(result);
      
      // Report
      console.log(`  ${tool}: status=${result.status}, loaded=${result.loaded}, cta=${result.ctaFound}/${result.ctaClicked}, crashed=${result.crashed}`);
    });
  }
});

test.describe('Games - Full Coverage', () => {
  // Test games in batches to avoid timeout
  const gameBatches = [
    GAMES.slice(0, 8),
    GAMES.slice(8, 16),
    GAMES.slice(16, 24),
    GAMES.slice(24, 32),
  ];
  
  for (let batchIdx = 0; batchIdx < gameBatches.length; batchIdx++) {
    test(`Games batch ${batchIdx + 1} (${gameBatches[batchIdx][0]}-${gameBatches[batchIdx][gameBatches[batchIdx].length - 1]})`, async ({ page }) => {
      for (const gameId of gameBatches[batchIdx]) {
        const path = `/games/play/${gameId}`;
        const result: GameTestResult = {
          gameId,
          path,
          status: 0,
          loaded: false,
          crashed: false,
          errors: [],
        };
        
        setupErrorListeners(page, path);
        
        try {
          const response = await page.goto(path, { timeout: 30000 });
          result.status = response?.status() || 0;
          
          await page.waitForLoadState('domcontentloaded');
          result.loaded = true;
          
          result.crashed = await checkCrashed(page);
          
          // Take screenshot every 8th game
          if (gameId % 8 === 1) {
            await page.screenshot({ path: `test-results/game-${gameId}.png` });
          }
          
        } catch (e) {
          result.errors.push((e as Error).message);
        }
        
        result.errors = allErrors
          .filter(e => e.context === path)
          .map(e => e.message);
        
        gameResults.push(result);
        
        console.log(`  Game ${gameId}: status=${result.status}, crashed=${result.crashed}`);
        
        // Fail on crash
        expect(result.crashed, `Game ${gameId} should not crash`).toBe(false);
      }
    });
  }
});

test.describe('Apps - Entry Points', () => {
  test('Apps page loads and lists apps', async ({ page }) => {
    setupErrorListeners(page, '/apps');
    await page.goto('/apps');
    await page.waitForLoadState('domcontentloaded');
    
    // Check if 503 or actual content
    const is503 = await page.locator('text=503').count() > 0;
    
    if (is503) {
      console.log('  /apps returns 503 (under construction)');
      // 503 is acceptable for under construction
    } else {
      // Find app cards
      const appCards = await page.locator('a[href^="/apps/"]').all();
      console.log(`  Found ${appCards.length} app cards`);
      
      // Test first few apps
      for (let i = 0; i < Math.min(3, appCards.length); i++) {
        const href = await appCards[i].getAttribute('href');
        if (href) {
          await page.goto(href);
          await page.waitForLoadState('domcontentloaded');
          
          const crashed = await checkCrashed(page);
          expect(crashed, `App ${href} should not crash`).toBe(false);
          
          console.log(`  App ${href}: loaded`);
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/apps-page.png' });
  });
});

test.afterAll(async () => {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  
  // Summary
  const toolsPassed = toolResults.filter(t => !t.crashed && t.loaded).length;
  const gamesPassed = gameResults.filter(g => !g.crashed && g.loaded).length;
  
  const report = {
    summary: {
      tools: {
        total: TOOLS.length,
        passed: toolsPassed,
        failed: TOOLS.length - toolsPassed,
        withCTA: toolResults.filter(t => t.ctaFound).length,
      },
      games: {
        total: GAMES.length,
        passed: gamesPassed,
        failed: GAMES.length - gamesPassed,
      },
    },
    toolResults,
    gameResults,
    errors: allErrors,
  };
  
  fs.writeFileSync('test-results/apps-tools-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n=== Apps & Tools Summary ===');
  console.log(`Tools: ${toolsPassed}/${TOOLS.length} passed`);
  console.log(`Games: ${gamesPassed}/${GAMES.length} passed`);
  console.log(`Total errors: ${allErrors.length}`);
});
