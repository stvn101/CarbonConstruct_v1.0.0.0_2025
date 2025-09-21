import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';

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

      // Fetch Scope 1 totals and details
      const { data: scope1Data } = await supabase
        .from('scope1_emissions')
        .select('category, emissions_tco2e')
        .eq('project_id', currentProject.id);

      // Fetch Scope 2 totals and details
      const { data: scope2Data } = await supabase
        .from('scope2_emissions')
        .select('energy_type, emissions_tco2e')
        .eq('project_id', currentProject.id);

      // Fetch Scope 3 totals and details
      const { data: scope3Data } = await supabase
        .from('scope3_emissions')
        .select('category_name, emissions_tco2e')
        .eq('project_id', currentProject.id);

      // Calculate totals
      const scope1Total = scope1Data?.reduce((sum, item) => sum + (item.emissions_tco2e || 0), 0) || 0;
      const scope2Total = scope2Data?.reduce((sum, item) => sum + (item.emissions_tco2e || 0), 0) || 0;
      const scope3Total = scope3Data?.reduce((sum, item) => sum + (item.emissions_tco2e || 0), 0) || 0;
      const total = scope1Total + scope2Total + scope3Total;

      setTotals({
        scope1: scope1Total,
        scope2: scope2Total,
        scope3: scope3Total,
        total
      });

      // Calculate category breakdowns
      const scope1Categories = scope1Data?.reduce((acc, item) => {
        const existing = acc.find(cat => cat.category === item.category);
        if (existing) {
          existing.emissions += item.emissions_tco2e || 0;
        } else {
          acc.push({ category: item.category, emissions: item.emissions_tco2e || 0, percentage: 0 });
        }
        return acc;
      }, [] as EmissionDetails[]) || [];

      const scope2Categories = scope2Data?.reduce((acc, item) => {
        const existing = acc.find(cat => cat.category === item.energy_type);
        if (existing) {
          existing.emissions += item.emissions_tco2e || 0;
        } else {
          acc.push({ category: item.energy_type, emissions: item.emissions_tco2e || 0, percentage: 0 });
        }
        return acc;
      }, [] as EmissionDetails[]) || [];

      const scope3Categories = scope3Data?.reduce((acc, item) => {
        const existing = acc.find(cat => cat.category === item.category_name);
        if (existing) {
          existing.emissions += item.emissions_tco2e || 0;
        } else {
          acc.push({ category: item.category_name, emissions: item.emissions_tco2e || 0, percentage: 0 });
        }
        return acc;
      }, [] as EmissionDetails[]) || [];

      // Calculate percentages
      scope1Categories.forEach(cat => cat.percentage = scope1Total > 0 ? (cat.emissions / scope1Total) * 100 : 0);
      scope2Categories.forEach(cat => cat.percentage = scope2Total > 0 ? (cat.emissions / scope2Total) * 100 : 0);
      scope3Categories.forEach(cat => cat.percentage = scope3Total > 0 ? (cat.emissions / scope3Total) * 100 : 0);

      setScope1Details(scope1Categories);
      setScope2Details(scope2Categories);
      setScope3Details(scope3Categories);

    } catch (error) {
      console.error('Error fetching emission totals:', error);
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