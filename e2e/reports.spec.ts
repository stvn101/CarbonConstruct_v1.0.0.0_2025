import { test, expect } from '@playwright/test';

test.describe('Reports Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
  });

  test('should display reports page', async ({ page }) => {
    // May redirect to auth if not logged in
    const url = page.url();
    if (url.includes('/auth')) {
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    } else {
      await expect(page.getByText(/report|carbon|assessment/i).first()).toBeVisible();
    }
  });
});

test.describe('Reports - Authenticated Flow', () => {
  test.skip(true, 'Requires authentication setup');

  test('should display report generation options', async ({ page }) => {
    await page.goto('/reports');
    
    await expect(page.getByText(/generate|create|download/i).first()).toBeVisible();
  });

  test('should show project selector', async ({ page }) => {
    await page.goto('/reports');
    
    await expect(page.getByText(/project|select/i).first()).toBeVisible();
  });

  test('should display emission totals', async ({ page }) => {
    await page.goto('/reports');
    
    // Check for emission summary
    await expect(page.getByText(/total|emissions|tCO2e/i).first()).toBeVisible();
  });

  test('should show compliance status', async ({ page }) => {
    await page.goto('/reports');
    
    // Check for compliance indicators
    await expect(page.getByText(/compliance|NCC|Green Star|NABERS/i).first()).toBeVisible();
  });

  test('should generate PDF report', async ({ page }) => {
    await page.goto('/reports');
    
    // Click generate button
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download|generate|pdf/i }).first().click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should display lifecycle stage breakdown in report', async ({ page }) => {
    await page.goto('/reports');
    
    // Check for EN 15978 stages
    await expect(page.getByText(/A1-A3|Product Stage/i)).toBeVisible();
    await expect(page.getByText(/A4|Transport/i)).toBeVisible();
  });
});
