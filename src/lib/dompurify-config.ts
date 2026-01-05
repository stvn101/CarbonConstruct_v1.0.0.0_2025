/**
 * DOMPurify Configuration for XSS Prevention
 * 
 * This module provides centralized sanitization functions for HTML and CSS content
 * to prevent Cross-Site Scripting (XSS) attacks throughout the application.
 * 
 * @see .github/instructions/security.instructions.md for security guidelines
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content with strict security rules
 * 
 * Allowed tags are limited to safe formatting and structural elements.
 * All scripts, event handlers, and dangerous attributes are stripped.
 * 
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML safe for rendering with dangerouslySetInnerHTML
 * 
 * @example
 * ```typescript
 * const userHtml = '<p>Safe content</p><script>alert("xss")</script>';
 * const safe = sanitizeHtml(userHtml);
 * // Returns: '<p>Safe content</p>'
 * ```
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    // Allow only safe HTML tags
    ALLOWED_TAGS: [
      // Text formatting
      'b', 'i', 'em', 'strong', 'u', 's', 'sup', 'sub', 'mark', 'small',
      // Structure
      'p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      // Lists
      'ul', 'ol', 'li', 'dl', 'dt', 'dd',
      // Tables
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'col', 'colgroup',
      // Links (href sanitized by DOMPurify)
      'a',
      // Images (src sanitized by DOMPurify)
      'img',
      // Block elements
      'blockquote', 'pre', 'code', 'hr',
    ],
    // Allow only safe attributes
    ALLOWED_ATTR: [
      // General
      'class', 'id', 'title', 'style',
      // Links
      'href', 'target', 'rel',
      // Images
      'src', 'alt', 'width', 'height',
      // Tables
      'colspan', 'rowspan', 'scope',
      // Accessibility
      'aria-label', 'aria-labelledby', 'aria-describedby', 'role',
    ],
    // Forbid dangerous tags
    FORBID_TAGS: [
      'script', 'style', 'iframe', 'object', 'embed', 'applet', 'base',
      'link', 'meta', 'form', 'input', 'button', 'select', 'textarea',
    ],
    // Forbid event handlers
    FORBID_ATTR: [
      'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
      'onmouseenter', 'onmouseleave', 'onfocus', 'onblur', 'onchange',
      'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress',
    ],
    // Keep type information for TypeScript
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    // Allow data URIs only for images
    ALLOW_DATA_ATTR: false,
    // Safe defaults
    KEEP_CONTENT: true,
    // Force body context
    FORCE_BODY: false,
    // Sanitize DOM
    SANITIZE_DOM: true,
    // Use a safe parser
    USE_PROFILES: { html: true },
  });
}

/**
 * Sanitizes CSS content for safe injection into style tags
 * 
 * This function provides defense-in-depth for dynamically generated CSS.
 * While CSS variables from trusted sources are generally safe, this adds
 * an extra layer of protection against potential CSS injection attacks.
 * 
 * @param css - Raw CSS string to sanitize
 * @returns Sanitized CSS safe for use in style tags
 * 
 * @example
 * ```typescript
 * const chartCss = '.chart { color: var(--primary); }';
 * const safeCss = sanitizeCss(chartCss);
 * // Returns sanitized CSS with dangerous patterns removed
 * ```
 */
export function sanitizeCss(css: string): string {
  // For CSS content, we use a more permissive configuration
  // since we're primarily dealing with CSS variables and chart styles
  // DOMPurify will strip any JavaScript or dangerous patterns
  
  // Remove any potential script tags or event handlers that might have been
  // embedded in CSS (defense in depth)
  let sanitized = css
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/expression\s*\(/gi, '');
  
  // Use DOMPurify to sanitize any HTML-like content
  // This handles edge cases where HTML might be mixed with CSS
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    ALLOW_DATA_ATTR: false,
    SANITIZE_DOM: true,
  });
  
  // Additional CSS-specific sanitization
  // Remove @import to prevent loading external stylesheets
  sanitized = sanitized.replace(/@import\s+/gi, '');
  
  // Remove behavior properties (IE-specific XSS vector)
  sanitized = sanitized.replace(/behavior\s*:/gi, '');
  
  // Remove -moz-binding (Firefox XSS vector)
  sanitized = sanitized.replace(/-moz-binding\s*:/gi, '');
  
  return sanitized;
}

/**
 * Sanitizes a URL to ensure it's safe for use in href or src attributes
 * 
 * @param url - URL string to sanitize
 * @returns Sanitized URL or empty string if URL is dangerous
 * 
 * @example
 * ```typescript
 * const url = sanitizeUrl('https://example.com');
 * // Safe URL returned as-is
 * 
 * const dangerous = sanitizeUrl('javascript:alert(1)');
 * // Returns: ''
 * ```
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  
  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ];
  
  const lowerUrl = trimmed.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '';
    }
  }
  
  // Allow http, https, mailto, tel, and relative URLs
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('?')
  ) {
    return trimmed;
  }
  
  // For other cases, use DOMPurify's URL sanitization
  return DOMPurify.sanitize(trimmed, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Configure DOMPurify with global hooks for additional security
 * 
 * This function sets up DOMPurify hooks that run after sanitization
 * to provide additional security checks and modifications.
 */
export function configureDOMPurify(): void {
  // Add a hook to ensure external links open in a new tab with security attributes
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Set external links to open in new tab with security
    if (node.tagName === 'A') {
      const href = node.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer');
      }
    }
    
    // Ensure images have alt text for accessibility
    if (node.tagName === 'IMG' && !node.getAttribute('alt')) {
      node.setAttribute('alt', '');
    }
  });
}

// Initialize DOMPurify configuration on module load
if (typeof window !== 'undefined') {
  configureDOMPurify();
}
