/**
 * Tests for secure HTML to PDF conversion utility
 * 
 * Priority 1 - Critical Security & Business Logic
 * Tests secure PDF generation with sanitization and validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  sanitizeFilename, 
  generateSecurePDF, 
  generateSecurePDFBlob,
  type SecurePDFOptions 
} from '../secure-html-to-pdf';

// Mock html2pdf.js
vi.mock('html2pdf.js', () => {
  const mockHtml2pdf = vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn().mockResolvedValue(undefined),
    output: vi.fn().mockResolvedValue(new Blob(['mock pdf content'], { type: 'application/pdf' })),
  }));
  
  return {
    default: mockHtml2pdf,
  };
});

// Mock DOMPurify
vi.mock('../dompurify-config', () => ({
  sanitizeHtml: vi.fn((html: string) => {
    // Simple mock that removes script tags
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }),
}));

// Mock logger
vi.mock('../logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('secure-html-to-pdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any created elements
    const testElements = document.querySelectorAll('[id^="test-"]');
    testElements.forEach(el => el.remove());
  });

  // Helper function to create element with dimensions
  function createElementWithDimensions(id: string, content: string, width = 100, height = 100): HTMLElement {
    const element = document.createElement('div');
    element.id = id;
    element.innerHTML = content;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    document.body.appendChild(element);
    
    // Mock offsetWidth and offsetHeight since JSDOM doesn't compute layout
    Object.defineProperty(element, 'offsetWidth', {
      configurable: true,
      value: width,
    });
    Object.defineProperty(element, 'offsetHeight', {
      configurable: true,
      value: height,
    });
    
    return element;
  }

  describe('sanitizeFilename', () => {
    it('should_RemoveUnsafeCharacters_When_FilenameContainsSpecialChars', () => {
      const result = sanitizeFilename('My Report <script>.pdf');
      expect(result).toBe('my-report-script.pdf');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should_RemovePathSeparators_When_FilenameContainsPaths', () => {
      const result = sanitizeFilename('../../../etc/passwd.pdf');
      expect(result).toBe('etcpasswd.pdf');
      expect(result).not.toContain('/');
      expect(result).not.toContain('\\');
      expect(result).not.toContain('..');
    });

    it('should_AddPdfExtension_When_FilenameHasNoExtension', () => {
      const result = sanitizeFilename('report');
      expect(result).toBe('report.pdf');
    });

    it('should_NormalizePdfExtension_When_FilenameHasPDFInUpperCase', () => {
      const result = sanitizeFilename('REPORT.PDF');
      expect(result).toBe('report.pdf');
    });

    it('should_RemoveMultipleDashes_When_FilenameHasConsecutiveDashes', () => {
      const result = sanitizeFilename('my---report---name');
      expect(result).toBe('my-report-name.pdf');
      expect(result).not.toMatch(/--/);
    });

    it('should_TrimDashes_When_FilenameStartsOrEndsWithDashes', () => {
      const result = sanitizeFilename('---report---');
      expect(result).toBe('report.pdf');
    });

    it('should_HandleEmptyFilename_When_InputIsEmpty', () => {
      const result = sanitizeFilename('');
      expect(result).toBe('document.pdf');
    });

    it('should_PreserveValidCharacters_When_FilenameIsValid', () => {
      const result = sanitizeFilename('carbon-report-2024.pdf');
      expect(result).toBe('carbon-report-2024.pdf');
    });

    it('should_ReplaceSpaces_When_FilenameContainsSpaces', () => {
      const result = sanitizeFilename('Carbon Report 2024.pdf');
      expect(result).toBe('carbon-report-2024.pdf');
      expect(result).not.toContain(' ');
    });
  });

  describe('generateSecurePDF', () => {
    it('should_GeneratePDF_When_ValidElementProvided', async () => {
      // Arrange
      createElementWithDimensions('test-pdf-content', '<p>Test content</p>');

      const options: SecurePDFOptions = {
        filename: 'test-report.pdf',
        margin: [10, 10, 10, 10],
      };

      // Act
      const result = await generateSecurePDF('test-pdf-content', options);

      // Assert
      expect(result.success).toBe(true);
      expect(result.filename).toBe('test-report.pdf');
      expect(result.error).toBeUndefined();
    });

    it('should_ReturnError_When_ElementNotFound', async () => {
      // Act
      const result = await generateSecurePDF('non-existent-element');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should_ReturnError_When_ElementHasZeroDimensions', async () => {
      // Arrange
      const element = document.createElement('div');
      element.id = 'test-zero-dimensions';
      element.innerHTML = '<p>Test content</p>';
      // Don't set dimensions - will be 0x0
      document.body.appendChild(element);

      // Act
      const result = await generateSecurePDF('test-zero-dimensions');

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('zero dimensions');
    });

    it('should_SanitizeFilename_When_UnsafeFilenameProvided', async () => {
      // Arrange
      createElementWithDimensions('test-sanitize-filename', '<p>Test content</p>');

      const options: SecurePDFOptions = {
        filename: '../../../evil/path.pdf',
      };

      // Act
      const result = await generateSecurePDF('test-sanitize-filename', options);

      // Assert
      expect(result.success).toBe(true);
      expect(result.filename).not.toContain('/');
      expect(result.filename).not.toContain('..');
    });

    it('should_UseDefaultFilename_When_NoFilenameProvided', async () => {
      // Arrange
      createElementWithDimensions('test-default-filename', '<p>Test content</p>');

      // Act
      const result = await generateSecurePDF('test-default-filename');

      // Assert
      expect(result.success).toBe(true);
      expect(result.filename).toMatch(/document-\d+\.pdf/);
    });

    it('should_AcceptHTMLElement_When_ElementPassedDirectly', async () => {
      // Arrange
      const element = createElementWithDimensions('test-direct-element', '<p>Test content</p>');

      // Act
      const result = await generateSecurePDF(element);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should_ValidateMarginArray_When_InvalidMarginProvided', async () => {
      // Arrange
      const element = createElementWithDimensions('test-invalid-margin', '<p>Test content</p>');

      const options: SecurePDFOptions = {
        margin: [10, 10, 10] as any, // Invalid - only 3 elements
      };

      // Act
      const result = await generateSecurePDF('test-invalid-margin', options);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Margin array must have exactly 4 elements');
    });

    it('should_ValidateImageQuality_When_OutOfRangeQualityProvided', async () => {
      // Arrange
      const element = createElementWithDimensions('test-invalid-quality', '<p>Test content</p>');

      const options: SecurePDFOptions = {
        image: { type: 'jpeg', quality: 1.5 }, // Invalid - must be 0-1
      };

      // Act
      const result = await generateSecurePDF('test-invalid-quality', options);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Image quality must be between 0 and 1');
    });

    it('should_ValidateScale_When_InvalidScaleProvided', async () => {
      // Arrange
      const element = createElementWithDimensions('test-invalid-scale', '<p>Test content</p>');

      const options: SecurePDFOptions = {
        html2canvas: { scale: 10 }, // Invalid - must be 0-4
      };

      // Act
      const result = await generateSecurePDF('test-invalid-scale', options);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('html2canvas scale must be between 0 and 4');
    });

    it('should_SanitizeContent_When_SanitizeOptionIsTrue', async () => {
      // Arrange
      const { sanitizeHtml } = await import('../dompurify-config');
      vi.clearAllMocks();
      
      const element = createElementWithDimensions('test-sanitize-content', '<p>Safe</p><script>alert("xss")</script>');

      const options: SecurePDFOptions = {
        sanitize: true,
      };

      // Act
      await generateSecurePDF('test-sanitize-content', options);

      // Assert
      expect(sanitizeHtml).toHaveBeenCalled();
    });

    it('should_SkipSanitization_When_SanitizeOptionIsFalse', async () => {
      // Arrange
      const { sanitizeHtml } = await import('../dompurify-config');
      vi.clearAllMocks();
      
      const element = createElementWithDimensions('test-no-sanitize', '<p>Content</p>');

      const options: SecurePDFOptions = {
        sanitize: false,
      };

      // Act
      await generateSecurePDF('test-no-sanitize', options);

      // Assert
      // sanitizeHtml should not be called when sanitize is false
      expect(sanitizeHtml).not.toHaveBeenCalled();
    });
  });

  describe('generateSecurePDFBlob', () => {
    it('should_GenerateBlob_When_ValidElementProvided', async () => {
      // Arrange
      const element = createElementWithDimensions('test-blob-content', '<p>Test content</p>');

      // Act
      const blob = await generateSecurePDFBlob('test-blob-content');

      // Assert
      expect(blob).not.toBeNull();
      expect(blob).toBeInstanceOf(Blob);
      if (blob) {
        expect(blob.size).toBeGreaterThan(0);
      }
    });

    it('should_ReturnNull_When_ElementNotFound', async () => {
      // Act
      const blob = await generateSecurePDFBlob('non-existent-element');

      // Assert
      expect(blob).toBeNull();
    });

    it('should_ReturnNull_When_ElementHasZeroDimensions', async () => {
      // Arrange
      const element = document.createElement('div');
      element.id = 'test-blob-zero-dimensions';
      element.innerHTML = '<p>Test content</p>';
      document.body.appendChild(element);

      // Act
      const blob = await generateSecurePDFBlob('test-blob-zero-dimensions');

      // Assert
      expect(blob).toBeNull();
    });

    it('should_AcceptHTMLElement_When_ElementPassedDirectly', async () => {
      // Arrange
      const element = createElementWithDimensions('test-blob-direct', '<p>Test content</p>');

      // Act
      const blob = await generateSecurePDFBlob(element);

      // Assert
      expect(blob).not.toBeNull();
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should_SanitizeContent_When_SanitizeOptionIsTrue', async () => {
      // Arrange
      const { sanitizeHtml } = await import('../dompurify-config');
      vi.clearAllMocks();
      
      const element = createElementWithDimensions('test-blob-sanitize', '<p>Safe</p><script>alert("xss")</script>');

      // Act
      await generateSecurePDFBlob('test-blob-sanitize', { sanitize: true });

      // Assert
      expect(sanitizeHtml).toHaveBeenCalled();
    });

    it('should_ValidateOptions_When_InvalidOptionsProvided', async () => {
      // Arrange
      const element = createElementWithDimensions('test-blob-invalid-options', '<p>Test content</p>');

      // Act
      const blob = await generateSecurePDFBlob('test-blob-invalid-options', {
        image: { type: 'jpeg', quality: 2 }, // Invalid
      });

      // Assert
      expect(blob).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    it('should_HandleComplexHTML_When_MultipleElementsPresent', async () => {
      // Arrange
      const element = createElementWithDimensions('test-complex-html', `
        <h1>Report Title</h1>
        <table>
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
        </table>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="test" />
      `, 200, 200);

      // Act
      const result = await generateSecurePDF('test-complex-html', {
        filename: 'complex-report.pdf',
        margin: [15, 15, 15, 15],
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      });

      // Assert
      expect(result.success).toBe(true);
    });

    it('should_HandleLandscapeOrientation_When_OrientationIsLandscape', async () => {
      // Arrange
      const element = createElementWithDimensions('test-landscape', '<p>Wide content</p>', 300, 100);

      // Act
      const result = await generateSecurePDF('test-landscape', {
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      });

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
