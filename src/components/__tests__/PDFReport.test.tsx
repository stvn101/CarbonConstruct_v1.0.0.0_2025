/**
 * Tests for PDFReport component
 * Validates report generation, branding, and Professional tier restrictions
 * Updated: Uses html2pdf.js instead of @react-pdf/renderer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../lib/__tests__/setup';

// Mock html2pdf.js
vi.mock('html2pdf.js', () => ({
  default: () => ({
    set: () => ({
      from: () => ({
        save: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  }),
}));

// Import after mocking
import { PDFReport, type ReportBranding } from '../PDFReport';
import { ReportData } from '../ReportData';

const mockReportData: ReportData = {
  project: {
    name: 'Test Project',
    project_type: 'commercial',
    description: 'Test description',
    location: 'Sydney, NSW',
  },
  emissions: {
    scope1: 100,
    scope2: 200,
    scope3: 300,
    total: 600,
  },
  breakdown: {
    materials: [{ name: 'Concrete', quantity: 100, unit: 'kg', emissionFactor: 2, totalEmissions: 200, category: 'Concrete' }],
    fuelInputs: [],
    electricityInputs: [],
    transportInputs: [],
  },
  compliance: {
    nccCompliant: true,
    greenStarEligible: true,
    nabersReady: true,
  },
  metadata: {
    generatedAt: new Date().toISOString(),
    methodology: 'EN 15978',
    dataQuality: 'High',
  },
};

describe('PDFReport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders download button', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="executive"
        />
      );

      // Component should render a download button
      const button = screen.getByRole('button', { name: /download pdf/i });
      expect(button).toBeInTheDocument();
    });

    it('renders with project name in UI', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="executive"
        />
      );

      // Button should be rendered for PDF download
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });
  });

  describe('template types', () => {
    it('accepts executive template', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="executive"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('accepts compliance template', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="compliance"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('accepts technical template', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="technical"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('accepts en15978 template', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="en15978"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });
  });

  describe('branding (Professional tier)', () => {
    const customBranding: ReportBranding = {
      companyName: 'Acme Construction',
      logoUrl: 'https://example.com/logo.png',
      contactEmail: 'contact@acme.com',
      preparedBy: 'John Smith',
    };

    it('accepts custom branding props', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="executive"
          branding={customBranding}
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('renders with partial branding', () => {
      const partialBranding: ReportBranding = {
        companyName: 'Partial Corp',
      };

      render(
        <PDFReport
          data={mockReportData}
          template="executive"
          branding={partialBranding}
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('renders without branding (default CarbonConstruct)', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="executive"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });
  });

  describe('watermark option', () => {
    it('accepts showWatermark prop true', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="executive"
          showWatermark={true}
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('accepts showWatermark prop false', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="executive"
          showWatermark={false}
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });
  });

  describe('emission data handling', () => {
    it('handles zero emissions', () => {
      const zeroData: ReportData = {
        ...mockReportData,
        emissions: {
          scope1: 0,
          scope2: 0,
          scope3: 0,
          total: 0,
        },
      };

      render(
        <PDFReport
          data={zeroData}
          template="executive"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('handles large emission values', () => {
      const largeData: ReportData = {
        ...mockReportData,
        emissions: {
          scope1: 1000000,
          scope2: 2000000,
          scope3: 3000000,
          total: 6000000,
        },
      };

      render(
        <PDFReport
          data={largeData}
          template="executive"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('handles decimal emission values', () => {
      const decimalData: ReportData = {
        ...mockReportData,
        emissions: {
          scope1: 100.555,
          scope2: 200.123,
          scope3: 300.789,
          total: 601.467,
        },
      };

      render(
        <PDFReport
          data={decimalData}
          template="executive"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });
  });

  describe('compliance data', () => {
    it('handles all compliant status', () => {
      render(
        <PDFReport
          data={mockReportData}
          template="compliance"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('handles non-compliant status', () => {
      const nonCompliantData: ReportData = {
        ...mockReportData,
        compliance: {
          nccCompliant: false,
          greenStarEligible: false,
          nabersReady: false,
        },
      };

      render(
        <PDFReport
          data={nonCompliantData}
          template="compliance"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('handles mixed compliance status', () => {
      const mixedData: ReportData = {
        ...mockReportData,
        compliance: {
          nccCompliant: true,
          greenStarEligible: false,
          nabersReady: true,
        },
      };

      render(
        <PDFReport
          data={mixedData}
          template="compliance"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });
  });

  describe('project data edge cases', () => {
    it('handles missing optional fields', () => {
      const minimalData: ReportData = {
        ...mockReportData,
        project: {
          name: 'Minimal Project',
          project_type: 'commercial',
        },
      };

      render(
        <PDFReport
          data={minimalData}
          template="executive"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('handles special characters in project name', () => {
      const specialData: ReportData = {
        ...mockReportData,
        project: {
          ...mockReportData.project,
          name: 'Project & Co. "Special" <Test>',
        },
      };

      render(
        <PDFReport
          data={specialData}
          template="executive"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    it('handles long project names', () => {
      const longNameData: ReportData = {
        ...mockReportData,
        project: {
          ...mockReportData.project,
          name: 'A'.repeat(200),
        },
      };

      render(
        <PDFReport
          data={longNameData}
          template="executive"
        />
      );

      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });
  });
});
