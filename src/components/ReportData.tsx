import { useProject } from '@/contexts/ProjectContext';
import { useUnifiedCalculations, MaterialItem, FuelInput, ElectricityInput, TransportInput } from '@/hooks/useUnifiedCalculations';
import { WholeLifeCarbonTotals, loadStoredWholeLifeTotals } from '@/hooks/useWholeLifeCarbonCalculations';

export interface ReportData {
  project: {
    name: string;
    description?: string | null;
    location?: string | null;
    project_type: string;
  };
  emissions: {
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  };
  breakdown: {
    materials: MaterialItem[];
    fuelInputs: FuelInput[];
    electricityInputs: ElectricityInput[];
    transportInputs: TransportInput[];
  };
  compliance: {
    nccCompliant: boolean;
    greenStarEligible: boolean;
    nabersReady: boolean;
  };
  metadata: {
    generatedAt: string;
    methodology: string;
    dataQuality: string;
  };
  // EN 15978 Whole Life Carbon data
  wholeLife?: WholeLifeCarbonTotals | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const calculateDataCompleteness = (data: ReportData): number => {
  let filledFields = 0;
  let totalFields = 0;

  // Project fields (4 total, 2 required)
  totalFields += 4;
  filledFields += 2; // name and project_type are always present
  if (data.project.description) filledFields++;
  if (data.project.location) filledFields++;

  // Emission data (4 scopes)
  totalFields += 4;
  if (data.emissions.scope1 > 0) filledFields++;
  if (data.emissions.scope2 > 0) filledFields++;
  if (data.emissions.scope3 > 0) filledFields++;
  if (data.emissions.total > 0) filledFields++;

  // Breakdown data (at least one entry in each category)
  totalFields += 4;
  if (data.breakdown.materials.length > 0) filledFields++;
  if (data.breakdown.fuelInputs.length > 0) filledFields++;
  if (data.breakdown.electricityInputs.length > 0) filledFields++;
  if (data.breakdown.transportInputs.length > 0) filledFields++;

  return Math.round((filledFields / totalFields) * 100);
};

export const validateReportData = (data: ReportData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for critical missing data
  if (!data.emissions.total || data.emissions.total === 0) {
    errors.push('No emission data available. Please add calculations to your project first.');
  }

  // Check for at least some input data
  const hasAnyData = 
    data.breakdown.materials.length > 0 ||
    data.breakdown.fuelInputs.length > 0 ||
    data.breakdown.electricityInputs.length > 0 ||
    data.breakdown.transportInputs.length > 0;

  if (!hasAnyData) {
    errors.push('No calculation data found. Please complete at least one calculation before generating a report.');
  }

  // Check for data quality warnings
  if (data.emissions.scope1 === 0 && data.emissions.scope2 === 0 && data.emissions.scope3 === 0) {
    warnings.push('All scopes show zero emissions. Please verify your input data.');
  }

  if (!data.project.location) {
    warnings.push('Project location is missing. This may affect compliance assessments.');
  }

  if (!data.project.description) {
    warnings.push('Project description is missing. Adding context improves report quality.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const useReportData = (): ReportData | null => {
  const { currentProject } = useProject();
  const { data, loading } = useUnifiedCalculations();

  if (!currentProject || loading) {
    return null;
  }

  if (!data) {
    return null;
  }

  // All database values are stored in kgCO2e, convert to tCO2e for display
  const scope1Tonnes = (data.totals.scope1 || 0) / 1000;
  const scope2Tonnes = (data.totals.scope2 || 0) / 1000;
  
  // Calculate transport emissions from transportInputs array
  const transportEmissionsKg = data.transportInputs.reduce((sum, t) => sum + (t.totalEmissions * 1000), 0);
  
  const scope3Total = ((data.totals.scope3_materials || 0) + (data.totals.scope3_transport || 0) + transportEmissionsKg) / 1000;
  const totalTonnes = scope1Tonnes + scope2Tonnes + scope3Total;

  // Load whole life carbon data from localStorage
  const wholeLifeTotals = loadStoredWholeLifeTotals();

  return {
    project: {
      name: currentProject.name,
      description: currentProject.description,
      location: currentProject.location,
      project_type: currentProject.project_type,
    },
    emissions: {
      scope1: scope1Tonnes,
      scope2: scope2Tonnes,
      scope3: scope3Total,
      total: totalTonnes,
    },
    breakdown: {
      materials: data.materials || [],
      fuelInputs: data.fuelInputs || [],
      electricityInputs: data.electricityInputs || [],
      transportInputs: data.transportInputs || [],
    },
    compliance: {
      nccCompliant: data.totals.total > 0,
      greenStarEligible: data.totals.total < 1000,
      nabersReady: data.totals.scope2 > 0,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      methodology: 'EN 15978:2011 / Australian NCC 2024 / ISO 14040-44',
      dataQuality: 'Mixed (Calculated from Australian emission factors and EPD data)',
    },
    wholeLife: wholeLifeTotals,
  };
};

// Debug hook to expose raw values for troubleshooting
export interface DebugEmissionData {
  raw: {
    scope1: number;
    scope2: number;
    scope3_materials: number;
    scope3_transport: number;
    total: number;
  };
  converted: {
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  };
  conversionFactor: number;
}

export const useDebugEmissionData = (): DebugEmissionData | null => {
  const { data, loading } = useUnifiedCalculations();

  if (loading || !data) {
    return null;
  }

  // Calculate transport emissions from transportInputs array
  const transportEmissionsKg = data.transportInputs.reduce((sum, t) => sum + (t.totalEmissions * 1000), 0);

  const raw = {
    scope1: data.totals.scope1 || 0,
    scope2: data.totals.scope2 || 0,
    scope3_materials: data.totals.scope3_materials || 0,
    scope3_transport: (data.totals.scope3_transport || 0) + transportEmissionsKg,
    total: data.totals.total || 0,
  };

  const converted = {
    scope1: raw.scope1 / 1000,
    scope2: raw.scope2 / 1000,
    scope3: (raw.scope3_materials + raw.scope3_transport) / 1000,
    total: (raw.scope1 + raw.scope2 + raw.scope3_materials + raw.scope3_transport) / 1000,
  };

  return {
    raw,
    converted,
    conversionFactor: 1000,
  };
};