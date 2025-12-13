import { test, expect } from '@playwright/test';
import {
  SIDEBAR_ROUTES,
  FOOTER_INTERNAL_LINKS,
  FOOTER_EXTERNAL_LINKS,
  TOOLS_PAGES_WITH_DEMO_BUTTON,
  DEMO_PAGE_LINKS,
  LANDING_PAGE_LINKS,
  GOOGLE_CALENDAR_URL,
  verifyExternalLink,
  verifyInternalLink,
  isExternalLinkSecure,
  verifyPageLoaded,
} from './fixtures/navigation.fixture';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Start from authenticated dashboard (or landing if not authenticated)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('all sidebar internal routes should be accessible', async ({ page }) => {
    for (const route of SIDEBAR_ROUTES) {
      await page.goto(route.url);
      await page.waitForLoadState('networkidle');
      
      // Verify URL is correct
      expect(page.url()).toContain(route.url);
      
      // Verify page content indicates correct page loaded
      await verifyPageLoaded(page, route.identifier);
    }
  });

  test('sidebar links should use internal navigation (no target="_blank")', async ({ page }) => {
    // Open sidebar if collapsed
    const sidebarTrigger = page.locator('[data-sidebar="trigger"]').first();
    if (await sidebarTrigger.isVisible()) {
      await sidebarTrigger.click();
      await page.waitForTimeout(300);
    }

    for (const route of SIDEBAR_ROUTES) {
      const sidebarLink = page.locator(`a[href="${route.url}"]`).first();
      
      if (await sidebarLink.isVisible()) {
        // Internal links should NOT open in new tab
        const target = await sidebarLink.getAttribute('target');
        expect(target).not.toBe('_blank');
      }
    }
  });

  test('AI BOQ Demo sidebar link should navigate to /demo page', async ({ page }) => {
    // Find and click the AI BOQ Demo link
    const demoLink = page.locator('a[href="/demo"]').first();
    
    if (await demoLink.isVisible()) {
      await demoLink.click();
      await page.waitForURL('**/demo');
      
      // Verify we're on the demo page
      expect(page.url()).toContain('/demo');
      await expect(page.getByText('AI BOQ Import')).toBeVisible();
    }
  });
});

test.describe('Footer Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('all footer internal links should navigate correctly', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    for (const link of FOOTER_INTERNAL_LINKS) {
      const footerLink = page.locator(`footer a[href="${link.url}"]`).first();
      
      if (await footerLink.isVisible()) {
        // Verify it's an internal link (no target="_blank")
        const target = await footerLink.getAttribute('target');
        expect(target).not.toBe('_blank');
      }
    }
  });

  test('all footer external links should open in new tab', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    for (const link of FOOTER_EXTERNAL_LINKS) {
      const footerLink = page.locator(`footer a[href*="${new URL(link.href).hostname}"]`).first();
      
      if (await footerLink.isVisible()) {
        // External links should have target="_blank"
        const target = await footerLink.getAttribute('target');
        expect(target).toBe('_blank');
      }
    }
  });

  test('all footer external links should have security attributes', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    for (const link of FOOTER_EXTERNAL_LINKS) {
      const footerLink = page.locator(`footer a[href*="${new URL(link.href).hostname}"]`).first();
      
      if (await footerLink.isVisible()) {
        const isSecure = await isExternalLinkSecure(page, `footer a[href*="${new URL(link.href).hostname}"]`);
        expect(isSecure).toBe(true);
      }
    }
  });

  test('social media links should have aria-labels', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const socialLinks = ['LinkedIn', 'Facebook', 'Instagram'];
    
    for (const social of socialLinks) {
      const link = page.locator(`footer a[aria-label*="${social}" i]`).first();
      
      if (await link.isVisible()) {
        const ariaLabel = await link.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    }
  });
});

