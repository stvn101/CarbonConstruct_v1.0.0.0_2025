import { useProject } from '@/contexts/ProjectContext';
import { useUnifiedCalculations, MaterialItem, FuelInput, ElectricityInput, TransportInput } from '@/hooks/useUnifiedCalculations';

export interface ReportData {
  project: {
    name: string;
    description?: string;
    location?: string;
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
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

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

  const scope3Total = (data.totals.scope3_materials || 0) + (data.totals.scope3_transport || 0);

  return {
    project: {
      name: currentProject.name,
      description: currentProject.description,
      location: currentProject.location,
      project_type: currentProject.project_type,
    },
    emissions: {
      scope1: data.totals.scope1 || 0,
      scope2: data.totals.scope2 || 0,
      scope3: scope3Total,
      total: data.totals.total || 0,
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
      methodology: 'Australian NCC 2024 / ISO 14040-44',
      dataQuality: 'Mixed (Calculated from Australian emission factors)',
    },
  };
};