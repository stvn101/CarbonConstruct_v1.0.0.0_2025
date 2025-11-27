import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LCAMaterialSchema } from '@/lib/schemas';
import { logger } from '@/lib/logger';

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

      // Fetch all materials - Supabase defaults to 1000 rows, so we need to paginate
      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const { data, error } = await supabase
          .from('lca_materials')
          .select('*')
          .order('material_category', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          allData = [...allData, ...data];
          page++;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }
      
      const data = allData;

      if (data) {
        // Validate materials data
        const validatedMaterials: LCAMaterialData[] = [];
        
        data.forEach(material => {
          const result = LCAMaterialSchema.safeParse(material);
          if (!result.success) {
            logger.warn('useLCAMaterials', 'Invalid LCA material data', { 
              material: material.material_name, 
              issues: result.error.issues 
            });
          } else {
            validatedMaterials.push(result.data as LCAMaterialData);
          }
        });

        setMaterials(validatedMaterials);

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
      logger.error('useLCAMaterials', error);
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