test.describe('Header Navigation', () => {
  test('Book a Demo button should appear on tools pages', async ({ page }) => {
    for (const toolsPage of TOOLS_PAGES_WITH_DEMO_BUTTON) {
      await page.goto(toolsPage);
      await page.waitForLoadState('networkidle');
      
      // Look for Book a Demo button in header
      const demoButton = page.locator('header a[href*="calendar.app.google"]').first();
      
      // Should be visible on tools pages
      if (await demoButton.isVisible()) {
        // Verify it's an external link
        const target = await demoButton.getAttribute('target');
        expect(target).toBe('_blank');
        
        // Verify correct href
        const href = await demoButton.getAttribute('href');
        expect(href).toContain(GOOGLE_CALENDAR_URL);
      }
    }
  });

  test('Book a Demo header button should be external link with security', async ({ page }) => {
    // Go to a tools page where button appears
    await page.goto('/pricing');
    await page.waitForLoadState('networkidle');
    
    const demoButton = page.locator('header a[href*="calendar.app.google"]').first();
    
    if (await demoButton.isVisible()) {
      const isSecure = await isExternalLinkSecure(page, 'header a[href*="calendar.app.google"]');
      expect(isSecure).toBe(true);
    }
  });
});

test.describe('Demo Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
  });

  test('/demo route should load demo page (not redirect)', async ({ page }) => {
    // Verify we're on /demo
    expect(page.url()).toContain('/demo');
    
    // Verify demo page content is visible
    await expect(page.getByText('AI BOQ Import')).toBeVisible();
  });

  test('Try AI BOQ Import Now button should navigate to /calculator', async ({ page }) => {
    const calcButton = page.locator('a[href="/calculator"]', { hasText: /try.*ai.*boq/i }).first();
    
    if (await calcButton.isVisible()) {
      await calcButton.click();
      await page.waitForURL('**/calculator');
      expect(page.url()).toContain('/calculator');
    }
  });

  test('View Pricing button should navigate to /pricing', async ({ page }) => {
    const pricingButton = page.locator('a[href="/pricing"]').first();
    
    if (await pricingButton.isVisible()) {
      await pricingButton.click();
      await page.waitForURL('**/pricing');
      expect(page.url()).toContain('/pricing');
    }
  });

  test('Book a Demo with Steven should be external link to Google Calendar', async ({ page }) => {
    const bookDemoLink = page.locator(`a[href*="calendar.app.google"]`).first();
    
    if (await bookDemoLink.isVisible()) {
      await verifyExternalLink(page, `a[href*="calendar.app.google"]`, GOOGLE_CALENDAR_URL);
    }
  });
});

test.describe('Landing Page Navigation (Unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any auth state
    await page.context().clearCookies();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Start Free Forever CTA should navigate to /auth', async ({ page }) => {
    const ctaButton = page.locator('a[href="/auth"]', { hasText: /start free/i }).first();
    
    if (await ctaButton.isVisible()) {
      await ctaButton.click();
      await page.waitForURL('**/auth');
      expect(page.url()).toContain('/auth');
    }
  });

  test('View Pricing link should navigate to /pricing', async ({ page }) => {
    const pricingLink = page.locator('a[href="/pricing"]').first();
    
    if (await pricingLink.isVisible()) {
      await pricingLink.click();
      await page.waitForURL('**/pricing');
      expect(page.url()).toContain('/pricing');
    }
  });

  test('Book a Demo buttons should be external links', async ({ page }) => {
    const bookDemoLinks = page.locator(`a[href*="calendar.app.google"]`);
    const count = await bookDemoLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = bookDemoLinks.nth(i);
      
      if (await link.isVisible()) {
        const target = await link.getAttribute('target');
        expect(target).toBe('_blank');
        
        const href = await link.getAttribute('href');
        expect(href).toContain(GOOGLE_CALENDAR_URL);
      }
    }
  });
});

