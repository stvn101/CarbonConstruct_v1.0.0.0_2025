import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { z } from 'zod';

// Zod schemas for validation
const materialItemSchema = z.object({
  name: z.string().max(200),
  category: z.string().max(100),
  quantity: z.number().min(0),
  unit: z.string().max(50),
  emissionFactor: z.number().min(0),
  totalEmissions: z.number().min(0),
  source: z.string().max(200).optional(),
  customNotes: z.string().max(500).optional(),
});

const fuelInputSchema = z.object({
  fuelType: z.string().max(100),
  quantity: z.number().min(0),
  unit: z.string().max(50),
  emissionFactor: z.number().min(0),
  totalEmissions: z.number().min(0),
});

const electricityInputSchema = z.object({
  state: z.string().max(50),
  quantity: z.number().min(0),
  unit: z.string().max(50),
  emissionFactor: z.number().min(0),
  totalEmissions: z.number().min(0),
  renewablePercentage: z.number().min(0).max(100).optional(),
});

const transportInputSchema = z.object({
  mode: z.string().max(100),
  distance: z.number().min(0),
  weight: z.number().min(0),
  emissionFactor: z.number().min(0),
  totalEmissions: z.number().min(0),
});

const totalsSchema = z.object({
  scope1: z.number().min(0),
  scope2: z.number().min(0),
  scope3_materials: z.number().min(0),
  scope3_transport: z.number().min(0),
  total: z.number().min(0),
});

// Helper to safely parse arrays with validation
function parseJsonbArray<T>(data: unknown, schema: z.ZodSchema<T>): T[] {
  if (!Array.isArray(data)) return [];
  
  return data
    .map((item, index) => {
      try {
        return schema.parse(item);
      } catch (error) {
        console.error(`Invalid item at index ${index}:`, error);
        return null;
      }
    })
    .filter((item): item is T => item !== null);
}

// Helper to safely parse objects
function parseJsonbField<T>(data: unknown, schema: z.ZodSchema<T>, fallback: T): T {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('Invalid field data:', error);
    return fallback;
  }
}

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
        // Parse and validate JSONB fields with Zod schemas
        const materials = parseJsonbArray(calcData.materials, materialItemSchema);
        const fuelInputs = parseJsonbArray(calcData.fuel_inputs, fuelInputSchema);
        const electricityInputs = parseJsonbArray(calcData.electricity_inputs, electricityInputSchema);
        const transportInputs = parseJsonbArray(calcData.transport_inputs, transportInputSchema);
        
        const totals = parseJsonbField<UnifiedTotals>(
          calcData.totals,
          totalsSchema,
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
