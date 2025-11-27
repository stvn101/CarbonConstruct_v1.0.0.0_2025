/**
 * Hook for accessing the EPD materials database from Supabase
 * Uses the new materials_epd table with regional manufacturer data
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  ef_a1a3: number;
  ef_a4: number;
  ef_a5: number;
  ef_b1b5: number;
  ef_c1c4: number;
  ef_d: number;
  ef_total: number;
  data_source: string;
  epd_url: string | null;
  epd_number: string | null;
  data_quality_tier: string | null;
  year: number | null;
  recycled_content: number | null;
}

export interface GroupedEPDMaterials {
  category: string;
  materials: EPDMaterial[];
}

export function useEPDMaterials() {
  const [materials, setMaterials] = useState<EPDMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');

  // Fetch materials from Supabase
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('materials_epd')
        .select('*')
        .order('material_category')
        .order('material_name');

      if (fetchError) throw fetchError;

      setMaterials(data || []);
    } catch (err) {
      console.error('Error fetching EPD materials:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(materials.map(m => m.material_category))];
    return cats.sort();
  }, [materials]);

  // Get unique states
  const states = useMemo(() => {
    const sts = [...new Set(materials.map(m => m.state).filter(Boolean))];
    return sts.sort() as string[];
  }, [materials]);

  // Get unique manufacturers
  const manufacturers = useMemo(() => {
    const mfrs = [...new Set(materials.map(m => m.manufacturer).filter(Boolean))];
    return mfrs.sort() as string[];
  }, [materials]);

  // Filter materials based on search and filters
  const filteredMaterials = useMemo(() => {
    let result = materials;

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
  }, [materials, searchTerm, selectedCategory, selectedState, selectedManufacturer]);

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
    allMaterials: materials,
    groupedMaterials,
    categories,
    states,
    manufacturers,
    
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
    refetch: fetchMaterials,
    
    // Helpers
    getUnitLabel,
    
    // Stats
    totalMaterials: materials.length,
    filteredCount: filteredMaterials.length,
  };
}

export type { EPDMaterial as MaterialEPD };
