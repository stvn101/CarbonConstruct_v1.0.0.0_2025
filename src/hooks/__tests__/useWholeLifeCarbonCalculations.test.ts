/**
 * Tests for useWholeLifeCarbonCalculations hook
 * Validates EN 15978 full lifecycle (A1-D) carbon calculations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '../../../src/lib/__tests__/setup';
import { useWholeLifeCarbonCalculations, loadStoredWholeLifeTotals } from '../useWholeLifeCarbonCalculations';

describe('useWholeLifeCarbonCalculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('upfront emissions (A1-A5)', () => {
    it('calculates total upfront from A1-A3, A4, A5', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 200, a5: 100 },
        })
      );

      expect(result.current.a1a3_product).toBe(1000);
      expect(result.current.a4_transport).toBe(200);
      expect(result.current.a5_construction).toBe(100);
      expect(result.current.total_upfront).toBe(1300);
    });

    it('handles zero upfront values', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 0, a4: 0, a5: 0 },
        })
      );

      expect(result.current.total_upfront).toBe(0);
    });

    it('handles undefined upfront values as zero', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: undefined as any, a4: 100, a5: undefined as any },
        })
      );

      expect(result.current.a1a3_product).toBe(0);
      expect(result.current.a4_transport).toBe(100);
      expect(result.current.total_upfront).toBe(100);
    });
  });

  describe('use phase emissions (B1-B7)', () => {
    it('calculates use phase from B1-B7 inputs', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 0, a5: 0 },
          usePhaseEmissions: {
            b1_use: 50,
            b2_maintenance: 100,
            b3_repair: 30,
            b4_replacement: 200,
            b5_refurbishment: 150,
            b6_operational_energy: 500,
            b7_operational_water: 25,
            total: 1055,
          },
        })
      );

      expect(result.current.b1_use).toBe(50);
      expect(result.current.b2_maintenance).toBe(100);
      expect(result.current.b3_repair).toBe(30);
      expect(result.current.b4_replacement).toBe(200);
      expect(result.current.b5_refurbishment).toBe(150);
      expect(result.current.b6_operational_energy).toBe(500);
      expect(result.current.b7_operational_water).toBe(25);
      expect(result.current.total_operational).toBe(525); // B6 + B7
    });

    it('handles null use phase emissions', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 0, a5: 0 },
          usePhaseEmissions: null,
        })
      );

      expect(result.current.b1_use).toBe(0);
      expect(result.current.total_operational).toBe(0);
    });
  });

  describe('end of life emissions (C1-C4)', () => {
    it('calculates end of life from C1-C4 inputs', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 0, a5: 0 },
          endOfLifeEmissions: {
            c1_deconstruction: 50,
            c2_transport: 30,
            c3_waste_processing: 80,
            c4_disposal: 40,
            total: 200,
          },
        })
      );

      expect(result.current.c1_deconstruction).toBe(50);
      expect(result.current.c2_transport).toBe(30);
      expect(result.current.c3_waste_processing).toBe(80);
      expect(result.current.c4_disposal).toBe(40);
    });

    it('handles null end of life emissions', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 0, a5: 0 },
          endOfLifeEmissions: null,
        })
      );

      expect(result.current.c1_deconstruction).toBe(0);
      expect(result.current.c4_disposal).toBe(0);
    });
  });

  describe('module D credits', () => {
    it('applies recycling, reuse, and energy recovery credits', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 0, a5: 0 },
          moduleDCredits: {
            recycling_credits: -200,
            reuse_credits: -100,
            energy_recovery_credits: -50,
            total: -350,
          },
        })
      );

      expect(result.current.d_recycling).toBe(-200);
      expect(result.current.d_reuse).toBe(-100);
      expect(result.current.d_energy_recovery).toBe(-50);
    });

    it('handles null module D credits', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 0, a5: 0 },
          moduleDCredits: null,
        })
      );

      expect(result.current.d_recycling).toBe(0);
      expect(result.current.d_reuse).toBe(0);
    });
  });

  describe('aggregate calculations', () => {
    it('calculates total_embodied correctly (A1-A5 + B1-B5 + C1-C4)', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 100, a5: 50 }, // 1150
          usePhaseEmissions: {
            b1_use: 10, b2_maintenance: 20, b3_repair: 10,
            b4_replacement: 30, b5_refurbishment: 30, // B1-B5 = 100
            b6_operational_energy: 500, b7_operational_water: 50,
            total: 650,
          },
          endOfLifeEmissions: {
            c1_deconstruction: 20, c2_transport: 10,
            c3_waste_processing: 15, c4_disposal: 5, // C1-C4 = 50
            total: 50,
          },
        })
      );

      expect(result.current.total_upfront).toBe(1150);
      expect(result.current.total_embodied).toBe(1300); // 1150 + 100 + 50
    });

    it('calculates total_whole_life correctly (embodied + operational)', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 0, a5: 0 },
          usePhaseEmissions: {
            b1_use: 0, b2_maintenance: 0, b3_repair: 0,
            b4_replacement: 0, b5_refurbishment: 0,
            b6_operational_energy: 500, b7_operational_water: 100,
            total: 600,
          },
        })
      );

      expect(result.current.total_operational).toBe(600);
      expect(result.current.total_whole_life).toBe(1600); // 1000 + 600
    });

    it('calculates total_with_benefits correctly (whole life + module D)', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 0, a5: 0 },
          moduleDCredits: {
            recycling_credits: -200,
            reuse_credits: -50,
            energy_recovery_credits: -50,
            total: -300,
          },
        })
      );

      expect(result.current.total_whole_life).toBe(1000);
      expect(result.current.total_with_benefits).toBe(700); // 1000 - 300
    });
  });

  describe('intensity calculations', () => {
    it('calculates per m² intensity when buildingSqm provided', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 10000, a4: 0, a5: 0 },
          buildingSqm: 100,
        })
      );

      expect(result.current.intensity_upfront).toBe(100); // 10000 / 100
      expect(result.current.intensity_whole_life).toBe(100);
    });

    it('does not include intensity when buildingSqm is 0', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 0, a5: 0 },
          buildingSqm: 0,
        })
      );

      expect(result.current.intensity_upfront).toBeUndefined();
      expect(result.current.intensity_whole_life).toBeUndefined();
    });

    it('does not include intensity when buildingSqm not provided', () => {
      const { result } = renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 0, a5: 0 },
        })
      );

      expect(result.current.intensity_upfront).toBeUndefined();
    });
  });

  describe('localStorage persistence', () => {
    it('persists totals to localStorage', () => {
      renderHook(() =>
        useWholeLifeCarbonCalculations({
          upfrontEmissions: { a1a3: 1000, a4: 200, a5: 100 },
        })
      );

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'wholeLifeCarbonTotals',
        expect.any(String)
      );
    });
  });

  describe('loadStoredWholeLifeTotals', () => {
    it('returns null when no stored data', () => {
      (localStorage.getItem as any).mockReturnValue(null);
      const result = loadStoredWholeLifeTotals();
      expect(result).toBeNull();
    });

    it('parses stored JSON correctly', () => {
      const storedData = { total_upfront: 1000, a1a3_product: 800 };
      (localStorage.getItem as any).mockReturnValue(JSON.stringify(storedData));
      
      const result = loadStoredWholeLifeTotals();
      expect(result).toEqual(storedData);
    });

    it('returns null on parse error', () => {
      (localStorage.getItem as any).mockReturnValue('invalid json');
      const result = loadStoredWholeLifeTotals();
      expect(result).toBeNull();
    });
  });
});
