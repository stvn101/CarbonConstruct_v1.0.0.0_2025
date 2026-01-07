/**
 * Secure HTML to PDF Conversion Utility
 * 
 * This module provides a centralized, secure wrapper for HTML to PDF conversion
 * using html2pdf.js with integrated content sanitization via DOMPurify.
 * 
 * Security Features:
 * - Sanitizes HTML content before PDF generation to prevent XSS
 * - Validates input elements and options
 * - Provides consistent error handling and logging
 * - Follows security best practices from dompurify-config.ts
 * 
 * @see .github/instructions/security.instructions.md for security guidelines
 */

import { sanitizeHtml } from './dompurify-config';
import { logger } from './logger';

/**
 * PDF generation options compatible with html2pdf.js
 */
export interface SecurePDFOptions {
  /** Output filename (will be sanitized) */
  filename?: string;
  /** Page margins in mm [top, right, bottom, left] */
  margin?: [number, number, number, number] | number;
  /** Image options for the PDF */
  image?: {
    type: 'jpeg' | 'png' | 'webp';
    quality: number;
  };
  /** html2canvas options */
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    [key: string]: unknown;
  };
  /** jsPDF options */
  jsPDF?: {
    unit: 'pt' | 'mm' | 'cm' | 'in';
    format: 'a4' | 'a3' | 'letter' | [number, number];
    orientation: 'portrait' | 'landscape';
    [key: string]: unknown;
  };
  /** Whether to sanitize HTML content (default: true) */
  sanitize?: boolean;
}

/**
 * Result of PDF generation operation
 */
export interface PDFGenerationResult {
  success: boolean;
  filename?: string;
  error?: string;
}

/**
 * Sanitizes a filename to prevent path traversal and other security issues
 * 
 * @param filename - Raw filename string
 * @returns Sanitized filename safe for file system use
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .trim()
    // Remove .pdf extension first (we'll add it back at the end)
    .replace(/\.pdf$/i, '')
    // Remove any path separators and dots at start (path traversal prevention)
    .replace(/[/\\]+/g, '')
    .replace(/^\.+/, '')
    // Replace unsafe characters with dashes (including angle brackets, but preserve extension dots temporarily)
    .replace(/[^a-z0-9._-]+/g, '-')
    // Remove dots that aren't part of a valid extension at the end
    .replace(/\.(?![a-z0-9]+$)/g, '-')
    // Remove multiple consecutive dashes
    .replace(/-+/g, '-')
    // Remove leading/trailing dashes and dots
    .replace(/^[-._]+|[-._]+$/g, '')
    // Add .pdf extension back
    + '.pdf';
}

/**
 * Validates PDF generation options
 * 
 * @param options - PDF options to validate
 * @throws Error if options are invalid
 */
function validateOptions(options: SecurePDFOptions): void {
  // Validate margin
  if (options.margin !== undefined) {
    if (Array.isArray(options.margin)) {
      if (options.margin.length !== 4) {
        throw new Error('Margin array must have exactly 4 elements');
      }
      if (!options.margin.every(m => typeof m === 'number' && m >= 0)) {
        throw new Error('Margin values must be non-negative numbers');
      }
    } else if (typeof options.margin !== 'number' || options.margin < 0) {
      throw new Error('Margin must be a non-negative number or array of 4 numbers');
    }
  }

  // Validate image quality
  if (options.image?.quality !== undefined) {
    if (typeof options.image.quality !== 'number' || 
        options.image.quality < 0 || 
        options.image.quality > 1) {
      throw new Error('Image quality must be between 0 and 1');
    }
  }

  // Validate scale
  if (options.html2canvas?.scale !== undefined) {
    if (typeof options.html2canvas.scale !== 'number' || 
        options.html2canvas.scale <= 0 || 
        options.html2canvas.scale > 4) {
      throw new Error('html2canvas scale must be greater than 0 and up to 4');
    }
  }
}

/**
 * Sanitizes HTML content within a DOM element
 * 
 * @param element - DOM element containing HTML to sanitize
 * @returns Sanitized element (modifies in place and returns)
 */
function sanitizeElementContent(element: HTMLElement): HTMLElement {
  // Get all text nodes and element content
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  const elementsToSanitize: HTMLElement[] = [];
  let currentNode = walker.currentNode as HTMLElement;
  
  while (currentNode) {
    elementsToSanitize.push(currentNode);
    currentNode = walker.nextNode() as HTMLElement;
  }

  // Sanitize each element's innerHTML
  elementsToSanitize.forEach((el) => {
    if (el.innerHTML) {
      el.innerHTML = sanitizeHtml(el.innerHTML);
    }
  });

  return element;
}

