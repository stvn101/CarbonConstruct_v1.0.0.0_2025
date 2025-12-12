// Re-export all fixtures for easy importing
export { 
  test, 
  expect, 
  isAuthenticated, 
  logout, 
  signUpUser,
  // Failed login handlers
  attemptLoginWithInvalidCredentials,
  attemptLoginWithMalformedEmail,
  // Rate limiting
  triggerRateLimitByFailedLogins,
  // Session management
  simulateSessionTimeout,
  simulateExpiredToken,
  getSessionInfo,
  // Password validation
  testPasswordValidation,
  testAllInvalidPasswords,
  // Protected route guards
  verifyRouteProtection,
  verifyAllProtectedRoutes,
  verifyAuthenticatedAccess,
  // Concurrent sessions
  testConcurrentSessions,
  // OAuth error handling
  simulateOAuthError,
  // Account status
  checkAccountStatus,
  verifyAccountStatusAccess,
} from './auth.fixture';

// Re-export auth constants
export {
  CI_TEST_USER,
  INVALID_CREDENTIALS,
  INVALID_PASSWORDS,
  PROTECTED_ROUTES,
  OAUTH_ERROR_TYPES,
  RATE_LIMIT,
  ACCOUNT_STATUS,
} from './auth.constants';

export { 
  TEST_MATERIALS, 
  addMaterial, 
  getEmissionsTotal, 
  clearAllMaterials, 
  goToCalculator,
  verifyCalculatorLoaded,
  setTransportData,
  verifyCalculationPersisted
} from './calculator.fixture';
export {
  goToReports,
  verifyReportsLoaded,
  generatePDFReport,
  getComplianceStatus,
  verifyLifecycleStages,
  getEmissionsBreakdown,
  setProjectDetails
} from './reports.fixture';

// Common test utilities
export async function waitForNetworkIdle(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

export async function clearLocalStorage(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

export async function setLocalStorageItem(
  page: import('@playwright/test').Page, 
  key: string, 
  value: string
): Promise<void> {
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value]);
}

export async function getLocalStorageItem(
  page: import('@playwright/test').Page, 
  key: string
): Promise<string | null> {
  return await page.evaluate((k) => localStorage.getItem(k), key);
}

// Screenshot helpers for debugging
export async function takeDebugScreenshot(
  page: import('@playwright/test').Page, 
  name: string
): Promise<void> {
  await page.screenshot({ path: `./e2e/debug-screenshots/${name}.png`, fullPage: true });
}

// Wait for toast/notification
export async function waitForToast(
  page: import('@playwright/test').Page, 
  text?: string
): Promise<void> {
  const toastSelector = text 
    ? `[role="alert"]:has-text("${text}"), .toast:has-text("${text}")`
    : '[role="alert"], .toast, [data-sonner-toast]';
  
  await page.waitForSelector(toastSelector, { timeout: 5000 }).catch(() => {
    // Toast may not appear, which is okay
  });
}

// Responsive viewport helpers
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  largeDesktop: { width: 1920, height: 1080 },
};

export async function setViewport(
  page: import('@playwright/test').Page, 
  viewport: keyof typeof VIEWPORTS
): Promise<void> {
  await page.setViewportSize(VIEWPORTS[viewport]);
}
