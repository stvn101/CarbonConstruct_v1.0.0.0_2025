import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

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

// Scope 1 Form Data Interfaces
interface FuelCombustionEntry {
  fuelType: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface VehicleEntry {
  vehicleType: string;
  fuelType: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface ProcessEntry {
  processType: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface FugitiveEmissionEntry {
  refrigerantType: string;
  quantity: number;
  unit: string;
  notes?: string;
}

interface Scope1FormData {
  fuelCombustion?: FuelCombustionEntry[];
  vehicles?: VehicleEntry[];
  processes?: ProcessEntry[];
  fugitiveEmissions?: FugitiveEmissionEntry[];
}

// Scope 2 Form Data Interfaces
interface ElectricityEntry {
  quantity: number;
  unit: string;
  state?: string;
  renewablePercentage?: number;
  notes?: string;
}

interface HeatingEntry {
  quantity: number;
  unit: string;
  state?: string;
  notes?: string;
}

interface SteamEntry {
  quantity: number;
  unit: string;
  state?: string;
  notes?: string;
}

interface Scope2FormData {
  electricity?: ElectricityEntry[];
  heating?: HeatingEntry[];
  steam?: SteamEntry[];
}

// Scope 3 Form Data Interfaces
interface ActivityEntry {
  category: number;
  categoryName?: string;
  subcategory?: string;
  description?: string;
  lcaStage?: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  supplierData?: boolean;
  notes?: string;
}

interface Scope3FormData {
  upstreamActivities?: ActivityEntry[];
  downstreamActivities?: ActivityEntry[];
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
        logger.error('EmissionCalculations:getEmissionFactor', error);
        return null;
      }
      
      return data?.factor_value || null;
    } catch (error) {
      logger.error('EmissionCalculations:getEmissionFactor', error);
      return null;
    }
  }, []);

  const calculateScope1Emissions = useCallback(async (formData: Scope1FormData) => {
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
        // First, delete existing emissions for this project to avoid duplicates
        const { error: deleteError } = await supabase
          .from('scope1_emissions')
          .delete()
          .eq('project_id', currentProject.id);

        if (deleteError) {
          logger.error('EmissionCalculations:deleteScope1', deleteError);
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
          logger.error('EmissionCalculations:saveScope1', error);
          throw error;
        }

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
      logger.error('EmissionCalculations:calculateScope1', error);
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

  const calculateScope2Emissions = useCallback(async (formData: Scope2FormData) => {
    if (!currentProject) {
      toast({
        title: "No project selected",
        description: "Please select a project first.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    logger.debug('EmissionCalculations:calculateScope2', 'Starting Scope 2 Calculation', {
      projectName: currentProject.name,
      projectId: currentProject.id,
      formData
    });
    
    try {
      const emissions: Array<{
        energy_type: string;
        state_region: string | null;
        quantity: number;
        unit: string;
        emission_factor: number;
        renewable_percentage?: number;
        emissions_tco2e: number;
        notes: string | null;
        data_quality: string;
        calculation_method: string;
      }> = [];

      // Process electricity with detailed logging
      logger.debug('EmissionCalculations:calculateScope2', 'Processing electricity entries', {
        count: formData.electricity?.length || 0
      });
      for (const electricity of formData.electricity || []) {
        logger.debug('EmissionCalculations:calculateScope2', 'Processing electricity entry', { electricity });

        if (!electricity.quantity || electricity.quantity <= 0) {
          logger.debug('EmissionCalculations:calculateScope2', 'Skipping electricity - quantity is 0');
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
        
        const stateFactor = stateFactors[electricity.state?.toUpperCase() || ''] || 0.79;
        logger.debug('EmissionCalculations:calculateScope2', 'Using emission factor', {
          factor: stateFactor,
          state: electricity.state
        });
        
        // Convert quantity to kWh based on unit
        let quantityInKwh = electricity.quantity;
        if (electricity.unit === 'MWh') {
          quantityInKwh = electricity.quantity * 1000;
        } else if (electricity.unit === 'GJ') {
          quantityInKwh = electricity.quantity * 277.778;
        }
        logger.debug('EmissionCalculations:calculateScope2', 'Converted to kWh', {
          original: electricity.quantity,
          unit: electricity.unit,
          converted: quantityInKwh
        });
        
        // Calculate emissions: kWh * kg/kWh = kg, then /1000 for tonnes
        const renewablePercent = electricity.renewablePercentage || 0;
        const emissionsKg = quantityInKwh * stateFactor * (1 - renewablePercent / 100);
        const emissionsTonnes = emissionsKg / 1000;

        logger.debug('EmissionCalculations:calculateScope2', 'Calculated emissions', {
          quantityInKwh,
          stateFactor,
          renewablePercent,
          emissionsTonnes
        });
        
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
      logger.debug('EmissionCalculations:calculateScope2', 'Processing heating/cooling entries', {
        count: formData.heating?.length || 0
      });
      for (const heating of formData.heating || []) {
        logger.debug('EmissionCalculations:calculateScope2', 'Processing heating entry', { heating });

        if (!heating.quantity || heating.quantity <= 0) {
          logger.debug('EmissionCalculations:calculateScope2', 'Skipping heating - quantity is 0');
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
        logger.debug('EmissionCalculations:calculateScope2', 'Converted heating to kWh', {
          original: heating.quantity,
          unit: heating.unit,
          converted: quantityInKwh
        });
        
        // Calculate emissions: kWh * kg/kWh = kg, then /1000 for tonnes
        const emissionsKg = quantityInKwh * factor;
        const emissionsTonnes = emissionsKg / 1000;

        logger.debug('EmissionCalculations:calculateScope2', 'Calculated heating emissions', {
          quantityInKwh,
          factor,
          emissionsTonnes
        });
        
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
      logger.debug('EmissionCalculations:calculateScope2', 'Processing steam entries', {
        count: formData.steam?.length || 0
      });
      for (const steam of formData.steam || []) {
        logger.debug('EmissionCalculations:calculateScope2', 'Processing steam entry', { steam });

        if (!steam.quantity || steam.quantity <= 0) {
          logger.debug('EmissionCalculations:calculateScope2', 'Skipping steam - quantity is 0');
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
        logger.debug('EmissionCalculations:calculateScope2', 'Converted steam to GJ', {
          original: steam.quantity,
          unit: steam.unit,
          converted: quantityInGJ
        });
        
        // Calculate emissions: GJ * tCO₂e/GJ = tCO₂e (already in tonnes)
        const emissionsTonnes = quantityInGJ * factorPerGJ;

        logger.debug('EmissionCalculations:calculateScope2', 'Calculated steam emissions', {
          quantityInGJ,
          factorPerGJ,
          emissionsTonnes
        });
        
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

      logger.debug('EmissionCalculations:calculateScope2', 'Total emissions calculated', {
        entriesCount: emissions.length
      });

      // Save to database if we have emissions
      if (emissions.length > 0) {
        const totalEmissions = emissions.reduce((sum, e) => sum + e.emissions_tco2e, 0);
        logger.debug('EmissionCalculations:calculateScope2', 'Saving to database', {
          totalEmissions
        });
        
        // Delete existing Scope 2 entries for clean state
        const { error: deleteError } = await supabase
          .from('scope2_emissions')
          .delete()
          .eq('project_id', currentProject.id);

        if (deleteError) {
          logger.error('EmissionCalculations:deleteScope2', deleteError);
          throw new Error(`Database delete failed: ${deleteError.message}`);
        }
        logger.debug('EmissionCalculations:calculateScope2', 'Previous entries deleted');

        // Insert new emissions
        const emissionsToInsert = emissions.map(e => ({
          ...e,
          project_id: currentProject.id
        }));

        logger.debug('EmissionCalculations:calculateScope2', 'Inserting emissions', {
          count: emissionsToInsert.length
        });

        const { data: insertedData, error: insertError } = await supabase
          .from('scope2_emissions')
          .insert(emissionsToInsert)
          .select();

        if (insertError) {
          logger.error('EmissionCalculations:insertScope2', insertError);
          throw new Error(`Database insert failed: ${insertError.message}`);
        }

        logger.debug('EmissionCalculations:calculateScope2', 'Emissions saved successfully', {
          rowsInserted: insertedData?.length
        });
        
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

      logger.debug('EmissionCalculations:calculateScope2', 'No emissions to save');
      return { emissions: [], total: 0 };

    } catch (error) {
      logger.error('EmissionCalculations:calculateScope2', error);
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

  const calculateScope3Emissions = useCallback(async (formData: Scope3FormData) => {
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
      const emissions: Array<{
        category: number;
        category_name: string;
        subcategory: string;
        activity_description: string;
        lca_stage: string;
        quantity: number;
        unit: string;
        emission_factor: number;
        emissions_tco2e: number;
        supplier_data: boolean;
        notes: string;
        data_quality: string;
        calculation_method: string;
      }> = [];

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
          logger.error('EmissionCalculations:deleteScope3', deleteError);
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
          logger.error('EmissionCalculations:insertScope3', insertError);
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
    } catch (error) {
      logger.error('EmissionCalculations:calculateScope3', error);
      toast({
        title: "Calculation failed",
        description: error instanceof Error ? error.message : "Failed to calculate emissions. Please try again.",
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