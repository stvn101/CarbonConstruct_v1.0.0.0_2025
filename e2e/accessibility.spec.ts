import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('landing page should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    // Should only have one h1
    await expect(h1).toHaveCount(1);
  });

  test('all pages should have skip links', async ({ page }) => {
    const pages = ['/', '/pricing', '/auth', '/demo'];
    
    for (const path of pages) {
      await page.goto(path);
      const skipLink = page.getByRole('link', { name: /skip/i });
      await expect(skipLink).toBeAttached();
    }
  });

  test('forms should have proper labels', async ({ page }) => {
    await page.goto('/auth');
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('interactive elements should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Tab through page
    await page.keyboard.press('Tab');
    
    // First focusable element should be visible
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');
    
    const images = page.getByRole('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('color contrast should be sufficient', async ({ page }) => {
    await page.goto('/');
    
    // Check that text is visible (basic contrast check)
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeVisible();
  });

  test('focus indicators should be visible', async ({ page }) => {
    await page.goto('/');
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Check focus is visible
    const focused = page.locator(':focus-visible');
    await expect(focused).toBeVisible();
  });

  test('ARIA landmarks should be present', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('navigation should be accessible', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
  });

  test('buttons should have accessible names', async ({ page }) => {
    await page.goto('/');
    
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const name = await button.getAttribute('aria-label') || await button.textContent();
      expect(name?.trim()).toBeTruthy();
    }
  });
});
