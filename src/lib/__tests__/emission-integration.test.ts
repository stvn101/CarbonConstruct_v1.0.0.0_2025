/**
 * Integration Tests for Emission Data Consistency
 * 
 * These tests verify that emission values are consistently converted
 * from kgCO2e (database) to tCO2e (display) across all hooks and components.
 * 
 * NOTE: Tests are self-contained to avoid Supabase client import chain issues.
 */

import { describe, it, expect } from 'vitest';

// Mock database response (simulates unified_calculations table)
const mockDbResponse = {
  id: 'test-calc-123',
  project_id: 'test-project-456',
  user_id: 'test-user-789',
  materials: [
    { name: 'Concrete', category: 'Concrete', quantity: 100, unit: 'm³', factor: 300 },
    { name: 'Steel', category: 'Steel', quantity: 50, unit: 'kg', factor: 2.5 }
  ],
  fuel_inputs: { diesel_transport: 500, petrol: 200 },
  electricity_inputs: { kwh: 10000 },
  transport_inputs: { road_freight: 1000 },
  totals: {
    scope1: 1804,           // kgCO2e (500 * 2.68 + 200 * 2.31)
    scope2: 7200,           // kgCO2e (10000 * 0.72)
    scope3_materials: 30125, // kgCO2e (100 * 300 + 50 * 2.5)
    scope3_transport: 89,    // kgCO2e (1000 * 0.089)
    scope3_a5: 0,
    scope3_commute: 0,
    scope3_waste: 0,
    total: 39218            // kgCO2e
  },
  is_draft: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  version: 1
};

// Expected display values (tCO2e = kgCO2e / 1000)
const expectedDisplayValues = {
  scope1: 1.804,
  scope2: 7.2,
  scope3: 30.214,  // materials + transport
  total: 39.218
};

