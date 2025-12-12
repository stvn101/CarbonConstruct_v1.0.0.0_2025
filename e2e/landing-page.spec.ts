import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the hero section with main CTA', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /start free/i })).toBeVisible();
  });

  test('should navigate to auth page when clicking Start Free', async ({ page }) => {
    await page.getByRole('link', { name: /start free/i }).first().click();
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should display feature sections', async ({ page }) => {
    await expect(page.getByText(/Australian Compliance/i)).toBeVisible();
    await expect(page.getByText(/Material Database/i)).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Test pricing link
    const pricingLink = page.getByRole('link', { name: /pricing/i }).first();
    await pricingLink.click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('should display footer with legal links', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /terms/i })).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should display comparison table', async ({ page }) => {
    await expect(page.getByText(/CarbonConstruct/i).first()).toBeVisible();
  });

  test('should have accessible skip links', async ({ page }) => {
    const skipLink = page.getByRole('link', { name: /skip to main/i });
    await expect(skipLink).toBeAttached();
  });
});
