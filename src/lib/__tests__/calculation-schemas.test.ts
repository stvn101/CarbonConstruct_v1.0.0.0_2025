/**
 * Tests for calculation-schemas.ts
 * 
 * Priority 1 - Critical Business Logic
 * Tests Zod schema validation for carbon calculation inputs
 */

import { describe, it, expect } from 'vitest';
import {
  fuelCombustionEntrySchema,
  vehicleEntrySchema,
  electricityEntrySchema,
  activityEntrySchema,
  validateScope1Data,
  validateScope2Data,
  validateScope3Data,
  formatValidationErrors
} from '../calculation-schemas';

describe('Calculation Schemas', () => {
  describe('Fuel Combustion Entry Schema', () => {
    it('should validate valid fuel combustion entry', () => {
      const validEntry = {
        fuelType: 'diesel',
        quantity: 100,
        unit: 'L',
        notes: 'Site generator'
      };

      const result = fuelCombustionEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should reject missing fuelType', () => {
      const invalidEntry = {
        quantity: 100,
        unit: 'L'
      };

      const result = fuelCombustionEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject zero quantity', () => {
      const invalidEntry = {
        fuelType: 'diesel',
        quantity: 0,
        unit: 'L'
      };

      const result = fuelCombustionEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject negative quantity', () => {
      const invalidEntry = {
        fuelType: 'diesel',
        quantity: -100,
        unit: 'L'
      };

      const result = fuelCombustionEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should accept optional notes', () => {
      const entryWithoutNotes = {
        fuelType: 'diesel',
        quantity: 100,
        unit: 'L'
      };

      const result = fuelCombustionEntrySchema.safeParse(entryWithoutNotes);
      expect(result.success).toBe(true);
    });
  });

  describe('Vehicle Entry Schema', () => {
    it('should validate valid vehicle entry', () => {
      const validEntry = {
        vehicleType: 'truck',
        fuelType: 'diesel',
        quantity: 500,
        unit: 'km'
      };

      const result = vehicleEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should reject missing vehicleType', () => {
      const invalidEntry = {
        fuelType: 'diesel',
        quantity: 500,
        unit: 'km'
      };

      const result = vehicleEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });
  });

  describe('Electricity Entry Schema', () => {
    it('should validate valid electricity entry with kWh', () => {
      const validEntry = {
        quantity: 1000,
        unit: 'kWh',
        state: 'NSW',
        renewablePercentage: 25
      };

      const result = electricityEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should validate valid electricity entry with MWh', () => {
      const validEntry = {
        quantity: 1,
        unit: 'MWh',
        state: 'VIC'
      };

      const result = electricityEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should reject invalid unit', () => {
      const invalidEntry = {
        quantity: 1000,
        unit: 'invalid_unit',
        state: 'NSW'
      };

      const result = electricityEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject renewable percentage over 100', () => {
      const invalidEntry = {
        quantity: 1000,
        unit: 'kWh',
        renewablePercentage: 150
      };

      const result = electricityEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject renewable percentage below 0', () => {
      const invalidEntry = {
        quantity: 1000,
        unit: 'kWh',
        renewablePercentage: -10
      };

      const result = electricityEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should accept all valid Australian states', () => {
      const states = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
      
      for (const state of states) {
        const entry = {
          quantity: 1000,
          unit: 'kWh',
          state
        };
        const result = electricityEntrySchema.safeParse(entry);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Scope 1 Form Data Schema', () => {
    it('should validate form with fuel combustion data', () => {
      const validData = {
        fuelCombustion: [
          { fuelType: 'diesel', quantity: 100, unit: 'L' }
        ]
      };

      const result = validateScope1Data(validData);
      expect(result.success).toBe(true);
    });

    it('should validate form with multiple emission sources', () => {
      const validData = {
        fuelCombustion: [
          { fuelType: 'diesel', quantity: 100, unit: 'L' }
        ],
        vehicles: [
          { vehicleType: 'truck', fuelType: 'diesel', quantity: 500, unit: 'km' }
        ]
      };

      const result = validateScope1Data(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty form (no emission sources)', () => {
      const emptyData = {};

      const result = validateScope1Data(emptyData);
      expect(result.success).toBe(false);
    });

    it('should reject form with empty arrays only', () => {
      const emptyArraysData = {
        fuelCombustion: [],
        vehicles: []
      };

      const result = validateScope1Data(emptyArraysData);
      expect(result.success).toBe(false);
    });
  });

  describe('Scope 2 Form Data Schema', () => {
    it('should validate form with electricity data', () => {
      const validData = {
        electricity: [
          { quantity: 1000, unit: 'kWh', state: 'NSW' }
        ]
      };

      const result = validateScope2Data(validData);
      expect(result.success).toBe(true);
    });

    it('should validate form with heating data', () => {
      const validData = {
        heating: [
          { quantity: 500, unit: 'GJ', state: 'VIC' }
        ]
      };

      const result = validateScope2Data(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty form', () => {
      const emptyData = {};

      const result = validateScope2Data(emptyData);
      expect(result.success).toBe(false);
    });
  });

  describe('Activity Entry Schema (Scope 3)', () => {
    it('should validate valid activity entry', () => {
      const validEntry = {
        category: 1,
        categoryName: 'Purchased Goods',
        quantity: 1000,
        unit: 'kg',
        emissionFactor: 2.5
      };

      const result = activityEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should reject category below 1', () => {
      const invalidEntry = {
        category: 0,
        quantity: 1000,
        unit: 'kg',
        emissionFactor: 2.5
      };

      const result = activityEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should reject category above 15', () => {
      const invalidEntry = {
        category: 16,
        quantity: 1000,
        unit: 'kg',
        emissionFactor: 2.5
      };

      const result = activityEntrySchema.safeParse(invalidEntry);
      expect(result.success).toBe(false);
    });

    it('should validate supplier data flag', () => {
      const entryWithSupplierData = {
        category: 1,
        quantity: 1000,
        unit: 'kg',
        emissionFactor: 2.5,
        supplierData: true
      };

      const result = activityEntrySchema.safeParse(entryWithSupplierData);
      expect(result.success).toBe(true);
    });
  });

  describe('Scope 3 Form Data Schema', () => {
    it('should validate form with upstream activities', () => {
      const validData = {
        upstreamActivities: [
          { category: 1, quantity: 1000, unit: 'kg', emissionFactor: 2.5 }
        ]
      };

      const result = validateScope3Data(validData);
      expect(result.success).toBe(true);
    });

    it('should validate form with downstream activities', () => {
      const validData = {
        downstreamActivities: [
          { category: 9, quantity: 500, unit: 't-km', emissionFactor: 0.1 }
        ]
      };

      const result = validateScope3Data(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty form', () => {
      const emptyData = {};

      const result = validateScope3Data(emptyData);
      expect(result.success).toBe(false);
    });
  });

  describe('Error Formatting', () => {
    it('should format validation errors correctly', () => {
      const invalidData = {
        fuelCombustion: [
          { fuelType: '', quantity: -100, unit: 'L' }
        ]
      };

      const result = validateScope1Data(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        const formattedErrors = formatValidationErrors(result.error);
        expect(typeof formattedErrors).toBe('string');
        expect(formattedErrors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Boundary Value Testing', () => {
    it('should accept minimum valid quantity (just above 0)', () => {
      const entry = {
        fuelType: 'diesel',
        quantity: 0.001,
        unit: 'L'
      };

      const result = fuelCombustionEntrySchema.safeParse(entry);
      expect(result.success).toBe(true);
    });

    it('should accept very large quantities', () => {
      const entry = {
        fuelType: 'diesel',
        quantity: 1000000000,
        unit: 'L'
      };

      const result = fuelCombustionEntrySchema.safeParse(entry);
      expect(result.success).toBe(true);
    });

    it('should accept renewable percentage at boundaries (0 and 100)', () => {
      const entryZero = {
        quantity: 1000,
        unit: 'kWh',
        renewablePercentage: 0
      };

      const entryHundred = {
        quantity: 1000,
        unit: 'kWh',
        renewablePercentage: 100
      };

      expect(electricityEntrySchema.safeParse(entryZero).success).toBe(true);
      expect(electricityEntrySchema.safeParse(entryHundred).success).toBe(true);
    });
  });

  describe('Type Coercion', () => {
    it('should reject string quantity (no implicit coercion)', () => {
      const entry = {
        fuelType: 'diesel',
        quantity: '100' as unknown as number,
        unit: 'L'
      };

      const result = fuelCombustionEntrySchema.safeParse(entry);
      expect(result.success).toBe(false);
    });

    it('should reject null values', () => {
      const entry = {
        fuelType: 'diesel',
        quantity: null as unknown as number,
        unit: 'L'
      };

      const result = fuelCombustionEntrySchema.safeParse(entry);
      expect(result.success).toBe(false);
    });
  });
});