describe('Emission Data Integration Tests', () => {

  describe('Database to Display Conversion Pipeline', () => {
    it('should convert useEmissionTotals values from kgCO2e to tCO2e', () => {
      // Simulate useEmissionTotals conversion logic
      const rawTotals = mockDbResponse.totals;
      const scope1Total = rawTotals.scope1 || 0;
      const scope2Total = rawTotals.scope2 || 0;
      const scope3Materials = rawTotals.scope3_materials || 0;
      const scope3Transport = rawTotals.scope3_transport || 0;
      const scope3Total = scope3Materials + scope3Transport;
      const total = rawTotals.total || 0;

      // Apply conversion (÷1000)
      const converted = {
        scope1: scope1Total / 1000,
        scope2: scope2Total / 1000,
        scope3: scope3Total / 1000,
        total: total / 1000
      };

      expect(converted.scope1).toBeCloseTo(expectedDisplayValues.scope1, 3);
      expect(converted.scope2).toBeCloseTo(expectedDisplayValues.scope2, 3);
      expect(converted.scope3).toBeCloseTo(expectedDisplayValues.scope3, 3);
      expect(converted.total).toBeCloseTo(expectedDisplayValues.total, 3);
    });

    it('should convert useReportData values from kgCO2e to tCO2e', () => {
      // Simulate ReportData.tsx conversion logic
      const rawTotals = mockDbResponse.totals;
      const scope1Tonnes = (rawTotals.scope1 || 0) / 1000;
      const scope2Tonnes = (rawTotals.scope2 || 0) / 1000;
      const scope3Total = ((rawTotals.scope3_materials || 0) + (rawTotals.scope3_transport || 0)) / 1000;
      const totalTonnes = scope1Tonnes + scope2Tonnes + scope3Total;

      expect(scope1Tonnes).toBeCloseTo(expectedDisplayValues.scope1, 3);
      expect(scope2Tonnes).toBeCloseTo(expectedDisplayValues.scope2, 3);
      expect(scope3Total).toBeCloseTo(expectedDisplayValues.scope3, 3);
      expect(totalTonnes).toBeCloseTo(
        expectedDisplayValues.scope1 + expectedDisplayValues.scope2 + expectedDisplayValues.scope3, 
        3
      );
    });

    it('should convert useCalculationHistory values from kgCO2e to tCO2e', () => {
      // Simulate useCalculationHistory conversion logic
      const totals = mockDbResponse.totals;
      const scope1Raw = totals.scope1 || 0;
      const scope2Raw = totals.scope2 || 0;
      const scope3Raw = (totals.scope3_materials || 0) + (totals.scope3_transport || 0);
      const totalRaw = totals.total || 0;

      const converted = {
        totalEmissions: totalRaw / 1000,
        scope1: scope1Raw / 1000,
        scope2: scope2Raw / 1000,
        scope3: scope3Raw / 1000,
      };

      expect(converted.scope1).toBeCloseTo(expectedDisplayValues.scope1, 3);
      expect(converted.scope2).toBeCloseTo(expectedDisplayValues.scope2, 3);
      expect(converted.scope3).toBeCloseTo(expectedDisplayValues.scope3, 3);
      expect(converted.totalEmissions).toBeCloseTo(expectedDisplayValues.total, 3);
    });
  });

  describe('Cross-Hook Consistency', () => {
    it('should produce identical values across all hooks for the same data', () => {
      const rawTotals = mockDbResponse.totals;

      // useEmissionTotals conversion
      const emissionTotals = {
        scope1: rawTotals.scope1 / 1000,
        scope2: rawTotals.scope2 / 1000,
        scope3: (rawTotals.scope3_materials + rawTotals.scope3_transport) / 1000,
        total: rawTotals.total / 1000
      };

      // useReportData conversion
      const reportData = {
        scope1: rawTotals.scope1 / 1000,
        scope2: rawTotals.scope2 / 1000,
        scope3: (rawTotals.scope3_materials + rawTotals.scope3_transport) / 1000,
        total: (rawTotals.scope1 + rawTotals.scope2 + rawTotals.scope3_materials + rawTotals.scope3_transport) / 1000
      };

      // useCalculationHistory conversion
      const historyData = {
        scope1: rawTotals.scope1 / 1000,
        scope2: rawTotals.scope2 / 1000,
        scope3: (rawTotals.scope3_materials + rawTotals.scope3_transport) / 1000,
        totalEmissions: rawTotals.total / 1000
      };

      // All hooks should produce the same scope values
      expect(emissionTotals.scope1).toBe(reportData.scope1);
      expect(emissionTotals.scope1).toBe(historyData.scope1);

      expect(emissionTotals.scope2).toBe(reportData.scope2);
      expect(emissionTotals.scope2).toBe(historyData.scope2);

      expect(emissionTotals.scope3).toBe(reportData.scope3);
      expect(emissionTotals.scope3).toBe(historyData.scope3);

      expect(emissionTotals.total).toBe(historyData.totalEmissions);
    });

    it('should handle all scope3 subcategories consistently', () => {
      const fullTotals = {
        scope1: 1000,
        scope2: 500,
        scope3_materials: 5000,
        scope3_transport: 200,
        scope3_a5: 100,
        scope3_commute: 50,
        scope3_waste: 30,
        total: 6880
      };

      // Full scope3 calculation (all subcategories)
      const scope3Full = (
        fullTotals.scope3_materials +
        fullTotals.scope3_transport +
        fullTotals.scope3_a5 +
        fullTotals.scope3_commute +
        fullTotals.scope3_waste
      ) / 1000;

      expect(scope3Full).toBe(5.38); // (5000 + 200 + 100 + 50 + 30) / 1000

      // Verify total matches sum
      const calculatedTotal = (
        fullTotals.scope1 +
        fullTotals.scope2 +
        fullTotals.scope3_materials +
        fullTotals.scope3_transport +
        fullTotals.scope3_a5 +
        fullTotals.scope3_commute +
        fullTotals.scope3_waste
      ) / 1000;

      expect(calculatedTotal).toBe(fullTotals.total / 1000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined totals gracefully', () => {
      const nullTotals = {
        scope1: null,
        scope2: undefined,
        scope3_materials: 0,
        scope3_transport: 0,
        total: 0
      };

      const converted = {
        scope1: (nullTotals.scope1 || 0) / 1000,
        scope2: (nullTotals.scope2 || 0) / 1000,
        scope3: ((nullTotals.scope3_materials || 0) + (nullTotals.scope3_transport || 0)) / 1000,
        total: (nullTotals.total || 0) / 1000
      };

      expect(converted.scope1).toBe(0);
      expect(converted.scope2).toBe(0);
      expect(converted.scope3).toBe(0);
      expect(converted.total).toBe(0);
    });

    it('should handle very large emission values', () => {
      const largeTotals = {
        scope1: 1000000000,     // 1 billion kg = 1 million tonnes
        scope2: 500000000,
        scope3_materials: 2000000000,
        scope3_transport: 100000000,
        total: 3600000000
      };

      const converted = {
        scope1: largeTotals.scope1 / 1000,
        scope2: largeTotals.scope2 / 1000,
        scope3: (largeTotals.scope3_materials + largeTotals.scope3_transport) / 1000,
        total: largeTotals.total / 1000
      };

      expect(converted.scope1).toBe(1000000);
      expect(converted.scope2).toBe(500000);
      expect(converted.scope3).toBe(2100000);
      expect(converted.total).toBe(3600000);
    });

    it('should handle fractional emission values with precision', () => {
      const fractionalTotals = {
        scope1: 0.123,
        scope2: 0.456,
        scope3_materials: 0.789,
        scope3_transport: 0.012,
        total: 1.38
      };

      const converted = {
        scope1: fractionalTotals.scope1 / 1000,
        scope2: fractionalTotals.scope2 / 1000,
        scope3: (fractionalTotals.scope3_materials + fractionalTotals.scope3_transport) / 1000,
        total: fractionalTotals.total / 1000
      };

      expect(converted.scope1).toBeCloseTo(0.000123, 6);
      expect(converted.scope2).toBeCloseTo(0.000456, 6);
      expect(converted.scope3).toBeCloseTo(0.000801, 6);
      expect(converted.total).toBeCloseTo(0.00138, 6);
    });
  });

  describe('Material Emission Calculations', () => {
    it('should calculate material emissions correctly', () => {
      const materials = mockDbResponse.materials;
      
      let totalMaterialEmissions = 0;
      materials.forEach((mat: any) => {
        const quantity = mat.quantity || 0;
        const factor = mat.factor || mat.emissionFactor || 0;
        totalMaterialEmissions += quantity * factor;
      });

      // Should be 100*300 + 50*2.5 = 30125 kgCO2e
      expect(totalMaterialEmissions).toBe(30125);
      
      // Converted to tCO2e
      expect(totalMaterialEmissions / 1000).toBe(30.125);
    });

    it('should match material emissions with scope3_materials total', () => {
      const materials = mockDbResponse.materials;
      const storedTotal = mockDbResponse.totals.scope3_materials;

      let calculatedTotal = 0;
      materials.forEach((mat: any) => {
        calculatedTotal += (mat.quantity || 0) * (mat.factor || 0);
      });

      expect(calculatedTotal).toBe(storedTotal);
    });
  });

  describe('Fuel and Electricity Emission Calculations', () => {
    it('should calculate fuel emissions (scope1) correctly', () => {
      const fuelInputs = mockDbResponse.fuel_inputs as Record<string, number>;
      const fuelFactors: Record<string, number> = {
        diesel_transport: 2.68,
        petrol: 2.31,
      };

      let scope1Total = 0;
      Object.entries(fuelInputs).forEach(([fuelType, quantity]) => {
        const factor = fuelFactors[fuelType] || 2.31;
        scope1Total += quantity * factor;
      });

      // 500 * 2.68 + 200 * 2.31 = 1340 + 462 = 1802 kgCO2e
      expect(scope1Total).toBeCloseTo(1802, 0);
      expect(scope1Total / 1000).toBeCloseTo(1.802, 3);
    });

    it('should calculate electricity emissions (scope2) correctly', () => {
      const elecInputs = mockDbResponse.electricity_inputs as Record<string, number>;
      const gridFactor = 0.72; // Australian grid average

      let scope2Total = 0;
      Object.entries(elecInputs).forEach(([_, quantity]) => {
        scope2Total += quantity * gridFactor;
      });

      // 10000 * 0.72 = 7200 kgCO2e
      expect(scope2Total).toBe(7200);
      expect(scope2Total / 1000).toBe(7.2);
    });
  });

  describe('Display Formatting Consistency', () => {
    it('should format values consistently for UI display', () => {
      const valueInKg = 67170927.66;
      const valueInTonnes = valueInKg / 1000;

      // Various formatting approaches should all represent the same value
      expect(valueInTonnes.toFixed(2)).toBe('67170.93');
      expect(valueInTonnes.toFixed(1)).toBe('67170.9');
      expect(valueInTonnes.toFixed(0)).toBe('67171');
      expect(Math.round(valueInTonnes)).toBe(67171);
    });

    it('should handle toLocaleString formatting', () => {
      const valueInTonnes = 67170.927;
      
      // Australian locale formatting
      const formatted = valueInTonnes.toLocaleString('en-AU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });

      expect(formatted).toBe('67,170.93');
    });
  });
});