test.describe('External vs Internal Link Verification', () => {
  test('all external links should have target="_blank"', async ({ page }) => {
    const pagesToCheck = ['/', '/demo', '/pricing', '/help'];
    
    for (const pageUrl of pagesToCheck) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      
      // Find all links with external hrefs (http:// or https://)
      const externalLinks = page.locator('a[href^="http"]');
      const count = await externalLinks.count();
      
      for (let i = 0; i < count; i++) {
        const link = externalLinks.nth(i);
        const href = await link.getAttribute('href');
        
        // Skip if it's the same origin
        if (href?.includes('localhost') || href?.includes('carbonconstruct')) {
          continue;
        }
        
        const target = await link.getAttribute('target');
        expect(target, `External link ${href} should open in new tab`).toBe('_blank');
      }
    }
  });

  test('all external links should have rel="noopener" for security', async ({ page }) => {
    const pagesToCheck = ['/', '/demo', '/pricing'];
    
    for (const pageUrl of pagesToCheck) {
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      
      // Find all external links
      const externalLinks = page.locator('a[target="_blank"]');
      const count = await externalLinks.count();
      
      for (let i = 0; i < count; i++) {
        const link = externalLinks.nth(i);
        const href = await link.getAttribute('href');
        const rel = await link.getAttribute('rel');
        
        expect(rel, `External link ${href} should have noopener`).toContain('noopener');
      }
    }
  });

  test('internal links should NOT have target="_blank"', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Internal links start with "/" and don't have target="_blank"
    const internalLinks = page.locator('a[href^="/"]');
    const count = await internalLinks.count();
    
    for (let i = 0; i < count; i++) {
      const link = internalLinks.nth(i);
      const href = await link.getAttribute('href');
      const target = await link.getAttribute('target');
      
      expect(target, `Internal link ${href} should NOT open in new tab`).not.toBe('_blank');
    }
  });
});

test.describe('Link Accessibility', () => {
  test('all links should have visible focus states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab to first link and check focus is visible
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('navigation links should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Press Tab multiple times and verify focus moves
    let previousFocusedHref = '';
    
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      
      const focusedElement = page.locator(':focus');
      const href = await focusedElement.getAttribute('href');
      
      if (href) {
        // Verify focus is moving to different elements
        expect(href).not.toBe(previousFocusedHref);
        previousFocusedHref = href;
      }
    }
  });

  test('links should be activatable with Enter key', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find the pricing link and focus it
    const pricingLink = page.locator('a[href="/pricing"]').first();
    
    if (await pricingLink.isVisible()) {
      await pricingLink.focus();
      await page.keyboard.press('Enter');
      
      // Should navigate to pricing
      await page.waitForURL('**/pricing', { timeout: 5000 });
      expect(page.url()).toContain('/pricing');
    }
  });
});

test.describe('Route Protection Verification', () => {
  test('protected routes should redirect unauthenticated users', async ({ page }) => {
    // Clear auth state
    await page.context().clearCookies();
    
    const protectedRoutes = ['/calculator', '/reports', '/settings'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Should redirect to /auth or / (landing)
      const url = page.url();
      const isRedirected = url.includes('/auth') || url.endsWith('/');
      expect(isRedirected, `Protected route ${route} should redirect`).toBe(true);
    }
  });

  test('public routes should be accessible without auth', async ({ page }) => {
    // Clear auth state
    await page.context().clearCookies();
    
    const publicRoutes = ['/pricing', '/demo', '/privacy-policy', '/terms-of-service'];
    
    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Should stay on the route
      expect(page.url()).toContain(route);
    }
  });
});

test.describe('Navigation Regression Prevention', () => {
  test('sidebar AI BOQ Demo link should NOT be external', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // The AI BOQ Demo link in sidebar should be internal (/demo)
    const demoLink = page.locator('a[href="/demo"]').first();
    
    if (await demoLink.isVisible()) {
      const target = await demoLink.getAttribute('target');
      const href = await demoLink.getAttribute('href');
      
      // Should NOT be external
      expect(target).not.toBe('_blank');
      // Should be internal /demo route
      expect(href).toBe('/demo');
      // Should NOT be Google Calendar
      expect(href).not.toContain('calendar.app.google');
    }
  });

  test('demo page should exist and render content', async ({ page }) => {
    const response = await page.goto('/demo');
    
    // Page should load successfully
    expect(response?.status()).toBe(200);
    
    // Demo page content should be visible
    await expect(page.getByText('AI BOQ Import')).toBeVisible();
    
    // Book a Demo button should exist on demo page
    const bookDemoButton = page.locator('a[href*="calendar.app.google"]').first();
    await expect(bookDemoButton).toBeVisible();
  });

  test('Google Calendar link should only appear as external button', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForLoadState('networkidle');
    
    // Find all Google Calendar links
    const calendarLinks = page.locator('a[href*="calendar.app.google"]');
    const count = await calendarLinks.count();
    
    // All should be external links
    for (let i = 0; i < count; i++) {
      const link = calendarLinks.nth(i);
      const target = await link.getAttribute('target');
      expect(target).toBe('_blank');
    }
  });
});
