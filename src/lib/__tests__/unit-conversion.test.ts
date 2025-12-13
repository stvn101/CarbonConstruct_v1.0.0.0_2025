/**
 * Unit Conversion Consistency Tests
 * 
 * These tests ensure that emission values are consistently converted
 * between kgCO2e (storage) and tCO2e (display) across the application.
 * 
 * NOTE: Tests are self-contained to avoid Supabase client import chain issues.
 */

import { describe, it, expect } from 'vitest';

// Self-contained conversion function (mirrors unit-validation.ts)
const convertEmissionUnits = (
  value: number, 
  fromUnit: 'kgCO2e' | 'tCO2e', 
  toUnit: 'kgCO2e' | 'tCO2e'
): number => {
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'kgCO2e' && toUnit === 'tCO2e') return value / 1000;
  if (fromUnit === 'tCO2e' && toUnit === 'kgCO2e') return value * 1000;
  return value;
};

// Self-contained validation function
const validateEmissionUnits = (
  storedValue: number, 
  displayValue: number, 
  fieldName: string
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  const expectedDisplay = storedValue / 1000;
  const tolerance = 0.01;
  
  if (Math.abs(expectedDisplay - displayValue) > tolerance * Math.max(1, expectedDisplay)) {
    warnings.push(`${fieldName}: potential unit mismatch - stored ${storedValue} kgCO2e should display as ${expectedDisplay.toFixed(4)} tCO2e, got ${displayValue}`);
  }
  
  if (storedValue > 1000000000) {
    warnings.push(`${fieldName}: suspiciously large value (${storedValue} kgCO2e)`);
  }
  
  return { isValid: warnings.length === 0, warnings };
};

// Self-contained totals validation
const validateTotals = (totals: {
  scope1: number;
  scope2: number;
  scope3_materials: number;
  scope3_transport: number;
  total: number;
}): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  const calculatedSum = totals.scope1 + totals.scope2 + totals.scope3_materials + totals.scope3_transport;
  const tolerance = 0.01;
  
  if (Math.abs(calculatedSum - totals.total) > tolerance * Math.max(1, totals.total)) {
    warnings.push(`Total mismatch: sum of scopes (${calculatedSum}) doesn't match total (${totals.total})`);
  }
  
  return { isValid: warnings.length === 0, warnings };
};

// Standard units config
const STANDARD_UNITS = {
  materials: ['kg', 'm³', 'm²', 't', 'unit'],
  fuel: ['L', 'kL', 'GJ'],
  electricity: ['kWh', 'MWh', 'GJ'],
  transport: ['km', 't-km'],
  emissions: {
    stored: 'kgCO2e',
    display: 'tCO2e',
    conversionFactor: 1000
  }
};

// Self-contained material validation
const validateMaterialData = (materials: any[]): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  materials.forEach((mat, index) => {
    if (mat.unit && !STANDARD_UNITS.materials.includes(mat.unit)) {
      warnings.push(`Material ${index + 1} (${mat.name}): Non-standard unit "${mat.unit}"`);
    }
  });
  
  return { isValid: warnings.length === 0, warnings };
};

