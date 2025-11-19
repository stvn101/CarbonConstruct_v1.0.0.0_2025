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

export const useReportData = (): ReportData | null => {
  const { currentProject } = useProject();
  const { data, loading } = useUnifiedCalculations();

  if (!currentProject || loading) {
    return null;
  }

  if (!data) {
    return null;
  }

  const scope3Total = data.totals.scope3_materials + data.totals.scope3_transport;

  return {
    project: {
      name: currentProject.name,
      description: currentProject.description,
      location: currentProject.location,
      project_type: currentProject.project_type,
    },
    emissions: {
      scope1: data.totals.scope1,
      scope2: data.totals.scope2,
      scope3: scope3Total,
      total: data.totals.total,
    },
    breakdown: {
      materials: data.materials,
      fuelInputs: data.fuelInputs,
      electricityInputs: data.electricityInputs,
      transportInputs: data.transportInputs,
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