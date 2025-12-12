/**
 * Tests for emission-factors.ts
 * 
 * Priority 1 - Critical Business Logic
 * Verifies emission factors match Australian standards
 */

import { describe, it, expect } from 'vitest';
import {
  MATERIAL_DB,
  FUEL_FACTORS,
  STATE_ELEC_FACTORS,
  TRANSPORT_FACTORS,
  COMMUTE_FACTORS,
  WASTE_FACTORS,
  A5_EQUIPMENT_FACTORS
} from '../emission-factors';

describe('Emission Factors', () => {
  describe('Material Database', () => {
    it('should have all required material categories', () => {
      const requiredCategories = ['concrete', 'steel', 'masonry', 'flooring', 'doors_windows', 'timber'];
      
      for (const category of requiredCategories) {
        expect(MATERIAL_DB).toHaveProperty(category);
      }
    });

    it('should have valid structure for each material category', () => {
      for (const [_key, category] of Object.entries(MATERIAL_DB)) {
        expect(category).toHaveProperty('label');
        expect(category).toHaveProperty('unit');
        expect(category).toHaveProperty('items');
        expect(Array.isArray(category.items)).toBe(true);
        expect(category.items.length).toBeGreaterThan(0);
      }
    });

    it('should have valid structure for each material item', () => {
      for (const [_key, category] of Object.entries(MATERIAL_DB)) {
        for (const item of category.items) {
          expect(item).toHaveProperty('id');
          expect(item).toHaveProperty('name');
          expect(item).toHaveProperty('factor');
          expect(item).toHaveProperty('source');
          expect(typeof item.factor).toBe('number');
          expect(item.factor).toBeGreaterThan(0);
        }
      }
    });

    it('should have unique IDs across all materials', () => {
      const allIds: string[] = [];
      
      for (const [_key, category] of Object.entries(MATERIAL_DB)) {
        for (const item of category.items) {
          allIds.push(item.id);
        }
      }

      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('should have NMEF source references', () => {
      for (const [_key, category] of Object.entries(MATERIAL_DB)) {
        for (const item of category.items) {
          expect(item.source).toMatch(/NMEF|Est/);
        }
      }
    });

    describe('Concrete Factors', () => {
      it('should have increasing factors for higher MPa grades', () => {
        const concrete = MATERIAL_DB.concrete.items;
        const c20 = concrete.find(c => c.id === 'c_20');
        const c25 = concrete.find(c => c.id === 'c_25');
        const c32 = concrete.find(c => c.id === 'c_32');
        const c40 = concrete.find(c => c.id === 'c_40');
        const c50 = concrete.find(c => c.id === 'c_50');

        expect(c20!.factor).toBeLessThan(c25!.factor);
        expect(c25!.factor).toBeLessThan(c32!.factor);
        expect(c32!.factor).toBeLessThan(c40!.factor);
        expect(c40!.factor).toBeLessThan(c50!.factor);
      });

      it('should use m³ as unit for concrete', () => {
        expect(MATERIAL_DB.concrete.unit).toBe('m³');
      });
    });

    describe('Steel Factors', () => {
      it('should use Tonnes as unit for steel', () => {
        expect(MATERIAL_DB.steel.unit).toBe('Tonnes');
      });

      it('should have higher factor for aluminium than steel', () => {
        const steel = MATERIAL_DB.steel.items;
        const structuralSteel = steel.find(s => s.id === 's_struc_hot');
        const aluminium = steel.find(s => s.id === 'al_ext');

        expect(aluminium!.factor).toBeGreaterThan(structuralSteel!.factor);
      });
    });
  });

  describe('Fuel Factors', () => {
    it('should have all common fuel types', () => {
      const requiredFuels = ['diesel_transport', 'diesel_stationary', 'petrol', 'lpg', 'natural_gas'];
      
      for (const fuel of requiredFuels) {
        expect(FUEL_FACTORS).toHaveProperty(fuel);
      }
    });

    it('should have valid structure for each fuel type', () => {
      for (const [_key, fuel] of Object.entries(FUEL_FACTORS)) {
        expect(fuel).toHaveProperty('name');
        expect(fuel).toHaveProperty('unit');
        expect(fuel).toHaveProperty('factor');
        expect(typeof fuel.factor).toBe('number');
        expect(fuel.factor).toBeGreaterThan(0);
      }
    });

    it('should have diesel and petrol using Litres as unit', () => {
      expect(FUEL_FACTORS.diesel_transport.unit).toBe('Litres');
      expect(FUEL_FACTORS.diesel_stationary.unit).toBe('Litres');
      expect(FUEL_FACTORS.petrol.unit).toBe('Litres');
    });

    it('should have same factor for diesel transport and stationary', () => {
      expect(FUEL_FACTORS.diesel_transport.factor).toBe(FUEL_FACTORS.diesel_stationary.factor);
    });

    it('should have LPG factor lower than diesel/petrol (cleaner fuel)', () => {
      expect(FUEL_FACTORS.lpg.factor).toBeLessThan(FUEL_FACTORS.diesel_transport.factor);
      expect(FUEL_FACTORS.lpg.factor).toBeLessThan(FUEL_FACTORS.petrol.factor);
    });
  });

  describe('State Electricity Factors', () => {
    it('should have all Australian states and territories', () => {
      const requiredStates = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
      
      for (const state of requiredStates) {
        expect(STATE_ELEC_FACTORS).toHaveProperty(state);
      }
    });

    it('should have valid structure for each state', () => {
      for (const [_key, state] of Object.entries(STATE_ELEC_FACTORS)) {
        expect(state).toHaveProperty('factor');
        expect(state).toHaveProperty('name');
        expect(typeof state.factor).toBe('number');
        expect(state.factor).toBeGreaterThan(0);
        expect(state.factor).toBeLessThan(2); // Reasonable upper bound
      }
    });

    it('should have Tasmania with lowest factor (hydro power)', () => {
      const factors = Object.entries(STATE_ELEC_FACTORS).map(([key, val]) => ({
        state: key,
        factor: val.factor
      }));
      
      const sortedByFactor = factors.sort((a, b) => a.factor - b.factor);
      expect(sortedByFactor[0].state).toBe('TAS');
    });

    it('should have Victoria with highest factor (brown coal legacy)', () => {
      const factors = Object.entries(STATE_ELEC_FACTORS).map(([key, val]) => ({
        state: key,
        factor: val.factor
      }));
      
      const sortedByFactor = factors.sort((a, b) => b.factor - a.factor);
      expect(sortedByFactor[0].state).toBe('VIC');
    });

    it('should have ACT and NSW with same factor (shared grid)', () => {
      expect(STATE_ELEC_FACTORS.ACT.factor).toBe(STATE_ELEC_FACTORS.NSW.factor);
    });
  });

  describe('Transport Factors', () => {
    it('should have required transport types', () => {
      expect(TRANSPORT_FACTORS).toHaveProperty('commute_car');
      expect(TRANSPORT_FACTORS).toHaveProperty('commute_ute');
      expect(TRANSPORT_FACTORS).toHaveProperty('waste_general');
    });

    it('should have higher factor for utes than cars (less fuel efficient)', () => {
      expect(TRANSPORT_FACTORS.commute_ute.factor).toBeGreaterThan(TRANSPORT_FACTORS.commute_car.factor);
    });
  });

  describe('Commute Factors', () => {
    it('should have all common transport modes', () => {
      const requiredModes = ['car_petrol', 'car_diesel', 'car_hybrid', 'car_ev', 'ute', 'motorcycle', 'bus', 'train', 'bicycle'];
      
      for (const mode of requiredModes) {
        expect(COMMUTE_FACTORS).toHaveProperty(mode);
      }
    });

    it('should have bicycle with zero emissions', () => {
      expect(COMMUTE_FACTORS.bicycle.factor).toBe(0);
    });

    it('should have EV with lower emissions than petrol car', () => {
      expect(COMMUTE_FACTORS.car_ev.factor).toBeLessThan(COMMUTE_FACTORS.car_petrol.factor);
    });

    it('should have hybrid between EV and petrol', () => {
      expect(COMMUTE_FACTORS.car_hybrid.factor).toBeGreaterThan(COMMUTE_FACTORS.car_ev.factor);
      expect(COMMUTE_FACTORS.car_hybrid.factor).toBeLessThan(COMMUTE_FACTORS.car_petrol.factor);
    });

    it('should have public transport lower than private car', () => {
      expect(COMMUTE_FACTORS.bus.factor).toBeLessThan(COMMUTE_FACTORS.car_petrol.factor);
      expect(COMMUTE_FACTORS.train.factor).toBeLessThan(COMMUTE_FACTORS.car_petrol.factor);
    });
  });

  describe('Waste Factors', () => {
    it('should have common construction waste types', () => {
      const requiredTypes = ['general_landfill', 'construction_mixed', 'concrete_waste', 'timber_waste', 'metal_waste', 'plastic_waste', 'plasterboard_waste'];
      
      for (const type of requiredTypes) {
        expect(WASTE_FACTORS).toHaveProperty(type);
      }
    });

    it('should have recycled metal with negative factor (carbon credit)', () => {
      expect(WASTE_FACTORS.metal_waste.factor).toBeLessThan(0);
    });

    it('should have kg as unit for all waste types', () => {
      for (const [_key, waste] of Object.entries(WASTE_FACTORS)) {
        expect(waste.unit).toBe('kg');
      }
    });

    it('should have concrete waste with lowest positive factor (inert material)', () => {
      const positivefactors = Object.entries(WASTE_FACTORS)
        .filter(([_, w]) => w.factor > 0)
        .map(([key, val]) => ({ type: key, factor: val.factor }));
      
      const sortedByFactor = positivefactors.sort((a, b) => a.factor - b.factor);
      expect(sortedByFactor[0].type).toBe('concrete_waste');
    });
  });

  describe('A5 Equipment Factors', () => {
    it('should have equipment categories', () => {
      const categories = new Set(Object.values(A5_EQUIPMENT_FACTORS).map(e => e.category));
      
      expect(categories.has('equipment')).toBe(true);
      expect(categories.has('generator')).toBe(true);
      expect(categories.has('installation')).toBe(true);
      expect(categories.has('facilities')).toBe(true);
    });

    it('should have valid structure for each equipment', () => {
      for (const [_key, equipment] of Object.entries(A5_EQUIPMENT_FACTORS)) {
        expect(equipment).toHaveProperty('name');
        expect(equipment).toHaveProperty('unit');
        expect(equipment).toHaveProperty('factor');
        expect(equipment).toHaveProperty('category');
        expect(typeof equipment.factor).toBe('number');
        expect(equipment.factor).toBeGreaterThan(0);
      }
    });

    it('should have larger excavators with higher factors', () => {
      expect(A5_EQUIPMENT_FACTORS.excavator_small.factor).toBeLessThan(A5_EQUIPMENT_FACTORS.excavator_medium.factor);
      expect(A5_EQUIPMENT_FACTORS.excavator_medium.factor).toBeLessThan(A5_EQUIPMENT_FACTORS.excavator_large.factor);
    });

    it('should have electric forklift with lower factor than diesel', () => {
      expect(A5_EQUIPMENT_FACTORS.forklift_electric.factor).toBeLessThan(A5_EQUIPMENT_FACTORS.forklift.factor);
    });

    it('should have larger generators with higher factors', () => {
      expect(A5_EQUIPMENT_FACTORS.generator_10kva.factor).toBeLessThan(A5_EQUIPMENT_FACTORS.generator_25kva.factor);
      expect(A5_EQUIPMENT_FACTORS.generator_25kva.factor).toBeLessThan(A5_EQUIPMENT_FACTORS.generator_50kva.factor);
      expect(A5_EQUIPMENT_FACTORS.generator_50kva.factor).toBeLessThan(A5_EQUIPMENT_FACTORS.generator_100kva.factor);
      expect(A5_EQUIPMENT_FACTORS.generator_100kva.factor).toBeLessThan(A5_EQUIPMENT_FACTORS.generator_250kva.factor);
    });
  });

  describe('Data Consistency', () => {
    it('should have no null or undefined factors anywhere', () => {
      // Check all factor objects
      const allFactorObjects = [
        FUEL_FACTORS,
        STATE_ELEC_FACTORS,
        TRANSPORT_FACTORS,
        COMMUTE_FACTORS,
        WASTE_FACTORS,
        A5_EQUIPMENT_FACTORS
      ];

      for (const factorObj of allFactorObjects) {
        for (const [_key, value] of Object.entries(factorObj)) {
          expect(value.factor).not.toBeNull();
          expect(value.factor).not.toBeUndefined();
          expect(Number.isNaN(value.factor)).toBe(false);
        }
      }
    });

    it('should have no empty names', () => {
      const allFactorObjects = [
        FUEL_FACTORS,
        STATE_ELEC_FACTORS,
        TRANSPORT_FACTORS,
        COMMUTE_FACTORS,
        WASTE_FACTORS,
        A5_EQUIPMENT_FACTORS
      ];

      for (const factorObj of allFactorObjects) {
        for (const [_key, value] of Object.entries(factorObj)) {
          expect(value.name.length).toBeGreaterThan(0);
        }
      }
    });

    it('should have no empty units (except where intentionally missing)', () => {
      const factorObjectsWithUnits = [
        FUEL_FACTORS,
        TRANSPORT_FACTORS,
        COMMUTE_FACTORS,
        WASTE_FACTORS,
        A5_EQUIPMENT_FACTORS
      ];

      for (const factorObj of factorObjectsWithUnits) {
        for (const [_key, value] of Object.entries(factorObj)) {
          expect(value.unit.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
