import { test, expect } from '@playwright/test';

test.describe('Visual Regression - Landing Page', () => {
  test('hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const hero = page.locator('section').first();
    await expect(hero).toHaveScreenshot('landing-hero.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('full page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('landing-full.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('navigation header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const header = page.getByRole('banner');
    await expect(header).toHaveScreenshot('navigation-header.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('footer', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toHaveScreenshot('footer.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Visual Regression - Pricing Page', () => {
  test('pricing cards', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('pricing-full.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('pricing cards - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('pricing-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe('Visual Regression - Auth Page', () => {
  test('login form', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('auth-login.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('login form - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('auth-login-mobile.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Visual Regression - Demo Page', () => {
  test('demo calculator', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('demo-calculator.png', {
      maxDiffPixelRatio: 0.05,
    });
  });
});

test.describe('Visual Regression - Dark Mode', () => {
  test('landing page dark mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Trigger dark mode via class or media query emulation
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('landing-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('pricing page dark mode', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('pricing-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('auth page dark mode', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('auth-dark.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe('Visual Regression - Responsive Breakpoints', () => {
  const breakpoints = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'wide', width: 1920, height: 1080 },
  ];

  for (const bp of breakpoints) {
    test(`landing page at ${bp.name} (${bp.width}x${bp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`landing-${bp.name}.png`, {
        maxDiffPixelRatio: 0.05,
      });
    });
  }
});

test.describe('Visual Regression - Component States', () => {
  test('button hover states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const ctaButton = page.getByRole('link', { name: /start free/i }).first();
    await ctaButton.hover();
    
    await expect(ctaButton).toHaveScreenshot('cta-button-hover.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('input focus states', async ({ page }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    const emailInput = page.getByLabel(/email/i);
    await emailInput.focus();
    
    await expect(emailInput).toHaveScreenshot('input-focused.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
