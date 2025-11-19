import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LCAMaterialData {
  id: string;
  material_name: string;
  material_category: string;
  embodied_carbon_a1a3: number;
  embodied_carbon_a4: number;
  embodied_carbon_a5: number;
  embodied_carbon_total: number;
  unit: string;
  region: string;
  data_source: string;
}

export interface LCAStageBreakdown {
  a1a3: number;
  a4: number;
  a5: number;
  total: number;
}

export interface LCACategoryBreakdown {
  category: string;
  a1a3: number;
  a4: number;
  a5: number;
  total: number;
}

export const useLCAMaterials = () => {
  const [materials, setMaterials] = useState<LCAMaterialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageBreakdown, setStageBreakdown] = useState<LCAStageBreakdown>({
    a1a3: 0,
    a4: 0,
    a5: 0,
    total: 0
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState<LCACategoryBreakdown[]>([]);

  const fetchLCAMaterials = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('lca_materials')
        .select('*')
        .order('material_category', { ascending: true });

      if (error) throw error;

      if (data) {
        setMaterials(data);

        // Calculate stage breakdown totals
        const totals = data.reduce((acc, material) => ({
          a1a3: acc.a1a3 + (material.embodied_carbon_a1a3 || 0),
          a4: acc.a4 + (material.embodied_carbon_a4 || 0),
          a5: acc.a5 + (material.embodied_carbon_a5 || 0),
          total: acc.total + (material.embodied_carbon_total || 0)
        }), { a1a3: 0, a4: 0, a5: 0, total: 0 });

        setStageBreakdown(totals);

        // Calculate category breakdown
        const categoryMap = new Map<string, LCACategoryBreakdown>();
        
        data.forEach(material => {
          const existing = categoryMap.get(material.material_category);
          if (existing) {
            existing.a1a3 += material.embodied_carbon_a1a3 || 0;
            existing.a4 += material.embodied_carbon_a4 || 0;
            existing.a5 += material.embodied_carbon_a5 || 0;
            existing.total += material.embodied_carbon_total || 0;
          } else {
            categoryMap.set(material.material_category, {
              category: material.material_category,
              a1a3: material.embodied_carbon_a1a3 || 0,
              a4: material.embodied_carbon_a4 || 0,
              a5: material.embodied_carbon_a5 || 0,
              total: material.embodied_carbon_total || 0
            });
          }
        });

        setCategoryBreakdown(Array.from(categoryMap.values()));
      }
    } catch (error) {
      console.error('Error fetching LCA materials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLCAMaterials();
  }, []);

  return {
    materials,
    loading,
    stageBreakdown,
    categoryBreakdown,
    refetch: fetchLCAMaterials
  };
};
