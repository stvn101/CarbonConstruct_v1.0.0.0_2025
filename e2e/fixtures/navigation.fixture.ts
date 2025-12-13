import { Page, expect } from '@playwright/test';

// Sidebar navigation routes (internal)
export const SIDEBAR_ROUTES = [
  { name: 'Dashboard', url: '/', identifier: 'Dashboard' },
  { name: 'LCA Calculator', url: '/calculator', identifier: 'Carbon Calculator' },
  { name: 'Reports', url: '/reports', identifier: 'Reports' },
  { name: 'Pricing', url: '/pricing', identifier: 'Pricing' },
  { name: 'AI BOQ Demo', url: '/demo', identifier: 'AI BOQ Import' },
  { name: 'Our Impact', url: '/impact', identifier: 'Impact' },
  { name: 'Product Roadmap', url: '/roadmap', identifier: 'Roadmap' },
  { name: 'Help & Resources', url: '/help', identifier: 'Help' },
  { name: 'Settings', url: '/settings', identifier: 'Settings' },
];

// Footer internal links
export const FOOTER_INTERNAL_LINKS = [
  { name: 'Dashboard', url: '/' },
  { name: 'LCA Calculator', url: '/calculator' },
  { name: 'Reports', url: '/reports' },
  { name: 'Install App', url: '/install' },
  { name: 'Help', url: '/help' },
  { name: 'Materials Database', url: '/materials/status' },
  { name: 'Our Impact', url: '/impact' },
  { name: 'Privacy Policy', url: '/privacy-policy' },
  { name: 'Terms of Service', url: '/terms-of-service' },
  { name: 'Cookie Policy', url: '/cookie-policy' },
  { name: 'Accessibility', url: '/accessibility' },
];

// Footer external links
export const FOOTER_EXTERNAL_LINKS = [
  { name: 'NCC Guidelines', href: 'https://ncc.abcb.gov.au/' },
  { name: 'Green Star', href: 'https://new.gbca.org.au/' },
  { name: 'NABERS', href: 'https://www.nabers.gov.au/' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/steven-j-carbonconstruct' },
  { name: 'Facebook', href: 'https://www.facebook.com/share/1AdCKCCb4f/' },
  { name: 'Instagram', href: 'https://www.instagram.com/carbonconstruct_tech' },
];

// Pages where "Book a Demo" button appears in header
export const TOOLS_PAGES_WITH_DEMO_BUTTON = [
  '/settings',
  '/pricing',
  '/impact',
  '/roadmap',
  '/help',
];

// Demo page links
export const DEMO_PAGE_LINKS = {
  internal: [
    { name: 'Try AI BOQ Import Now', url: '/calculator' },
    { name: 'View Pricing', url: '/pricing' },
  ],
  external: [
    { name: 'Book a Demo with Steven', href: 'https://calendar.app.google/1SMFPsNBFS7V5pu37' },
  ],
};

// Landing page CTA links (unauthenticated)
export const LANDING_PAGE_LINKS = {
  internal: [
    { name: 'Start Free Forever', url: '/auth' },
    { name: 'View Pricing', url: '/pricing' },
  ],
  external: [
    { name: 'Book a Demo', href: 'https://calendar.app.google/1SMFPsNBFS7V5pu37' },
  ],
};

// Google Calendar external link
export const GOOGLE_CALENDAR_URL = 'https://calendar.app.google/1SMFPsNBFS7V5pu37';

/**
 * Verify internal navigation works correctly (no full page reload)
 */
export async function verifyInternalNavigation(
  page: Page,
  linkSelector: string,
  expectedUrl: string
): Promise<void> {
  const link = page.locator(linkSelector).first();
  await expect(link).toBeVisible();
  
  // Click and wait for navigation
  await link.click();
  await page.waitForURL(`**${expectedUrl}`, { timeout: 10000 });
  
  // Verify URL
  expect(page.url()).toContain(expectedUrl);
}

/**
 * Verify external link has correct href and security attributes
 */
export async function verifyExternalLink(
  page: Page,
  linkSelector: string,
  expectedHref: string
): Promise<void> {
  const link = page.locator(linkSelector).first();
  await expect(link).toBeVisible();
  
  // Check href
  const href = await link.getAttribute('href');
  expect(href).toContain(expectedHref);
  
  // Check target="_blank" for new tab
  const target = await link.getAttribute('target');
  expect(target).toBe('_blank');
  
  // Check rel="noopener noreferrer" for security
  const rel = await link.getAttribute('rel');
  expect(rel).toContain('noopener');
}

/**
 * Check if external link has proper security attributes
 */
export async function isExternalLinkSecure(
  page: Page,
  linkSelector: string
): Promise<boolean> {
  const link = page.locator(linkSelector).first();
  
  if (!(await link.isVisible())) {
    return false;
  }
  
  const target = await link.getAttribute('target');
  const rel = await link.getAttribute('rel');
  
  return target === '_blank' && rel !== null && rel.includes('noopener');
}

/**
 * Verify a link is internal (uses React Router, no target="_blank")
 */
export async function verifyInternalLink(
  page: Page,
  linkSelector: string
): Promise<void> {
  const link = page.locator(linkSelector).first();
  await expect(link).toBeVisible();
  
  // Internal links should NOT have target="_blank"
  const target = await link.getAttribute('target');
  expect(target).not.toBe('_blank');
}

/**
 * Verify sidebar navigation item is active
 */
export async function verifySidebarActiveState(
  page: Page,
  activeUrl: string
): Promise<void> {
  // Navigate to the URL first
  await page.goto(activeUrl);
  await page.waitForLoadState('networkidle');
  
  // Find the active sidebar item
  const sidebarLink = page.locator(`[data-sidebar="menu-button"] a[href="${activeUrl}"]`).first();
  
  if (await sidebarLink.isVisible()) {
    // Check for active styling (data-active attribute or active class)
    const isActive = await sidebarLink.getAttribute('data-active');
    const className = await sidebarLink.getAttribute('class');
    
    // Either has data-active="true" or has active styling class
    const hasActiveState = isActive === 'true' || 
                          className?.includes('active') || 
                          className?.includes('bg-');
    
    expect(hasActiveState).toBeTruthy();
  }
}

/**
 * Get all links on the current page
 */
export async function getAllLinks(page: Page): Promise<Array<{href: string, isExternal: boolean}>> {
  return await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    return links.map(link => ({
      href: link.getAttribute('href') || '',
      isExternal: link.getAttribute('target') === '_blank'
    }));
  });
}

/**
 * Verify page loaded correctly by checking for specific content
 */
export async function verifyPageLoaded(
  page: Page,
  identifier: string
): Promise<void> {
  // Wait for page to stabilize
  await page.waitForLoadState('networkidle');
  
  // Check for page identifier (heading or text content)
  const content = await page.textContent('body');
  expect(content).toContain(identifier);
}
