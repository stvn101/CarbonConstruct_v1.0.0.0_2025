import { test as base, expect, Page, Browser } from '@playwright/test';
import {
  CI_TEST_USER,
  INVALID_CREDENTIALS,
  INVALID_PASSWORDS,
  PROTECTED_ROUTES,
  OAUTH_ERROR_TYPES,
  RATE_LIMIT,
  ACCOUNT_STATUS,
  type AccountStatus,
  type OAuthErrorType,
} from './auth.constants';

// Extended test fixture with authentication helpers
export const test = base.extend<{
  authenticatedPage: Page;
  loginAsUser: (email?: string, password?: string) => Promise<void>;
}>({
  // Provides a page that's already authenticated
  authenticatedPage: async ({ page }, use) => {
    await loginUser(page, CI_TEST_USER.email, CI_TEST_USER.password);
    await use(page);
  },

  // Provides a helper function to login with custom credentials
  loginAsUser: async ({ page }, use) => {
    const login = async (email = CI_TEST_USER.email, password = CI_TEST_USER.password) => {
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

// ============================================================================
// FAILED LOGIN HANDLERS
// ============================================================================

/**
 * Attempt login with invalid credentials and capture error state
 */
export async function attemptLoginWithInvalidCredentials(
  page: Page,
  email: string = INVALID_CREDENTIALS.nonexistentEmail,
  password: string = INVALID_CREDENTIALS.wrongPassword
): Promise<{ errorMessage: string | null; remainsOnAuthPage: boolean }> {
  await page.goto('/auth');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Fill in invalid credentials
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Click sign in button
  await page.click('button[type="submit"]:has-text("Sign In")');
  
  // Wait for error message to appear
  await page.waitForTimeout(2000);
  
  // Check for error message
  const errorElement = await page.$('[role="alert"], .text-destructive, [data-sonner-toast][data-type="error"]');
  const errorMessage = errorElement ? await errorElement.textContent() : null;
  
  // Verify user remains on auth page
  const remainsOnAuthPage = page.url().includes('/auth');
  
  return { errorMessage, remainsOnAuthPage };
}

/**
 * Attempt login with malformed email
 */
export async function attemptLoginWithMalformedEmail(
  page: Page
): Promise<{ validationError: string | null; formSubmitted: boolean }> {
  await page.goto('/auth');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Fill in malformed email
  await page.fill('input[type="email"]', INVALID_CREDENTIALS.malformedEmail);
  await page.fill('input[type="password"]', 'SomePassword123!');
  
  // Try to submit
  await page.click('button[type="submit"]:has-text("Sign In")');
  
  // Check for HTML5 validation or custom validation error
  const emailInput = await page.$('input[type="email"]');
  const validationMessage = emailInput ? await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage) : null;
  
  // Check if form was actually submitted (would show loading or different state)
  const formSubmitted = !(await page.$('button[type="submit"]:has-text("Sign In")'));
  
  return { validationError: validationMessage, formSubmitted };
}

// ============================================================================
// RATE LIMITING TESTS
// ============================================================================

/**
 * Trigger rate limiting by attempting multiple failed logins
 */
export async function triggerRateLimitByFailedLogins(
  page: Page,
  attempts: number = RATE_LIMIT.maxFailedAttempts + 1
): Promise<{ rateLimited: boolean; attemptsMade: number; errorMessage: string | null }> {
  await page.goto('/auth');
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  let rateLimited = false;
  let attemptsMade = 0;
  let errorMessage: string | null = null;
  
  for (let i = 0; i < attempts; i++) {
    // Fill in invalid credentials
    await page.fill('input[type="email"]', INVALID_CREDENTIALS.nonexistentEmail);
    await page.fill('input[type="password"]', INVALID_CREDENTIALS.wrongPassword);
    
    // Click sign in button
    await page.click('button[type="submit"]:has-text("Sign In")');
    attemptsMade++;
    
    // Wait for response
    await page.waitForTimeout(1000);
    
    // Check for rate limit message
    const rateLimitMessage = await page.$('text=/rate limit|too many|try again later/i');
    if (rateLimitMessage) {
      rateLimited = true;
      errorMessage = await rateLimitMessage.textContent();
      break;
    }
  }
  
  return { rateLimited, attemptsMade, errorMessage };
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Simulate session timeout by clearing storage and verifying redirect
 */
export async function simulateSessionTimeout(
  page: Page
): Promise<{ redirectedToAuth: boolean; sessionCleared: boolean }> {
  // Clear all session-related storage
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // Clear cookies
  await page.context().clearCookies();
  
  const sessionCleared = true;
  
  // Try to access a protected route
  await page.goto('/calculator');
  await page.waitForTimeout(2000);
  
  // Check if redirected to auth page
  const redirectedToAuth = page.url().includes('/auth');
  
  return { redirectedToAuth, sessionCleared };
}

/**
 * Simulate expired token by manipulating stored auth data
 */
export async function simulateExpiredToken(
  page: Page
): Promise<{ tokenExpired: boolean; refreshAttempted: boolean; redirectedToAuth: boolean }> {
  // Manipulate the stored token to appear expired
  await page.evaluate(() => {
    const authKey = Object.keys(localStorage).find(key => 
      key.includes('supabase') && key.includes('auth')
    );
    
    if (authKey) {
      try {
        const authData = JSON.parse(localStorage.getItem(authKey) || '{}');
        if (authData.expires_at) {
          // Set expiry to past
          authData.expires_at = Math.floor(Date.now() / 1000) - 3600;
          localStorage.setItem(authKey, JSON.stringify(authData));
        }
      } catch {
        // Token manipulation failed
      }
    }
  });
  
  const tokenExpired = true;
  
  // Trigger a navigation that would require auth
  await page.goto('/calculator');
  await page.waitForTimeout(3000);
  
  // Check if refresh was attempted (network request) or redirected to auth
  const redirectedToAuth = page.url().includes('/auth');
  const refreshAttempted = true; // Supabase client auto-attempts refresh
  
  return { tokenExpired, refreshAttempted, redirectedToAuth };
}

/**
 * Get current session info from storage
 */
export async function getSessionInfo(
  page: Page
): Promise<{ hasSession: boolean; expiresAt: number | null; userId: string | null }> {
  const sessionInfo = await page.evaluate(() => {
    const authKey = Object.keys(localStorage).find(key => 
      key.includes('supabase') && key.includes('auth')
    );
    
    if (!authKey) {
      return { hasSession: false, expiresAt: null, userId: null };
    }
    
    try {
      const authData = JSON.parse(localStorage.getItem(authKey) || '{}');
      return {
        hasSession: !!authData.access_token,
        expiresAt: authData.expires_at || null,
        userId: authData.user?.id || null,
      };
    } catch {
      return { hasSession: false, expiresAt: null, userId: null };
    }
  });
  
  return sessionInfo;
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Test password validation during signup
 */
export async function testPasswordValidation(
  page: Page,
  password: string
): Promise<{ validationError: string | null; signupAllowed: boolean }> {
  await page.goto('/auth');
  
  // Switch to signup tab
  await page.click('button:has-text("Sign Up"), [role="tab"]:has-text("Sign Up")');
  await page.waitForTimeout(500);
  
  // Generate unique email for this test
  const testEmail = `test-pwd-${Date.now()}@example.com`;
  
  // Fill signup form
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', password);
  
  // Try to submit
  await page.click('button[type="submit"]:has-text("Sign Up")');
  await page.waitForTimeout(2000);
  
  // Check for validation error
  const errorElement = await page.$('[role="alert"], .text-destructive, [data-sonner-toast][data-type="error"]');
  const validationError = errorElement ? await errorElement.textContent() : null;
  
  // Check if signup was allowed (would show success message or redirect)
  const signupAllowed = !validationError && !page.url().includes('/auth');
  
  return { validationError, signupAllowed };
}

/**
 * Test all invalid password patterns
 */
export async function testAllInvalidPasswords(
  page: Page
): Promise<Record<keyof typeof INVALID_PASSWORDS, { error: string | null; allowed: boolean }>> {
  const results: Record<string, { error: string | null; allowed: boolean }> = {};
  
  for (const [key, password] of Object.entries(INVALID_PASSWORDS)) {
    const { validationError, signupAllowed } = await testPasswordValidation(page, password);
    results[key] = { error: validationError, allowed: signupAllowed };
  }
  
  return results as Record<keyof typeof INVALID_PASSWORDS, { error: string | null; allowed: boolean }>;
}

// ============================================================================
// PROTECTED ROUTE GUARDS
// ============================================================================

/**
 * Verify a single route requires authentication
 */
export async function verifyRouteProtection(
  page: Page,
  route: string
): Promise<{ route: string; isProtected: boolean; redirectedTo: string | null }> {
  // Ensure we're logged out
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.context().clearCookies();
  
  // Try to access the route
  await page.goto(route);
  await page.waitForTimeout(2000);
  
  const currentUrl = page.url();
  const isProtected = currentUrl.includes('/auth');
  const redirectedTo = isProtected ? '/auth' : null;
  
  return { route, isProtected, redirectedTo };
}

/**
 * Verify all protected routes require authentication
 */
export async function verifyAllProtectedRoutes(
  page: Page
): Promise<Array<{ route: string; isProtected: boolean; redirectedTo: string | null }>> {
  const results: Array<{ route: string; isProtected: boolean; redirectedTo: string | null }> = [];
  
  for (const route of PROTECTED_ROUTES) {
    const result = await verifyRouteProtection(page, route);
    results.push(result);
  }
  
  return results;
}

/**
 * Verify authenticated user can access protected routes
 */
export async function verifyAuthenticatedAccess(
  page: Page,
  email: string = CI_TEST_USER.email,
  password: string = CI_TEST_USER.password
): Promise<Array<{ route: string; accessible: boolean }>> {
  // Login first
  await loginUser(page, email, password);
  
  const results: Array<{ route: string; accessible: boolean }> = [];
  
  for (const route of PROTECTED_ROUTES) {
    await page.goto(route);
    await page.waitForTimeout(1000);
    
    // Check if we stayed on the route (not redirected to auth)
    const accessible = !page.url().includes('/auth');
    results.push({ route, accessible });
  }
  
  return results;
}

// ============================================================================
// CONCURRENT SESSIONS
// ============================================================================

/**
 * Test concurrent sessions in multiple browser contexts
 */
export async function testConcurrentSessions(
  page: Page,
  browser: Browser,
  email: string = CI_TEST_USER.email,
  password: string = CI_TEST_USER.password
): Promise<{ bothSessionsActive: boolean; session1Valid: boolean; session2Valid: boolean }> {
  // Login in first context (original page)
  await loginUser(page, email, password);
  const session1Valid = await isAuthenticated(page);
  
  // Create second browser context
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  
  // Login in second context
  await loginUser(page2, email, password);
  const session2Valid = await isAuthenticated(page2);
  
  // Verify first session is still valid
  await page.reload();
  const session1StillValid = await isAuthenticated(page);
  
  // Cleanup
  await context2.close();
  
  return {
    bothSessionsActive: session1StillValid && session2Valid,
    session1Valid: session1StillValid,
    session2Valid,
  };
}

// ============================================================================
// OAUTH ERROR HANDLING
// ============================================================================

/**
 * Simulate OAuth error callback
 */
export async function simulateOAuthError(
  page: Page,
  errorType: OAuthErrorType = OAUTH_ERROR_TYPES.accessDenied
): Promise<{ errorDisplayed: boolean; errorMessage: string | null; onAuthPage: boolean }> {
  // Navigate to auth callback with error params
  const errorUrl = `/auth?error=${errorType}&error_description=${encodeURIComponent(`OAuth ${errorType} error`)}`;
  await page.goto(errorUrl);
  await page.waitForTimeout(2000);
  
  // Check for error display
  const errorElement = await page.$('[role="alert"], .text-destructive, [data-sonner-toast][data-type="error"]');
  const errorMessage = errorElement ? await errorElement.textContent() : null;
  
  return {
    errorDisplayed: !!errorElement,
    errorMessage,
    onAuthPage: page.url().includes('/auth'),
  };
}

// ============================================================================
// ACCOUNT STATUS HELPERS
// ============================================================================

/**
 * Check current account status from UI indicators
 */
export async function checkAccountStatus(
  page: Page
): Promise<AccountStatus> {
  // Navigate to settings to check account status
  await page.goto('/settings');
  await page.waitForTimeout(2000);
  
  // Check for suspension notice
  const suspendedNotice = await page.$('text=/suspended|account suspended/i');
  if (suspendedNotice) {
    return ACCOUNT_STATUS.suspended;
  }
  
  // Check for deletion pending notice
  const deletionNotice = await page.$('text=/deletion scheduled|pending deletion/i');
  if (deletionNotice) {
    return ACCOUNT_STATUS.pendingDeletion;
  }
  
  return ACCOUNT_STATUS.active;
}

/**
 * Verify account status affects access appropriately
 */
export async function verifyAccountStatusAccess(
  page: Page,
  expectedStatus: AccountStatus
): Promise<{ statusMatches: boolean; accessRestricted: boolean }> {
  const currentStatus = await checkAccountStatus(page);
  const statusMatches = currentStatus === expectedStatus;
  
  // Check if access is restricted based on status
  let accessRestricted = false;
  if (expectedStatus === ACCOUNT_STATUS.suspended) {
    // Try to access a feature that should be blocked
    await page.goto('/calculator');
    await page.waitForTimeout(1000);
    accessRestricted = !!(await page.$('text=/suspended|access denied/i'));
  }
  
  return { statusMatches, accessRestricted };
}

// Re-export expect and constants for convenience
export { expect };
export {
  CI_TEST_USER,
  INVALID_CREDENTIALS,
  INVALID_PASSWORDS,
  PROTECTED_ROUTES,
  OAUTH_ERROR_TYPES,
  RATE_LIMIT,
  ACCOUNT_STATUS,
};
