/**
 * Central constants file for the application
 * Replaces magic numbers throughout the codebase
 */

// ============================================================================
// COMPANY INFORMATION
// ============================================================================

/**
 * Official Australian Business Number for United Facade Pty Ltd
 * Format: XX XXX XXX XXX (validated using ATO checksum algorithm)
 * @see https://abr.business.gov.au/
 */
export const COMPANY_ABN = '67 652 069 139' as const;

/**
 * Company legal name as registered with ASIC
 */
export const COMPANY_LEGAL_NAME = 'United Facade Pty Ltd' as const;

/**
 * Product/brand name
 */
export const PRODUCT_NAME = 'CarbonConstruct' as const;

/**
 * Company contact email
 */
export const COMPANY_EMAIL = 'contact@carbonconstruct.com.au' as const;

/**
 * Company location
 */
export const COMPANY_LOCATION = 'Sydney, Australia' as const;

/**
 * Data residency region (for compliance statements)
 */
export const DATA_RESIDENCY_REGION = 'ap-southeast-2' as const;

// ============================================================================
// ABN VALIDATION
// ============================================================================

/**
 * Validates an Australian Business Number using the official ATO checksum algorithm
 * @param abn - The ABN to validate (with or without spaces)
 * @returns Object containing validity status and formatted ABN
 */
export function validateABN(abn: string): {
  isValid: boolean;
  formatted: string;
  error?: string;
} {
  const digits = abn.replace(/\D/g, '');
  
  if (digits.length !== 11) {
    return { isValid: false, formatted: abn, error: 'ABN must be exactly 11 digits' };
  }
  
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const abnDigits = digits.split('').map((d, i) => {
    const num = parseInt(d, 10);
    return i === 0 ? num - 1 : num;
  });
  
  const sum = abnDigits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  const isValid = sum % 89 === 0;
  const formatted = `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
  
  return { isValid, formatted, error: isValid ? undefined : 'Invalid ABN checksum' };
}

/**
 * Formats an ABN string to the standard XX XXX XXX XXX format
 */
export function formatABN(abn: string): string {
  const digits = abn.replace(/\D/g, '');
  if (digits.length !== 11) return abn;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
}

// ============================================================================
// LIMITS & THRESHOLDS
// ============================================================================

export const LIMITS = {
  MAX_MATERIALS_COMPARISON: 5,
  MAX_QUANTITY: 10000000,
  MAX_EMISSIONS: 100000000,
  MAX_PROJECT_NAME_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
} as const;

export const THRESHOLDS = {
  HOTSPOT_CRITICAL: 20, // percentage of total emissions
  HOTSPOT_HIGH: 10,
  HOTSPOT_MODERATE: 5,
} as const;

export const DEBOUNCE = {
  AUTO_SAVE: 2000, // 2 seconds
  AI_REQUEST: 5000, // 5 seconds
  REPORT_GENERATION: 3000, // 3 seconds
  USAGE_TRACKING: 500, // 500ms
} as const;

export const RETRY = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 100, // milliseconds
  MAX_DELAY: 5000,
  SUBSCRIPTION_CHECK_DELAY: 1000, // milliseconds - delay between subscription check retries
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
