import { useProject } from '@/contexts/ProjectContext';
import { useEmissionTotals } from '@/hooks/useEmissionTotals';

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
    scope1Details: Array<{ category: string; emissions: number; percentage: number }>;
    scope2Details: Array<{ category: string; emissions: number; percentage: number }>;
    scope3Details: Array<{ category: string; emissions: number; percentage: number }>;
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
  const { totals, scope1Details, scope2Details, scope3Details, loading } = useEmissionTotals();

  if (!currentProject || loading) {
    return null;
  }

  return {
    project: {
      name: currentProject.name,
      description: currentProject.description,
      location: currentProject.location,
      project_type: currentProject.project_type,
    },
    emissions: totals,
    breakdown: {
      scope1Details,
      scope2Details,
      scope3Details,
    },
    compliance: {
      nccCompliant: totals.total > 0,
      greenStarEligible: totals.total < 1000, // Example threshold
      nabersReady: totals.scope2 > 0,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      methodology: 'Australian NCC 2024 / ISO 14040-44',
      dataQuality: 'Mixed (Calculated from Australian emission factors)',
    },
  };
};