# Secure HTML to PDF Utility - Usage Guide

## Overview

The `secure-html-to-pdf` utility provides a secure, centralized wrapper for converting HTML content to PDF files using html2pdf.js with integrated DOMPurify sanitization.

## Features

- ✅ **XSS Prevention**: Automatically sanitizes HTML content using DOMPurify
- ✅ **Path Traversal Protection**: Sanitizes filenames to prevent security issues
- ✅ **Input Validation**: Validates all options (margins, quality, scale, etc.)
- ✅ **Error Handling**: Comprehensive error logging and recovery
- ✅ **TypeScript**: Fully typed interfaces
- ✅ **Flexible API**: Download or get Blob for uploads/emails

## Basic Usage

### Generate and Download PDF

```typescript
import { generateSecurePDF } from '@/lib/secure-html-to-pdf';

// Simple usage - by element ID
const result = await generateSecurePDF('my-report-content', {
  filename: 'carbon-report-2024.pdf'
});

if (result.success) {
  console.log('PDF downloaded:', result.filename);
} else {
  console.error('PDF generation failed:', result.error);
}
```

### Generate PDF Blob (for uploads/emails)

```typescript
import { generateSecurePDFBlob } from '@/lib/secure-html-to-pdf';

// Get Blob instead of downloading
const pdfBlob = await generateSecurePDFBlob('my-report-content', {
  margin: [10, 10, 10, 10],
  image: { type: 'jpeg', quality: 0.98 }
});

if (pdfBlob) {
  // Upload to storage or send via email
  const formData = new FormData();
  formData.append('pdf', pdfBlob, 'report.pdf');
  await fetch('/api/upload', { method: 'POST', body: formData });
}
```

## Advanced Options

```typescript
import { generateSecurePDF, SecurePDFOptions } from '@/lib/secure-html-to-pdf';

const options: SecurePDFOptions = {
  filename: 'detailed-report.pdf',
  
  // Page margins [top, right, bottom, left] in mm
  margin: [15, 15, 15, 15],
  
  // Image settings
  image: {
    type: 'jpeg',
    quality: 0.98  // 0-1 range
  },
  
  // html2canvas settings
  html2canvas: {
    scale: 2,        // Higher = better quality (greater than 0, up to 4)
    useCORS: true,   // Allow cross-origin images
    logging: false
  },
  
  // jsPDF settings
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait'  // or 'landscape'
  },
  
  // XSS sanitization (default: true)
  sanitize: true
};

const result = await generateSecurePDF(element, options);
```

## Using with React Components

### In a Report Component

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateSecurePDF } from '@/lib/secure-html-to-pdf';
import { toast } from 'sonner';

export function ReportComponent() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSecurePDF('report-content', {
        filename: `report-${Date.now()}.pdf`,
        margin: [10, 10, 10, 10]
      });

      if (result.success) {
        toast.success('PDF downloaded successfully');
      } else {
        toast.error(`PDF generation failed: ${result.error}`);
      }
    } catch (error) {
      toast.error('Unexpected error generating PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {/* Hidden content for PDF generation */}
      <div id="report-content" className="hidden">
        <h1>My Report</h1>
        <p>Report content here...</p>
      </div>

      {/* Download button */}
      <Button onClick={handleDownload} disabled={isGenerating}>
        {isGenerating ? (
          <>Generating...</>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </>
        )}
      </Button>
    </div>
  );
}
```

### Sending PDF via Email

```typescript
import { generateSecurePDFBlob } from '@/lib/secure-html-to-pdf';
import { supabase } from '@/integrations/supabase/client';

async function sendReportEmail(recipientEmail: string) {
  // Generate PDF as blob
  const pdfBlob = await generateSecurePDFBlob('report-content', {
    margin: [10, 10, 10, 10]
  });

  if (!pdfBlob) {
    throw new Error('Failed to generate PDF');
  }

  // Convert blob to base64
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(pdfBlob);
  });

  // Send via Edge Function
  const { error } = await supabase.functions.invoke('send-report-email', {
    body: {
      recipientEmail,
      pdfBase64: base64,
      filename: 'report.pdf'
    }
  });

  if (error) throw error;
}
```

## Security Features

### Automatic HTML Sanitization

By default, all HTML content is sanitized using DOMPurify before PDF generation:

```typescript
// This will automatically remove the script tag
const element = document.getElementById('content');
element.innerHTML = '<p>Safe</p><script>alert("xss")</script>';

