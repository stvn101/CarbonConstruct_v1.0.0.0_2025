import { describe, it, expect } from 'vitest';
import {
  getSourceTier,
  determineConfidenceLevel,
  runFullValidation,
  SOURCE_TIER_MAP,
  NABERS_RANGES,
  NABERS_UPPER_TOLERANCE_MULTIPLIER,
  NABERS_LOWER_TOLERANCE_MULTIPLIER,
} from '../material-validation';

describe('Material Validation Framework', () => {
  describe('Source Tier Classification', () => {
    it('should classify NABERS sources as Tier 1', () => {
      expect(getSourceTier('NABERS').tier).toBe(1);
      expect(getSourceTier('NABERS EPD').tier).toBe(1);
      expect(getSourceTier('NABERS 2025 Emission Factors').tier).toBe(1);
    });

    it('should classify NGER sources as Tier 1', () => {
      expect(getSourceTier('NGER').tier).toBe(1);
      expect(getSourceTier('NGER Materials Database').tier).toBe(1);
      expect(getSourceTier('NGER Materials Database v2025.1').tier).toBe(1);
    });

    it('should classify EPD Australasia as Tier 1', () => {
      expect(getSourceTier('EPD Australasia').tier).toBe(1);
    });

    it('should classify ICE sources as Tier 2', () => {
      expect(getSourceTier('ICE').tier).toBe(2);
      expect(getSourceTier('ICE V4.1 - Circular Ecology').tier).toBe(2);
      expect(getSourceTier('ICE Database').tier).toBe(2);
    });

    it('should classify ICM sources as Tier 2', () => {
      expect(getSourceTier('ICM Database').tier).toBe(2);
      expect(getSourceTier('ICM Database 2019').tier).toBe(2);
      expect(getSourceTier('ICM Database 2019 (AusLCI)').tier).toBe(2);
    });

    it('should classify BlueScope as Tier 2', () => {
      expect(getSourceTier('BlueScope').tier).toBe(2);
      expect(getSourceTier('BlueScope Steel EPD').tier).toBe(2);
    });

    it('should classify unknown sources as Tier 3', () => {
      expect(getSourceTier('Unknown Source').tier).toBe(3);
      expect(getSourceTier('Random EPD').tier).toBe(3);
      expect(getSourceTier(null).tier).toBe(3);
      expect(getSourceTier(undefined).tier).toBe(3);
    });

    it('should perform case-insensitive matching', () => {
      expect(getSourceTier('nabers').tier).toBe(1);
      expect(getSourceTier('NGER').tier).toBe(1);
      expect(getSourceTier('ice database').tier).toBe(2);
    });
  });

  describe('NABERS Range Validation', () => {
    it('should have defined ranges for major material categories', () => {
      expect(NABERS_RANGES.Concrete).toBeDefined();
      expect(NABERS_RANGES.Steel).toBeDefined();
      expect(NABERS_RANGES.Aluminium).toBeDefined();
      expect(NABERS_RANGES.Timber).toBeDefined();
      expect(NABERS_RANGES.Glass).toBeDefined();
    });

    it('should have valid tolerance multipliers', () => {
      expect(NABERS_UPPER_TOLERANCE_MULTIPLIER).toBeGreaterThan(1);
      expect(NABERS_LOWER_TOLERANCE_MULTIPLIER).toBeLessThan(1);
      expect(NABERS_LOWER_TOLERANCE_MULTIPLIER).toBeGreaterThan(0);
    });

    it('should have min < max for all ranges', () => {
      Object.entries(NABERS_RANGES).forEach(([, ranges]) => {
        ranges.forEach((range) => {
          expect(range.min).toBeLessThanOrEqual(range.max);
        });
      });
    });
  });

  describe('Confidence Level Determination', () => {
    it('should return verified for valid Tier 1 material with EPD', () => {
      const material = {
        epd_number: 'S-P-12345',
        data_source: 'NABERS EPD',
        ef_total: 200,
        material_category: 'Concrete',
        unit: 'm³',
        expiry_date: '2026-12-31',
      };
      const result = determineConfidenceLevel(material);
      expect(result.confidenceLevel).toBe('verified');
      expect(result.confidenceColor).toBe('green');
      expect(result.sourceTier).toBe(1);
    });

    it('should flag null ef_total as critical issue', () => {
      const material = {
        epd_number: 'S-P-12345',
        data_source: 'NABERS EPD',
        ef_total: null,
        material_category: 'Concrete',
        unit: 'm³',
      };
      const result = determineConfidenceLevel(material);
      expect(result.confidenceLevel).toBe('needs_review');
      expect(result.issues.some(i => i.code === 'NULL_EF_TOTAL')).toBe(true);
    });

    it('should flag negative ef_total as critical issue', () => {
      const material = {
        epd_number: 'S-P-12345',
        data_source: 'NABERS EPD',
        ef_total: -100,
        material_category: 'Concrete',
        unit: 'm³',
      };
      const result = determineConfidenceLevel(material);
      expect(result.confidenceLevel).toBe('needs_review');
      expect(result.issues.some(i => i.code === 'NEGATIVE_FACTOR')).toBe(true);
    });

    it('should detect expired EPD', () => {
      const material = {
        epd_number: 'S-P-12345',
        data_source: 'NABERS EPD',
        ef_total: 200,
        material_category: 'Concrete',
        unit: 'm³',
        expiry_date: '2020-01-01',
      };
      const result = determineConfidenceLevel(material);
      expect(result.issues.some(i => i.code === 'EXPIRED_EPD')).toBe(true);
    });

    it('should classify industry average sources correctly', () => {
      const material = {
        data_source: 'ICE V4.1 - Circular Ecology',
        ef_total: 200,
        material_category: 'Concrete',
        unit: 'm³',
      };
      const result = determineConfidenceLevel(material);
      expect(result.confidenceLevel).toBe('industry_average');
      expect(result.confidenceColor).toBe('orange');
      expect(result.sourceTier).toBe(2);
    });

    it('should flag Tier 3 sources with medium severity', () => {
      const material = {
        data_source: 'Unknown Source',
        ef_total: 200,
        material_category: 'Concrete',
        unit: 'm³',
      };
      const result = determineConfidenceLevel(material);
      expect(result.sourceTier).toBe(3);
      expect(result.issues.some(i => i.code === 'TIER_3_SOURCE')).toBe(true);
    });

    it('should detect outliers above NABERS range', () => {
      const material = {
        data_source: 'NABERS EPD',
        ef_total: 2000, // Way above Concrete max of ~1270
        material_category: 'Concrete',
        unit: 'm³',
      };
      const result = determineConfidenceLevel(material);
      expect(result.isOutlier).toBe(true);
      expect(result.issues.some(i => i.code === 'ABOVE_NABERS_RANGE')).toBe(true);
    });

    it('should detect outliers below NABERS range', () => {
      const material = {
        data_source: 'NABERS EPD',
        ef_total: 10, // Way below Concrete min of ~100
        material_category: 'Concrete',
        unit: 'm³',
      };
      const result = determineConfidenceLevel(material);
      expect(result.isOutlier).toBe(true);
      expect(result.issues.some(i => i.code === 'BELOW_NABERS_RANGE')).toBe(true);
    });
  });

  describe('Full Validation Run', () => {
    it('should process empty materials array', async () => {
      const result = await runFullValidation([]);
      expect(result.materials).toHaveLength(0);
      expect(result.stats.totalMaterials).toBe(0);
    });

    it('should calculate correct statistics', async () => {
      const materials = [
        {
          id: '1',
          material_name: 'Concrete 25MPa',
          material_category: 'Concrete',
          ef_total: 200,
          unit: 'm³',
          data_source: 'NABERS EPD',
          epd_number: 'S-P-12345',
          manufacturer: 'Test Mfg',
          state: 'NSW',
          expiry_date: '2026-12-31',
        },
        {
          id: '2',
          material_name: 'Steel Rebar',
          material_category: 'Steel',
          ef_total: 2500,
          unit: 'tonne',
          data_source: 'ICE V4.1',
          epd_number: null,
          manufacturer: null,
          state: null,
          expiry_date: null,
        },
        {
          id: '3',
          material_name: 'Unknown Material',
          material_category: 'Other',
          ef_total: null as any,
          unit: 'kg',
          data_source: null,
          epd_number: null,
          manufacturer: null,
          state: null,
          expiry_date: null,
        },
      ];

      const result = await runFullValidation(materials);
      
      expect(result.stats.totalMaterials).toBe(3);
      expect(result.stats.confidenceLevelCounts.verified).toBe(1);
      expect(result.stats.confidenceLevelCounts.industry_average).toBe(1);
      expect(result.stats.confidenceLevelCounts.needs_review).toBe(1);
      expect(result.stats.sourceTierCounts.tier1).toBe(1);
      expect(result.stats.sourceTierCounts.tier2).toBe(1);
      expect(result.stats.sourceTierCounts.tier3).toBe(1);
    });

    it('should include validation info for each material', async () => {
      const materials = [
        {
          id: '1',
          material_name: 'Test Material',
          material_category: 'Concrete',
          ef_total: 200,
          unit: 'm³',
          data_source: 'NABERS EPD',
          epd_number: 'S-P-12345',
          manufacturer: 'Test',
          state: 'NSW',
          expiry_date: '2026-12-31',
        },
      ];

      const result = await runFullValidation(materials);
      
      expect(result.materials[0].validation).toBeDefined();
      expect(result.materials[0].validation.confidenceLevel).toBeDefined();
      expect(result.materials[0].validation.sourceTier).toBeDefined();
    });
  });

  describe('Source Tier Map Coverage', () => {
    it('should have all required Australian sources', () => {
      const requiredSources = ['NABERS', 'NGER', 'EPD Australasia'];
      requiredSources.forEach(source => {
        const found = Object.keys(SOURCE_TIER_MAP).some(key => 
          key.toLowerCase().includes(source.toLowerCase()) ||
          source.toLowerCase().includes(key.toLowerCase())
        );
        expect(found).toBe(true);
      });
    });

    it('should have all required international sources', () => {
      const requiredSources = ['ICE', 'ICM', 'BlueScope'];
      requiredSources.forEach(source => {
        const found = Object.keys(SOURCE_TIER_MAP).some(key => 
          key.toLowerCase().includes(source.toLowerCase())
        );
        expect(found).toBe(true);
      });
    });
  });
});
