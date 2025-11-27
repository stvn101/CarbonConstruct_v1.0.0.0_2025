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

interface EmissionDetails {
  category: string;
  emissions: number;
  percentage: number;
}

export const useEmissionTotals = () => {
  const [totals, setTotals] = useState<EmissionTotals>({
    scope1: 0,
    scope2: 0,
    scope3: 0,
    total: 0
  });
  const [scope1Details, setScope1Details] = useState<EmissionDetails[]>([]);
  const [scope2Details, setScope2Details] = useState<EmissionDetails[]>([]);
  const [scope3Details, setScope3Details] = useState<EmissionDetails[]>([]);
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

        setTotals({
          scope1: scope1Total,
          scope2: scope2Total,
          scope3: scope3Total,
          total
        });

        // Build Scope 1 details from fuel_inputs
        const scope1Categories: EmissionDetails[] = [];
        const fuelData = unifiedData.fuel_inputs;
        const parsedFuelData = typeof fuelData === 'string' ? JSON.parse(fuelData) : fuelData;
        
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
              const emissions = (qty * factor) / 1000;
              scope1Categories.push({
                category: fuelType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                emissions,
                percentage: scope1Total > 0 ? (emissions / scope1Total) * 100 : 0
              });
            }
          });
        }
        setScope1Details(scope1Categories);

        // Build Scope 2 details from electricity_inputs
        const scope2Categories: EmissionDetails[] = [];
        const elecData = unifiedData.electricity_inputs;
        const parsedElecData = typeof elecData === 'string' ? JSON.parse(elecData) : elecData;
        
        if (parsedElecData && typeof parsedElecData === 'object' && !Array.isArray(parsedElecData)) {
          Object.entries(parsedElecData).forEach(([key, quantity]) => {
            const qty = Number(quantity);
            if (!isNaN(qty) && qty > 0) {
              const emissions = (qty * 0.72) / 1000; // Australian grid factor
              scope2Categories.push({
                category: key === 'kwh' ? 'Grid Electricity' : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                emissions,
                percentage: scope2Total > 0 ? (emissions / scope2Total) * 100 : 0
              });
            }
          });
        }
        setScope2Details(scope2Categories);

        // Build Scope 3 details from materials and transport
        const scope3Categories: EmissionDetails[] = [];
        
        if (scope3Materials > 0) {
          scope3Categories.push({
            category: 'Embodied Carbon (A1-A3)',
            emissions: scope3Materials,
            percentage: scope3Total > 0 ? (scope3Materials / scope3Total) * 100 : 0
          });
        }
        
        if (scope3Transport > 0) {
          scope3Categories.push({
            category: 'Transport (A4)',
            emissions: scope3Transport,
            percentage: scope3Total > 0 ? (scope3Transport / scope3Total) * 100 : 0
          });
        }
        
        if (scope3A5 > 0) {
          scope3Categories.push({
            category: 'Construction (A5)',
            emissions: scope3A5,
            percentage: scope3Total > 0 ? (scope3A5 / scope3Total) * 100 : 0
          });
        }
        
        if (scope3Commute > 0) {
          scope3Categories.push({
            category: 'Employee Commute',
            emissions: scope3Commute,
            percentage: scope3Total > 0 ? (scope3Commute / scope3Total) * 100 : 0
          });
        }
        
        if (scope3Waste > 0) {
          scope3Categories.push({
            category: 'Construction Waste',
            emissions: scope3Waste,
            percentage: scope3Total > 0 ? (scope3Waste / scope3Total) * 100 : 0
          });
        }
        
        setScope3Details(scope3Categories);
      } else {
        // No unified data, reset to zeros
        setTotals({ scope1: 0, scope2: 0, scope3: 0, total: 0 });
        setScope1Details([]);
        setScope2Details([]);
        setScope3Details([]);
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
    scope1Details,
    scope2Details,
    scope3Details,
    loading,
    refetch: fetchEmissionTotals
  };
};
