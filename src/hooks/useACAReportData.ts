/**
 * ACA Monthly Emissions Report Data Hook
 * 
 * Aggregates energy, materials, and plant data for the
 * Australian Constructors Association Subcontractor Emissions Reporting Guide
 * (September 2025 standard)
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/contexts/ProjectContext';
import { STATE_ELEC_FACTORS } from '@/lib/emission-factors';
import Decimal from 'decimal.js';

// Configure Decimal.js for precision
Decimal.set({ rounding: Decimal.ROUND_HALF_UP, precision: 20 });

export interface ACAEnergyRow {
  fuelType: string;
  quantity: number;
  unit: string;
  emissions: number; // tCO2-e
  source: string;
}

export interface ACAMaterialRow {
  material: string;
  quantity: number;
  unit: string;
  emissions: number; // tCO2-e
  source: string; // "EPD: [manufacturer]" or "AusLCI: [category]"
}

export interface ACAPlantRow {
  equipment: string;
  fuelType: string;
  capacity: string;
  modelYear: string;
  spec: string;
}

export interface ACAReportData {
  companyName: string;
  projectName: string;
  reportingPeriod: {
    startDate: string;
    endDate: string;
  };
  energy: ACAEnergyRow[];
  materials: ACAMaterialRow[];
  plant: ACAPlantRow[];
  totalEmissions: number; // tCO2-e
  generatedAt: string;
  equipmentTrackingConfigured: boolean;
}

export interface UseACAReportDataState {
  loading: boolean;
  error: Error | null;
  data: ACAReportData | null;
  fetchData: (startDate: string, endDate: string) => Promise<void>;
}

// Map fuel types to ACA standard names
const FUEL_TYPE_MAP: Record<string, string> = {
  diesel_stationary: 'Diesel (Stationary)',
  diesel_transport: 'Diesel (Transport)',
  petrol: 'Petrol (Light Vehicles)',
  lpg: 'LPG',
  natural_gas: 'Natural Gas',
};

// Map state codes to readable format for display
const formatElectricitySource = (state: string): string => {
  const stateInfo = STATE_ELEC_FACTORS[state as keyof typeof STATE_ELEC_FACTORS];
  return stateInfo ? stateInfo.name : state;
};

export const useACAReportData = (): UseACAReportDataState => {
  const { currentProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ACAReportData | null>(null);

  const fetchData = useCallback(async (startDate: string, endDate: string) => {
    if (!currentProject?.id) {
      setError(new Error('No project selected'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user profile for company name
      const { data: userData } = await supabase.auth.getUser();
      let companyName = 'Company Name';
      
      if (userData?.user?.id) {
        const { data: profile } = await supabase
          .from('user_preferences')
          .select('preferences_data')
          .eq('user_id', userData.user.id)
          .single();
        
        if (profile?.preferences_data) {
          const prefs = profile.preferences_data as Record<string, unknown>;
          if (prefs.companyName) {
            companyName = prefs.companyName as string;
          }
        }
      }

      // Fetch unified calculations for the project
      const { data: calcData, error: calcError } = await supabase
        .from('unified_calculations')
        .select('*')
        .eq('project_id', currentProject.id)
        .gte('updated_at', startDate)
        .lte('updated_at', endDate)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (calcError) throw calcError;

      // Process energy data
      const energyRows: ACAEnergyRow[] = [];
      const materialRows: ACAMaterialRow[] = [];

      if (calcData && calcData.length > 0) {
        const calc = calcData[0];
        
        // Process fuel inputs
        if (calc.fuel_inputs && Array.isArray(calc.fuel_inputs)) {
          const fuelAggregated: Record<string, { quantity: number; emissions: number; unit: string }> = {};
          
          for (const fuel of calc.fuel_inputs as Array<{ fuelType: string; quantity: number; unit: string; totalEmissions?: number }>) {
            const fuelKey = fuel.fuelType;
            if (!fuelAggregated[fuelKey]) {
              fuelAggregated[fuelKey] = { quantity: 0, emissions: 0, unit: fuel.unit || 'L' };
            }
            fuelAggregated[fuelKey].quantity += fuel.quantity || 0;
            // Emissions stored in kgCO2e, convert to tCO2e
            fuelAggregated[fuelKey].emissions += (fuel.totalEmissions || 0) / 1000;
          }

          for (const [fuelType, values] of Object.entries(fuelAggregated)) {
            const displayName = FUEL_TYPE_MAP[fuelType] || fuelType;
            energyRows.push({
              fuelType: displayName,
              quantity: new Decimal(values.quantity).toDecimalPlaces(2).toNumber(),
              unit: values.unit === 'L' ? 'L' : values.unit,
              emissions: new Decimal(values.emissions).toDecimalPlaces(2).toNumber(),
              source: 'NGA Factors 2024',
            });
          }
        }

        // Process electricity inputs
        if (calc.electricity_inputs && Array.isArray(calc.electricity_inputs)) {
          const elecAggregated: Record<string, { quantity: number; emissions: number }> = {};
          
          for (const elec of calc.electricity_inputs as Array<{ state: string; quantity: number; totalEmissions?: number }>) {
            const stateKey = elec.state || 'NSW';
            if (!elecAggregated[stateKey]) {
              elecAggregated[stateKey] = { quantity: 0, emissions: 0 };
            }
            elecAggregated[stateKey].quantity += elec.quantity || 0;
            elecAggregated[stateKey].emissions += (elec.totalEmissions || 0) / 1000;
          }

          for (const [state, values] of Object.entries(elecAggregated)) {
            energyRows.push({
              fuelType: `Electricity (${formatElectricitySource(state)})`,
              quantity: new Decimal(values.quantity).toDecimalPlaces(2).toNumber(),
              unit: 'kWh',
              emissions: new Decimal(values.emissions).toDecimalPlaces(2).toNumber(),
              source: 'NGA Factors 2024',
            });
          }
        }

        // Process materials
        if (calc.materials && Array.isArray(calc.materials)) {
          const materialAggregated: Record<string, { 
            quantity: number; 
            emissions: number; 
            unit: string; 
            manufacturer?: string;
            dataSource?: string;
            category?: string;
          }> = {};
          
          for (const mat of calc.materials as Array<{ 
            name: string; 
            quantity: number; 
            unit: string; 
            totalEmissions?: number;
            manufacturer?: string;
            dataSource?: string;
            category?: string;
          }>) {
            const matKey = mat.name;
            if (!materialAggregated[matKey]) {
              materialAggregated[matKey] = { 
                quantity: 0, 
                emissions: 0, 
                unit: mat.unit || 'm²',
                manufacturer: mat.manufacturer,
                dataSource: mat.dataSource,
                category: mat.category,
              };
            }
            materialAggregated[matKey].quantity += mat.quantity || 0;
            materialAggregated[matKey].emissions += (mat.totalEmissions || 0) / 1000;
          }

          for (const [name, values] of Object.entries(materialAggregated)) {
            // Determine source attribution
            let source = 'AusLCI: Generic';
            if (values.manufacturer && values.dataSource?.toLowerCase().includes('epd')) {
              source = `EPD: ${values.manufacturer}`;
            } else if (values.dataSource) {
              source = values.dataSource;
            } else if (values.category) {
              source = `AusLCI: ${values.category}`;
            }

            materialRows.push({
              material: name,
              quantity: new Decimal(values.quantity).toDecimalPlaces(2).toNumber(),
              unit: values.unit,
              emissions: new Decimal(values.emissions).toDecimalPlaces(2).toNumber(),
              source,
            });
          }
        }
      }

      // Check for equipment tracking table
      let plantRows: ACAPlantRow[] = [];
      let equipmentTrackingConfigured = false;

      // Try to fetch from equipment_tracking if it exists
      // Note: This table may not exist yet - handle gracefully
      try {
        const { data: equipmentData, error: equipError } = await supabase
          .from('scope1_emissions')
          .select('*')
          .eq('project_id', currentProject.id)
          .eq('category', 'equipment')
          .gte('created_at', startDate)
          .lte('created_at', endDate);

        if (!equipError && equipmentData && equipmentData.length > 0) {
          equipmentTrackingConfigured = true;
          plantRows = equipmentData.map((equip) => ({
            equipment: equip.subcategory || 'Unknown Equipment',
            fuelType: equip.fuel_type || 'Diesel',
            capacity: `${equip.quantity || 0} kW`,
            modelYear: '2024', // Default if not stored
            spec: equip.notes || 'Tier 4 Final',
          }));
        }
      } catch {
        // Equipment tracking not configured - this is expected
        equipmentTrackingConfigured = false;
      }

      // Calculate total emissions
      const energyTotal = energyRows.reduce((sum, row) => sum + row.emissions, 0);
      const materialsTotal = materialRows.reduce((sum, row) => sum + row.emissions, 0);
      const totalEmissions = new Decimal(energyTotal).plus(materialsTotal).toDecimalPlaces(2).toNumber();

      setData({
        companyName,
        projectName: currentProject.name,
        reportingPeriod: {
          startDate,
          endDate,
        },
        energy: energyRows,
        materials: materialRows,
        plant: plantRows,
        totalEmissions,
        generatedAt: new Date().toISOString(),
        equipmentTrackingConfigured,
      });

    } catch (err) {
      console.error('Error fetching ACA report data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch report data'));
    } finally {
      setLoading(false);
    }
  }, [currentProject?.id, currentProject?.name]);

  return {
    loading,
    error,
    data,
    fetchData,
  };
};
