import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';

export interface MaterialItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  totalEmissions: number;
  source?: string;
  customNotes?: string;
}

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
        setData({
          id: calcData.id,
          materials: (calcData.materials as unknown as MaterialItem[]) || [],
          fuelInputs: (calcData.fuel_inputs as unknown as FuelInput[]) || [],
          electricityInputs: (calcData.electricity_inputs as unknown as ElectricityInput[]) || [],
          transportInputs: (calcData.transport_inputs as unknown as TransportInput[]) || [],
          totals: (calcData.totals as unknown as UnifiedTotals) || {
            scope1: 0,
            scope2: 0,
            scope3_materials: 0,
            scope3_transport: 0,
            total: 0
          },
          createdAt: calcData.created_at,
          updatedAt: calcData.updated_at
        });
      } else {
        setData(null);
      }
    } catch (error) {
      logger.error('UnifiedCalculations:fetchCalculations', error);
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
