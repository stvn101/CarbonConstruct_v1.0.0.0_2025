import { useState, useEffect, useCallback } from 'react';

export interface FavoriteMaterial {
  materialId: string;
  materialName: string;
  category: string;
  unit: string;
  factor: number;
  source: string;
  usageCount: number;
  isPinned: boolean;
  isHidden: boolean;
  lastUsed: string;
}

const STORAGE_KEY = 'carbonConstruct_favoriteMaterials';
const MIN_USAGE_FOR_QUICK_ADD = 2;
const MAX_QUICK_ADD_ITEMS = 8;

export function useFavoriteMaterials() {
  const [favorites, setFavorites] = useState<FavoriteMaterial[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      console.warn('Failed to load favorite materials');
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Track material usage - call this when a material is added to calculation
  const trackMaterialUsage = useCallback((material: {
    id: string;
    name: string;
    category: string;
    unit: string;
    factor: number;
    source: string;
  }) => {
    setFavorites(prev => {
      const existing = prev.find(f => f.materialId === material.id);
      if (existing) {
        return prev.map(f => 
          f.materialId === material.id 
            ? { ...f, usageCount: f.usageCount + 1, lastUsed: new Date().toISOString() }
            : f
        );
      } else {
        return [...prev, {
          materialId: material.id,
          materialName: material.name,
          category: material.category,
          unit: material.unit,
          factor: material.factor,
          source: material.source,
          usageCount: 1,
          isPinned: false,
          isHidden: false,
          lastUsed: new Date().toISOString()
        }];
      }
    });
  }, []);

  // Get quick-add materials (pinned OR used >= 2 times, not hidden)
  const quickAddMaterials = favorites
    .filter(f => !f.isHidden && (f.isPinned || f.usageCount >= MIN_USAGE_FOR_QUICK_ADD))
    .sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by usage count
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
      // Then by last used
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    })
    .slice(0, MAX_QUICK_ADD_ITEMS);

  // Pin a material manually
  const pinMaterial = useCallback((materialId: string, material?: {
    name: string;
    category: string;
    unit: string;
    factor: number;
    source: string;
  }) => {
    setFavorites(prev => {
      const existing = prev.find(f => f.materialId === materialId);
      if (existing) {
        return prev.map(f => 
          f.materialId === materialId ? { ...f, isPinned: true, isHidden: false } : f
        );
      } else if (material) {
        return [...prev, {
          materialId,
          materialName: material.name,
          category: material.category,
          unit: material.unit,
          factor: material.factor,
          source: material.source,
          usageCount: 0,
          isPinned: true,
          isHidden: false,
          lastUsed: new Date().toISOString()
        }];
      }
      return prev;
    });
  }, []);

  // Unpin a material
  const unpinMaterial = useCallback((materialId: string) => {
    setFavorites(prev => 
      prev.map(f => f.materialId === materialId ? { ...f, isPinned: false } : f)
    );
  }, []);

  // Hide a material from quick-add
  const hideMaterial = useCallback((materialId: string) => {
    setFavorites(prev => 
      prev.map(f => f.materialId === materialId ? { ...f, isHidden: true, isPinned: false } : f)
    );
  }, []);

  // Unhide a material
  const unhideMaterial = useCallback((materialId: string) => {
    setFavorites(prev => 
      prev.map(f => f.materialId === materialId ? { ...f, isHidden: false } : f)
    );
  }, []);

  // Clear all favorites
  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    quickAddMaterials,
    trackMaterialUsage,
    pinMaterial,
    unpinMaterial,
    hideMaterial,
    unhideMaterial,
    clearAllFavorites
  };
}
