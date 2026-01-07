/**
 * Secure HTML to PDF converter
 * Replaces vulnerable html2pdf.js with direct use of html2canvas + jspdf@4.0.0
 * This avoids the critical vulnerability in jspdf <=3.0.4 used by html2pdf.js
 */

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Html2PdfOptions {
  margin?: number | [number, number, number, number];
  filename?: string;
  image?: {
    type?: 'jpeg' | 'png' | 'webp';
    quality?: number;
  };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    [key: string]: any;
  };
  jsPDF?: {
    unit?: 'pt' | 'mm' | 'cm' | 'in';
    format?: string | number[];
    orientation?: 'portrait' | 'landscape';
    compress?: boolean;
  };
  pagebreak?: {
    mode?: string | string[];
    before?: string[];
    after?: string[];
    avoid?: string[];
  };
}

/**
 * Convert HTML element to PDF
 * Compatible API with html2pdf.js but uses secure jspdf@4.0.0
 */
export async function convertHtmlToPdf(
  element: HTMLElement,
  options: Html2PdfOptions = {}
): Promise<jsPDF> {
  // Default options matching html2pdf.js behavior
  const opts: Html2PdfOptions = {
    margin: options.margin ?? 10,
    filename: options.filename ?? 'document.pdf',
    image: {
      type: options.image?.type ?? 'jpeg',
      quality: options.image?.quality ?? 0.95,
    },
    html2canvas: {
      scale: options.html2canvas?.scale ?? 2,
      useCORS: options.html2canvas?.useCORS ?? true,
      logging: options.html2canvas?.logging ?? false,
      ...options.html2canvas,
    },
    jsPDF: {
      unit: options.jsPDF?.unit ?? 'mm',
      format: options.jsPDF?.format ?? 'a4',
      orientation: options.jsPDF?.orientation ?? 'portrait',
      compress: options.jsPDF?.compress ?? true,
      ...options.jsPDF,
    },
    pagebreak: options.pagebreak,
  };

  // Convert margin to array format
  let margins: [number, number, number, number];
  if (typeof opts.margin === 'number') {
    margins = [opts.margin, opts.margin, opts.margin, opts.margin];
  } else if (Array.isArray(opts.margin)) {
    margins = opts.margin as [number, number, number, number];
  } else {
    margins = [10, 10, 10, 10];
  }

  // Capture element as canvas
  const canvas = await html2canvas(element, opts.html2canvas);

  // Create PDF
  const pdf = new jsPDF({
    orientation: opts.jsPDF!.orientation,
    unit: opts.jsPDF!.unit,
    format: opts.jsPDF!.format,
    compress: opts.jsPDF!.compress,
  });

  const imgData = canvas.toDataURL(`image/${opts.image!.type}`, opts.image!.quality);

  // Calculate dimensions
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  // Account for margins
  const contentWidth = pdfWidth - margins[1] - margins[3]; // left + right margins
  const contentHeight = pdfHeight - margins[0] - margins[2]; // top + bottom margins

  // Calculate image dimensions maintaining aspect ratio
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = imgWidth / imgHeight;

  let finalWidth = contentWidth;
  let finalHeight = contentWidth / ratio;

  // If height exceeds page, split into multiple pages
  if (finalHeight > contentHeight) {
    finalHeight = contentHeight;
    finalWidth = contentHeight * ratio;
  }

  // Center image if it doesn't fill the width
  const xOffset = margins[3] + (contentWidth - finalWidth) / 2;
  const yOffset = margins[0];

  // Check if we need multiple pages
  const totalPdfHeight = (canvas.height * finalWidth) / canvas.width;
  const pageCount = Math.ceil(totalPdfHeight / contentHeight);

  if (pageCount > 1) {
    // Multi-page document
    for (let i = 0; i < pageCount; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const sourceY = (i * contentHeight * canvas.width) / finalWidth;
      const sourceHeight = Math.min(
        (contentHeight * canvas.width) / finalWidth,
        canvas.height - sourceY
      );

      // Create a temporary canvas for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        const pageImgData = pageCanvas.toDataURL(
          `image/${opts.image!.type}`,
          opts.image!.quality
        );
        
        const pageHeight = (sourceHeight * finalWidth) / canvas.width;
        pdf.addImage(pageImgData, opts.image!.type!.toUpperCase(), xOffset, yOffset, finalWidth, pageHeight);
      }
    }
  } else {
    // Single page document
    pdf.addImage(imgData, opts.image!.type!.toUpperCase(), xOffset, yOffset, finalWidth, finalHeight);
  }

  return pdf;
}

/**
 * Fluent API wrapper to match html2pdf.js interface
 */
export class SecureHtml2Pdf {
  private element: HTMLElement | null = null;
  private options: Html2PdfOptions = {};
  private pdf: jsPDF | null = null;

  set(options: Html2PdfOptions): SecureHtml2Pdf {
    this.options = { ...this.options, ...options };
    return this;
  }

  from(element: HTMLElement): SecureHtml2Pdf {
    this.element = element;
    return this;
  }

  async toPdf(): Promise<SecureHtml2Pdf> {
    if (!this.element) {
      throw new Error('No element specified. Call from() first.');
    }
    this.pdf = await convertHtmlToPdf(this.element, this.options);
    return this;
  }

  get(key: 'pdf'): jsPDF {
    if (key === 'pdf') {
      if (!this.pdf) {
        throw new Error('PDF not generated yet. Call toPdf() first.');
      }
      return this.pdf;
    }
    throw new Error(`Unknown key: ${key}`);
  }

  async save(filename?: string): Promise<void> {
    if (!this.element) {
      throw new Error('No element specified. Call from() first.');
    }
    
    if (!this.pdf) {
      this.pdf = await convertHtmlToPdf(this.element, this.options);
    }

    const finalFilename = filename || this.options.filename || 'document.pdf';
    this.pdf.save(finalFilename);
  }

  async output(type: 'blob' | 'datauristring' | 'arraybuffer'): Promise<any> {
    if (!this.pdf) {
      if (!this.element) {
        throw new Error('No element specified. Call from() first.');
      }
      this.pdf = await convertHtmlToPdf(this.element, this.options);
    }

    switch (type) {
      case 'blob':
        return this.pdf.output('blob');
      case 'datauristring':
        return this.pdf.output('datauristring');
      case 'arraybuffer':
        return this.pdf.output('arraybuffer');
      default:
        throw new Error(`Unknown output type: ${type}`);
    }
  }
}

/**
 * Factory function matching html2pdf.js API
 */
export default function secureHtml2Pdf(): SecureHtml2Pdf {
  return new SecureHtml2Pdf();
}
