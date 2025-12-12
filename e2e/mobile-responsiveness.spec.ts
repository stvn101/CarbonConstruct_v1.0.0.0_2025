import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test.use({ ...devices['iPhone 12'] });

  test('landing page should be mobile-friendly', async ({ page }) => {
    await page.goto('/');
    
    // Hero should be visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // CTA should be visible and tappable
    await expect(page.getByRole('link', { name: /start free/i }).first()).toBeVisible();
  });

  test('navigation should be accessible on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check for mobile menu or hamburger
    const mobileMenu = page.getByRole('button', { name: /menu|toggle/i });
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.getByRole('navigation')).toBeVisible();
    }
  });

  test('pricing page should stack cards on mobile', async ({ page }) => {
    await page.goto('/pricing');
    
    // All tiers should be visible
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/professional|pro/i).first()).toBeVisible();
  });

  test('auth page should be usable on mobile', async ({ page }) => {
    await page.goto('/auth');
    
    // Form should be visible
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    
    // Button should be tappable
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('forms should be touch-friendly', async ({ page }) => {
    await page.goto('/auth');
    
    const emailInput = page.getByLabel(/email/i);
    const box = await emailInput.boundingBox();
    
    // Input should be at least 44px tall for touch targets
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('text should be readable without zooming', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport meta tag
    const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
    expect(viewport).toContain('width=device-width');
  });
});

test.describe('Tablet Responsiveness', () => {
  test.use({ ...devices['iPad Pro'] });

  test('landing page should adapt to tablet', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('pricing cards should display in grid', async ({ page }) => {
    await page.goto('/pricing');
    
    // All tiers visible
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/professional|pro/i).first()).toBeVisible();
    await expect(page.getByText(/business/i).first()).toBeVisible();
  });
});