const result = await generateSecurePDF('content', {
  sanitize: true  // default
});
// Result: Only <p>Safe</p> will be in the PDF
```

### Filename Sanitization

All filenames are automatically sanitized to prevent path traversal attacks:

```typescript
// Unsafe filename
const result = await generateSecurePDF('content', {
  filename: '../../../etc/passwd.pdf'
});

// Result: filename will be 'etcpasswd.pdf' (safe)
```

### Input Validation

All options are validated before PDF generation:

```typescript
// Invalid margin - will return error
const result = await generateSecurePDF('content', {
  margin: [10, 10, 10]  // Must have 4 values
});

console.log(result.error);
// "Margin array must have exactly 4 elements"
```

## Error Handling

The utility provides detailed error messages:

```typescript
const result = await generateSecurePDF('non-existent-id');

if (!result.success) {
  console.error(result.error);
  // "Element with ID 'non-existent-id' not found"
}
```

## TypeScript Types

```typescript
interface SecurePDFOptions {
  filename?: string;
  margin?: [number, number, number, number] | number;
  image?: {
    type: 'jpeg' | 'png' | 'webp';
    quality: number;
  };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    [key: string]: unknown;
  };
  jsPDF?: {
    unit: 'pt' | 'mm' | 'cm' | 'in';
    format: 'a4' | 'a3' | 'letter' | [number, number];
    orientation: 'portrait' | 'landscape';
    [key: string]: unknown;
  };
  sanitize?: boolean;
}

interface PDFGenerationResult {
  success: boolean;
  filename?: string;
  error?: string;
}
```

## Migration from Direct html2pdf.js Usage

### Before (Direct html2pdf.js)

```typescript
import html2pdf from 'html2pdf.js';

const element = document.getElementById('content');
await html2pdf()
  .set({
    margin: 10,
    filename: 'report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  })
  .from(element)
  .save();
```

### After (Secure Utility)

```typescript
import { generateSecurePDF } from '@/lib/secure-html-to-pdf';

const result = await generateSecurePDF('content', {
  margin: 10,
  filename: 'report.pdf',
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: { scale: 2 },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
});

if (!result.success) {
  console.error(result.error);
}
```

## Testing

The utility includes comprehensive tests. To run them:

```bash
npm test -- src/lib/__tests__/secure-html-to-pdf.test.ts
```

## Related Files

- `src/lib/secure-html-to-pdf.ts` - Main implementation
- `src/lib/__tests__/secure-html-to-pdf.test.ts` - Test suite
- `src/lib/dompurify-config.ts` - HTML sanitization configuration
- `src/lib/logger.ts` - Logging utility

## Best Practices

1. **Always validate element exists**: Check element has content before calling
2. **Handle errors**: Always check `result.success` and handle `result.error`
3. **Use sensible defaults**: Start with default options, customize as needed
4. **Test with real content**: Test PDF generation with actual report content
5. **Monitor performance**: Large documents may take time to generate

## Common Issues

### PDF Element Has Zero Dimensions

**Problem**: `Element has zero dimensions - cannot generate PDF`

**Solution**: Ensure the element is visible or has explicit width/height:

```typescript
const element = document.getElementById('content');
element.style.width = '800px';
element.style.height = 'auto';
element.style.position = 'absolute';
element.style.left = '0';
```

### Images Not Appearing in PDF

**Problem**: Images are missing in generated PDF

**Solution**: Enable CORS and ensure images are loaded:

```typescript
const result = await generateSecurePDF('content', {
  html2canvas: {
    useCORS: true,  // Enable CORS
    allowTaint: true
  }
});

// Wait for images to load before generating
await document.fonts.ready;
await Promise.all(
  Array.from(document.images)
    .filter(img => !img.complete)
    .map(img => new Promise(resolve => { img.onload = img.onerror = resolve; }))
);
```

## Support

For issues or questions, refer to:
- `.github/instructions/security.instructions.md` - Security guidelines
- `src/lib/dompurify-config.ts` - Sanitization examples
- Test file for usage examples
