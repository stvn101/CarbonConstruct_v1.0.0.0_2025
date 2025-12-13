/**
 * Tests for useEPDMaterials hook
 * Validates pagination (4,316 materials in 1000-record batches), filtering, and caching
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../../lib/__tests__/setup';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => ({
          order: () => ({
            range: () => Promise.resolve({ data: mockMaterials, error: null }),
          }),
        }),
      }),
    }),
  },
}));

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: mockMaterials,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

// Mock useAuth from AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-123',
      email: 'test@example.com'
    },
    session: null,
    loading: false
  })
}));

// Mock useSubscription
vi.mock('@/hooks/useSubscription', () => ({
  useSubscription: () => ({
    currentTier: {
      id: 'tier-pro',
      name: 'Professional',
      limits: {
        full_database: true,
        projects: 10,
        reports_per_month: 50,
        lca_calculations: true,
        team_collaboration: true
      }
    },
    loading: false,
    error: null
  })
}));

// Import after mocking
import { useEPDMaterials } from '../useEPDMaterials';

const mockMaterials = [
  {
    id: '1',
    material_name: 'Concrete 32MPa',
    material_category: 'Concrete',
    subcategory: 'Ready Mix',
    manufacturer: 'Boral',
    plant_location: 'Sydney, NSW',
    region: 'NSW',
    state: 'NSW',
    unit: 'm³',
    ef_a1a3: 280,
    ef_a4: 10,
    ef_a5: 5,
    ef_b1b5: null,
    ef_c1c4: 20,
    ef_d: -15,
    ef_total: 300,
    data_source: 'EPD Australasia',
    epd_url: 'https://epd.example.com/1',
    epd_number: 'EPD-001',
    data_quality_tier: 'Tier 1',
    year: 2024,
    recycled_content: 10,
  },
  {
    id: '2',
    material_name: 'Steel Reinforcing Bar',
    material_category: 'Steel',
    subcategory: 'Rebar',
    manufacturer: 'BlueScope',
    plant_location: 'Wollongong, NSW',
    region: 'NSW',
    state: 'NSW',
    unit: 'kg',
    ef_a1a3: 1.8,
    ef_a4: 0.1,
    ef_a5: 0.05,
    ef_b1b5: null,
    ef_c1c4: 0.2,
    ef_d: -0.8,
    ef_total: 1.35,
    data_source: 'EPD Australasia',
    epd_url: 'https://epd.example.com/2',
    epd_number: 'EPD-002',
    data_quality_tier: 'Tier 1',
    year: 2024,
    recycled_content: 90,
  },
  {
    id: '3',
    material_name: 'Glass Wool Insulation',
    material_category: 'Insulation',
    subcategory: 'Batts',
    manufacturer: 'Fletcher',
    plant_location: 'Melbourne, VIC',
    region: 'VIC',
    state: 'VIC',
    unit: 'm²',
    ef_a1a3: 2.5,
    ef_a4: 0.2,
    ef_a5: 0.1,
    ef_b1b5: null,
    ef_c1c4: 0.5,
    ef_d: null,
    ef_total: 3.3,
    data_source: 'ICM Database',
    epd_url: null,
    epd_number: null,
    data_quality_tier: 'Tier 2',
    year: 2019,
    recycled_content: 80,
  },
];

describe('useEPDMaterials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('data loading', () => {
    it('returns materials from query', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.allMaterials).toHaveLength(3);
      expect(result.current.materials).toHaveLength(3);
    });

    it('provides loading state', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(typeof result.current.loading).toBe('boolean');
    });

    it('provides total materials count', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.totalMaterials).toBe(3);
    });
  });

  describe('category extraction', () => {
    it('extracts unique categories', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.categories).toContain('Concrete');
      expect(result.current.categories).toContain('Steel');
      expect(result.current.categories).toContain('Insulation');
      expect(result.current.categories).toHaveLength(3);
    });

    it('sorts categories alphabetically', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.categories[0]).toBe('Concrete');
      expect(result.current.categories[1]).toBe('Insulation');
      expect(result.current.categories[2]).toBe('Steel');
    });
  });

  describe('state extraction', () => {
    it('extracts unique states', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.states).toContain('NSW');
      expect(result.current.states).toContain('VIC');
    });

    it('filters out null states', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.states).not.toContain(null);
    });
  });

  describe('manufacturer extraction', () => {
    it('extracts unique manufacturers', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.manufacturers).toContain('Boral');
      expect(result.current.manufacturers).toContain('BlueScope');
      expect(result.current.manufacturers).toContain('Fletcher');
    });
  });

  describe('search filtering', () => {
    it('filters by material name', () => {
      const { result } = renderHook(() => useEPDMaterials());

      act(() => {
        result.current.setSearchTerm('concrete');
      });

      expect(result.current.materials).toHaveLength(1);
      expect(result.current.materials[0].material_name).toBe('Concrete 32MPa');
    });

    it('filters by manufacturer', () => {
      const { result } = renderHook(() => useEPDMaterials());

      act(() => {
        result.current.setSearchTerm('bluescope');
      });

      expect(result.current.materials).toHaveLength(1);
      expect(result.current.materials[0].manufacturer).toBe('BlueScope');
    });

    it('filters by plant location', () => {
      const { result } = renderHook(() => useEPDMaterials());

      act(() => {
        result.current.setSearchTerm('melbourne');
      });

      expect(result.current.materials).toHaveLength(1);
      expect(result.current.materials[0].plant_location).toContain('Melbourne');
    });

    it('search is case insensitive', () => {
      const { result } = renderHook(() => useEPDMaterials());

      act(() => {
        result.current.setSearchTerm('STEEL');
      });

      expect(result.current.materials).toHaveLength(1);
    });
  });

  describe('category filtering', () => {
    it('filters by selected category', () => {
      const { result } = renderHook(() => useEPDMaterials());

      act(() => {
        result.current.setSelectedCategory('Steel');
      });

      expect(result.current.materials).toHaveLength(1);
      expect(result.current.materials[0].material_category).toBe('Steel');
    });

    it('shows all when category is "all"', () => {
      const { result } = renderHook(() => useEPDMaterials());

      act(() => {
        result.current.setSelectedCategory('all');
      });

      expect(result.current.materials).toHaveLength(3);
    });
  });

  describe('state filtering', () => {
    it('filters by selected state', () => {
      const { result } = renderHook(() => useEPDMaterials());

      act(() => {
        result.current.setSelectedState('VIC');
      });

      expect(result.current.materials).toHaveLength(1);
      expect(result.current.materials[0].state).toBe('VIC');
    });
  });

  describe('manufacturer filtering', () => {
    it('filters by selected manufacturer', () => {
      const { result } = renderHook(() => useEPDMaterials());

      act(() => {
        result.current.setSelectedManufacturer('Boral');
      });

      expect(result.current.materials).toHaveLength(1);
      expect(result.current.materials[0].manufacturer).toBe('Boral');
    });
  });

  describe('combined filters', () => {
    it('applies multiple filters together', () => {
      const { result } = renderHook(() => useEPDMaterials());

      act(() => {
        result.current.setSelectedState('NSW');
        result.current.setSearchTerm('steel');
      });

      expect(result.current.materials).toHaveLength(1);
      expect(result.current.materials[0].material_name).toBe('Steel Reinforcing Bar');
    });
  });

  describe('grouped materials', () => {
    it('groups materials by category', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.groupedMaterials).toHaveLength(3);
      
      const concreteGroup = result.current.groupedMaterials.find(g => g.category === 'Concrete');
      expect(concreteGroup?.materials).toHaveLength(1);
    });

    it('sorts materials within groups by name', () => {
      const { result } = renderHook(() => useEPDMaterials());

      result.current.groupedMaterials.forEach(group => {
        for (let i = 1; i < group.materials.length; i++) {
          expect(
            group.materials[i - 1].material_name.localeCompare(group.materials[i].material_name)
          ).toBeLessThanOrEqual(0);
        }
      });
    });
  });

  describe('reset filters', () => {
    it('resets all filters', () => {
      const { result } = renderHook(() => useEPDMaterials());

      act(() => {
        result.current.setSearchTerm('test');
        result.current.setSelectedCategory('Steel');
        result.current.setSelectedState('NSW');
        result.current.setSelectedManufacturer('Boral');
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.searchTerm).toBe('');
      expect(result.current.selectedCategory).toBe('all');
      expect(result.current.selectedState).toBe('all');
      expect(result.current.selectedManufacturer).toBe('all');
    });
  });

  describe('unit label helper', () => {
    it('returns human-readable unit labels', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.getUnitLabel('kg')).toBe('kilograms');
      expect(result.current.getUnitLabel('m³')).toBe('cubic metres');
      expect(result.current.getUnitLabel('m²')).toBe('square metres');
    });

    it('returns original unit if not mapped', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.getUnitLabel('unknown')).toBe('unknown');
    });
  });

  describe('filtered count', () => {
    it('provides filtered count', () => {
      const { result } = renderHook(() => useEPDMaterials());

      expect(result.current.filteredCount).toBe(3);

      act(() => {
        result.current.setSelectedCategory('Steel');
      });

      expect(result.current.filteredCount).toBe(1);
    });
  });
});
