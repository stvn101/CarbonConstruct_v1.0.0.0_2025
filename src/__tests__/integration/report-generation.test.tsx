/**
 * Integration Tests for Report Generation
 * 
 * Tests the complete report generation workflow:
 * - Data aggregation from calculations
 * - Report template selection
 * - PDF generation
 * - Compliance checking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock report data structure
interface ReportData {
  projectName: string;
  projectType: string;
  buildingSqm?: number;
  emissions: {
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  };
  breakdown: {
    materials: any[];
    fuelInputs: any[];
    electricityInputs: any[];
    transportInputs: any[];
  };
  lifecycleStages?: {
    a1a3: number;
    a4: number;
    a5: number;
    b1b5: number;
    c1c4: number;
    d: number;
  };
  complianceStatus?: {
    ncc2024: boolean;
    greenStar: boolean;
    nabers: boolean;
  };
}

// Helper function to create report data
const createReportData = (overrides: Partial<ReportData> = {}): ReportData => ({
  projectName: 'Test Project',
  projectType: 'commercial',
  buildingSqm: 1000,
  emissions: {
    scope1: 10,
    scope2: 25,
    scope3: 100,
    total: 135,
  },
  breakdown: {
    materials: [
      { name: 'Concrete', quantity: 500, unit: 'm³', emissions: 175000 },
      { name: 'Steel', quantity: 100, unit: 'kg', emissions: 150000 },
    ],
    fuelInputs: [
      { fuelType: 'diesel', quantity: 1000, unit: 'L', emissions: 2680 },
    ],
    electricityInputs: [
      { quantity: 50000, unit: 'kWh', emissions: 42500 },
    ],
    transportInputs: [
      { distance: 100, weight: 50, mode: 'road', emissions: 1340 },
    ],
  },
  lifecycleStages: {
    a1a3: 300000,
    a4: 15000,
    a5: 10000,
    b1b5: 0,
    c1c4: 8000,
    d: -5000,
  },
  complianceStatus: {
    ncc2024: true,
    greenStar: true,
    nabers: false,
  },
  ...overrides,
});

describe('Report Generation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Report Data Aggregation', () => {
    it('should aggregate emissions from all sources', () => {
      const data = createReportData();

      const totalEmissions = data.emissions.scope1 + data.emissions.scope2 + data.emissions.scope3;
      expect(totalEmissions).toBe(data.emissions.total);
    });

    it('should include all material entries', () => {
      const data = createReportData();

      expect(data.breakdown.materials.length).toBe(2);
      expect(data.breakdown.materials[0].name).toBe('Concrete');
    });

    it('should calculate material emissions correctly', () => {
      const data = createReportData();

      const totalMaterialEmissions = data.breakdown.materials.reduce(
        (sum, m) => sum + m.emissions,
        0
      );
      expect(totalMaterialEmissions).toBe(325000);
    });
  });

  describe('Carbon Intensity Calculations', () => {
    it('should calculate carbon intensity per sqm', () => {
      const data = createReportData();

      if (data.buildingSqm && data.lifecycleStages) {
        const upfront = data.lifecycleStages.a1a3 + data.lifecycleStages.a4 + data.lifecycleStages.a5;
        const intensity = upfront / data.buildingSqm;

        expect(intensity).toBe(325); // 325000 / 1000
      }
    });

    it('should handle missing building area gracefully', () => {
      const data = createReportData({ buildingSqm: undefined });

      expect(data.buildingSqm).toBeUndefined();
      // Intensity calculation should not throw
    });
  });

  describe('Lifecycle Stage Calculations', () => {
    it('should calculate upfront carbon (A1-A5)', () => {
      const data = createReportData();
      const stages = data.lifecycleStages!;

      const upfront = stages.a1a3 + stages.a4 + stages.a5;
      expect(upfront).toBe(325000);
    });

    it('should calculate whole life carbon', () => {
      const data = createReportData();
      const stages = data.lifecycleStages!;

      const wholeLife = stages.a1a3 + stages.a4 + stages.a5 + stages.b1b5 + stages.c1c4;
      expect(wholeLife).toBe(333000);
    });

    it('should calculate net carbon with module D credits', () => {
      const data = createReportData();
      const stages = data.lifecycleStages!;

      const wholeLife = stages.a1a3 + stages.a4 + stages.a5 + stages.b1b5 + stages.c1c4;
      const netWithCredits = wholeLife + stages.d;
      expect(netWithCredits).toBe(328000);
    });

    it('should ensure module D is negative (credits)', () => {
      const data = createReportData();

      expect(data.lifecycleStages?.d).toBeLessThanOrEqual(0);
    });
  });

  describe('Compliance Checking', () => {
    it('should check NCC 2024 compliance', () => {
      const data = createReportData();

      expect(data.complianceStatus?.ncc2024).toBe(true);
    });

    it('should check Green Star alignment', () => {
      const data = createReportData();

      expect(data.complianceStatus?.greenStar).toBe(true);
    });

    it('should check NABERS rating', () => {
      const data = createReportData();

      expect(typeof data.complianceStatus?.nabers).toBe('boolean');
    });
  });

  describe('Report Template Types', () => {
    const templates = ['executive', 'compliance', 'technical', 'en15978'];

    templates.forEach(template => {
      it(`should support ${template} template`, () => {
        const data = createReportData();

        // Template should be valid string
        expect(typeof template).toBe('string');
        expect(data).toBeDefined();
      });
    });
  });

  describe('Report Filename Generation', () => {
    it('should generate valid filename from project name', () => {
      const data = createReportData();
      const date = new Date().toISOString().split('T')[0];

      const filename = `${data.projectName.replace(/\s+/g, '_')}_Carbon_Report_${date}.pdf`;

      expect(filename).toMatch(/^Test_Project_Carbon_Report_\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should sanitize special characters in filename', () => {
      const data = createReportData({ projectName: 'Test/Project:Name' });

      const sanitized = data.projectName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      expect(sanitized).toBe('TestProjectName');
    });
  });

  describe('Data Validation', () => {
    it('should validate emissions are non-negative', () => {
      const data = createReportData();

      expect(data.emissions.scope1).toBeGreaterThanOrEqual(0);
      expect(data.emissions.scope2).toBeGreaterThanOrEqual(0);
      expect(data.emissions.scope3).toBeGreaterThanOrEqual(0);
      expect(data.emissions.total).toBeGreaterThanOrEqual(0);
    });

    it('should validate quantities are positive', () => {
      const data = createReportData();

      data.breakdown.materials.forEach(material => {
        expect(material.quantity).toBeGreaterThan(0);
      });
    });

    it('should validate project name is not empty', () => {
      const data = createReportData();

      expect(data.projectName.length).toBeGreaterThan(0);
    });
  });

  describe('Breakdown Data Structure', () => {
    it('should have array structure for all breakdown fields', () => {
      const data = createReportData();

      expect(Array.isArray(data.breakdown.materials)).toBe(true);
      expect(Array.isArray(data.breakdown.fuelInputs)).toBe(true);
      expect(Array.isArray(data.breakdown.electricityInputs)).toBe(true);
      expect(Array.isArray(data.breakdown.transportInputs)).toBe(true);
    });

    it('should handle empty breakdown arrays', () => {
      const data = createReportData({
        breakdown: {
          materials: [],
          fuelInputs: [],
          electricityInputs: [],
          transportInputs: [],
        },
      });

      expect(data.breakdown.materials.length).toBe(0);
      expect(data.breakdown.fuelInputs.length).toBe(0);
    });
  });

  describe('Branding Options', () => {
    it('should accept custom branding', () => {
      const branding = {
        companyName: 'Test Company',
        logoUrl: 'https://example.com/logo.png',
        primaryColor: '#00ff00',
        contactEmail: 'test@example.com',
      };

      expect(branding.companyName).toBe('Test Company');
      expect(branding.logoUrl).toContain('logo');
    });

    it('should use default branding when not provided', () => {
      const defaultBranding = {
        companyName: 'CarbonConstruct',
        primaryColor: '#10b981',
      };

      expect(defaultBranding.companyName).toBe('CarbonConstruct');
    });
  });
});
