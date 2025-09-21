import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from '@/hooks/use-toast';

interface EmissionEntry {
  category: string;
  subcategory?: string;
  fuel_type?: string;
  quantity: number;
  unit: string;
  emission_factor?: number;
  emissions_tco2e: number;
  notes?: string;
  data_quality?: string;
  calculation_method?: string;
}

export const useEmissionCalculations = () => {
  const [loading, setLoading] = useState(false);
  const { currentProject } = useProject();

  const getEmissionFactor = useCallback(async (category: string, subcategory?: string, fuel_type?: string, unit?: string) => {
    try {
      let query = supabase
        .from('emission_factors')
        .select('factor_value')
        .eq('category', category)
        .eq('unit', unit || 'kg');

      if (subcategory) {
        query = query.eq('subcategory', subcategory);
      }
      
      if (fuel_type) {
        query = query.eq('fuel_type', fuel_type);
      }

      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error('Error fetching emission factor:', error);
        return null;
      }
      
      return data?.factor_value || null;
    } catch (error) {
      console.error('Error in getEmissionFactor:', error);
      return null;
    }
  }, []);

  const calculateScope1Emissions = useCallback(async (formData: any) => {
    if (!currentProject) {
      toast({
        title: "No project selected",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const emissions: EmissionEntry[] = [];

      // Process fuel combustion
      for (const fuel of formData.fuelCombustion || []) {
        if (fuel.quantity > 0) {
          const factor = await getEmissionFactor('fuel_combustion', fuel.fuelType, fuel.fuelType, fuel.unit);
          const calculatedEmissions = fuel.quantity * (factor || 2.31); // Default factor for diesel
          
          emissions.push({
            category: 'fuel_combustion',
            subcategory: fuel.fuelType,
            fuel_type: fuel.fuelType,
            quantity: fuel.quantity,
            unit: fuel.unit,
            emission_factor: factor || 2.31,
            emissions_tco2e: calculatedEmissions,
            notes: fuel.notes,
            data_quality: 'estimated',
            calculation_method: 'activity_data_x_emission_factor'
          });
        }
      }

      // Process vehicles
      for (const vehicle of formData.vehicles || []) {
        if (vehicle.quantity > 0) {
          const factor = await getEmissionFactor('company_vehicles', vehicle.vehicleType, vehicle.fuelType, vehicle.unit);
          const calculatedEmissions = vehicle.quantity * (factor || 0.2); // Default factor
          
          emissions.push({
            category: 'company_vehicles',
            subcategory: vehicle.vehicleType,
            fuel_type: vehicle.fuelType,
            quantity: vehicle.quantity,
            unit: vehicle.unit,
            emission_factor: factor || 0.2,
            emissions_tco2e: calculatedEmissions,
            notes: vehicle.notes,
            data_quality: 'estimated',
            calculation_method: 'activity_data_x_emission_factor'
          });
        }
      }

      // Process industrial processes
      for (const process of formData.processes || []) {
        if (process.quantity > 0) {
          const factor = await getEmissionFactor('industrial_processes', process.processType, undefined, process.unit);
          const calculatedEmissions = process.quantity * (factor || 1.0); // Default factor
          
          emissions.push({
            category: 'industrial_processes',
            subcategory: process.processType,
            quantity: process.quantity,
            unit: process.unit,
            emission_factor: factor || 1.0,
            emissions_tco2e: calculatedEmissions,
            notes: process.notes,
            data_quality: 'estimated',
            calculation_method: 'activity_data_x_emission_factor'
          });
        }
      }

      // Process fugitive emissions
      for (const fugitive of formData.fugitiveEmissions || []) {
        if (fugitive.quantity > 0) {
          const factor = await getEmissionFactor('fugitive_emissions', fugitive.refrigerantType, fugitive.refrigerantType, fugitive.unit);
          const calculatedEmissions = fugitive.quantity * (factor || 1810); // Default GWP for R134a
          
          emissions.push({
            category: 'fugitive_emissions',
            subcategory: fugitive.refrigerantType,
            quantity: fugitive.quantity,
            unit: fugitive.unit,
            emission_factor: factor || 1810,
            emissions_tco2e: calculatedEmissions,
            notes: fugitive.notes,
            data_quality: 'estimated',
            calculation_method: 'activity_data_x_emission_factor'
          });
        }
      }

      // Save to database
      if (emissions.length > 0) {
        const { error } = await supabase
          .from('scope1_emissions')
          .upsert(
            emissions.map(emission => ({
              ...emission,
              project_id: currentProject.id
            })),
            { onConflict: 'project_id,category,subcategory,fuel_type' }
          );

        if (error) throw error;

        const totalEmissions = emissions.reduce((sum, emission) => sum + emission.emissions_tco2e, 0);
        
        toast({
          title: "Scope 1 emissions calculated",
          description: `Total: ${totalEmissions.toFixed(2)} tCO₂e`,
        });

        return { emissions, total: totalEmissions };
      }

      return { emissions: [], total: 0 };
    } catch (error) {
      console.error('Error calculating Scope 1 emissions:', error);
      toast({
        title: "Calculation failed",
        description: "Failed to calculate emissions. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentProject, getEmissionFactor]);

  const calculateScope2Emissions = useCallback(async (formData: any) => {
    if (!currentProject) {
      toast({
        title: "No project selected",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const emissions = [];

      // Process electricity
      for (const electricity of formData.electricity || []) {
        if (electricity.quantity > 0) {
          // Australian grid emission factors (kg CO2-e/kWh)
          const stateFactors: { [key: string]: number } = {
            'NSW': 0.79,
            'VIC': 1.02,
            'QLD': 0.81,
            'SA': 0.55,
            'WA': 0.70,
            'TAS': 0.17,
            'NT': 0.58,
            'ACT': 0.79
          };
          
          const factor = stateFactors[electricity.state] || 0.79;
          const calculatedEmissions = electricity.quantity * factor * (1 - (electricity.renewablePercentage || 0) / 100);
          
          emissions.push({
            energy_type: 'electricity',
            state_region: electricity.state,
            quantity: electricity.quantity,
            unit: electricity.unit,
            emission_factor: factor,
            renewable_percentage: electricity.renewablePercentage || 0,
            emissions_tco2e: calculatedEmissions,
            notes: electricity.notes,
            data_quality: 'measured',
            calculation_method: 'location_based'
          });
        }
      }

      // Process heating/cooling
      for (const heating of formData.heating || []) {
        if (heating.quantity > 0) {
          const factor = 0.185; // Default gas heating factor
          const calculatedEmissions = heating.quantity * factor;
          
          emissions.push({
            energy_type: 'heating_cooling',
            quantity: heating.quantity,
            unit: heating.unit,
            emission_factor: factor,
            emissions_tco2e: calculatedEmissions,
            notes: heating.notes,
            data_quality: 'estimated',
            calculation_method: 'activity_data_x_emission_factor'
          });
        }
      }

      // Process purchased steam
      for (const steam of formData.steam || []) {
        if (steam.quantity > 0) {
          const factor = 0.3; // Default steam factor
          const calculatedEmissions = steam.quantity * factor;
          
          emissions.push({
            energy_type: 'purchased_steam',
            quantity: steam.quantity,
            unit: steam.unit,
            emission_factor: factor,
            emissions_tco2e: calculatedEmissions,
            notes: steam.notes,
            data_quality: 'estimated',
            calculation_method: 'activity_data_x_emission_factor'
          });
        }
      }

      // Save to database
      if (emissions.length > 0) {
        const { error } = await supabase
          .from('scope2_emissions')
          .upsert(
            emissions.map(emission => ({
              ...emission,
              project_id: currentProject.id
            })),
            { onConflict: 'project_id,energy_type,state_region' }
          );

        if (error) throw error;

        const totalEmissions = emissions.reduce((sum, emission) => sum + emission.emissions_tco2e, 0);
        
        toast({
          title: "Scope 2 emissions calculated",
          description: `Total: ${totalEmissions.toFixed(2)} tCO₂e`,
        });

        return { emissions, total: totalEmissions };
      }

      return { emissions: [], total: 0 };
    } catch (error) {
      console.error('Error calculating Scope 2 emissions:', error);
      toast({
        title: "Calculation failed",
        description: "Failed to calculate emissions. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  const calculateScope3Emissions = useCallback(async (formData: any) => {
    if (!currentProject) {
      toast({
        title: "No project selected",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    try {
      const emissions = [];

      // Process upstream activities
      for (const activity of formData.upstreamActivities || []) {
        if (activity.quantity > 0) {
          const factor = activity.emissionFactor || 1.0; // Use provided or default factor
          const calculatedEmissions = activity.quantity * factor;
          
          emissions.push({
            category: activity.category,
            category_name: activity.categoryName,
            subcategory: activity.subcategory,
            activity_description: activity.description,
            lca_stage: activity.lcaStage,
            quantity: activity.quantity,
            unit: activity.unit,
            emission_factor: factor,
            emissions_tco2e: calculatedEmissions,
            supplier_data: activity.supplierData || false,
            notes: activity.notes,
            data_quality: activity.supplierData ? 'supplier_specific' : 'estimated',
            calculation_method: 'activity_data_x_emission_factor'
          });
        }
      }

      // Process downstream activities
      for (const activity of formData.downstreamActivities || []) {
        if (activity.quantity > 0) {
          const factor = activity.emissionFactor || 1.0;
          const calculatedEmissions = activity.quantity * factor;
          
          emissions.push({
            category: activity.category,
            category_name: activity.categoryName,
            subcategory: activity.subcategory,
            activity_description: activity.description,
            lca_stage: activity.lcaStage,
            quantity: activity.quantity,
            unit: activity.unit,
            emission_factor: factor,
            emissions_tco2e: calculatedEmissions,
            supplier_data: activity.supplierData || false,
            notes: activity.notes,
            data_quality: activity.supplierData ? 'supplier_specific' : 'estimated',
            calculation_method: 'activity_data_x_emission_factor'
          });
        }
      }

      // Save to database
      if (emissions.length > 0) {
        const { error } = await supabase
          .from('scope3_emissions')
          .upsert(
            emissions.map(emission => ({
              ...emission,
              project_id: currentProject.id
            })),
            { onConflict: 'project_id,category,subcategory,activity_description' }
          );

        if (error) throw error;

        const totalEmissions = emissions.reduce((sum, emission) => sum + emission.emissions_tco2e, 0);
        
        toast({
          title: "Scope 3 emissions calculated",
          description: `Total: ${totalEmissions.toFixed(2)} tCO₂e`,
        });

        return { emissions, total: totalEmissions };
      }

      return { emissions: [], total: 0 };
    } catch (error) {
      console.error('Error calculating Scope 3 emissions:', error);
      toast({
        title: "Calculation failed",
        description: "Failed to calculate emissions. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  return {
    loading,
    calculateScope1Emissions,
    calculateScope2Emissions,
    calculateScope3Emissions,
  };
};