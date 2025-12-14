import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { logger } from '@/lib/logger';

interface EmissionTotals {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

// EN 15978 Whole Life Carbon Totals
interface WholeLifeTotals {
  upfront: number; // A1-A5
  usePhase: number; // B1-B7
  endOfLife: number; // C1-C4
  moduleD: number; // D credits (negative)
  wholeLife: number; // A-C total
  withBenefits: number; // A-D total
}

interface EmissionDetails {
  category: string;
  emissions: number;
  percentage: number;
  [key: string]: string | number; // Index signature for chart compatibility
}

export const useEmissionTotals = () => {
  const [totals, setTotals] = useState<EmissionTotals>({
    scope1: 0,
    scope2: 0,
    scope3: 0,
    total: 0
  });
  const [wholeLifeTotals, setWholeLifeTotals] = useState<WholeLifeTotals>({
    upfront: 0,
    usePhase: 0,
    endOfLife: 0,
    moduleD: 0,
    wholeLife: 0,
    withBenefits: 0
  });
  const [scope1Details, setScope1Details] = useState<EmissionDetails[]>([]);
  const [scope2Details, setScope2Details] = useState<EmissionDetails[]>([]);
  const [scope3Details, setScope3Details] = useState<EmissionDetails[]>([]);
  const [lifecycleDetails, setLifecycleDetails] = useState<EmissionDetails[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { currentProject } = useProject();

  const fetchEmissionTotals = async () => {
    if (!currentProject?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch from unified_calculations table (primary source)
      const { data: unifiedData, error: unifiedError } = await supabase
        .from('unified_calculations')
        .select('*')
        .eq('project_id', currentProject.id)
        .eq('is_draft', false)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (unifiedError) throw unifiedError;

      if (unifiedData) {
        // Parse totals from unified_calculations
        const rawTotals = unifiedData.totals as any || {};
        const scope1Total = rawTotals.scope1 || 0;
        const scope2Total = rawTotals.scope2 || 0;
        const scope3Materials = rawTotals.scope3_materials || rawTotals.scope3_materials_gross || 0;
        const scope3Transport = rawTotals.scope3_transport || 0;
        const scope3A5 = rawTotals.scope3_a5 || 0;
        const scope3Commute = rawTotals.scope3_commute || 0;
        const scope3Waste = rawTotals.scope3_waste || 0;
        const scope3Total = scope3Materials + scope3Transport + scope3A5 + scope3Commute + scope3Waste;
        const total = rawTotals.total || (scope1Total + scope2Total + scope3Total);

        // Convert from kgCO2e to tCO2e (divide by 1000)
        setTotals({
          scope1: scope1Total / 1000,
          scope2: scope2Total / 1000,
          scope3: scope3Total / 1000,
          total: total / 1000
        });

        // Build Scope 1 details from fuel_inputs
        // Convert emissions to tCO2e for display
        const scope1Categories: EmissionDetails[] = [];
        const fuelData = unifiedData.fuel_inputs;
        const parsedFuelData = typeof fuelData === 'string' ? JSON.parse(fuelData) : fuelData;
        const scope1TotalTonnes = scope1Total / 1000;
        
        if (parsedFuelData && typeof parsedFuelData === 'object' && !Array.isArray(parsedFuelData)) {
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
              const factor = fuelFactors[fuelType] || 2.31;
              const emissions = (qty * factor) / 1000; // Convert to tCO2e
              scope1Categories.push({
                category: fuelType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                emissions,
                percentage: scope1TotalTonnes > 0 ? (emissions / scope1TotalTonnes) * 100 : 0
              });
            }
          });
        }
        setScope1Details(scope1Categories);

        // Build Scope 2 details from electricity_inputs
        // Convert emissions to tCO2e for display
        const scope2Categories: EmissionDetails[] = [];
        const elecData = unifiedData.electricity_inputs;
        const parsedElecData = typeof elecData === 'string' ? JSON.parse(elecData) : elecData;
        const scope2TotalTonnes = scope2Total / 1000;
        
        if (parsedElecData && typeof parsedElecData === 'object' && !Array.isArray(parsedElecData)) {
          Object.entries(parsedElecData).forEach(([key, quantity]) => {
            const qty = Number(quantity);
            if (!isNaN(qty) && qty > 0) {
              const emissions = (qty * 0.72) / 1000; // Australian grid factor, convert to tCO2e
              scope2Categories.push({
                category: key === 'kwh' ? 'Grid Electricity' : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                emissions,
                percentage: scope2TotalTonnes > 0 ? (emissions / scope2TotalTonnes) * 100 : 0
              });
            }
          });
        }
        setScope2Details(scope2Categories);

        // Build Scope 3 details from materials and transport
        // Convert from kgCO2e to tCO2e for display
        const scope3Categories: EmissionDetails[] = [];
        
        if (scope3Materials > 0) {
          scope3Categories.push({
            category: 'Embodied Carbon (A1-A3)',
            emissions: scope3Materials / 1000,
            percentage: scope3Total > 0 ? (scope3Materials / scope3Total) * 100 : 0
          });
        }
        
        if (scope3Transport > 0) {
          scope3Categories.push({
            category: 'Transport (A4)',
            emissions: scope3Transport / 1000,
            percentage: scope3Total > 0 ? (scope3Transport / scope3Total) * 100 : 0
          });
        }
        
        if (scope3A5 > 0) {
          scope3Categories.push({
            category: 'Construction (A5)',
            emissions: scope3A5 / 1000,
            percentage: scope3Total > 0 ? (scope3A5 / scope3Total) * 100 : 0
          });
        }
        
        if (scope3Commute > 0) {
          scope3Categories.push({
            category: 'Employee Commute',
            emissions: scope3Commute / 1000,
            percentage: scope3Total > 0 ? (scope3Commute / scope3Total) * 100 : 0
          });
        }
        
        if (scope3Waste > 0) {
          scope3Categories.push({
            category: 'Construction Waste',
            emissions: scope3Waste / 1000,
            percentage: scope3Total > 0 ? (scope3Waste / scope3Total) * 100 : 0
          });
        }
        
        setScope3Details(scope3Categories);

        // Parse EN 15978 whole life carbon data
        const b1 = rawTotals.b1_use || 0;
        const b2 = rawTotals.b2_maintenance || 0;
        const b3 = rawTotals.b3_repair || 0;
        const b4 = rawTotals.b4_replacement || 0;
        const b5 = rawTotals.b5_refurbishment || 0;
        const b6 = rawTotals.b6_operational_energy || 0;
        const b7 = rawTotals.b7_operational_water || 0;
        const c1 = rawTotals.c1_deconstruction || 0;
        const c2 = rawTotals.c2_transport || 0;
        const c3 = rawTotals.c3_waste_processing || 0;
        const c4 = rawTotals.c4_disposal || 0;
        const dRecycling = rawTotals.d_recycling || 0;
        const dReuse = rawTotals.d_reuse || 0;
        const dEnergy = rawTotals.d_energy_recovery || 0;

        const upfront = (rawTotals.total_upfront || total) / 1000;
        const usePhase = (b1 + b2 + b3 + b4 + b5 + b6 + b7) / 1000;
        const endOfLife = (c1 + c2 + c3 + c4) / 1000;
        const moduleD = (dRecycling + dReuse + dEnergy) / 1000;
        const wholeLife = upfront + usePhase + endOfLife;
        const withBenefits = wholeLife - moduleD;

        setWholeLifeTotals({
          upfront,
          usePhase,
          endOfLife,
          moduleD,
          wholeLife,
          withBenefits
        });

        // Build lifecycle details for dashboard
        const lcDetails: EmissionDetails[] = [];
        if (upfront > 0) {
          lcDetails.push({ category: 'Upfront (A1-A5)', emissions: upfront, percentage: wholeLife > 0 ? (upfront / wholeLife) * 100 : 0 });
        }
        if (usePhase > 0) {
          lcDetails.push({ category: 'Use Phase (B1-B7)', emissions: usePhase, percentage: wholeLife > 0 ? (usePhase / wholeLife) * 100 : 0 });
        }
        if (endOfLife > 0) {
          lcDetails.push({ category: 'End of Life (C1-C4)', emissions: endOfLife, percentage: wholeLife > 0 ? (endOfLife / wholeLife) * 100 : 0 });
        }
        if (moduleD > 0) {
          lcDetails.push({ category: 'Module D Credits', emissions: -moduleD, percentage: 0 });
        }
        setLifecycleDetails(lcDetails);

      } else {
        // No unified data, reset to zeros
        setTotals({ scope1: 0, scope2: 0, scope3: 0, total: 0 });
        setWholeLifeTotals({ upfront: 0, usePhase: 0, endOfLife: 0, moduleD: 0, wholeLife: 0, withBenefits: 0 });
        setScope1Details([]);
        setScope2Details([]);
        setScope3Details([]);
        setLifecycleDetails([]);
      }

    } catch (error) {
      logger.error('EmissionTotals:fetchEmissionTotals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmissionTotals();
  }, [currentProject?.id]);

  return {
    totals,
    wholeLifeTotals,
    scope1Details,
    scope2Details,
    scope3Details,
    lifecycleDetails,
    loading,
    refetch: fetchEmissionTotals
  };
};
