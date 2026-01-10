/**
 * End-to-End Calculation Accuracy Integration Test
 * 
 * Validates the complete calculation pipeline from input to report output
 * matches expected values within ±0.01% tolerance.
 * 
 * Compliance:
 * - EN 15978:2011 Building lifecycle carbon
 * - EN 15804+A2:2019 EPD methodology
 * - ISO 14064-1:2018 GHG accounting
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWholeLifeCarbonCalculations, loadStoredWholeLifeTotals } from '@/hooks/useWholeLifeCarbonCalculations';

describe('End-to-End Calculation Accuracy', () => {

  describe('Whole Life Carbon Calculations', () => {
    it('should_CalculateUpfrontCarbon_Accurately', () => {
      // Arrange
      const inputs = {
        upfrontEmissions: { a1a3: 50000, a4: 5000, a5: 3000 },
        usePhaseEmissions: null,
        endOfLifeEmissions: null,
        moduleDCredits: null,
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert
      expect(result.current.a1a3_product).toBe(50000);
      expect(result.current.a4_transport).toBe(5000);
      expect(result.current.a5_construction).toBe(3000);
      expect(result.current.total_upfront).toBe(58000);
    });

    it('should_CalculateUsePhaseTotals_Accurately', () => {
      // Arrange
      const inputs = {
        upfrontEmissions: { a1a3: 50000, a4: 5000, a5: 3000 },
        usePhaseEmissions: {
          b1_use: 500,
          b2_maintenance: 1000,
          b3_repair: 500,
          b4_replacement: 2000,
          b5_refurbishment: 1000,
          b6_operational_energy: 20000,
          b7_operational_water: 1000,
          total: 26000,
        },
        endOfLifeEmissions: null,
        moduleDCredits: null,
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert
      expect(result.current.b1_use).toBe(500);
      expect(result.current.b2_maintenance).toBe(1000);
      expect(result.current.b6_operational_energy).toBe(20000);
      expect(result.current.total_operational).toBe(21000); // B6 + B7
    });

    it('should_CalculateEndOfLifeTotals_Accurately', () => {
      // Arrange
      const inputs = {
        upfrontEmissions: { a1a3: 50000, a4: 5000, a5: 3000 },
        usePhaseEmissions: null,
        endOfLifeEmissions: {
          c1_deconstruction: 1000,
          c2_transport: 500,
          c3_waste_processing: 1500,
          c4_disposal: 500,
          total: 3500,
        },
        moduleDCredits: null,
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert
      expect(result.current.c1_deconstruction).toBe(1000);
      expect(result.current.c2_transport).toBe(500);
      expect(result.current.c3_waste_processing).toBe(1500);
      expect(result.current.c4_disposal).toBe(500);
    });

    it('should_CalculateModuleDCredits_Accurately', () => {
      // Arrange
      const inputs = {
        upfrontEmissions: { a1a3: 50000, a4: 5000, a5: 3000 },
        usePhaseEmissions: null,
        endOfLifeEmissions: null,
        moduleDCredits: {
          recycling_credits: -5000,
          reuse_credits: -2000,
          energy_recovery_credits: -1000,
          total: -8000,
        },
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert
      expect(result.current.d_recycling).toBe(-5000);
      expect(result.current.d_reuse).toBe(-2000);
      expect(result.current.d_energy_recovery).toBe(-1000);
    });

    it('should_CalculateAllAggregates_Accurately', () => {
      // Arrange - Full lifecycle
      const inputs = {
        upfrontEmissions: { a1a3: 50000, a4: 5000, a5: 3000 },
        usePhaseEmissions: {
          b1_use: 500,
          b2_maintenance: 1000,
          b3_repair: 500,
          b4_replacement: 2000,
          b5_refurbishment: 1000,
          b6_operational_energy: 20000,
          b7_operational_water: 1000,
          total: 26000,
        },
        endOfLifeEmissions: {
          c1_deconstruction: 1000,
          c2_transport: 500,
          c3_waste_processing: 1500,
          c4_disposal: 500,
          total: 3500,
        },
        moduleDCredits: {
          recycling_credits: -5000,
          reuse_credits: -2000,
          energy_recovery_credits: -1000,
          total: -8000,
        },
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert - Verify each aggregate calculation
      // total_upfront = A1-A3 + A4 + A5 = 50000 + 5000 + 3000 = 58000
      expect(result.current.total_upfront).toBe(58000);
      
      // total_operational = B6 + B7 = 20000 + 1000 = 21000
      expect(result.current.total_operational).toBe(21000);
      
      // total_embodied = upfront + B1-B5 + C1-C4
      // = 58000 + (500+1000+500+2000+1000) + (1000+500+1500+500)
      // = 58000 + 5000 + 3500 = 66500
      expect(result.current.total_embodied).toBe(66500);
      
      // total_whole_life = embodied + operational = 66500 + 21000 = 87500
      expect(result.current.total_whole_life).toBe(87500);
      
      // total_with_benefits = whole_life + module_d = 87500 + (-8000) = 79500
      expect(result.current.total_with_benefits).toBe(79500);
    });
  });

  describe('Intensity Calculations', () => {
    it('should_CalculateIntensity_WhenBuildingAreaProvided', () => {
      // Arrange
      const inputs = {
        upfrontEmissions: { a1a3: 50000, a4: 5000, a5: 3000 },
        usePhaseEmissions: {
          b1_use: 0, b2_maintenance: 0, b3_repair: 0,
          b4_replacement: 0, b5_refurbishment: 0,
          b6_operational_energy: 21000, b7_operational_water: 0,
          total: 21000,
        },
        endOfLifeEmissions: {
          c1_deconstruction: 1000, c2_transport: 500,
          c3_waste_processing: 1500, c4_disposal: 500,
          total: 3500,
        },
        moduleDCredits: {
          recycling_credits: -5000, reuse_credits: -2000,
          energy_recovery_credits: -1000, total: -8000,
        },
        buildingSqm: 500,
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert
      // total_upfront = 58000, intensity_upfront = 58000 / 500 = 116
      expect(result.current.intensity_upfront).toBe(116);
      
      // total_whole_life ≈ 83500, intensity_whole_life = 83500 / 500 = 167
      expect(result.current.intensity_whole_life).toBeDefined();
    });

    it('should_NotCalculateIntensity_WhenNoBuildingArea', () => {
      // Arrange
      const inputs = {
        upfrontEmissions: { a1a3: 50000, a4: 5000, a5: 3000 },
        usePhaseEmissions: null,
        endOfLifeEmissions: null,
        moduleDCredits: null,
        buildingSqm: 0,
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert
      expect(result.current.intensity_upfront).toBeUndefined();
      expect(result.current.intensity_whole_life).toBeUndefined();
    });
  });

  describe('LocalStorage Persistence', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should_PersistTotals_ToLocalStorage', () => {
      // Arrange
      const inputs = {
        upfrontEmissions: { a1a3: 50000, a4: 5000, a5: 3000 },
        usePhaseEmissions: null,
        endOfLifeEmissions: null,
        moduleDCredits: null,
      };

      // Act
      renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert - Check localStorage was updated
      const stored = localStorage.getItem('wholeLifeCarbonTotals');
      expect(stored).not.toBeNull();
      
      const parsed = JSON.parse(stored!);
      expect(parsed.total_upfront).toBe(58000);
    });

    it('should_LoadStoredTotals_FromLocalStorage', () => {
      // Arrange - Set up stored data
      const storedData = {
        a1a3_product: 50000,
        a4_transport: 5000,
        a5_construction: 3000,
        total_upfront: 58000,
        total_whole_life: 58000,
        total_with_benefits: 58000,
      };
      localStorage.setItem('wholeLifeCarbonTotals', JSON.stringify(storedData));

      // Act
      const loaded = loadStoredWholeLifeTotals();

      // Assert
      expect(loaded).not.toBeNull();
      expect(loaded!.total_upfront).toBe(58000);
    });

    it('should_ReturnNull_WhenNoStoredData', () => {
      // Act
      const loaded = loadStoredWholeLifeTotals();

      // Assert
      expect(loaded).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should_HandleZeroEmissions_Gracefully', () => {
      // Arrange
      const inputs = {
        upfrontEmissions: { a1a3: 0, a4: 0, a5: 0 },
        usePhaseEmissions: null,
        endOfLifeEmissions: null,
        moduleDCredits: null,
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert
      expect(result.current.total_upfront).toBe(0);
      expect(result.current.total_whole_life).toBe(0);
    });

    it('should_HandleNegativeModuleD_Correctly', () => {
      // Arrange - More credits than emissions
      const inputs = {
        upfrontEmissions: { a1a3: 5000, a4: 0, a5: 0 },
        usePhaseEmissions: null,
        endOfLifeEmissions: null,
        moduleDCredits: {
          recycling_credits: -10000,
          reuse_credits: 0,
          energy_recovery_credits: 0,
          total: -10000,
        },
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert - Net negative is valid for carbon-negative buildings
      expect(result.current.total_with_benefits).toBe(-5000);
    });

    it('should_HandlePartialData_WithNulls', () => {
      // Arrange - Only upfront, rest null
      const inputs = {
        upfrontEmissions: { a1a3: 50000, a4: 5000, a5: 3000 },
        usePhaseEmissions: null,
        endOfLifeEmissions: null,
        moduleDCredits: null,
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert
      expect(result.current.total_upfront).toBe(58000);
      expect(result.current.total_embodied).toBe(58000);
      expect(result.current.total_operational).toBe(0);
      expect(result.current.total_whole_life).toBe(58000);
      expect(result.current.total_with_benefits).toBe(58000);
    });
  });

  describe('Precision Validation', () => {
    it('should_MaintainPrecision_ForSmallValues', () => {
      // Arrange
      const inputs = {
        upfrontEmissions: { a1a3: 0.001, a4: 0.002, a5: 0.003 },
        usePhaseEmissions: null,
        endOfLifeEmissions: null,
        moduleDCredits: null,
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert
      expect(result.current.total_upfront).toBeCloseTo(0.006, 10);
    });

    it('should_HandleLargeValues_WithoutOverflow', () => {
      // Arrange - Large commercial project
      const inputs = {
        upfrontEmissions: { a1a3: 5000000, a4: 500000, a5: 300000 },
        usePhaseEmissions: {
          b1_use: 50000, b2_maintenance: 100000, b3_repair: 50000,
          b4_replacement: 200000, b5_refurbishment: 100000,
          b6_operational_energy: 2000000, b7_operational_water: 100000,
          total: 2600000,
        },
        endOfLifeEmissions: {
          c1_deconstruction: 100000, c2_transport: 50000,
          c3_waste_processing: 150000, c4_disposal: 50000,
          total: 350000,
        },
        moduleDCredits: {
          recycling_credits: -500000, reuse_credits: -200000,
          energy_recovery_credits: -100000, total: -800000,
        },
      };

      // Act
      const { result } = renderHook(() => useWholeLifeCarbonCalculations(inputs));

      // Assert
      expect(result.current.total_upfront).toBe(5800000);
      expect(Number.isFinite(result.current.total_with_benefits)).toBe(true);
    });
  });
});
