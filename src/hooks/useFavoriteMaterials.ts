import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  // EPD Traceability fields
  epdNumber?: string;
  epdUrl?: string;
  manufacturer?: string;
  plantLocation?: string;
  dataQualityTier?: string;
  year?: number;
  // Lifecycle breakdown (kgCO2e per unit)
  ef_a1a3?: number;
  ef_a4?: number;
  ef_a5?: number;
  ef_b1b5?: number;
  ef_c1c4?: number;
  ef_d?: number;
  // ECO Platform compliance fields
  manufacturing_country?: string;
  manufacturing_city?: string;
  characterisation_factor_version?: string;
  allocation_method?: string;
  is_co_product?: boolean;
  co_product_type?: string;
  uses_mass_balance?: boolean;
  biogenic_carbon_kg_c?: number;
  biogenic_carbon_percentage?: number;
  ecoinvent_methodology?: string;
  eco_platform_compliant?: boolean;
  data_quality_rating?: string;
}

const STORAGE_KEY = 'carbonConstruct_favoriteMaterials';
const MIN_USAGE_FOR_QUICK_ADD = 2;
const MAX_QUICK_ADD_ITEMS = 8;

// Default common Australian construction materials for quick-add
const DEFAULT_MATERIALS: FavoriteMaterial[] = [
  {
    materialId: 'default_plasterboard',
    materialName: 'Plasterboard',
    category: 'Ceilings & walls',
    unit: 'm²',
    factor: 8.71,
    source: 'NMEF v2025.1',
    usageCount: 0,
    isPinned: true,
    isHidden: false,
    lastUsed: new Date().toISOString()
  },
  {
    materialId: 'default_concrete_32mpa',
    materialName: 'Concrete 32MPa',
    category: 'Concrete',
    unit: 'm³',
    factor: 320,
    source: 'NMEF v2025.1',
    usageCount: 0,
    isPinned: true,
    isHidden: false,
    lastUsed: new Date().toISOString()
  },
  {
    materialId: 'default_steel_rebar',
    materialName: 'Steel Reinforcing',
    category: 'Steel',
    unit: 'kg',
    factor: 1.99,
    source: 'NMEF v2025.1',
    usageCount: 0,
    isPinned: true,
    isHidden: false,
    lastUsed: new Date().toISOString()
  },
  {
    materialId: 'default_timber_softwood',
    materialName: 'Timber Softwood',
    category: 'Timber',
    unit: 'm³',
    factor: 718,
    source: 'NMEF v2025.1',
    usageCount: 0,
    isPinned: true,
    isHidden: false,
    lastUsed: new Date().toISOString()
  },
  {
    materialId: 'default_insulation_glasswool',
    materialName: 'Insulation Glass Wool',
    category: 'Insulation',
    unit: 'm²',
    factor: 2.8,
    source: 'NMEF v2025.1',
    usageCount: 0,
    isPinned: true,
    isHidden: false,
    lastUsed: new Date().toISOString()
  },
  {
    materialId: 'default_aluminium',
    materialName: 'Aluminium',
    category: 'Metals',
    unit: 'kg',
    factor: 12.5,
    source: 'NMEF v2025.1',
    usageCount: 0,
    isPinned: true,
    isHidden: false,
    lastUsed: new Date().toISOString()
  }
];

