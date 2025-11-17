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

export const useEmissionCalculations = (onDataChange?: () => void) => {
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
        console.log("Saving emissions to database:", emissions);
        
        // First, delete existing emissions for this project to avoid duplicates
        const { error: deleteError } = await supabase
          .from('scope1_emissions')
          .delete()
          .eq('project_id', currentProject.id);

        if (deleteError) {
          console.error('Error deleting old emissions:', deleteError);
        }

        // Insert new emissions
        const { data: savedData, error } = await supabase
          .from('scope1_emissions')
          .insert(
            emissions.map(emission => ({
              ...emission,
              project_id: currentProject.id
            }))
          )
          .select();

        if (error) {
          console.error('Database save error:', error);
          throw error;
        }

        console.log("Successfully saved emissions:", savedData);

        const totalEmissions = emissions.reduce((sum, emission) => sum + emission.emissions_tco2e, 0);
        
        toast({
          title: "Scope 1 emissions calculated",
          description: `Total: ${totalEmissions.toFixed(2)} tCO₂e`,
        });

        // Trigger data refresh if callback provided
        if (onDataChange) {
          setTimeout(() => onDataChange(), 500);
        }

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
    console.log("=== Starting Scope 2 Calculation ===");
    console.log("Project:", currentProject.name, currentProject.id);
    console.log("Input data:", JSON.stringify(formData, null, 2));
    
    try {
      const emissions = [];

      // Process electricity with detailed logging
      console.log("Processing electricity entries:", formData.electricity?.length || 0);
      for (const electricity of formData.electricity || []) {
        console.log("Electricity entry:", electricity);
        
        if (!electricity.quantity || electricity.quantity <= 0) {
          console.log("Skipping - quantity is 0 or undefined");
          continue;
        }

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
        
        const stateFactor = stateFactors[electricity.state?.toUpperCase()] || 0.79;
        console.log(`Using emission factor ${stateFactor} for state ${electricity.state}`);
        
        // Convert quantity to kWh based on unit
        let quantityInKwh = electricity.quantity;
        if (electricity.unit === 'MWh') {
          quantityInKwh = electricity.quantity * 1000;
        } else if (electricity.unit === 'GJ') {
          quantityInKwh = electricity.quantity * 277.778;
        }
        console.log(`Converted ${electricity.quantity} ${electricity.unit} to ${quantityInKwh} kWh`);
        
        // Calculate emissions: kWh * kg/kWh = kg, then /1000 for tonnes
        const renewablePercent = electricity.renewablePercentage || 0;
        const emissionsKg = quantityInKwh * stateFactor * (1 - renewablePercent / 100);
        const emissionsTonnes = emissionsKg / 1000;
        
        console.log(`Calculation: ${quantityInKwh} kWh × ${stateFactor} kg/kWh × ${(1 - renewablePercent/100)} = ${emissionsTonnes.toFixed(4)} tCO₂e`);
        
        emissions.push({
          energy_type: 'electricity',
          state_region: electricity.state?.toUpperCase() || null,
          quantity: electricity.quantity,
          unit: electricity.unit,
          emission_factor: stateFactor,
          renewable_percentage: renewablePercent,
          emissions_tco2e: emissionsTonnes,
          notes: electricity.notes || null,
          data_quality: 'measured',
          calculation_method: 'location_based'
        });
      }

      // Process heating/cooling
      console.log("Processing heating/cooling entries:", formData.heating?.length || 0);
      for (const heating of formData.heating || []) {
        console.log("Heating entry:", heating);
        
        if (!heating.quantity || heating.quantity <= 0) {
          console.log("Skipping - quantity is 0 or undefined");
          continue;
        }

        // Natural gas emission factor: 0.185 kg CO2-e/kWh
        const factor = 0.185;
        
        // Convert to kWh based on unit
        let quantityInKwh = heating.quantity;
        if (heating.unit === 'MWh') {
          quantityInKwh = heating.quantity * 1000;
        } else if (heating.unit === 'GJ') {
          quantityInKwh = heating.quantity * 277.778;
        } else if (heating.unit === 'm3') {
          quantityInKwh = heating.quantity * 10.55;
        }
        console.log(`Converted ${heating.quantity} ${heating.unit} to ${quantityInKwh} kWh`);
        
        // Calculate emissions: kWh * kg/kWh = kg, then /1000 for tonnes
        const emissionsKg = quantityInKwh * factor;
        const emissionsTonnes = emissionsKg / 1000;
        
        console.log(`Calculation: ${quantityInKwh} kWh × ${factor} kg/kWh = ${emissionsTonnes.toFixed(4)} tCO₂e`);
        
        emissions.push({
          energy_type: 'heating_cooling',
          state_region: heating.state?.toUpperCase() || null,
          quantity: heating.quantity,
          unit: heating.unit,
          emission_factor: factor,
          emissions_tco2e: emissionsTonnes,
          notes: heating.notes || null,
          data_quality: 'estimated',
          calculation_method: 'activity_data_x_emission_factor'
        });
      }

      // Process purchased steam
      console.log("Processing steam entries:", formData.steam?.length || 0);
      for (const steam of formData.steam || []) {
        console.log("Steam entry:", steam);
        
        if (!steam.quantity || steam.quantity <= 0) {
          console.log("Skipping - quantity is 0 or undefined");
          continue;
        }

        // Steam emission factor: 0.3 tCO₂e/GJ (already in tonnes per GJ)
        const factorPerGJ = 0.3;
        
        // Convert to GJ based on unit
        let quantityInGJ = steam.quantity;
        if (steam.unit === 'MMBtu') {
          quantityInGJ = steam.quantity * 1.055;
        } else if (steam.unit === 'tonnes') {
          quantityInGJ = steam.quantity * 2.5;
        } else if (steam.unit === 'klb') {
          quantityInGJ = steam.quantity * 1.134;
        }
        console.log(`Converted ${steam.quantity} ${steam.unit} to ${quantityInGJ} GJ`);
        
        // Calculate emissions: GJ * tCO₂e/GJ = tCO₂e (already in tonnes)
        const emissionsTonnes = quantityInGJ * factorPerGJ;
        
        console.log(`Calculation: ${quantityInGJ} GJ × ${factorPerGJ} tCO₂e/GJ = ${emissionsTonnes.toFixed(4)} tCO₂e`);
        
        emissions.push({
          energy_type: 'purchased_steam',
          state_region: steam.state?.toUpperCase() || null,
          quantity: steam.quantity,
          unit: steam.unit,
          emission_factor: factorPerGJ,
          emissions_tco2e: emissionsTonnes,
          notes: steam.notes || null,
          data_quality: 'estimated',
          calculation_method: 'activity_data_x_emission_factor'
        });
      }

      console.log(`=== Total emissions calculated: ${emissions.length} entries ===`);

      // Save to database if we have emissions
      if (emissions.length > 0) {
        const totalEmissions = emissions.reduce((sum, e) => sum + e.emissions_tco2e, 0);
        console.log(`Total: ${totalEmissions.toFixed(4)} tCO₂e`);
        console.log("Saving to database...");
        
        // Delete existing Scope 2 entries for clean state
        const { error: deleteError } = await supabase
          .from('scope2_emissions')
          .delete()
          .eq('project_id', currentProject.id);
          
        if (deleteError) {
          console.error("Error deleting existing entries:", deleteError);
          throw new Error(`Database delete failed: ${deleteError.message}`);
        }
        console.log("✓ Previous entries deleted");

        // Insert new emissions
        const emissionsToInsert = emissions.map(e => ({
          ...e,
          project_id: currentProject.id
        }));
        
        console.log("Inserting emissions:", emissionsToInsert);
        
        const { data: insertedData, error: insertError } = await supabase
          .from('scope2_emissions')
          .insert(emissionsToInsert)
          .select();

        if (insertError) {
          console.error("Error inserting emissions:", insertError);
          throw new Error(`Database insert failed: ${insertError.message}`);
        }
        
        console.log("✓ Emissions saved successfully:", insertedData?.length, "rows");
        
        toast({
          title: "Success",
          description: `Scope 2 emissions saved: ${totalEmissions.toFixed(2)} tCO₂e`,
        });

        // Trigger data refresh
        if (onDataChange) {
          setTimeout(() => onDataChange(), 500);
        }

        return { emissions, total: totalEmissions };
      }

      console.log("No emissions to save (all quantities were 0)");
      return { emissions: [], total: 0 };
      
    } catch (error) {
      console.error('=== Scope 2 Calculation Error ===');
      console.error(error);
      toast({
        title: "Calculation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentProject, onDataChange]);

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
        if (activity.quantity > 0 && activity.emissionFactor > 0) {
          const factor = activity.emissionFactor;
          const calculatedEmissions = activity.quantity * factor;
          
          emissions.push({
            category: activity.category,
            category_name: activity.categoryName || '',
            subcategory: activity.subcategory || '',
            activity_description: activity.description || 'No description',
            lca_stage: activity.lcaStage || '',
            quantity: activity.quantity,
            unit: activity.unit,
            emission_factor: factor,
            emissions_tco2e: calculatedEmissions,
            supplier_data: activity.supplierData || false,
            notes: activity.notes || '',
            data_quality: activity.supplierData ? 'supplier_specific' : 'estimated',
            calculation_method: 'activity_data_x_emission_factor'
          });
        }
      }

      // Process downstream activities
      for (const activity of formData.downstreamActivities || []) {
        if (activity.quantity > 0 && activity.emissionFactor > 0) {
          const factor = activity.emissionFactor;
          const calculatedEmissions = activity.quantity * factor;
          
          emissions.push({
            category: activity.category,
            category_name: activity.categoryName || '',
            subcategory: activity.subcategory || '',
            activity_description: activity.description || 'No description',
            lca_stage: activity.lcaStage || '',
            quantity: activity.quantity,
            unit: activity.unit,
            emission_factor: factor,
            emissions_tco2e: calculatedEmissions,
            supplier_data: activity.supplierData || false,
            notes: activity.notes || '',
            data_quality: activity.supplierData ? 'supplier_specific' : 'estimated',
            calculation_method: 'activity_data_x_emission_factor'
          });
        }
      }

      // Save to database
      if (emissions.length > 0) {
        // Delete existing Scope 3 entries for clean state
        const { error: deleteError } = await supabase
          .from('scope3_emissions')
          .delete()
          .eq('project_id', currentProject.id);
          
        if (deleteError) {
          console.error("Error deleting existing entries:", deleteError);
          throw new Error(`Database delete failed: ${deleteError.message}`);
        }

        // Insert new emissions
        const { error: insertError } = await supabase
          .from('scope3_emissions')
          .insert(
            emissions.map(emission => ({
              ...emission,
              project_id: currentProject.id
            }))
          );

        if (insertError) {
          console.error("Error inserting emissions:", insertError);
          throw new Error(`Database insert failed: ${insertError.message}`);
        }

        const totalEmissions = emissions.reduce((sum, emission) => sum + emission.emissions_tco2e, 0);
        
        toast({
          title: "Success",
          description: `Scope 3 emissions saved: ${totalEmissions.toFixed(2)} tCO₂e`,
        });

        // Trigger data refresh
        if (onDataChange) {
          setTimeout(() => onDataChange(), 500);
        }

        return { emissions, total: totalEmissions };
      }

      toast({
        title: "No valid emissions data",
        description: "Please ensure quantity and emission factors are greater than 0.",
        variant: "destructive",
      });
      return null;
    } catch (error: any) {
      console.error('Error calculating Scope 3 emissions:', error);
      toast({
        title: "Calculation failed",
        description: error?.message || "Failed to calculate emissions. Please try again.",
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