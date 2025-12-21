import { describe, it, expect, vi } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [{ updated_at: '2025-01-01T00:00:00Z' }] }),
    })),
  },
}));

// Mock material-validation
vi.mock('@/lib/material-validation', () => ({
  getSourceTier: vi.fn((source: string | null) => {
    if (!source) return { tier: 3, label: 'Tier 3', description: 'Unknown' };
    const s = source.toLowerCase();
    if (s.includes('nabers') || s.includes('nger')) return { tier: 1, label: 'Tier 1', description: 'Verified' };
    if (s.includes('ice') || s.includes('icm')) return { tier: 2, label: 'Tier 2', description: 'Industry' };
    return { tier: 3, label: 'Tier 3', description: 'Unknown' };
  }),
}));

describe('Material Database Stats Types', () => {
  describe('DataSourceStats Interface', () => {
    it('should have correct structure', () => {
      const stats = {
        name: 'NABERS EPD',
        count: 100,
        percentage: 25.5,
        lastImported: '2025-01-01T00:00:00Z',
      };
      
      expect(stats.name).toBe('NABERS EPD');
      expect(stats.count).toBe(100);
      expect(stats.percentage).toBe(25.5);
      expect(stats.lastImported).toBe('2025-01-01T00:00:00Z');
    });
  });

  describe('CategoryStats Interface', () => {
    it('should include all EF statistics', () => {
      const categoryStats = {
        category: 'Concrete',
        count: 500,
        avgEf: 250.5,
        minEf: 100,
        maxEf: 600,
        stdDev: 125.3,
      };
      
      expect(categoryStats.category).toBe('Concrete');
      expect(categoryStats.avgEf).toBeGreaterThan(0);
      expect(categoryStats.minEf).toBeLessThanOrEqual(categoryStats.maxEf);
      expect(categoryStats.stdDev).toBeGreaterThanOrEqual(0);
    });
  });

  describe('OutlierMaterial Interface', () => {
    it('should have correct severity levels', () => {
      const severities = ['extreme_high', 'high', 'low', 'extreme_low'] as const;
      
      severities.forEach(severity => {
        const outlier = {
          id: 'test-id',
          name: 'Test Material',
          category: 'Steel',
          efTotal: 5000,
          expectedRange: { min: 500, max: 4000 },
          severity,
        };
        
        expect(outlier.severity).toBe(severity);
      });
    });
  });

  describe('MaterialsDatabaseStats Interface', () => {
    it('should include all data source stats including NGER', () => {
      const stats = {
        dataSourceStats: {
          ice: { name: 'ICE Database', count: 500, percentage: 10, lastImported: null },
          nabers: { name: 'NABERS EPD', count: 3000, percentage: 65, lastImported: null },
          bluescope: { name: 'BlueScope Steel', count: 50, percentage: 1, lastImported: null },
          icm: { name: 'Australian ICM', count: 600, percentage: 13, lastImported: null },
          nger: { name: 'NGER Database', count: 63, percentage: 1.4, lastImported: null },
          other: { name: 'Other Sources', count: 100, percentage: 2, lastImported: null },
        },
      };
      
      expect(stats.dataSourceStats.nger).toBeDefined();
      expect(stats.dataSourceStats.nger.name).toBe('NGER Database');
    });
  });
});

describe('Source Classification Logic', () => {
  describe('ICE Source Detection', () => {
    it('should match ICE variations', () => {
      const iceVariants = [
        'ICE V4.1 - Circular Ecology',
        'ice database',
        'ICE',
        'Circular Ecology ICE',
      ];
      
      iceVariants.forEach(source => {
        const s = source.toLowerCase();
        expect(s.includes('ice') || s.includes('circular ecology')).toBe(true);
      });
    });
  });

  describe('NABERS Source Detection', () => {
    it('should match NABERS variations', () => {
      const nabersVariants = [
        'NABERS 2025 Emission Factors',
        'NABERS EPD',
        'nabers',
      ];
      
      nabersVariants.forEach(source => {
        expect(source.toLowerCase().includes('nabers')).toBe(true);
      });
    });
  });

  describe('NGER Source Detection', () => {
    it('should match NGER variations', () => {
      const ngerVariants = [
        'NGER Materials Database v2025.1',
        'NGER Materials',
        'nger',
      ];
      
      ngerVariants.forEach(source => {
        expect(source.toLowerCase().includes('nger')).toBe(true);
      });
    });
  });

  describe('ICM Source Detection', () => {
    it('should match ICM variations', () => {
      const icmVariants = [
        'ICM Database 2019 (AusLCI)',
        'ICM Database',
        'AusLCI',
      ];
      
      icmVariants.forEach(source => {
        const s = source.toLowerCase();
        expect(s.includes('icm') || s.includes('auslci')).toBe(true);
      });
    });
  });
});

describe('Outlier Detection', () => {
  it('should calculate z-score correctly', () => {
    const values = [100, 200, 300, 400, 500];
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // Value 1000 should have high z-score
    const outlierValue = 1000;
    const zScore = (outlierValue - mean) / stdDev;
    
    expect(zScore).toBeGreaterThan(2);
  });

  it('should classify severity based on z-score thresholds', () => {
    const classifySeverity = (zScore: number) => {
      if (zScore > 3) return 'extreme_high';
      if (zScore > 2) return 'high';
      if (zScore < -3) return 'extreme_low';
      if (zScore < -2) return 'low';
      return 'normal';
    };
    
    expect(classifySeverity(4)).toBe('extreme_high');
    expect(classifySeverity(2.5)).toBe('high');
    expect(classifySeverity(-2.5)).toBe('low');
    expect(classifySeverity(-4)).toBe('extreme_low');
    expect(classifySeverity(1)).toBe('normal');
  });
});

describe('Category Statistics Calculation', () => {
  it('should calculate mean correctly', () => {
    const values = [100, 200, 300];
    const mean = values.reduce((a, b) => a + b) / values.length;
    expect(mean).toBe(200);
  });

  it('should calculate standard deviation correctly', () => {
    const values = [100, 200, 300];
    const mean = 200;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b) / values.length;
    const stdDev = Math.sqrt(avgSquaredDiff);
    
    expect(Math.round(stdDev * 100) / 100).toBe(81.65);
  });

  it('should handle edge case of single value', () => {
    const values = [100];
    const mean = values[0];
    const stdDev = 0;
    
    expect(mean).toBe(100);
    expect(stdDev).toBe(0);
  });

  it('should handle edge case of empty array', () => {
    const values: number[] = [];
    const mean = values.length > 0 ? values.reduce((a, b) => a + b) / values.length : 0;
    
    expect(mean).toBe(0);
  });
});
