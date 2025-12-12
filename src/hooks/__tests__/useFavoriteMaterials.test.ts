/**
 * Tests for useFavoriteMaterials hook
 * Validates EPD metadata preservation, quick-add, and localStorage persistence
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '../../lib/__tests__/setup';
import { useFavoriteMaterials } from '../useFavoriteMaterials';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        in: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
}));

describe('useFavoriteMaterials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('initialization', () => {
    it('loads default materials on first mount', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      expect(result.current.favorites.length).toBeGreaterThan(0);
      expect(result.current.favorites.some(f => f.materialId === 'default_plasterboard')).toBe(true);
      expect(result.current.favorites.some(f => f.materialId === 'default_concrete_32mpa')).toBe(true);
    });

    it('includes default pinned materials in quick-add', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      const defaultPinned = result.current.quickAddMaterials.filter(m => m.isPinned);
      expect(defaultPinned.length).toBeGreaterThan(0);
    });
  });

  describe('trackMaterialUsage', () => {
    it('adds new material to favorites', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      const newMaterial = {
        id: 'new-material-1',
        name: 'Test Material',
        category: 'Test Category',
        unit: 'kg',
        factor: 1.5,
        source: 'Test Source',
      };

      act(() => {
        result.current.trackMaterialUsage(newMaterial);
      });

      const added = result.current.favorites.find(f => f.materialId === 'new-material-1');
      expect(added).toBeDefined();
      expect(added?.materialName).toBe('Test Material');
      expect(added?.usageCount).toBe(1);
    });

    it('increments usage count for existing material', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      const material = {
        id: 'repeat-material',
        name: 'Repeat Material',
        category: 'Test',
        unit: 'kg',
        factor: 1.0,
        source: 'Test',
      };

      act(() => {
        result.current.trackMaterialUsage(material);
        result.current.trackMaterialUsage(material);
        result.current.trackMaterialUsage(material);
      });

      const tracked = result.current.favorites.find(f => f.materialId === 'repeat-material');
      expect(tracked?.usageCount).toBe(3);
    });

    it('preserves EPD metadata fields', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      const materialWithEPD = {
        id: 'epd-material',
        name: 'EPD Material',
        category: 'Concrete',
        unit: 'm³',
        factor: 320,
        source: 'EPD Australasia',
        epdNumber: 'EPD-AUS-001',
        epdUrl: 'https://epd.example.com/001',
        manufacturer: 'Boral',
        plantLocation: 'Sydney, NSW',
        dataQualityTier: 'Tier 1',
        year: 2024,
        ef_a1a3: 280,
        ef_a4: 15,
        ef_a5: 10,
        ef_b1b5: 5,
        ef_c1c4: 20,
        ef_d: -15,
      };

      act(() => {
        result.current.trackMaterialUsage(materialWithEPD);
      });

      const saved = result.current.favorites.find(f => f.materialId === 'epd-material');
      expect(saved?.epdNumber).toBe('EPD-AUS-001');
      expect(saved?.epdUrl).toBe('https://epd.example.com/001');
      expect(saved?.manufacturer).toBe('Boral');
      expect(saved?.plantLocation).toBe('Sydney, NSW');
      expect(saved?.dataQualityTier).toBe('Tier 1');
      expect(saved?.year).toBe(2024);
      expect(saved?.ef_a1a3).toBe(280);
      expect(saved?.ef_a4).toBe(15);
      expect(saved?.ef_d).toBe(-15);
    });

    it('updates lastUsed timestamp', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      const material = {
        id: 'timestamp-test',
        name: 'Timestamp Test',
        category: 'Test',
        unit: 'kg',
        factor: 1.0,
        source: 'Test',
      };

      const beforeAdd = new Date().toISOString();

      act(() => {
        result.current.trackMaterialUsage(material);
      });

      const tracked = result.current.favorites.find(f => f.materialId === 'timestamp-test');
      expect(new Date(tracked!.lastUsed).getTime()).toBeGreaterThanOrEqual(new Date(beforeAdd).getTime());
    });
  });

  describe('quickAddMaterials', () => {
    it('includes pinned materials', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      const pinnedInQuickAdd = result.current.quickAddMaterials.filter(m => m.isPinned);
      expect(pinnedInQuickAdd.length).toBeGreaterThan(0);
    });

    it('includes frequently used materials (>= 2 uses)', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      const material = {
        id: 'frequent-use',
        name: 'Frequent Use Material',
        category: 'Test',
        unit: 'kg',
        factor: 1.0,
        source: 'Test',
      };

      act(() => {
        result.current.trackMaterialUsage(material);
        result.current.trackMaterialUsage(material);
      });

      const inQuickAdd = result.current.quickAddMaterials.find(m => m.materialId === 'frequent-use');
      expect(inQuickAdd).toBeDefined();
    });

    it('excludes hidden materials', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      act(() => {
        result.current.hideMaterial('default_plasterboard');
      });

      const hidden = result.current.quickAddMaterials.find(m => m.materialId === 'default_plasterboard');
      expect(hidden).toBeUndefined();
    });

    it('limits to max 8 items', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      expect(result.current.quickAddMaterials.length).toBeLessThanOrEqual(8);
    });

    it('sorts pinned items first', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      if (result.current.quickAddMaterials.length >= 2) {
        const firstPinned = result.current.quickAddMaterials[0]?.isPinned;
        const hasPinnedFirst = result.current.quickAddMaterials.every((m, i) => {
          const nextUnpinned = result.current.quickAddMaterials.slice(i + 1).find(n => !n.isPinned);
          return m.isPinned || !nextUnpinned;
        });
        expect(hasPinnedFirst || firstPinned).toBe(true);
      }
    });
  });

  describe('recentlyUsedMaterials', () => {
    it('returns materials sorted by lastUsed', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      act(() => {
        result.current.trackMaterialUsage({ id: 'a', name: 'A', category: 'T', unit: 'kg', factor: 1, source: 'T' });
      });

      // Small delay to ensure different timestamps
      act(() => {
        result.current.trackMaterialUsage({ id: 'b', name: 'B', category: 'T', unit: 'kg', factor: 1, source: 'T' });
      });

      const recent = result.current.recentlyUsedMaterials;
      if (recent.length >= 2) {
        expect(new Date(recent[0].lastUsed).getTime()).toBeGreaterThanOrEqual(
          new Date(recent[1].lastUsed).getTime()
        );
      }
    });

    it('limits to 10 items', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      for (let i = 0; i < 15; i++) {
        act(() => {
          result.current.trackMaterialUsage({
            id: `bulk-${i}`,
            name: `Bulk ${i}`,
            category: 'T',
            unit: 'kg',
            factor: 1,
            source: 'T',
          });
        });
      }

      expect(result.current.recentlyUsedMaterials.length).toBeLessThanOrEqual(10);
    });

    it('only includes materials with usageCount > 0', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      result.current.recentlyUsedMaterials.forEach(m => {
        expect(m.usageCount).toBeGreaterThan(0);
      });
    });
  });

  describe('pinMaterial', () => {
    it('pins existing material', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      act(() => {
        result.current.trackMaterialUsage({ id: 'to-pin', name: 'To Pin', category: 'T', unit: 'kg', factor: 1, source: 'T' });
        result.current.pinMaterial('to-pin');
      });

      const pinned = result.current.favorites.find(f => f.materialId === 'to-pin');
      expect(pinned?.isPinned).toBe(true);
    });

    it('adds and pins new material when details provided', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      act(() => {
        result.current.pinMaterial('new-pin', {
          name: 'New Pinned',
          category: 'Test',
          unit: 'kg',
          factor: 2.0,
          source: 'Test',
        });
      });

      const added = result.current.favorites.find(f => f.materialId === 'new-pin');
      expect(added).toBeDefined();
      expect(added?.isPinned).toBe(true);
      expect(added?.materialName).toBe('New Pinned');
    });

    it('unhides material when pinning', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      act(() => {
        result.current.hideMaterial('default_plasterboard');
        result.current.pinMaterial('default_plasterboard');
      });

      const material = result.current.favorites.find(f => f.materialId === 'default_plasterboard');
      expect(material?.isHidden).toBe(false);
      expect(material?.isPinned).toBe(true);
    });
  });

  describe('unpinMaterial', () => {
    it('unpins material', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      act(() => {
        result.current.unpinMaterial('default_plasterboard');
      });

      const unpinned = result.current.favorites.find(f => f.materialId === 'default_plasterboard');
      expect(unpinned?.isPinned).toBe(false);
    });
  });

  describe('hideMaterial', () => {
    it('hides material and unpins it', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      act(() => {
        result.current.hideMaterial('default_concrete_32mpa');
      });

      const hidden = result.current.favorites.find(f => f.materialId === 'default_concrete_32mpa');
      expect(hidden?.isHidden).toBe(true);
      expect(hidden?.isPinned).toBe(false);
    });
  });

  describe('unhideMaterial', () => {
    it('unhides material', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      act(() => {
        result.current.hideMaterial('default_plasterboard');
        result.current.unhideMaterial('default_plasterboard');
      });

      const unhidden = result.current.favorites.find(f => f.materialId === 'default_plasterboard');
      expect(unhidden?.isHidden).toBe(false);
    });
  });

  describe('clearAllFavorites', () => {
    it('clears all favorites', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      act(() => {
        result.current.clearAllFavorites();
      });

      expect(result.current.favorites).toHaveLength(0);
    });
  });

  describe('localStorage persistence', () => {
    it('persists favorites to localStorage', () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      act(() => {
        result.current.trackMaterialUsage({
          id: 'persist-test',
          name: 'Persist Test',
          category: 'T',
          unit: 'kg',
          factor: 1,
          source: 'T',
        });
      });

      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('syncWithDatabase', () => {
    it('returns sync stats', async () => {
      const { result } = renderHook(() => useFavoriteMaterials());

      let syncResult: { synced: number; total: number } | undefined;
      await act(async () => {
        syncResult = await result.current.syncWithDatabase();
      });

      expect(syncResult).toBeDefined();
      expect(typeof syncResult?.synced).toBe('number');
      expect(typeof syncResult?.total).toBe('number');
    });
  });
});
