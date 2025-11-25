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
        // Transform fuel_inputs object to array
        const fuelInputs: FuelInput[] = [];
        if (calcData.fuel_inputs && typeof calcData.fuel_inputs === 'object' && !Array.isArray(calcData.fuel_inputs)) {
          Object.entries(calcData.fuel_inputs).forEach(([fuelType, quantity]) => {
            if (typeof quantity === 'number' && quantity > 0) {
              // Get emission factor for this fuel type (placeholder logic)
              const emissionFactor = 2.31; // Default diesel factor
              fuelInputs.push({
                fuelType,
                quantity,
                unit: 'L',
                emissionFactor,
                totalEmissions: (quantity * emissionFactor) / 1000 // Convert to tonnes
              });
            }
          });
        } else if (Array.isArray(calcData.fuel_inputs)) {
          fuelInputs.push(...(calcData.fuel_inputs as unknown as FuelInput[]));
        }

        // Transform electricity_inputs object to array
        const electricityInputs: ElectricityInput[] = [];
        if (calcData.electricity_inputs && typeof calcData.electricity_inputs === 'object' && !Array.isArray(calcData.electricity_inputs)) {
          Object.entries(calcData.electricity_inputs).forEach(([key, quantity]) => {
            if (typeof quantity === 'number' && quantity > 0) {
              // Get emission factor (Australian average)
              const emissionFactor = 0.00081; // kgCO2e/kWh
              electricityInputs.push({
                state: key === 'kwh' ? 'National Average' : key,
                quantity,
                unit: 'kWh',
                emissionFactor,
                totalEmissions: (quantity * emissionFactor) / 1000 // Convert to tonnes
              });
            }
          });
        } else if (Array.isArray(calcData.electricity_inputs)) {
          electricityInputs.push(...(calcData.electricity_inputs as unknown as ElectricityInput[]));
        }

        // Transform transport_inputs object to array
        const transportInputs: TransportInput[] = [];
        if (calcData.transport_inputs && typeof calcData.transport_inputs === 'object' && !Array.isArray(calcData.transport_inputs)) {
          Object.entries(calcData.transport_inputs).forEach(([mode, data]) => {
            if (data && typeof data === 'object') {
              const transportData = data as any;
              const emissionFactor = 0.1; // Default factor
              transportInputs.push({
                mode,
                distance: transportData.distance || 0,
                weight: transportData.weight || 0,
                emissionFactor,
                totalEmissions: ((transportData.distance || 0) * (transportData.weight || 0) * emissionFactor) / 1000
              });
            }
          });
        } else if (Array.isArray(calcData.transport_inputs)) {
          transportInputs.push(...(calcData.transport_inputs as unknown as TransportInput[]));
        }

        setData({
          id: calcData.id,
          materials: Array.isArray(calcData.materials) ? (calcData.materials as unknown as MaterialItem[]) : [],
          fuelInputs,
          electricityInputs,
          transportInputs,
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
