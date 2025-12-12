import { test as base, expect, Page } from '@playwright/test';

// Test user credentials - use environment variables in CI
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

// Extended test fixture with authentication helpers
export const test = base.extend<{
  authenticatedPage: Page;
  loginAsUser: (email?: string, password?: string) => Promise<void>;
}>({
  // Provides a page that's already authenticated
  authenticatedPage: async ({ page }, use) => {
    await loginUser(page, TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await use(page);
  },

  // Provides a helper function to login with custom credentials
  loginAsUser: async ({ page }, use) => {
    const login = async (email = TEST_USER_EMAIL, password = TEST_USER_PASSWORD) => {
      await loginUser(page, email, password);
    };
    await use(login);
  },
});

// Core login function
async function loginUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/auth');
  
  // Wait for auth page to load
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Fill in credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Click sign in button
  await page.click('button[type="submit"]:has-text("Sign In")');
  
  // Wait for redirect to authenticated page
  await page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout: 15000 });
}

// Helper to check if user is authenticated
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check for presence of authenticated UI elements
  const logoutButton = await page.$('button:has-text("Sign Out"), button:has-text("Logout")');
  return logoutButton !== null;
}

// Helper to logout
export async function logout(page: Page): Promise<void> {
  // Navigate to settings or find logout button
  const logoutButton = await page.$('button:has-text("Sign Out"), button:has-text("Logout")');
  if (logoutButton) {
    await logoutButton.click();
    await page.waitForURL('/auth', { timeout: 10000 });
  }
}

// Helper to create a new test user (for signup tests)
export async function signUpUser(
  page: Page, 
  email: string, 
  password: string
): Promise<void> {
  await page.goto('/auth');
  
  // Switch to signup tab
  await page.click('button:has-text("Sign Up"), [role="tab"]:has-text("Sign Up")');
  
  // Fill signup form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Submit signup
  await page.click('button[type="submit"]:has-text("Sign Up")');
  
  // Wait for success or redirect
  await page.waitForTimeout(2000);
}

// Re-export expect for convenience
export { expect };
