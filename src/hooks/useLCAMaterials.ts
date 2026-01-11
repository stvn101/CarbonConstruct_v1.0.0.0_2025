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
  const [loadedCount, setLoadedCount] = useState(0);
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
      setLoadedCount(0);

      // Fetch all materials from materials_epd - paginate to get all records
      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const { data, error } = await supabase
          .from('materials_epd')
          .select('*')
          .order('material_category', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          allData = [...allData, ...data];
          setLoadedCount(allData.length);
          page++;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }
      
      // Map materials_epd columns to LCAMaterialData interface
      const mappedData = allData.map(row => ({
        id: row.id,
        material_name: row.material_name,
        material_category: row.material_category,
        embodied_carbon_a1a3: row.ef_a1a3 || 0,
        embodied_carbon_a4: row.ef_a4 || 0,
        embodied_carbon_a5: row.ef_a5 || 0,
        embodied_carbon_total: row.ef_total || 0,
        unit: row.unit,
        region: row.region || 'Australia',
        data_source: row.data_source,
      }));
      
      const data = mappedData;

      if (data) {
        // Single-pass optimization: Validate materials and calculate breakdowns in one iteration
        const validatedMaterials: LCAMaterialData[] = [];
        const totals = { a1a3: 0, a4: 0, a5: 0, total: 0 };
        const categoryMap = new Map<string, LCACategoryBreakdown>();
        
        // Iterate once through data performing all operations
        for (let i = 0; i < data.length; i++) {
          const material = data[i];
          
          // 1. Validate material data
          const result = LCAMaterialSchema.safeParse(material);
          if (!result.success) {
            logger.warn('useLCAMaterials', 'Invalid LCA material data', { 
              material: material.material_name, 
              issues: result.error.issues 
            });
          } else {
            validatedMaterials.push(result.data as LCAMaterialData);
          }
          
          // 2. Calculate stage breakdown totals
          const a1a3 = material.embodied_carbon_a1a3 || 0;
          const a4 = material.embodied_carbon_a4 || 0;
          const a5 = material.embodied_carbon_a5 || 0;
          const total = material.embodied_carbon_total || 0;
          
          totals.a1a3 += a1a3;
          totals.a4 += a4;
          totals.a5 += a5;
          totals.total += total;
          
          // 3. Calculate category breakdown
          const category = material.material_category;
          const existing = categoryMap.get(category);
          if (existing) {
            existing.a1a3 += a1a3;
            existing.a4 += a4;
            existing.a5 += a5;
            existing.total += total;
          } else {
            categoryMap.set(category, {
              category,
              a1a3,
              a4,
              a5,
              total
            });
          }
        }

        setMaterials(validatedMaterials);
        setStageBreakdown(totals);
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
    loadedCount,
    stageBreakdown,
    categoryBreakdown,
    refetch: fetchLCAMaterials
  };
};
