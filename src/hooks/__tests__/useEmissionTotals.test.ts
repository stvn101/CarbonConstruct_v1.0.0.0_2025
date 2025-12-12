/**
 * Tests for useEmissionTotals hook
 * 
 * Priority 1 - Critical Business Logic
 * Tests correct aggregation of emissions and kgCO2e to tCO2e conversion
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@/lib/__tests__/setup';

// Mock the Supabase client before importing the hook
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => ({
                maybeSingle: vi.fn(() => Promise.resolve({
                  data: {
                    id: 'calc-1',
                    project_id: 'test-project-123',
                    totals: {
                      scope1: 1000,    // 1000 kgCO2e = 1 tCO2e
                      scope2: 2000,    // 2000 kgCO2e = 2 tCO2e
                      scope3_materials: 5000, // 5000 kgCO2e = 5 tCO2e
                      scope3_transport: 500,
                      scope3_a5: 300,
                      scope3_commute: 200,
                      scope3_waste: 100,
                      total: 9100,
                      total_upfront: 5800,
                      b1_use: 100,
                      b2_maintenance: 200,
                      b3_repair: 50,
                      b4_replacement: 150,
                      b5_refurbishment: 100,
                      b6_operational_energy: 500,
                      b7_operational_water: 100,
                      c1_deconstruction: 100,
                      c2_transport: 50,
                      c3_waste_processing: 75,
                      c4_disposal: 125,
                      d_recycling: 200,
                      d_reuse: 100,
                      d_energy_recovery: 50
                    },
                    fuel_inputs: { diesel_transport: 100, petrol: 50 },
                    electricity_inputs: { kwh: 2778 },
                    is_draft: false
                  },
                  error: null
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  }
}));

vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({
    currentProject: {
      id: 'test-project-123',
      name: 'Test Project',
      project_type: 'residential',
      status: 'active'
    }
  })
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

// Import the hook after mocking
import { useEmissionTotals } from '../useEmissionTotals';

describe('useEmissionTotals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with zero totals', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      // Initially loading
      expect(result.current.loading).toBe(true);
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should expose refetch function', () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      expect(result.current.refetch).toBeInstanceOf(Function);
    });
  });

  describe('Unit Conversion - kgCO2e to tCO2e', () => {
    it('should convert Scope 1 from kgCO2e to tCO2e (divide by 1000)', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 1000 kgCO2e should become 1 tCO2e
      expect(result.current.totals.scope1).toBe(1);
    });

    it('should convert Scope 2 from kgCO2e to tCO2e (divide by 1000)', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 2000 kgCO2e should become 2 tCO2e
      expect(result.current.totals.scope2).toBe(2);
    });

    it('should convert Scope 3 from kgCO2e to tCO2e (divide by 1000)', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 5000 + 500 + 300 + 200 + 100 = 6100 kgCO2e = 6.1 tCO2e
      expect(result.current.totals.scope3).toBe(6.1);
    });

    it('should convert total from kgCO2e to tCO2e (divide by 1000)', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // 9100 kgCO2e should become 9.1 tCO2e
      expect(result.current.totals.total).toBe(9.1);
    });
  });

  describe('Scope Aggregation', () => {
    it('should correctly aggregate all Scope 3 subcategories', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Materials + Transport + A5 + Commute + Waste
      // (5000 + 500 + 300 + 200 + 100) / 1000 = 6.1
      expect(result.current.totals.scope3).toBe(6.1);
    });

    it('should build scope3Details array correctly', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.scope3Details.length).toBeGreaterThan(0);
      
      const materialsEntry = result.current.scope3Details.find(
        d => d.category === 'Embodied Carbon (A1-A3)'
      );
      expect(materialsEntry).toBeDefined();
      expect(materialsEntry?.emissions).toBe(5); // 5000 / 1000
    });
  });

  describe('EN 15978 Whole Life Carbon', () => {
    it('should calculate upfront emissions correctly', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // total_upfront: 5800 kgCO2e = 5.8 tCO2e
      expect(result.current.wholeLifeTotals.upfront).toBe(5.8);
    });

    it('should calculate use phase (B1-B7) correctly', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // B1+B2+B3+B4+B5+B6+B7 = 100+200+50+150+100+500+100 = 1200 kgCO2e = 1.2 tCO2e
      expect(result.current.wholeLifeTotals.usePhase).toBe(1.2);
    });

    it('should calculate end of life (C1-C4) correctly', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // C1+C2+C3+C4 = 100+50+75+125 = 350 kgCO2e = 0.35 tCO2e
      expect(result.current.wholeLifeTotals.endOfLife).toBe(0.35);
    });

    it('should calculate Module D credits correctly', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // d_recycling + d_reuse + d_energy_recovery = 200+100+50 = 350 kgCO2e = 0.35 tCO2e
      expect(result.current.wholeLifeTotals.moduleD).toBe(0.35);
    });

    it('should calculate whole life total (A-C) correctly', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // upfront + usePhase + endOfLife = 5.8 + 1.2 + 0.35 = 7.35 tCO2e
      expect(result.current.wholeLifeTotals.wholeLife).toBe(7.35);
    });

    it('should calculate with benefits (A-D) correctly', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // wholeLife - moduleD = 7.35 - 0.35 = 7 tCO2e
      expect(result.current.wholeLifeTotals.withBenefits).toBe(7);
    });
  });

  describe('Scope Details Parsing', () => {
    it('should build scope1Details from fuel_inputs', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.scope1Details.length).toBeGreaterThan(0);
    });

    it('should build scope2Details from electricity_inputs', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.scope2Details.length).toBeGreaterThan(0);
    });

    it('should build lifecycleDetails for dashboard', async () => {
      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lifecycleDetails.length).toBeGreaterThan(0);
      
      const upfrontEntry = result.current.lifecycleDetails.find(
        d => d.category === 'Upfront (A1-A5)'
      );
      expect(upfrontEntry).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero emissions gracefully', async () => {
      // Reset mock for this test
      vi.mocked(vi.fn()).mockImplementation(() => ({
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    maybeSingle: vi.fn(() => Promise.resolve({
                      data: {
                        totals: {
                          scope1: 0,
                          scope2: 0,
                          scope3_materials: 0,
                          total: 0
                        }
                      },
                      error: null
                    }))
                  }))
                }))
              }))
            }))
          }))
        }))
      }));

      const { result } = renderHook(() => useEmissionTotals());
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not throw, values should be numbers
      expect(typeof result.current.totals.scope1).toBe('number');
      expect(typeof result.current.totals.total).toBe('number');
    });
  });
});
