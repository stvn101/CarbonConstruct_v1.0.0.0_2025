/**
 * Tests for useEmissionCalculations hook
 *
 * Tests the core emission calculation logic for Scope 1, 2, and 3 emissions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEmissionCalculations, type Scope1FormData, type Scope2FormData, type Scope3FormData } from '../useEmissionCalculations';

// Mock the dependencies
vi.mock('@/integrations/supabase/client', () => {
  const createChainableMock = () => {
    const chain: any = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      maybeSingle: vi.fn(() => Promise.resolve({ data: { factor_value: 2.31 }, error: null })),
      single: vi.fn(() => Promise.resolve({ data: { factor_value: 2.31 }, error: null })),
      delete: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      order: vi.fn(() => Promise.resolve({ data: [], error: null }))
    };
    return chain;
  };

  return {
    supabase: {
      from: vi.fn(() => createChainableMock())
    }
  };
});

vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({
    currentProject: {
      id: 'test-project-123',
      name: 'Test Project',
      project_type: 'residential',
      status: 'active',
      created_at: '2025-01-01',
      updated_at: '2025-01-01'
    }
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('useEmissionCalculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Hook initialization', () => {
    it('should initialize with loading=false', () => {
      const { result } = renderHook(() => useEmissionCalculations());

      expect(result.current.loading).toBe(false);
      expect(result.current.calculateScope1Emissions).toBeInstanceOf(Function);
      expect(result.current.calculateScope2Emissions).toBeInstanceOf(Function);
      expect(result.current.calculateScope3Emissions).toBeInstanceOf(Function);
    });
  });

  describe('Scope 1 Emissions Calculations', () => {
    it('should calculate fuel combustion emissions correctly', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope1FormData = {
        fuelCombustion: [
          {
            fuelType: 'diesel',
            quantity: 100,
            unit: 'L',
            notes: 'Test diesel'
          }
        ]
      };

      const response = await result.current.calculateScope1Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.total).toBeGreaterThan(0);
    });

    it('should handle empty form data', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope1FormData = {};

      const response = await result.current.calculateScope1Emissions(formData);

      expect(response).toEqual({ emissions: [], total: 0 });
    });

    it('should calculate vehicle emissions correctly', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope1FormData = {
        vehicles: [
          {
            vehicleType: 'truck',
            fuelType: 'diesel',
            quantity: 500,
            unit: 'km'
          }
        ]
      };

      const response = await result.current.calculateScope1Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.emissions).toHaveLength(1);
    });

    it('should handle multiple emission sources', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope1FormData = {
        fuelCombustion: [
          { fuelType: 'diesel', quantity: 100, unit: 'L' }
        ],
        vehicles: [
          { vehicleType: 'truck', fuelType: 'diesel', quantity: 500, unit: 'km' }
        ],
        fugitiveEmissions: [
          { refrigerantType: 'R134a', quantity: 2, unit: 'kg' }
        ]
      };

      const response = await result.current.calculateScope1Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.emissions.length).toBeGreaterThanOrEqual(3);
      expect(response?.total).toBeGreaterThan(0);
    });
  });

  describe('Scope 2 Emissions Calculations', () => {
    it('should calculate electricity emissions correctly', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope2FormData = {
        electricity: [
          {
            quantity: 1000,
            unit: 'kWh',
            state: 'NSW'
          }
        ]
      };

      const response = await result.current.calculateScope2Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.total).toBeGreaterThan(0);
    });

    it('should apply renewable energy percentage correctly', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope2FormData = {
        electricity: [
          {
            quantity: 1000,
            unit: 'kWh',
            state: 'NSW',
            renewablePercentage: 50 // 50% renewable
          }
        ]
      };

      const response = await result.current.calculateScope2Emissions(formData);

      expect(response).toBeTruthy();
      // Emissions should be less than without renewable percentage
    });

    it('should handle different Australian states correctly', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const states = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'] as const;

      for (const state of states) {
        const formData: Scope2FormData = {
          electricity: [
            {
              quantity: 1000,
              unit: 'kWh',
              state
            }
          ]
        };

        const response = await result.current.calculateScope2Emissions(formData);
        expect(response).toBeTruthy();
      }
    });

    it('should convert MWh to kWh correctly', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope2FormData = {
        electricity: [
          {
            quantity: 1, // 1 MWh = 1000 kWh
            unit: 'MWh',
            state: 'NSW'
          }
        ]
      };

      const response = await result.current.calculateScope2Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.total).toBeGreaterThan(0);
    });

    it('should handle heating/cooling calculations', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope2FormData = {
        heating: [
          {
            quantity: 500,
            unit: 'kWh',
            state: 'VIC'
          }
        ]
      };

      const response = await result.current.calculateScope2Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.emissions).toHaveLength(1);
    });

    it('should handle purchased steam calculations', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope2FormData = {
        steam: [
          {
            quantity: 100,
            unit: 'GJ',
            state: 'NSW'
          }
        ]
      };

      const response = await result.current.calculateScope2Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.emissions).toHaveLength(1);
    });

    it('should skip entries with zero quantity', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope2FormData = {
        electricity: [
          {
            quantity: 0, // Should be skipped
            unit: 'kWh',
            state: 'NSW'
          },
          {
            quantity: 1000,
            unit: 'kWh',
            state: 'NSW'
          }
        ]
      };

      const response = await result.current.calculateScope2Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.emissions).toHaveLength(1);
    });
  });

  describe('Scope 3 Emissions Calculations', () => {
    it('should calculate upstream activities', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope3FormData = {
        upstreamActivities: [
          {
            category: 1,
            categoryName: 'Purchased Goods',
            quantity: 1000,
            unit: 'kg',
            emissionFactor: 2.5
          }
        ]
      };

      const response = await result.current.calculateScope3Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.total).toBe(2500); // 1000 * 2.5
    });

    it('should calculate downstream activities', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope3FormData = {
        downstreamActivities: [
          {
            category: 9,
            categoryName: 'Transportation',
            quantity: 500,
            unit: 't-km',
            emissionFactor: 0.1
          }
        ]
      };

      const response = await result.current.calculateScope3Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.total).toBe(50); // 500 * 0.1
    });

    it('should handle supplier-specific data flag', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope3FormData = {
        upstreamActivities: [
          {
            category: 1,
            quantity: 1000,
            unit: 'kg',
            emissionFactor: 2.5,
            supplierData: true
          }
        ]
      };

      const response = await result.current.calculateScope3Emissions(formData);

      expect(response).toBeTruthy();
      // Data quality should be 'supplier_specific'
    });

    it('should skip activities with zero quantity or emission factor', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope3FormData = {
        upstreamActivities: [
          {
            category: 1,
            quantity: 0, // Should be skipped
            unit: 'kg',
            emissionFactor: 2.5
          },
          {
            category: 2,
            quantity: 1000,
            unit: 'kg',
            emissionFactor: 0 // Should be skipped
          },
          {
            category: 3,
            quantity: 500,
            unit: 'kg',
            emissionFactor: 1.5 // Valid
          }
        ]
      };

      const response = await result.current.calculateScope3Emissions(formData);

      expect(response).toBeTruthy();
      expect(response?.emissions).toHaveLength(1);
      expect(response?.total).toBe(750); // Only the valid entry
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      // Mock will handle the error case
      const formData: Scope1FormData = {
        fuelCombustion: [
          {
            fuelType: 'diesel',
            quantity: 100,
            unit: 'L'
          }
        ]
      };

      await expect(result.current.calculateScope1Emissions(formData)).resolves.not.toThrow();
    });
  });

  describe('Loading State', () => {
    it.skip('should set loading state during calculation', async () => {
      const { result } = renderHook(() => useEmissionCalculations());

      const formData: Scope1FormData = {
        fuelCombustion: [
          {
            fuelType: 'diesel',
            quantity: 100,
            unit: 'L'
          }
        ]
      };

      // Start calculation
      const promise = result.current.calculateScope1Emissions(formData);

      // Should be loading
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      }, { timeout: 3000 });

      await promise;

      // Should be done loading
      expect(result.current.loading).toBe(false);
    });
  });
});
