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
    // Disallow data-* attributes and data: URIs for stricter XSS protection
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
  // For CSS content, delegate sanitization to DOMPurify's built-in
  // CSS sanitizer by using a temporary <style> element. This avoids
  // brittle regex-based filtering and handles obfuscated payloads.

  // In non-browser environments (e.g. SSR), fall back to a conservative,
  // minimal pattern removal instead of attempting DOM-based sanitization.
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    let fallback = css;

    // Remove @import to prevent loading external stylesheets
    fallback = fallback.replace(/@import\s+[^;]+;?/gi, '');

    // Strip obvious expression() usages
    fallback = fallback.replace(/expression\s*\([^)]*\)/gi, '');

    // Neutralise javascript: URLs inside url(...)
    fallback = fallback.replace(
      /url\(\s*(['"])?\s*javascript:[^)]*\)/gi,
      'url()',
    );

    // Remove legacy behavior and -moz-binding properties
    fallback = fallback.replace(/behavior\s*:[^;]*;?/gi, '');
    fallback = fallback.replace(/-moz-binding\s*:[^;]*;?/gi, '');

    return fallback;
  }

  // Browser path: use a real <style> element so DOMPurify can apply
  // its CSS sanitization logic.
  const container = document.createElement('div');
  const styleElement = document.createElement('style');
  styleElement.textContent = css;
  container.appendChild(styleElement);

  const sanitizedContainer = DOMPurify.sanitize(container, {
    RETURN_DOM: true,
    WHOLE_DOCUMENT: false,
  }) as HTMLElement;

  const sanitizedStyle = sanitizedContainer.querySelector('style');
  let sanitizedCss = sanitizedStyle?.textContent ?? '';

  // Additional CSS-specific hardening (defense in depth)
  // Remove @import to prevent loading external stylesheets
  sanitizedCss = sanitizedCss.replace(/@import\s+[^;]+;?/gi, '');

  // Remove behavior properties (IE-specific XSS vector)
  sanitizedCss = sanitizedCss.replace(/behavior\s*:[^;]*;?/gi, '');

  // Remove -moz-binding (Firefox XSS vector)
  sanitizedCss = sanitizedCss.replace(/-moz-binding\s*:[^;]*;?/gi, '');

  return sanitizedCss;
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
    'blob:',
    'filesystem:',
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

  // For all other cases, treat the URL as unsafe and return an empty string
  return '';
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
