import DOMPurify from 'dompurify';

// Maximum lengths for different field types
export const MAX_LENGTHS = {
  NAME: 200,
  DESCRIPTION: 2000,
  NOTES: 5000,
  CATEGORY: 100,
  UNIT: 50,
  SOURCE: 200,
} as const;

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize plain text input by trimming and limiting length
 */
export function sanitizeText(
  text: string,
  maxLength: number = MAX_LENGTHS.DESCRIPTION
): string {
  if (!text) return '';
  
  // Trim whitespace
  let sanitized = text.trim();
  
  // Remove any HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(
  value: any,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): number {
  const num = parseFloat(value);
  
  if (isNaN(num)) return 0;
  if (num < min) return min;
  if (num > max) return max;
  
  return num;
}

/**
 * Sanitize material name for safe storage and display
 */
export function sanitizeMaterialName(name: string): string {
  return sanitizeText(name, MAX_LENGTHS.NAME);
}

/**
 * Sanitize CSV data for safe export
 */
export function sanitizeCsvField(field: string): string {
  if (!field) return '';
  
  // Convert to string and trim
  let sanitized = String(field).trim();
  
  // Escape double quotes by doubling them
  sanitized = sanitized.replace(/"/g, '""');
  
  // Wrap in quotes if contains comma, newline, or quote
  if (sanitized.includes(',') || sanitized.includes('\n') || sanitized.includes('"')) {
    sanitized = `"${sanitized}"`;
  }
  
  return sanitized;
}

/**
 * Sanitize category/subcategory names
 */
export function sanitizeCategory(category: string): string {
  return sanitizeText(category, MAX_LENGTHS.CATEGORY);
}

/**
 * Validate and sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  // Remove any path traversal attempts
  let sanitized = fileName.replace(/\.\./g, '');
  
  // Remove special characters except for dots, dashes, and underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const nameWithoutExt = sanitized.substring(0, 250 - (ext?.length || 0));
    sanitized = `${nameWithoutExt}.${ext}`;
  }
  
  return sanitized;
}
