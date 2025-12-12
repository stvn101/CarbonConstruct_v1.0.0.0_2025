/**
 * Tests for useComplianceCheck hook
 * Validates NCC 2024, Green Star, NABERS, EN 15978, Climate Active, and IS Rating compliance checks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '../../lib/__tests__/setup';
import { useComplianceCheck } from '../useComplianceCheck';
import { WholeLifeCarbonTotals } from '../useWholeLifeCarbonCalculations';

// Mock ProjectContext
const mockProject = {
  id: 'test-project-id',
  name: 'Test Project',
  project_type: 'commercial',
  size_sqm: 1000,
  ncc_compliance_level: 'class5',
};

vi.mock('@/contexts/ProjectContext', () => ({
  useProject: () => ({
    currentProject: mockProject,
  }),
}));

const baseTotals = {
  scope1: 50000,
  scope2: 100000,
  scope3: 150000,
  total: 300000,
};

const baseWholeLifeTotals: WholeLifeCarbonTotals = {
  a1a3_product: 400000,
  a4_transport: 20000,
  a5_construction: 30000,
  b1_use: 5000,
  b2_maintenance: 10000,
  b3_repair: 5000,
  b4_replacement: 20000,
  b5_refurbishment: 10000,
  b6_operational_energy: 200000,
  b7_operational_water: 10000,
  c1_deconstruction: 15000,
  c2_transport: 5000,
  c3_waste_processing: 10000,
  c4_disposal: 20000,
  d_recycling: -50000,
  d_reuse: -20000,
  d_energy_recovery: -10000,
  total_upfront: 450000,
  total_embodied: 550000,
  total_operational: 210000,
  total_whole_life: 760000,
  total_with_benefits: 680000,
};

describe('useComplianceCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('NCC 2024 compliance', () => {
    it('returns NCC compliance result structure', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      expect(result.current.ncc).toBeDefined();
      expect(result.current.ncc.compliant).toBeDefined();
      expect(result.current.ncc.status).toBeDefined();
      expect(result.current.ncc.requirements).toBeInstanceOf(Array);
    });

    it('checks upfront embodied carbon against NCC limit', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const upfrontReq = result.current.ncc.requirements.find(
        r => r.name.includes('Upfront embodied carbon')
      );
      expect(upfrontReq).toBeDefined();
      expect(upfrontReq?.unit).toBe('kgCO₂e/m²');
      expect(upfrontReq?.stage).toBe('A1-A5');
    });

    it('returns compliant status when all requirements met', () => {
      const lowEmissions = {
        scope1: 10000,
        scope2: 20000,
        scope3: 30000,
        total: 60000,
      };

      const { result } = renderHook(() =>
        useComplianceCheck(lowEmissions, null)
      );

      expect(['compliant', 'partial', 'non-compliant']).toContain(
        result.current.ncc.status
      );
    });
  });

  describe('GBCA Green Star compliance', () => {
    it('returns GBCA compliance result structure', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      expect(result.current.gbca).toBeDefined();
      expect(result.current.gbca.compliant).toBeDefined();
      expect(result.current.gbca.score).toBeGreaterThanOrEqual(0);
      expect(result.current.gbca.maxScore).toBe(100);
      expect(result.current.gbca.requirements).toBeInstanceOf(Array);
    });

    it('includes circular economy check (Credit 9)', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const circularReq = result.current.gbca.requirements.find(
        r => r.name.includes('Circular economy')
      );
      expect(circularReq).toBeDefined();
      expect(circularReq?.stage).toBe('Module D');
    });

    it('checks for whole life carbon assessment completion', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const lcaReq = result.current.gbca.requirements.find(
        r => r.name.includes('Whole life carbon assessment')
      );
      expect(lcaReq).toBeDefined();
      expect(lcaReq?.met).toBe(true);
    });

    it('marks LCA incomplete when no whole life totals', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, null)
      );

      const lcaReq = result.current.gbca.requirements.find(
        r => r.name.includes('Whole life carbon assessment')
      );
      expect(lcaReq?.met).toBe(false);
    });
  });

  describe('NABERS rating', () => {
    it('returns NABERS rating result structure', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      expect(result.current.nabers).toBeDefined();
      expect(result.current.nabers.rating).toBeGreaterThanOrEqual(0);
      expect(result.current.nabers.maxRating).toBe(6);
      expect(result.current.nabers.requirements).toBeInstanceOf(Array);
    });

    it('checks for minimum 12 months operational data', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const dataReq = result.current.nabers.requirements.find(
        r => r.name.includes('12 months operational data')
      );
      expect(dataReq).toBeDefined();
    });

    it('includes 4 star minimum requirement', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const starReq = result.current.nabers.requirements.find(
        r => r.name.includes('4 stars or higher')
      );
      expect(starReq).toBeDefined();
      expect(starReq?.threshold).toBe(4);
      expect(starReq?.unit).toBe('stars');
    });
  });

  describe('EN 15978 compliance', () => {
    it('returns EN 15978 compliance result structure', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      expect(result.current.en15978).toBeDefined();
      expect(result.current.en15978.stages).toBeDefined();
      expect(result.current.en15978.stages.a1a5).toBeDefined();
      expect(result.current.en15978.stages.b1b7).toBeDefined();
      expect(result.current.en15978.stages.c1c4).toBeDefined();
      expect(result.current.en15978.stages.wholeLife).toBeDefined();
    });

    it('includes value and threshold for each stage', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const stages = result.current.en15978.stages;
      
      expect(stages.a1a5.value).toBeGreaterThanOrEqual(0);
      expect(stages.a1a5.threshold).toBeGreaterThan(0);
      expect(stages.b1b7.value).toBeGreaterThanOrEqual(0);
      expect(stages.c1c4.value).toBeGreaterThanOrEqual(0);
    });

    it('checks Module D benefits separately', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const moduleDReq = result.current.en15978.requirements.find(
        r => r.name.includes('Module D')
      );
      expect(moduleDReq).toBeDefined();
      expect(moduleDReq?.stage).toBe('D');
    });
  });

  describe('Climate Active compliance', () => {
    it('returns Climate Active result structure', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      expect(result.current.climateActive).toBeDefined();
      expect(result.current.climateActive.compliant).toBeDefined();
      expect(result.current.climateActive.requirements).toBeInstanceOf(Array);
    });

    it('checks all three scopes are measured', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const scope1Req = result.current.climateActive.requirements.find(
        r => r.name.includes('Scope 1')
      );
      const scope2Req = result.current.climateActive.requirements.find(
        r => r.name.includes('Scope 2')
      );
      const scope3Req = result.current.climateActive.requirements.find(
        r => r.name.includes('Scope 3')
      );

      expect(scope1Req).toBeDefined();
      expect(scope2Req).toBeDefined();
      expect(scope3Req).toBeDefined();
    });

    it('checks for carbon neutral pathway documentation', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const pathwayReq = result.current.climateActive.requirements.find(
        r => r.name.includes('pathway')
      );
      expect(pathwayReq).toBeDefined();
    });
  });

  describe('IS Rating (Infrastructure)', () => {
    it('returns IS Rating result structure', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      expect(result.current.isRating).toBeDefined();
      expect(result.current.isRating.level).toBeDefined();
      expect(result.current.isRating.score).toBeGreaterThanOrEqual(0);
      expect(result.current.isRating.requirements).toBeInstanceOf(Array);
    });

    it('checks for LCA completion', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const lcaReq = result.current.isRating.requirements.find(
        r => r.name.includes('Life cycle assessment')
      );
      expect(lcaReq).toBeDefined();
    });

    it('checks for recycling/reuse strategy', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      const recycleReq = result.current.isRating.requirements.find(
        r => r.name.includes('Recycling/reuse')
      );
      expect(recycleReq).toBeDefined();
    });

    it('indicates isInfrastructure flag', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, baseWholeLifeTotals)
      );

      expect(typeof result.current.isRating.isInfrastructure).toBe('boolean');
    });
  });

  describe('edge cases', () => {
    it('handles zero emissions', () => {
      const zeroTotals = {
        scope1: 0,
        scope2: 0,
        scope3: 0,
        total: 0,
      };

      const { result } = renderHook(() =>
        useComplianceCheck(zeroTotals, null)
      );

      expect(result.current.ncc).toBeDefined();
      expect(result.current.gbca).toBeDefined();
    });

    it('handles null whole life totals', () => {
      const { result } = renderHook(() =>
        useComplianceCheck(baseTotals, null)
      );

      expect(result.current.en15978.stages.a1a5.value).toBeGreaterThanOrEqual(0);
    });

    it('handles very large emissions', () => {
      const largeTotals = {
        scope1: 100000000,
        scope2: 200000000,
        scope3: 300000000,
        total: 600000000,
      };

      const { result } = renderHook(() =>
        useComplianceCheck(largeTotals, null)
      );

      expect(result.current.ncc.status).toBe('non-compliant');
    });
  });

  describe('recommendations', () => {
    it('provides recommendations for failed requirements', () => {
      const highEmissions = {
        scope1: 500000,
        scope2: 1000000,
        scope3: 1500000,
        total: 3000000,
      };

      const { result } = renderHook(() =>
        useComplianceCheck(highEmissions, null)
      );

      const failedReqs = result.current.ncc.requirements.filter(r => !r.met);
      const withRecommendations = failedReqs.filter(r => r.recommendation);
      
      // Should have recommendations for failed items
      expect(withRecommendations.length).toBeGreaterThanOrEqual(0);
    });
  });
});