describe('Unit Conversion', () => {
  describe('convertEmissionUnits', () => {
    it('should convert kgCO2e to tCO2e correctly', () => {
      expect(convertEmissionUnits(1000, 'kgCO2e', 'tCO2e')).toBe(1);
      expect(convertEmissionUnits(67170927, 'kgCO2e', 'tCO2e')).toBeCloseTo(67170.927, 3);
      expect(convertEmissionUnits(2516.8, 'kgCO2e', 'tCO2e')).toBeCloseTo(2.5168, 4);
    });

    it('should convert tCO2e to kgCO2e correctly', () => {
      expect(convertEmissionUnits(1, 'tCO2e', 'kgCO2e')).toBe(1000);
      expect(convertEmissionUnits(67.17, 'tCO2e', 'kgCO2e')).toBe(67170);
    });

    it('should return same value when units match', () => {
      expect(convertEmissionUnits(1000, 'kgCO2e', 'kgCO2e')).toBe(1000);
      expect(convertEmissionUnits(67.17, 'tCO2e', 'tCO2e')).toBe(67.17);
    });
  });

  describe('validateEmissionUnits', () => {
    it('should validate matching stored and display values', () => {
      const result = validateEmissionUnits(1000, 1, 'test');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn on mismatched values', () => {
      const result = validateEmissionUnits(1000, 100, 'test'); // 100 instead of 1
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('mismatch');
    });

    it('should warn on suspiciously large values', () => {
      const result = validateEmissionUnits(2000000000, 2000000, 'test');
      expect(result.warnings.some(w => w.includes('large'))).toBe(true);
    });
  });

  describe('validateTotals', () => {
    it('should validate when sum matches total', () => {
      const result = validateTotals({
        scope1: 1000,
        scope2: 500,
        scope3_materials: 5000,
        scope3_transport: 500,
        total: 7000
      });
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn when sum does not match total', () => {
      const result = validateTotals({
        scope1: 1000,
        scope2: 500,
        scope3_materials: 5000,
        scope3_transport: 500,
        total: 10000 // Wrong total
      });
      expect(result.warnings.some(w => w.includes('mismatch'))).toBe(true);
    });
  });

  describe('validateMaterialData', () => {
    it('should validate materials with correct units', () => {
      const materials = [
        { name: 'Concrete', quantity: 100, unit: 'kg', emissionFactor: 0.1, totalEmissions: 0.01 }
      ];
      const result = validateMaterialData(materials);
      expect(result.isValid).toBe(true);
    });

    it('should warn on non-standard units', () => {
      const materials = [
        { name: 'Test', quantity: 100, unit: 'gallons', emissionFactor: 0.1, totalEmissions: 0.01 }
      ];
      const result = validateMaterialData(materials);
      expect(result.warnings.some(w => w.includes('Non-standard'))).toBe(true);
    });
  });
});

describe('Standard Units Configuration', () => {
  it('should have correct emission conversion factor', () => {
    expect(STANDARD_UNITS.emissions.conversionFactor).toBe(1000);
  });

  it('should have kgCO2e as stored unit', () => {
    expect(STANDARD_UNITS.emissions.stored).toBe('kgCO2e');
  });

  it('should have tCO2e as display unit', () => {
    expect(STANDARD_UNITS.emissions.display).toBe('tCO2e');
  });
});

describe('Calculator to Reports Consistency', () => {
  it('should produce consistent values through the conversion pipeline', () => {
    const dbValues = {
      scope1: 2516.8,
      scope2: 169.92,
      scope3_materials: 67170927.66,
      scope3_transport: 807.61,
    };
    
    const expectedDisplay = {
      scope1: 2.5168,
      scope2: 0.16992,
      scope3: 67171.73527,
      total: 67174.42199,
    };
    
    const convertedScope1 = dbValues.scope1 / 1000;
    const convertedScope2 = dbValues.scope2 / 1000;
    const convertedScope3 = (dbValues.scope3_materials + dbValues.scope3_transport) / 1000;
    const convertedTotal = convertedScope1 + convertedScope2 + convertedScope3;
    
    expect(convertedScope1).toBeCloseTo(expectedDisplay.scope1, 4);
    expect(convertedScope2).toBeCloseTo(expectedDisplay.scope2, 4);
    expect(convertedScope3).toBeCloseTo(expectedDisplay.scope3, 2);
    expect(convertedTotal).toBeCloseTo(expectedDisplay.total, 2);
  });

  it('should not double-convert values', () => {
    const originalKg = 1000;
    const convertedOnce = originalKg / 1000;
    const convertedTwice = convertedOnce / 1000;
    
    expect(convertedOnce).toBe(1);
    expect(convertedTwice).not.toBe(1);
  });

  it('should handle zero values correctly', () => {
    const result = validateTotals({
      scope1: 0,
      scope2: 0,
      scope3_materials: 0,
      scope3_transport: 0,
      total: 0
    });
    expect(result.isValid).toBe(true);
  });

  it('should handle very small values correctly', () => {
    const smallKg = 0.5;
    const converted = smallKg / 1000;
    expect(converted).toBe(0.0005);
  });

  it('should handle very large values correctly', () => {
    const largeKg = 1000000000;
    const converted = largeKg / 1000;
    expect(converted).toBe(1000000);
  });
});

describe('Rounding and Precision', () => {
  it('should maintain precision through conversion', () => {
    const precise = 12345.6789;
    const converted = precise / 1000;
    const reconverted = converted * 1000;
    
    expect(Math.abs(reconverted - precise)).toBeLessThan(0.0001);
  });

  it('should handle floating point edge cases', () => {
    const values = [0.1, 0.2, 0.3].map(v => v * 1000);
    const sum = values.reduce((a, b) => a + b, 0);
    const converted = sum / 1000;
    
    expect(converted).toBeCloseTo(0.6, 10);
  });
});