export function useFavoriteMaterials() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteMaterial[]>([]);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load from localStorage on mount, merge with defaults
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as FavoriteMaterial[];
        // Merge defaults with stored, keeping user preferences for defaults
        const merged = DEFAULT_MATERIALS.map(def => {
          const userVersion = parsed.find(p => p.materialId === def.materialId);
          return userVersion || def;
        });
        // Add any user materials not in defaults
        const userOnly = parsed.filter(p => !DEFAULT_MATERIALS.some(d => d.materialId === p.materialId));
        setFavorites([...merged, ...userOnly]);
      } else {
        // First time - use defaults
        setFavorites(DEFAULT_MATERIALS);
      }
    } catch {
      console.warn('Failed to load favorite materials');
      setFavorites(DEFAULT_MATERIALS);
    }
  }, []);

  // Load from cloud when user logs in
  useEffect(() => {
    if (user) {
      loadFromCloud();
    }
  }, [user]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Load favorites from cloud
  const loadFromCloud = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_material_favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.warn('Failed to load cloud favorites:', error);
        return;
      }

      if (data && data.length > 0) {
        setCloudSyncEnabled(true);
        // Merge cloud data with local, preferring cloud for matching materials
        setFavorites(prev => {
          const cloudMaterials: FavoriteMaterial[] = data.map(d => ({
            materialId: d.material_id,
            materialName: d.material_name,
            category: d.material_category,
            unit: d.unit,
            factor: Number(d.factor),
            source: d.source || '',
            usageCount: d.usage_count || 1,
            isPinned: true, // Cloud synced = pinned
            isHidden: false,
            lastUsed: d.last_used || new Date().toISOString(),
            epdNumber: d.epd_number || undefined,
          }));

          // Merge: cloud materials take precedence, then local
          const merged = [...DEFAULT_MATERIALS];
          
          // Add cloud materials
          cloudMaterials.forEach(cloud => {
            const existingIdx = merged.findIndex(m => m.materialId === cloud.materialId);
            if (existingIdx >= 0) {
              merged[existingIdx] = { ...merged[existingIdx], ...cloud };
            } else {
              merged.push(cloud);
            }
          });

          // Add local-only materials that aren't in cloud
          prev.forEach(local => {
            if (!merged.find(m => m.materialId === local.materialId)) {
              merged.push(local);
            }
          });

          return merged;
        });
      }
    } catch (err) {
      console.warn('Cloud sync failed:', err);
    }
  }, [user]);

  // Save favorites to cloud
  const saveToCloud = useCallback(async () => {
    if (!user) return { success: false, message: 'Not logged in' };
    
    setIsSyncing(true);
    try {
      // Get non-default favorites to sync
      const toSync = favorites.filter(f => 
        !f.materialId.startsWith('default_') && 
        !f.isHidden && 
        (f.isPinned || f.usageCount >= MIN_USAGE_FOR_QUICK_ADD)
      );

      // Delete existing and insert fresh
      await supabase
        .from('user_material_favorites')
        .delete()
        .eq('user_id', user.id);

      if (toSync.length > 0) {
        const { error } = await supabase
          .from('user_material_favorites')
          .insert(toSync.map(f => ({
            user_id: user.id,
            material_id: f.materialId,
            material_name: f.materialName,
            material_category: f.category,
            unit: f.unit,
            factor: f.factor,
            source: f.source,
            epd_number: f.epdNumber,
            usage_count: f.usageCount,
            last_used: f.lastUsed,
          })));

        if (error) throw error;
      }

      setCloudSyncEnabled(true);
      return { success: true, message: `Synced ${toSync.length} materials to cloud` };
    } catch (err) {
      console.error('Failed to save to cloud:', err);
      return { success: false, message: 'Failed to sync to cloud' };
    } finally {
      setIsSyncing(false);
    }
  }, [user, favorites]);

  // Track material usage - call this when a material is added to calculation
  const trackMaterialUsage = useCallback((material: {
    id: string;
    name: string;
    category: string;
    unit: string;
    factor: number;
    source: string;
    // EPD Traceability fields
    epdNumber?: string;
    epdUrl?: string;
    manufacturer?: string;
    plantLocation?: string;
    dataQualityTier?: string;
    year?: number;
    // Lifecycle breakdown
    ef_a1a3?: number;
    ef_a4?: number;
    ef_a5?: number;
    ef_b1b5?: number;
    ef_c1c4?: number;
    ef_d?: number;
    // ECO Platform compliance fields
    manufacturing_country?: string;
    manufacturing_city?: string;
    characterisation_factor_version?: string;
    allocation_method?: string;
    is_co_product?: boolean;
    co_product_type?: string;
    uses_mass_balance?: boolean;
    biogenic_carbon_kg_c?: number;
    biogenic_carbon_percentage?: number;
    ecoinvent_methodology?: string;
    eco_platform_compliant?: boolean;
    data_quality_rating?: string;
  }) => {
    setFavorites(prev => {
      const existing = prev.find(f => f.materialId === material.id);
      if (existing) {
        // Update existing with latest EPD data and increment usage
        return prev.map(f => 
          f.materialId === material.id 
            ? { 
                ...f, 
                usageCount: f.usageCount + 1, 
                lastUsed: new Date().toISOString(),
                // Update EPD fields with latest data
                epdNumber: material.epdNumber ?? f.epdNumber,
                epdUrl: material.epdUrl ?? f.epdUrl,
                manufacturer: material.manufacturer ?? f.manufacturer,
                plantLocation: material.plantLocation ?? f.plantLocation,
                dataQualityTier: material.dataQualityTier ?? f.dataQualityTier,
                year: material.year ?? f.year,
                ef_a1a3: material.ef_a1a3 ?? f.ef_a1a3,
                ef_a4: material.ef_a4 ?? f.ef_a4,
                ef_a5: material.ef_a5 ?? f.ef_a5,
                ef_b1b5: material.ef_b1b5 ?? f.ef_b1b5,
                ef_c1c4: material.ef_c1c4 ?? f.ef_c1c4,
                ef_d: material.ef_d ?? f.ef_d,
                // Update ECO Platform fields with latest data
                manufacturing_country: material.manufacturing_country ?? f.manufacturing_country,
                manufacturing_city: material.manufacturing_city ?? f.manufacturing_city,
                characterisation_factor_version: material.characterisation_factor_version ?? f.characterisation_factor_version,
                allocation_method: material.allocation_method ?? f.allocation_method,
                is_co_product: material.is_co_product ?? f.is_co_product,
                co_product_type: material.co_product_type ?? f.co_product_type,
                uses_mass_balance: material.uses_mass_balance ?? f.uses_mass_balance,
                biogenic_carbon_kg_c: material.biogenic_carbon_kg_c ?? f.biogenic_carbon_kg_c,
                biogenic_carbon_percentage: material.biogenic_carbon_percentage ?? f.biogenic_carbon_percentage,
                ecoinvent_methodology: material.ecoinvent_methodology ?? f.ecoinvent_methodology,
                eco_platform_compliant: material.eco_platform_compliant ?? f.eco_platform_compliant,
                data_quality_rating: material.data_quality_rating ?? f.data_quality_rating,
              }
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
          lastUsed: new Date().toISOString(),
          // Store EPD fields
          epdNumber: material.epdNumber,
          epdUrl: material.epdUrl,
          manufacturer: material.manufacturer,
          plantLocation: material.plantLocation,
          dataQualityTier: material.dataQualityTier,
          year: material.year,
          ef_a1a3: material.ef_a1a3,
          ef_a4: material.ef_a4,
          ef_a5: material.ef_a5,
          ef_b1b5: material.ef_b1b5,
          ef_c1c4: material.ef_c1c4,
          ef_d: material.ef_d,
          // Store ECO Platform fields
          manufacturing_country: material.manufacturing_country,
          manufacturing_city: material.manufacturing_city,
          characterisation_factor_version: material.characterisation_factor_version,
          allocation_method: material.allocation_method,
          is_co_product: material.is_co_product,
          co_product_type: material.co_product_type,
          uses_mass_balance: material.uses_mass_balance,
          biogenic_carbon_kg_c: material.biogenic_carbon_kg_c,
          biogenic_carbon_percentage: material.biogenic_carbon_percentage,
          ecoinvent_methodology: material.ecoinvent_methodology,
          eco_platform_compliant: material.eco_platform_compliant,
          data_quality_rating: material.data_quality_rating,
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

  // Get recently used materials (last 10, sorted by lastUsed)
  const recentlyUsedMaterials = favorites
    .filter(f => f.usageCount > 0)
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 10);

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

  /**
   * Synchronizes the local favorites list with the latest EPD data from the database.
   *
   * This function fetches updated material data for all non-default favorite materials
   * from the `materials_epd` table and updates the local state accordingly. It performs
   * a bulk query for efficiency and merges the latest EPD data with existing user preferences
   * (usage count, pinned status, etc.).
   *
   * ## Invocation Context
   * Call this function when you need to ensure favorite materials reflect current database values:
   * - After a scheduled EPD data refresh
   * - When the app resumes from background/paused state
   * - On user-triggered "Sync Materials" action
   * - Before generating compliance reports that require up-to-date emission factors
   *
   * ## Behavior
   * - Skips default pinned materials (IDs starting with 'default_')
   * - Queries Supabase `materials_epd` table using `.in()` for batch efficiency
   * - Updates emission factors, EPD metadata, and lifecycle breakdown fields
   * - Preserves user-specific data (usage count, pinned status, lastUsed timestamp)
   * - Handles missing materials gracefully (keeps original data if not found in database)
   *
   * ## Error Handling
   * If database query fails or network is unavailable, logs a warning and returns
   * `{ synced: 0, total: materialIds.length }` to allow graceful degradation.
   * The function does not throw errors to prevent breaking the UI.
   *
   * @returns {Promise<{ synced: number, total: number }>} Synchronization result containing:
   *   - `synced`: Number of materials successfully updated from the database
   *   - `total`: Total number of favorite materials queried (excludes defaults)
   *
   * @example
   * ```typescript
   * const { syncWithDatabase } = useFavoriteMaterials();
   * const result = await syncWithDatabase();
   * console.log(`Synced ${result.synced} of ${result.total} materials`);
   * ```
   */
  const syncWithDatabase = useCallback(async () => {
    if (favorites.length === 0) return { synced: 0, total: 0 };

    // Get all material IDs that aren't default pinned items
    const materialIds = favorites
      .filter(f => !f.materialId.startsWith('default_'))
      .map(f => f.materialId);

    if (materialIds.length === 0) return { synced: 0, total: 0 };

    // Fetch latest EPD data from database
    const { data: dbMaterials, error } = await supabase
      .from('materials_epd')
      .select('*')
      .in('id', materialIds);

    if (error || !dbMaterials) {
      console.warn('Failed to sync EPD data:', error);
      return { synced: 0, total: materialIds.length };
    }

    // Update favorites with latest EPD data
    setFavorites(prev => prev.map(fav => {
      const dbMaterial = dbMaterials.find(m => m.id === fav.materialId);
      if (!dbMaterial) return fav;

      return {
        ...fav,
        factor: Number(dbMaterial.ef_total) || fav.factor,
        epdNumber: dbMaterial.epd_number || fav.epdNumber,
        epdUrl: dbMaterial.epd_url || fav.epdUrl,
        manufacturer: dbMaterial.manufacturer || fav.manufacturer,
        plantLocation: dbMaterial.plant_location || fav.plantLocation,
        dataQualityTier: dbMaterial.data_quality_tier || fav.dataQualityTier,
        year: dbMaterial.year || fav.year,
        ef_a1a3: dbMaterial.ef_a1a3 ? Number(dbMaterial.ef_a1a3) : fav.ef_a1a3,
        ef_a4: dbMaterial.ef_a4 ? Number(dbMaterial.ef_a4) : fav.ef_a4,
        ef_a5: dbMaterial.ef_a5 ? Number(dbMaterial.ef_a5) : fav.ef_a5,
        ef_b1b5: dbMaterial.ef_b1b5 ? Number(dbMaterial.ef_b1b5) : fav.ef_b1b5,
        ef_c1c4: dbMaterial.ef_c1c4 ? Number(dbMaterial.ef_c1c4) : fav.ef_c1c4,
        ef_d: dbMaterial.ef_d ? Number(dbMaterial.ef_d) : fav.ef_d,
        // ECO Platform compliance fields
        manufacturing_country: dbMaterial.manufacturing_country || fav.manufacturing_country,
        manufacturing_city: dbMaterial.manufacturing_city || fav.manufacturing_city,
        characterisation_factor_version: dbMaterial.characterisation_factor_version || fav.characterisation_factor_version,
        allocation_method: dbMaterial.allocation_method || fav.allocation_method,
        is_co_product: dbMaterial.is_co_product ?? fav.is_co_product,
        co_product_type: dbMaterial.co_product_type || fav.co_product_type,
        uses_mass_balance: dbMaterial.uses_mass_balance ?? fav.uses_mass_balance,
        biogenic_carbon_kg_c: dbMaterial.biogenic_carbon_kg_c ? Number(dbMaterial.biogenic_carbon_kg_c) : fav.biogenic_carbon_kg_c,
        biogenic_carbon_percentage: dbMaterial.biogenic_carbon_percentage ? Number(dbMaterial.biogenic_carbon_percentage) : fav.biogenic_carbon_percentage,
        ecoinvent_methodology: dbMaterial.ecoinvent_methodology || fav.ecoinvent_methodology,
        eco_platform_compliant: dbMaterial.eco_platform_compliant ?? fav.eco_platform_compliant,
        data_quality_rating: dbMaterial.data_quality_rating || fav.data_quality_rating,
      };
    }));

    return { synced: dbMaterials.length, total: materialIds.length };
  }, [favorites]);

  return {
    favorites,
    quickAddMaterials,
    recentlyUsedMaterials,
    trackMaterialUsage,
    pinMaterial,
    unpinMaterial,
    hideMaterial,
    unhideMaterial,
    clearAllFavorites,
    syncWithDatabase,
    // Cloud sync features
    cloudSyncEnabled,
    isSyncing,
    saveToCloud,
    loadFromCloud,
  };
}
