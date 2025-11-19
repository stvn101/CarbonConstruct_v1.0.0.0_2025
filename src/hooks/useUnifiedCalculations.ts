import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import {
  unifiedMaterialSchema,
  fuelInputSchema,
  electricityInputSchema,
  transportInputSchema,
  totalsSchema,
  parseJsonbArray,
  parseJsonbField,
  UnifiedMaterial,
} from '@/lib/schemas';

// Use the UnifiedMaterial type from schemas
export type MaterialItem = UnifiedMaterial;

export interface FuelInput {
  fuelType: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  totalEmissions: number;
}

export interface ElectricityInput {
  state: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  totalEmissions: number;
  renewablePercentage?: number;
}

export interface TransportInput {
  mode: string;
  distance: number;
  weight: number;
  emissionFactor: number;
  totalEmissions: number;
}

export interface UnifiedTotals {
  scope1: number;
  scope2: number;
  scope3_materials: number;
  scope3_transport: number;
  total: number;
}

export interface UnifiedCalculationData {
  id: string;
  materials: MaterialItem[];
  fuelInputs: FuelInput[];
  electricityInputs: ElectricityInput[];
  transportInputs: TransportInput[];
  totals: UnifiedTotals;
  createdAt: string;
  updatedAt: string;
}

export const useUnifiedCalculations = () => {
  const [data, setData] = useState<UnifiedCalculationData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentProject } = useProject();

  const fetchUnifiedCalculations = async () => {
    if (!currentProject?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: calcData, error } = await supabase
        .from('unified_calculations')
        .select('*')
        .eq('project_id', currentProject.id)
        .eq('is_draft', false)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (calcData) {
        // Parse and validate JSONB fields with Zod schemas
        const materials = parseJsonbArray(calcData.materials, unifiedMaterialSchema, 'materials');
        const fuelInputs = parseJsonbArray(calcData.fuel_inputs, fuelInputSchema, 'fuelInputs');
        const electricityInputs = parseJsonbArray(calcData.electricity_inputs, electricityInputSchema, 'electricityInputs');
        const transportInputs = parseJsonbArray(calcData.transport_inputs, transportInputSchema, 'transportInputs');
        
        const totals = parseJsonbField<UnifiedTotals>(
          calcData.totals,
          totalsSchema,
          'totals',
          { scope1: 0, scope2: 0, scope3_materials: 0, scope3_transport: 0, total: 0 }
        );

        setData({
          id: calcData.id,
          materials,
          fuelInputs,
          electricityInputs,
          transportInputs,
          totals,
          createdAt: calcData.created_at,
          updatedAt: calcData.updated_at
        });
      } else {
        setData(null);
      }
    } catch (error) {
      console.error('Error fetching unified calculations:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnifiedCalculations();
  }, [currentProject?.id]);

  return {
    data,
    loading,
    refetch: fetchUnifiedCalculations
  };
};
