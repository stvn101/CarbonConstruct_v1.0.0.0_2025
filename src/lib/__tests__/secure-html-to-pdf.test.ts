/**
 * Integration tests for secure-html-to-pdf
 * Validates that the PDF generation replacement works correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import secureHtml2Pdf, { convertHtmlToPdf } from '../secure-html-to-pdf';

// Mock dependencies
vi.mock('html2canvas', () => ({
  default: vi.fn((_element) => {
    // Return a mock canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 800, 600);
    }
    return Promise.resolve(canvas);
  }),
}));

vi.mock('jspdf', () => {
  const mockJsPDF = function(this: any, _options?: any) {
    this.internal = {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
      getNumberOfPages: () => 1,
    };
    this.addImage = vi.fn();
    this.addPage = vi.fn();
    this.setPage = vi.fn();
    this.setFontSize = vi.fn();
    this.setTextColor = vi.fn();
    this.text = vi.fn();
    this.save = vi.fn();
    this.output = vi.fn((type: string) => {
      if (type === 'blob') return new Blob(['mock pdf'], { type: 'application/pdf' });
      if (type === 'datauristring') return 'data:application/pdf;base64,mock';
      if (type === 'arraybuffer') return new ArrayBuffer(8);
      return null;
    });
    return this;
  };
  
  return {
    jsPDF: mockJsPDF,
  };
});

describe('secure-html-to-pdf', () => {
  let testElement: HTMLDivElement;

  beforeEach(() => {
    // Create a test element
    testElement = document.createElement('div');
    testElement.innerHTML = '<h1>Test Content</h1><p>This is a test</p>';
    testElement.style.width = '800px';
    testElement.style.height = '600px';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('convertHtmlToPdf', () => {
    it('should_ConvertElementToPDF_When_ValidElementProvided', async () => {
      const pdf = await convertHtmlToPdf(testElement);
      expect(pdf).toBeDefined();
      expect(pdf.internal).toBeDefined();
    });

    it('should_UseDefaultOptions_When_NoOptionsProvided', async () => {
      const pdf = await convertHtmlToPdf(testElement);
      expect(pdf).toBeDefined();
    });

    it('should_AcceptCustomOptions_When_OptionsProvided', async () => {
      const pdf = await convertHtmlToPdf(testElement, {
        margin: 20,
        filename: 'custom.pdf',
        image: { type: 'png', quality: 0.9 },
        jsPDF: { orientation: 'landscape' },
      });
      expect(pdf).toBeDefined();
    });

    it('should_HandleArrayMargins_When_MarginArrayProvided', async () => {
      const pdf = await convertHtmlToPdf(testElement, {
        margin: [10, 15, 10, 15],
      });
      expect(pdf).toBeDefined();
    });
  });

  describe('SecureHtml2Pdf fluent API', () => {
    it('should_ChainSetMethod_When_CalledMultipleTimes', () => {
      const instance = secureHtml2Pdf();
      const result = instance.set({ margin: 10 }).set({ filename: 'test.pdf' });
      expect(result).toBe(instance);
    });

    it('should_ChainFromMethod_When_ElementProvided', () => {
      const instance = secureHtml2Pdf();
      const result = instance.from(testElement);
      expect(result).toBe(instance);
    });

    it('should_GeneratePDF_When_SaveCalled', async () => {
      const instance = secureHtml2Pdf();
      await instance
        .set({ margin: 10, filename: 'test.pdf' })
        .from(testElement)
        .save();
      
      // If we get here without error, the save succeeded
      expect(true).toBe(true);
    });

    it('should_ThrowError_When_SaveCalledWithoutElement', async () => {
      const instance = secureHtml2Pdf();
      await expect(instance.save()).rejects.toThrow('No element specified');
    });

    it('should_ReturnPDF_When_ToPdfCalled', async () => {
      const instance = secureHtml2Pdf();
      await instance.from(testElement).toPdf();
      const pdf = instance.get('pdf');
      expect(pdf).toBeDefined();
    });

    it('should_ThrowError_When_GetPdfCalledWithoutGeneration', () => {
      const instance = secureHtml2Pdf();
      expect(() => instance.get('pdf')).toThrow('PDF not generated yet');
    });

    it('should_OutputBlob_When_OutputBlobCalled', async () => {
      const instance = secureHtml2Pdf();
      const blob = await instance.from(testElement).output('blob');
      expect(blob).toBeInstanceOf(Blob);
    });

    it('should_OutputDataUri_When_OutputDatauriCalled', async () => {
      const instance = secureHtml2Pdf();
      const dataUri = await instance.from(testElement).output('datauristring');
      expect(typeof dataUri).toBe('string');
      expect(dataUri).toContain('data:application/pdf');
    });

    it('should_OutputArrayBuffer_When_OutputArrayBufferCalled', async () => {
      const instance = secureHtml2Pdf();
      const buffer = await instance.from(testElement).output('arraybuffer');
      expect(buffer).toBeInstanceOf(ArrayBuffer);
    });

    it('should_ThrowError_When_InvalidOutputTypeProvided', async () => {
      const instance = secureHtml2Pdf();
      await expect(
        instance.from(testElement).output('invalid' as any)
      ).rejects.toThrow('Unknown output type');
    });
  });

  describe('Compatibility with html2pdf.js API', () => {
    it('should_MatchFluentAPI_When_UsedLikeOriginal', async () => {
      // This test verifies the API is compatible with html2pdf.js usage patterns
      const instance = secureHtml2Pdf();
      
      await instance
        .set({
          margin: [10, 10, 10, 10],
          filename: 'test-report.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(testElement)
        .save();

      // If we reach here, the API is compatible
      expect(true).toBe(true);
    });

    it('should_SupportAdvancedWorkflow_When_UsingToPdfAndGet', async () => {
      // This matches the pattern used in Methodology.tsx
      const instance = secureHtml2Pdf();
      
      await instance
        .set({
          margin: [20, 15, 25, 15],
          image: { type: 'jpeg', quality: 0.98 },
        })
        .from(testElement)
        .toPdf();

      const pdf = instance.get('pdf');
      expect(pdf).toBeDefined();
      expect(pdf.internal).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should_HandleEmptyElement_When_ElementHasNoContent', async () => {
      const emptyElement = document.createElement('div');
      document.body.appendChild(emptyElement);
      
      const pdf = await convertHtmlToPdf(emptyElement);
      expect(pdf).toBeDefined();
      
      document.body.removeChild(emptyElement);
    });

    it('should_HandleLargeContent_When_ContentExceedsOnePage', async () => {
      const largeElement = document.createElement('div');
      largeElement.style.height = '5000px';
      largeElement.innerHTML = '<h1>Large Content</h1>' + '<p>Line</p>'.repeat(500);
      document.body.appendChild(largeElement);
      
      const pdf = await convertHtmlToPdf(largeElement);
      expect(pdf).toBeDefined();
      
      document.body.removeChild(largeElement);
    });
  });
});