/**
 * Generates a PDF from an HTML element with security measures
 * 
 * This function:
 * 1. Validates the input element and options
 * 2. Optionally sanitizes HTML content to prevent XSS
 * 3. Uses html2pdf.js to generate the PDF
 * 4. Handles errors and logs security events
 * 
 * @param element - HTML element or element ID to convert to PDF
 * @param options - PDF generation options
 * @returns Promise resolving to generation result
 * 
 * @example
 * ```typescript
 * const result = await generateSecurePDF('report-content', {
 *   filename: 'carbon-report.pdf',
 *   margin: [10, 10, 10, 10],
 *   image: { type: 'jpeg', quality: 0.98 },
 *   html2canvas: { scale: 2, useCORS: true },
 *   jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
 * });
 * 
 * if (result.success) {
 *   console.log('PDF generated:', result.filename);
 * } else {
 *   console.error('PDF generation failed:', result.error);
 * }
 * ```
 */
export async function generateSecurePDF(
  element: HTMLElement | string,
  options: SecurePDFOptions = {}
): Promise<PDFGenerationResult> {
  const startTime = Date.now();
  
  try {
    // Import html2pdf.js dynamically
    const html2pdf = (await import('html2pdf.js')).default;

    // Validate options first
    validateOptions(options);

    // Resolve element
    let targetElement: HTMLElement | null;
    if (typeof element === 'string') {
      targetElement = document.getElementById(element);
      if (!targetElement) {
        throw new Error(`Element with ID "${element}" not found`);
      }
    } else {
      targetElement = element;
    }

    // Validate element has content
    if (!targetElement.offsetWidth || !targetElement.offsetHeight) {
      throw new Error('Element has zero dimensions - cannot generate PDF');
    }

    // Sanitize filename
    const filename = options.filename 
      ? sanitizeFilename(options.filename)
      : `document-${Date.now()}.pdf`;

    // Clone element to avoid modifying the original
    const clonedElement = targetElement.cloneNode(true) as HTMLElement;

    // Sanitize HTML content if enabled (default: true)
    if (options.sanitize !== false) {
      sanitizeElementContent(clonedElement);
      logger.info('pdf_content_sanitized', { filename });
    }

    // Build html2pdf options
    const html2pdfOptions = {
      margin: options.margin ?? 10,
      filename,
      image: options.image ?? { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: options.html2canvas ?? { scale: 2, useCORS: true },
      jsPDF: options.jsPDF ?? { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const 
      },
    };

    // Generate PDF
    await html2pdf()
      .set(html2pdfOptions)
      .from(clonedElement)
      .save();

    const duration = Date.now() - startTime;
    logger.info('pdf_generated_successfully', { 
      filename, 
      duration,
      sanitized: options.sanitize !== false
    });

    return {
      success: true,
      filename,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('pdf_generation_failed', { 
      error: errorMessage,
      duration,
      element: typeof element === 'string' ? element : 'HTMLElement',
      filename: options.filename
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Generates a PDF and returns it as a Blob instead of downloading
 * 
 * Useful for:
 * - Sending PDFs via email
 * - Uploading PDFs to storage
 * - Preview before download
 * 
 * @param element - HTML element or element ID to convert to PDF
 * @param options - PDF generation options (filename ignored)
 * @returns Promise resolving to PDF Blob or null on error
 */
export async function generateSecurePDFBlob(
  element: HTMLElement | string,
  options: Omit<SecurePDFOptions, 'filename'> = {}
): Promise<Blob | null> {
  try {
    const html2pdf = (await import('html2pdf.js')).default;

    // Validate options first
    validateOptions(options as SecurePDFOptions);

    // Resolve element
    let targetElement: HTMLElement | null;
    if (typeof element === 'string') {
      targetElement = document.getElementById(element);
      if (!targetElement) {
        throw new Error(`Element with ID "${element}" not found`);
      }
    } else {
      targetElement = element;
    }

    // Validate element has content
    if (!targetElement.offsetWidth || !targetElement.offsetHeight) {
      throw new Error('Element has zero dimensions - cannot generate PDF');
    }

    // Clone element to avoid modifying the original
    const clonedElement = targetElement.cloneNode(true) as HTMLElement;

    // Sanitize HTML content if enabled (default: true)
    if (options.sanitize !== false) {
      sanitizeElementContent(clonedElement);
    }

    // Build html2pdf options
    const html2pdfOptions = {
      margin: options.margin ?? 10,
      image: options.image ?? { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: options.html2canvas ?? { scale: 2, useCORS: true },
      jsPDF: options.jsPDF ?? { 
        unit: 'mm' as const, 
        format: 'a4' as const, 
        orientation: 'portrait' as const 
      },
    };

    // Generate PDF and get blob
    const pdf = await html2pdf()
      .set(html2pdfOptions)
      .from(clonedElement)
      .output('blob');

    logger.info('pdf_blob_generated_successfully', {
      size: pdf.size,
      sanitized: options.sanitize !== false
    });

    return pdf;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    logger.error('pdf_blob_generation_failed', { 
      error: errorMessage,
      element: typeof element === 'string' ? element : 'HTMLElement'
    });

    return null;
  }
}
