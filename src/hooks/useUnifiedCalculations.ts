import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';
import { validateCalculationData, UnitValidationResult } from '@/lib/unit-validation';

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
  const [validationResult, setValidationResult] = useState<UnitValidationResult | null>(null);
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
        // Transform materials array - map database structure to interface
        const materials: MaterialItem[] = [];
        if (Array.isArray(calcData.materials)) {
          (calcData.materials as any[]).forEach((mat: any) => {
            const quantity = mat.quantity || 0;
            const factor = mat.factor || mat.emissionFactor || 0;
            materials.push({
              name: mat.name || 'Unknown Material',
              category: mat.category || 'Uncategorized',
              quantity,
              unit: mat.unit || 'kg',
              emissionFactor: factor,
              totalEmissions: (quantity * factor) / 1000, // Convert kg to tonnes
              source: mat.source || 'Database',
              customNotes: mat.isCustom ? 'Custom material' : undefined
            });
          });
        }

        // Transform fuel_inputs object to array - with better parsing
        const fuelInputs: FuelInput[] = [];
        const fuelData = calcData.fuel_inputs;
        const parsedFuelData = typeof fuelData === 'string' ? JSON.parse(fuelData) : fuelData;
        
        if (parsedFuelData && typeof parsedFuelData === 'object' && !Array.isArray(parsedFuelData)) {
          // Emission factors for different fuel types (kgCO2e/L)
          const fuelFactors: Record<string, number> = {
            diesel_transport: 2.68,
            diesel_stationary: 2.68,
            petrol: 2.31,
            lpg: 1.51,
            natural_gas: 2.04,
          };
          
          Object.entries(parsedFuelData).forEach(([fuelType, quantity]) => {
            const qty = Number(quantity);
            if (!isNaN(qty) && qty > 0) {
              const emissionFactor = fuelFactors[fuelType] || 2.31;
              fuelInputs.push({
                fuelType: fuelType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                quantity: qty,
                unit: 'L',
                emissionFactor,
                totalEmissions: (qty * emissionFactor) / 1000
              });
            }
          });
        } else if (Array.isArray(parsedFuelData)) {
          fuelInputs.push(...(parsedFuelData as unknown as FuelInput[]));
        }

        // Transform electricity_inputs object to array - with better parsing
        const electricityInputs: ElectricityInput[] = [];
        const elecData = calcData.electricity_inputs;
        const parsedElecData = typeof elecData === 'string' ? JSON.parse(elecData) : elecData;
        
        if (parsedElecData && typeof parsedElecData === 'object' && !Array.isArray(parsedElecData)) {
          // Australian grid emission factor (kgCO2e/kWh)
          const emissionFactor = 0.72;
          
          Object.entries(parsedElecData).forEach(([key, quantity]) => {
            const qty = Number(quantity);
            if (!isNaN(qty) && qty > 0) {
              electricityInputs.push({
                state: key === 'kwh' ? 'Grid Electricity' : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                quantity: qty,
                unit: 'kWh',
                emissionFactor,
                totalEmissions: (qty * emissionFactor) / 1000
              });
            }
          });
        } else if (Array.isArray(parsedElecData)) {
          electricityInputs.push(...(parsedElecData as unknown as ElectricityInput[]));
        }

        // Transform transport_inputs object to array - with better parsing
        const transportInputs: TransportInput[] = [];
        const transData = calcData.transport_inputs;
        const parsedTransData = typeof transData === 'string' ? JSON.parse(transData) : transData;
        
        // Transport emission factors (kgCO2e/km or kgCO2e/t-km)
        const transportFactors: Record<string, number> = {
          commute_car: 0.21, // avg car per km
          commute_ute: 0.27, // ute/van per km
          commute_truck: 0.89, // truck per km
          waste_general: 100, // per tonne of waste transported
          road_freight: 0.089, // per tonne-km
          rail_freight: 0.022, // per tonne-km
          sea_freight: 0.016, // per tonne-km
          articulated_truck: 0.0875, // per tonne-km
          rigid_truck_large: 0.1126, // per tonne-km
          rigid_truck_medium: 0.1876, // per tonne-km
          light_commercial: 0.2496, // per tonne-km
        };
        
        if (parsedTransData && typeof parsedTransData === 'object' && !Array.isArray(parsedTransData)) {
          Object.entries(parsedTransData).forEach(([mode, value]) => {
            const qty = Number(value);
            if (!isNaN(qty) && qty > 0) {
              const emissionFactor = transportFactors[mode] || 0.1;
              // Mode determines if it's distance (km) or weight (tonnes)
              const isDistanceBased = mode.startsWith('commute_');
              transportInputs.push({
                mode: mode.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                distance: isDistanceBased ? qty : 0,
                weight: isDistanceBased ? 0 : qty,
                emissionFactor,
                totalEmissions: (qty * emissionFactor) / 1000
              });
            }
          });
        } else if (Array.isArray(parsedTransData)) {
          transportInputs.push(...(parsedTransData as unknown as TransportInput[]));
        }
        
        // Also load A4 transport from localStorage (TransportCalculator data)
        try {
          const localTransportData = localStorage.getItem('carbonConstruct_transportItems');
          if (localTransportData) {
            const transportItems = JSON.parse(localTransportData);
            if (Array.isArray(transportItems)) {
              transportItems.forEach((item: any) => {
                if (item.emissions > 0) {
                  transportInputs.push({
                    mode: `A4: ${item.description || item.mode || 'Material Transport'}`,
                    distance: item.distanceKm || item.distance || 0,
                    weight: item.weightTonnes || item.weight || 0,
                    emissionFactor: item.emissions / ((item.distanceKm || 1) * (item.weightTonnes || 1)),
                    totalEmissions: item.emissions / 1000 // Convert kgCO2e to tCO2e
                  });
                }
              });
            }
          }
        } catch (e) {
          // Silently fail if localStorage is unavailable
        }

        // Transform totals - map database structure to interface
        const rawTotals = calcData.totals as any || {};
        const totals: UnifiedTotals = {
          scope1: rawTotals.scope1 || rawTotals.s1 || 0,
          scope2: rawTotals.scope2 || rawTotals.s2 || 0,
          scope3_materials: rawTotals.scope3_materials || rawTotals.s3_mat || 0,
          scope3_transport: rawTotals.scope3_transport || rawTotals.s3_trans || 0,
          total: rawTotals.total || 0
        };

        const calculationData = {
          id: calcData.id,
          materials,
          fuelInputs,
          electricityInputs,
          transportInputs,
          totals,
          createdAt: calcData.created_at,
          updatedAt: calcData.updated_at
        };

        // Validate unit consistency
        const validation = validateCalculationData({
          materials,
          fuelInputs,
          electricityInputs,
          transportInputs,
          totals
        });
        setValidationResult(validation);
        
        if (validation.warnings.length > 0) {
          logger.warn('UnifiedCalculations:unitValidation', 
            `Project ${currentProject.id}: ${validation.warnings.join('; ')}`
          );
        }

        setData(calculationData);
      } else {
        setData(null);
        setValidationResult(null);
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
    validationResult,
    refetch: fetchUnifiedCalculations
  };
};
