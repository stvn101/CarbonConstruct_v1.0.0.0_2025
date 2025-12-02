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
  // EN 15978 Lifecycle stages
  a1a3_product?: number;
  a4_transport?: number;
  a5_construction?: number;
  // Use phase (B1-B7)
  b1_use?: number;
  b2_maintenance?: number;
  b3_repair?: number;
  b4_replacement?: number;
  b5_refurbishment?: number;
  b6_operational_energy?: number;
  b7_operational_water?: number;
  // End of life (C1-C4)
  c1_deconstruction?: number;
  c2_transport?: number;
  c3_waste_processing?: number;
  c4_disposal?: number;
  // Module D
  d_recycling?: number;
  d_reuse?: number;
  d_energy_recovery?: number;
  // Aggregates
  total_upfront?: number;
  total_embodied?: number;
  total_operational?: number;
  total_whole_life?: number;
  total_with_benefits?: number;
}

export interface UnifiedCalculationData {
  id: string;
  materials: MaterialItem[];
  fuelInputs: FuelInput[];
  electricityInputs: ElectricityInput[];
  transportInputs: TransportInput[];
  totals: UnifiedTotals;
  createdAt: string | null;
  updatedAt: string | null;
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
          // First check for A4 transport items saved from TransportCalculator
          const a4Items = parsedTransData.a4_transport_items;
          if (Array.isArray(a4Items)) {
            a4Items.forEach((item: any) => {
              if (item.emissions > 0) {
                transportInputs.push({
                  mode: `A4: ${item.description || item.mode || 'Material Transport'}`,
                  distance: item.distanceKm || item.distance || 0,
                  weight: item.materialTonnes || item.weight || 0,
                  emissionFactor: item.emissions / Math.max((item.distanceKm || 1) * (item.materialTonnes || 1), 1),
                  totalEmissions: item.emissions / 1000 // Convert kgCO2e to tCO2e
                });
              }
            });
          }
          
          // Then process commute/other transport inputs
          Object.entries(parsedTransData).forEach(([mode, value]) => {
            // Skip the A4 transport items array and total
            if (mode === 'a4_transport_items' || mode === 'a4_total_emissions') return;
            
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
        
        // Fallback: Also load A4 transport from localStorage if database doesn't have it
        if (transportInputs.filter(t => t.mode.startsWith('A4:')).length === 0) {
          try {
            const localTransportData = localStorage.getItem('transportCalculatorItems');
            if (localTransportData) {
              const transportItems = JSON.parse(localTransportData);
              if (Array.isArray(transportItems)) {
                transportItems.forEach((item: any) => {
                  if (item.emissions > 0) {
                    transportInputs.push({
                      mode: `A4: ${item.description || item.mode || 'Material Transport'}`,
                      distance: item.distanceKm || item.distance || 0,
                      weight: item.materialTonnes || item.weight || 0,
                      emissionFactor: item.emissions / Math.max((item.distanceKm || 1) * (item.materialTonnes || 1), 1),
                      totalEmissions: item.emissions / 1000 // Convert kgCO2e to tCO2e
                    });
                  }
                });
              }
            }
          } catch (e) {
            // Silently fail if localStorage is unavailable
          }
        }

        // Transform totals - map database structure to interface
        const rawTotals = calcData.totals as any || {};
        const totals: UnifiedTotals = {
          scope1: rawTotals.scope1 || rawTotals.s1 || 0,
          scope2: rawTotals.scope2 || rawTotals.s2 || 0,
          scope3_materials: rawTotals.scope3_materials || rawTotals.s3_mat || 0,
          scope3_transport: rawTotals.scope3_transport || rawTotals.s3_trans || 0,
          total: rawTotals.total || 0,
          // EN 15978 Lifecycle stages (with defaults to 0 for backward compatibility)
          a1a3_product: rawTotals.a1a3_product || rawTotals.scope3_materials || 0,
          a4_transport: rawTotals.a4_transport || rawTotals.scope3_transport || 0,
          a5_construction: rawTotals.a5_construction || rawTotals.scope3_a5 || 0,
          // Use phase (B1-B7)
          b1_use: rawTotals.b1_use || 0,
          b2_maintenance: rawTotals.b2_maintenance || 0,
          b3_repair: rawTotals.b3_repair || 0,
          b4_replacement: rawTotals.b4_replacement || 0,
          b5_refurbishment: rawTotals.b5_refurbishment || 0,
          b6_operational_energy: rawTotals.b6_operational_energy || 0,
          b7_operational_water: rawTotals.b7_operational_water || 0,
          // End of life (C1-C4)
          c1_deconstruction: rawTotals.c1_deconstruction || 0,
          c2_transport: rawTotals.c2_transport || 0,
          c3_waste_processing: rawTotals.c3_waste_processing || 0,
          c4_disposal: rawTotals.c4_disposal || 0,
          // Module D
          d_recycling: rawTotals.d_recycling || 0,
          d_reuse: rawTotals.d_reuse || 0,
          d_energy_recovery: rawTotals.d_energy_recovery || 0,
          // Aggregates
          total_upfront: rawTotals.total_upfront || 0,
          total_embodied: rawTotals.total_embodied || 0,
          total_operational: rawTotals.total_operational || 0,
          total_whole_life: rawTotals.total_whole_life || 0,
          total_with_benefits: rawTotals.total_with_benefits || 0,
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
