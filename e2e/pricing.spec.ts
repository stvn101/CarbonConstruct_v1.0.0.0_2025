import { test, expect } from '@playwright/test';

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing');
  });

  test('should display pricing tiers', async ({ page }) => {
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/professional|pro/i).first()).toBeVisible();
    await expect(page.getByText(/business/i).first()).toBeVisible();
    await expect(page.getByText(/enterprise/i).first()).toBeVisible();
  });

  test('should display pricing amounts', async ({ page }) => {
    await expect(page.getByText(/\$0|\$49|\$99/)).toBeVisible();
  });

  test('should have CTA buttons for each tier', async ({ page }) => {
    const ctaButtons = page.getByRole('button', { name: /start|get started|contact|upgrade/i });
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should display feature comparison', async ({ page }) => {
    // Check for feature list items
    await expect(page.getByText(/material|report|project/i).first()).toBeVisible();
  });

  test('should show Forever Free badge', async ({ page }) => {
    await expect(page.getByText(/forever free/i)).toBeVisible();
  });

  test('should show Most Popular badge on Pro tier', async ({ page }) => {
    await expect(page.getByText(/most popular/i)).toBeVisible();
  });

  test('should navigate to auth when clicking free tier CTA', async ({ page }) => {
    await page.getByRole('button', { name: /start free/i }).first().click();
    await expect(page).toHaveURL(/\/auth/);
  });

  test('should show Stripe Climate contribution', async ({ page }) => {
    await expect(page.getByText(/stripe climate|0\.5%/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/professional|pro/i).first()).toBeVisible();
  });
});
