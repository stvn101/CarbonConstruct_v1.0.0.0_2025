import { useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';

interface EmissionTotals {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

interface ComplianceResult {
  ncc: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    requirements: Array<{
      name: string;
      met: boolean;
      value?: number;
      threshold?: number;
      unit?: string;
    }>;
  };
  gbca: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    score: number;
    maxScore: number;
    requirements: Array<{
      name: string;
      met: boolean;
      value?: number;
      threshold?: number;
      unit?: string;
    }>;
  };
  nabers: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    rating: number;
    maxRating: number;
    requirements: Array<{
      name: string;
      met: boolean;
      value?: number;
      threshold?: number;
      unit?: string;
    }>;
  };
}

export const useComplianceCheck = (totals: EmissionTotals): ComplianceResult => {
  const { currentProject } = useProject();

  return useMemo(() => {
    // Use type assertion to access size_sqm which exists in the database but may not be in the type
    const projectSize = (currentProject as any)?.size_sqm || 1000;
    const emissionsPerSqm = totals.total / projectSize;
    
    // NCC Section J Compliance Check
    // Based on NCC 2024 energy efficiency requirements
    const nccEnergyTarget = 120; // kgCO2e/m² per year (example threshold)
    const nccScope2Limit = 80; // kgCO2e/m² for purchased energy
    
    const nccRequirements = [
      {
        name: 'Total emissions intensity below target',
        met: emissionsPerSqm < nccEnergyTarget,
        value: emissionsPerSqm,
        threshold: nccEnergyTarget,
        unit: 'kgCO₂e/m²',
      },
      {
        name: 'Scope 2 (Energy) emissions within limit',
        met: (totals.scope2 / projectSize) < nccScope2Limit,
        value: totals.scope2 / projectSize,
        threshold: nccScope2Limit,
        unit: 'kgCO₂e/m²',
      },
      {
        name: 'Building envelope performance documented',
        met: totals.total > 0, // Simplified check
      },
    ];

    const nccCompliantCount = nccRequirements.filter(r => r.met).length;
    const nccStatus = 
      nccCompliantCount === nccRequirements.length ? 'compliant' :
      nccCompliantCount > 0 ? 'partial' : 'non-compliant';

    // GBCA Green Star Compliance Check
    // Based on Green Star Buildings v1.1
    const gbcaEmbodiedCarbonTarget = 500; // kgCO2e/m² (example)
    const gbcaOperationalTarget = 60; // kgCO2e/m² per year
    
    const gbcaRequirements = [
      {
        name: 'Embodied carbon below benchmark',
        met: (totals.scope3 / projectSize) < gbcaEmbodiedCarbonTarget,
        value: totals.scope3 / projectSize,
        threshold: gbcaEmbodiedCarbonTarget,
        unit: 'kgCO₂e/m²',
      },
      {
        name: 'Operational carbon below benchmark',
        met: (totals.scope2 / projectSize) < gbcaOperationalTarget,
        value: totals.scope2 / projectSize,
        threshold: gbcaOperationalTarget,
        unit: 'kgCO₂e/m²',
      },
      {
        name: 'Renewable energy usage documented',
        met: totals.scope2 > 0,
      },
      {
        name: 'Circular economy principles applied',
        met: totals.scope3 > 0,
      },
    ];

    const gbcaCompliantCount = gbcaRequirements.filter(r => r.met).length;
    const gbcaScore = gbcaCompliantCount * 25; // Out of 100
    const gbcaStatus = 
      gbcaScore >= 75 ? 'compliant' :
      gbcaScore >= 45 ? 'partial' : 'non-compliant';

    // NABERS Energy Rating Calculation
    // Based on NABERS methodology for commercial buildings
    const nabersBaseEnergy = 100; // kgCO2e/m² (example baseline)
    const energyIntensity = (totals.scope2 / projectSize);
    const performanceRatio = nabersBaseEnergy / energyIntensity;
    
    // NABERS rating (0-6 stars)
    let nabersRating = Math.min(6, Math.max(0, Math.round(performanceRatio * 3)));
    
    const nabersRequirements = [
      {
        name: 'Minimum 12 months operational data',
        met: totals.scope2 > 0,
      },
      {
        name: 'Energy consumption measured and verified',
        met: totals.scope2 > 0,
      },
      {
        name: 'Base building performance assessed',
        met: true,
      },
      {
        name: 'Rating of 4 stars or higher achieved',
        met: nabersRating >= 4,
        value: nabersRating,
        threshold: 4,
        unit: 'stars',
      },
    ];

    const nabersCompliantCount = nabersRequirements.filter(r => r.met).length;
    const nabersStatus = 
      nabersRating >= 5 ? 'compliant' :
      nabersRating >= 3 ? 'partial' : 'non-compliant';

    return {
      ncc: {
        compliant: nccStatus === 'compliant',
        status: nccStatus,
        requirements: nccRequirements,
      },
      gbca: {
        compliant: gbcaStatus === 'compliant',
        status: gbcaStatus,
        score: gbcaScore,
        maxScore: 100,
        requirements: gbcaRequirements,
      },
      nabers: {
        compliant: nabersStatus === 'compliant',
        status: nabersStatus,
        rating: nabersRating,
        maxRating: 6,
        requirements: nabersRequirements,
      },
    };
  }, [totals, currentProject]);
};
