// Shared request validation utilities for public edge functions
// Provides payload validation, honeypot detection, and abuse prevention

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  suspicious?: boolean;
}

// Honeypot field names that bots typically fill
const HONEYPOT_FIELDS = ['website', 'url', 'phone_number', 'fax', 'company_url'];

// Suspicious patterns in payloads
const SUSPICIOUS_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:text\/html/i,
  /\x00/,  // Null bytes
  /eval\s*\(/i,
  /document\.(cookie|location|write)/i,
];

// Maximum payload sizes (in bytes)
const MAX_PAYLOAD_SIZE = 50000; // 50KB
const MAX_STRING_LENGTH = 10000;
const MAX_ARRAY_LENGTH = 100;

/**
 * Validates payload size
 */
export function validatePayloadSize(payload: unknown): ValidationResult {
  const size = JSON.stringify(payload).length;
  if (size > MAX_PAYLOAD_SIZE) {
    return { valid: false, reason: 'Payload too large' };
  }
  return { valid: true };
}

/**
 * Checks for honeypot fields in payload
 * Returns suspicious if honeypot fields are filled (bots often fill hidden fields)
 */
export function checkHoneypot(payload: Record<string, unknown>): ValidationResult {
  for (const field of HONEYPOT_FIELDS) {
    if (payload[field] && String(payload[field]).trim().length > 0) {
      return { valid: true, suspicious: true, reason: `Honeypot field filled: ${field}` };
    }
  }
  return { valid: true, suspicious: false };
}

/**
 * Checks for suspicious patterns in string values
 */
export function checkSuspiciousPatterns(value: string): ValidationResult {
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(value)) {
      return { valid: false, reason: 'Suspicious content detected' };
    }
  }
  return { valid: true };
}

/**
 * Validates string length
 */
export function validateStringLength(value: string, maxLength = MAX_STRING_LENGTH): ValidationResult {
  if (value.length > maxLength) {
    return { valid: false, reason: `String exceeds maximum length of ${maxLength}` };
  }
  return { valid: true };
}

/**
 * Validates array length
 */
export function validateArrayLength(arr: unknown[], maxLength = MAX_ARRAY_LENGTH): ValidationResult {
  if (arr.length > maxLength) {
    return { valid: false, reason: `Array exceeds maximum length of ${maxLength}` };
  }
  return { valid: true };
}

/**
 * Deep validates an object for suspicious content
 */
export function deepValidate(obj: unknown, depth = 0): ValidationResult {
  // Prevent stack overflow from deeply nested objects
  if (depth > 10) {
    return { valid: false, reason: 'Object nesting too deep' };
  }

  if (typeof obj === 'string') {
    const lengthCheck = validateStringLength(obj);
    if (!lengthCheck.valid) return lengthCheck;
    
    const patternCheck = checkSuspiciousPatterns(obj);
    if (!patternCheck.valid) return patternCheck;
  }

  if (Array.isArray(obj)) {
    const lengthCheck = validateArrayLength(obj);
    if (!lengthCheck.valid) return lengthCheck;
    
    for (const item of obj) {
      const result = deepValidate(item, depth + 1);
      if (!result.valid) return result;
    }
  }

  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const keys = Object.keys(obj);
    if (keys.length > 100) {
      return { valid: false, reason: 'Too many object keys' };
    }
    
    for (const key of keys) {
      const keyCheck = checkSuspiciousPatterns(key);
      if (!keyCheck.valid) return keyCheck;
      
      const result = deepValidate((obj as Record<string, unknown>)[key], depth + 1);
      if (!result.valid) return result;
    }
  }

  return { valid: true };
}

/**
 * Full payload validation with all checks
 */
export function validateRequest(payload: unknown): ValidationResult & { honeypotTriggered?: boolean } {
  // Size check
  const sizeCheck = validatePayloadSize(payload);
  if (!sizeCheck.valid) return sizeCheck;

  // Deep validation
  const deepCheck = deepValidate(payload);
  if (!deepCheck.valid) return deepCheck;

  // Honeypot check (only for objects)
  let honeypotTriggered = false;
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const honeypotCheck = checkHoneypot(payload as Record<string, unknown>);
    honeypotTriggered = honeypotCheck.suspicious ?? false;
  }

  return { valid: true, honeypotTriggered };
}

/**
 * Rate limit configuration for public endpoints
 */
export const PUBLIC_RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 50, // 50 requests per hour per IP
};
