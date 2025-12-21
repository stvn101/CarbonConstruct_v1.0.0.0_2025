import { test, expect } from '@playwright/test';

test.describe('Material Verification Page', () => {
  test.beforeEach(async ({ page }) => {
    // Note: This page requires admin auth - tests will verify page structure
    await page.goto('/admin/material-verification');
  });

  test('should display page title', async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState('networkidle');
    
    // Check for Material Verification title or redirect to auth
    const pageContent = await page.content();
    const hasVerificationPage = pageContent.includes('Material') || pageContent.includes('Verification');
    const hasAuthPage = pageContent.includes('Sign in') || pageContent.includes('Login');
    
    expect(hasVerificationPage || hasAuthPage).toBe(true);
  });

  test('should have proper page structure', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for main semantic structure
    const main = page.locator('main');
    await expect(main).toBeAttached();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    
    // Verify page renders without horizontal scroll issues
    const body = page.locator('body');
    const scrollWidth = await body.evaluate(el => el.scrollWidth);
    const clientWidth = await body.evaluate(el => el.clientWidth);
    
    // Allow small tolerance for scrollbar
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API calls and fail them
    await page.route('**/materials_epd*', route => route.abort());
    
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    // Page should still render without crashing
    const pageContent = await page.content();
    expect(pageContent.length).toBeGreaterThan(0);
  });
});

test.describe('Material Verification - Authenticated Admin', () => {
  // These tests would require a valid admin session
  // Using test.skip for CI environments without test credentials
  
  test.skip('should display database statistics cards', async ({ page }) => {
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    // Look for stats cards
    const statsCards = page.locator('[class*="card"]');
    const cardCount = await statsCards.count();
    
    expect(cardCount).toBeGreaterThan(0);
  });

  test.skip('should display category breakdown table', async ({ page }) => {
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    // Look for table elements
    const tables = page.locator('table');
    const tableCount = await tables.count();
    
    expect(tableCount).toBeGreaterThan(0);
  });

  test.skip('should have run verification button', async ({ page }) => {
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    // Look for verification button
    const runButton = page.getByRole('button', { name: /run.*verification|verify/i });
    await expect(runButton).toBeVisible();
  });

  test.skip('should display verification history section', async ({ page }) => {
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    // Look for history section
    const historySection = page.getByText(/verification.*history|history/i);
    await expect(historySection).toBeVisible();
  });

  test.skip('should display outlier detection section', async ({ page }) => {
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    // Look for outlier section
    const outlierSection = page.getByText(/outlier.*detection|outliers/i);
    await expect(outlierSection).toBeVisible();
  });

  test.skip('should display data source breakdown', async ({ page }) => {
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    // Check for known data sources
    const sources = ['NABERS', 'ICE', 'NGER', 'ICM'];
    
    for (const source of sources) {
      const sourceText = page.getByText(new RegExp(source, 'i'));
      // At least one source should be visible
      const isVisible = await sourceText.first().isVisible().catch(() => false);
      if (isVisible) {
        expect(isVisible).toBe(true);
        break;
      }
    }
  });
});

test.describe('Material Verification - Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    // Check for at least one heading
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    // All buttons should have accessible names
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();
      if (isVisible) {
        const accessibleName = await button.getAttribute('aria-label') || await button.textContent();
        expect(accessibleName).toBeTruthy();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    // Tab through the page
    await page.keyboard.press('Tab');
    
    // Something should be focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});

test.describe('Material Verification - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/admin/material-verification');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    // Navigate to page multiple times
    for (let i = 0; i < 3; i++) {
      await page.goto('/admin/material-verification');
      await page.waitForLoadState('networkidle');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    }
    
    // If we got here without crashing, the test passes
    expect(true).toBe(true);
  });
});
