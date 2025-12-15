/**
 * Hook for accessing the EPD materials database from Supabase
 * Uses the new materials_epd table with regional manufacturer data
 * Implements TanStack Query for caching to prevent redundant fetches
 */

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

export interface EPDMaterial {
  id: string;
  material_name: string;
  material_category: string;
  subcategory: string | null;
  manufacturer: string | null;
  plant_location: string | null;
  region: string | null;
  state: string | null;
  unit: string;
  ef_a1a3: number | null;
  ef_a4: number | null;
  ef_a5: number | null;
  ef_b1b5: number | null;
  ef_c1c4: number | null;
  ef_d: number | null;
  ef_total: number;
  data_source: string;
  epd_url: string | null;
  epd_number: string | null;
  data_quality_tier: string | null;
  year: number | null;
  recycled_content: number | null;
  // ECO Platform compliance fields
  manufacturing_country: string | null;
  manufacturing_city: string | null;
  characterisation_factor_version: string | null;
  allocation_method: string | null;
  is_co_product: boolean | null;
  co_product_type: string | null;
  uses_mass_balance: boolean | null;
  biogenic_carbon_kg_c: number | null;
  biogenic_carbon_percentage: number | null;
  ecoinvent_methodology: string | null;
  eco_platform_compliant: boolean | null;
  data_quality_rating: string | null;
}

export interface GroupedEPDMaterials {
  category: string;
  materials: EPDMaterial[];
}

// Fetch function for EPD materials (handles pagination)
async function fetchAllEPDMaterials(): Promise<EPDMaterial[]> {
  const allMaterials: EPDMaterial[] = [];
  const pageSize = 1000;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('materials_epd')
      .select('*')
      .order('material_category')
      .order('material_name')
      .range(from, to);

    if (error) throw error;

    if (data && data.length > 0) {
      allMaterials.push(...data);
      hasMore = data.length === pageSize;
      page++;
    } else {
      hasMore = false;
    }
  }

  return allMaterials;
}

export function useEPDMaterials() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');

  // Get subscription tier to determine database access
  const { currentTier } = useSubscription();
  const hasFullDatabaseAccess = currentTier?.limits?.full_database !== false;

  // Use TanStack Query for caching - materials rarely change
  const { 
    data: materials = [], 
    isLoading: loading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: ['epd-materials'],
    queryFn: fetchAllEPDMaterials,
    staleTime: 5 * 60 * 1000, // 5 minutes - EPD data rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes cache retention
  });

  // Filter to ICM-only for Free tier users
  const accessibleMaterials = useMemo(() => {
    if (hasFullDatabaseAccess) {
      return materials;
    }
    // Free tier: only ICM database materials
    return materials.filter(m => 
      m.data_source?.toLowerCase().includes('icm') || 
      m.data_source?.toLowerCase().includes('icm database')
    );
  }, [materials, hasFullDatabaseAccess]);

  const error = queryError instanceof Error ? queryError.message : queryError ? 'Failed to fetch materials' : null;

  // Get unique categories from accessible materials
  const categories = useMemo(() => {
    const cats = [...new Set(accessibleMaterials.map(m => m.material_category))];
    return cats.sort();
  }, [accessibleMaterials]);

  // Get unique states from accessible materials
  const states = useMemo(() => {
    const sts = [...new Set(accessibleMaterials.map(m => m.state).filter(Boolean))];
    return sts.sort() as string[];
  }, [accessibleMaterials]);

  // Get unique manufacturers from accessible materials
  const manufacturers = useMemo(() => {
    const mfrs = [...new Set(accessibleMaterials.map(m => m.manufacturer).filter(Boolean))];
    return mfrs.sort() as string[];
  }, [accessibleMaterials]);

  // Filter materials based on search and filters (from accessible materials only)
  const filteredMaterials = useMemo(() => {
    let result = accessibleMaterials;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(m => m.material_category === selectedCategory);
    }

    // Filter by state
    if (selectedState !== 'all') {
      result = result.filter(m => m.state === selectedState);
    }

    // Filter by manufacturer
    if (selectedManufacturer !== 'all') {
      result = result.filter(m => m.manufacturer === selectedManufacturer);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.material_name.toLowerCase().includes(searchLower) ||
        m.material_category.toLowerCase().includes(searchLower) ||
        m.subcategory?.toLowerCase().includes(searchLower) ||
        m.manufacturer?.toLowerCase().includes(searchLower) ||
        m.plant_location?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [accessibleMaterials, searchTerm, selectedCategory, selectedState, selectedManufacturer]);

  // Group materials by category
  const groupedMaterials = useMemo((): GroupedEPDMaterials[] => {
    const groups = new Map<string, EPDMaterial[]>();
    
    filteredMaterials.forEach(material => {
      const existing = groups.get(material.material_category) || [];
      groups.set(material.material_category, [...existing, material]);
    });

    return Array.from(groups.entries())
      .map(([category, mats]) => ({
        category,
        materials: mats.sort((a, b) => a.material_name.localeCompare(b.material_name))
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [filteredMaterials]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedState('all');
    setSelectedManufacturer('all');
  }, []);

  // Get unit label
  const getUnitLabel = useCallback((unit: string): string => {
    const labels: Record<string, string> = {
      'kg': 'kilograms',
      'm³': 'cubic metres',
      'm²': 'square metres',
      'm': 'metres',
      'unit': 'units',
      'L': 'litres',
      'tonne': 'tonnes',
    };
    return labels[unit] || unit;
  }, []);

  return {
    // Data
    materials: filteredMaterials,
    allMaterials: accessibleMaterials,
    groupedMaterials,
    categories,
    states,
    manufacturers,
    
    // Access info
    hasFullDatabaseAccess,
    
    // State
    searchTerm,
    selectedCategory,
    selectedState,
    selectedManufacturer,
    loading,
    error,
    
    // Actions
    setSearchTerm,
    setSelectedCategory,
    setSelectedState,
    setSelectedManufacturer,
    resetFilters,
    refetch,
    
    // Helpers
    getUnitLabel,
    
    // Stats
    totalMaterials: accessibleMaterials.length,
    filteredCount: filteredMaterials.length,
  };
}

export type { EPDMaterial as MaterialEPD };
