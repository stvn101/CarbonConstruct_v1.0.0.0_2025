import { test, expect } from '@playwright/test';

test.describe('Calculator Flow', () => {
  // Note: These tests assume user is authenticated
  // In real E2E, you'd set up authentication before each test
  
  test.beforeEach(async ({ page }) => {
    // For unauthenticated flow, go to demo or public calculator
    await page.goto('/demo');
  });

  test('should display calculator interface', async ({ page }) => {
    await expect(page.getByText(/carbon|calculator|emissions/i).first()).toBeVisible();
  });

  test('should display material search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search|material/i).first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('steel');
      // Should show search results
      await expect(page.getByText(/steel/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display emission categories', async ({ page }) => {
    // Check for scope indicators or material categories
    await expect(page.getByText(/scope|material|emission/i).first()).toBeVisible();
  });
});

test.describe('Calculator - Authenticated Flow', () => {
  test.skip(true, 'Requires authentication setup');
  
  test('should add material to calculation', async ({ page }) => {
    await page.goto('/calculator');
    
    // Search for material
    await page.getByPlaceholder(/search/i).fill('concrete');
    await page.waitForTimeout(500);
    
    // Click add button on first result
    await page.getByRole('button', { name: /add/i }).first().click();
    
    // Material should appear in list
    await expect(page.getByText(/concrete/i)).toBeVisible();
  });

  test('should calculate emissions when quantity entered', async ({ page }) => {
    await page.goto('/calculator');
    
    // Add a material and enter quantity
    await page.getByPlaceholder(/search/i).fill('steel');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /add/i }).first().click();
    
    // Enter quantity
    const quantityInput = page.getByRole('spinbutton').first();
    await quantityInput.fill('1000');
    
    // Check total updates
    await expect(page.getByText(/tCO2e|kgCO2e/i)).toBeVisible();
  });

  test('should persist calculations in localStorage', async ({ page }) => {
    await page.goto('/calculator');
    
    // Add material
    await page.getByPlaceholder(/search/i).fill('concrete');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /add/i }).first().click();
    
    // Reload page
    await page.reload();
    
    // Material should still be there
    await expect(page.getByText(/concrete/i)).toBeVisible();
  });

  test('should display lifecycle stage breakdown', async ({ page }) => {
    await page.goto('/calculator');
    
    // Check for EN 15978 lifecycle stages
    await expect(page.getByText(/A1-A3|Product Stage/i)).toBeVisible();
  });
});
