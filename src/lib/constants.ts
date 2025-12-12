/**
 * Central constants file for the application
 * Replaces magic numbers throughout the codebase
 */

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
