/**
 * Hook for accessing the local materials database
 * No Supabase dependency - uses TypeScript data
 */

import { useState, useMemo, useCallback } from 'react';
import { 
  materialsDatabase, 
  Material, 
  MaterialCategory,
  getMaterialsByCategory,
  getMaterialCategories,
  getUnitLabel,
  getCategoryLabel
} from '@/data/materials-database';

export interface GroupedMaterials {
  category: MaterialCategory;
  categoryLabel: string;
  materials: Material[];
}

export function useLocalMaterials() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory | 'all'>('all');

  // Get all categories
  const categories = useMemo(() => getMaterialCategories(), []);

  // Filter materials based on search and category
  const filteredMaterials = useMemo(() => {
    let result = materialsDatabase;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = getMaterialsByCategory(selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(searchLower) ||
        m.subcategory.toLowerCase().includes(searchLower) ||
        m.notes?.toLowerCase().includes(searchLower) ||
        m.suppliers?.some(s => s.toLowerCase().includes(searchLower))
      );
    }

    return result;
  }, [searchTerm, selectedCategory]);

  // Group materials by category
  const groupedMaterials = useMemo((): GroupedMaterials[] => {
    const groups = new Map<MaterialCategory, Material[]>();
    
    filteredMaterials.forEach(material => {
      const existing = groups.get(material.category) || [];
      groups.set(material.category, [...existing, material]);
    });

    return Array.from(groups.entries()).map(([category, materials]) => ({
      category,
      categoryLabel: getCategoryLabel(category),
      materials: materials.sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel));
  }, [filteredMaterials]);

  // Get category breakdown for stats
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; avgFactor: number }> = {};
    
    categories.forEach(category => {
      const categoryMaterials = getMaterialsByCategory(category);
      const avgFactor = categoryMaterials.length > 0
        ? categoryMaterials.reduce((sum, m) => sum + m.ef_total, 0) / categoryMaterials.length
        : 0;
      
      breakdown[category] = {
        count: categoryMaterials.length,
        avgFactor: Math.round(avgFactor * 100) / 100
      };
    });
    
    return breakdown;
  }, [categories]);

  // Search function
  const search = useCallback((query: string) => {
    setSearchTerm(query);
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
  }, []);

  return {
    // Data
    materials: filteredMaterials,
    allMaterials: materialsDatabase,
    groupedMaterials,
    categories,
    categoryBreakdown,
    
    // State
    searchTerm,
    selectedCategory,
    
    // Actions
    setSearchTerm: search,
    setSelectedCategory,
    resetFilters,
    
    // Helpers
    getUnitLabel,
    getCategoryLabel,
    
    // Stats
    totalMaterials: materialsDatabase.length,
    filteredCount: filteredMaterials.length,
    loading: false // No async loading needed
  };
}

// Export types for use in components
export type { Material, MaterialCategory } from '@/data/materials-database';
