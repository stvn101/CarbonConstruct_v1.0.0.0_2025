// CI Test User Credentials - Use environment variables in CI
export const CI_TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test-ci@carbonconstruct.com.au',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
};

// Invalid credentials for testing failure scenarios
export const INVALID_CREDENTIALS = {
  nonexistentEmail: 'nonexistent-user@carbonconstruct.com.au',
  wrongPassword: 'WrongPassword999!',
  malformedEmail: 'not-an-email',
  emptyEmail: '',
  emptyPassword: '',
};

// Invalid password patterns for validation testing
export const INVALID_PASSWORDS = {
  tooShort: 'Ab1!',
  noUppercase: 'password123!',
  noLowercase: 'PASSWORD123!',
  noNumber: 'Password!@#',
  noSpecial: 'Password123',
  tooLong: 'A'.repeat(100) + '1!a',
  commonPassword: 'Password1!',
};

// Valid password for successful tests
export const VALID_PASSWORD = 'SecureP@ssw0rd2024!';

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  '/calculator',
  '/reports',
  '/settings',
  '/admin',
  '/impact',
] as const;

// Public routes accessible without authentication
export const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/pricing',
  '/demo',
  '/help',
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-policy',
  '/accessibility',
] as const;

// OAuth error types for testing
export const OAUTH_ERROR_TYPES = {
  accessDenied: 'access_denied',
  invalidRequest: 'invalid_request',
  serverError: 'server_error',
  temporarilyUnavailable: 'temporarily_unavailable',
} as const;

// Rate limiting constants
export const RATE_LIMIT = {
  maxFailedAttempts: 5,
  lockoutDurationMs: 60000, // 1 minute
};

// Session timeout constants
export const SESSION = {
  timeoutMs: 3600000, // 1 hour
  refreshThresholdMs: 300000, // 5 minutes before expiry
};

// Account status types
export const ACCOUNT_STATUS = {
  active: 'active',
  suspended: 'suspended',
  pendingDeletion: 'pending_deletion',
} as const;

export type AccountStatus = typeof ACCOUNT_STATUS[keyof typeof ACCOUNT_STATUS];
export type OAuthErrorType = typeof OAUTH_ERROR_TYPES[keyof typeof OAUTH_ERROR_TYPES];
