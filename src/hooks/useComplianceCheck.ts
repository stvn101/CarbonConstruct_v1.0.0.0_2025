import { useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { WholeLifeCarbonTotals } from '@/hooks/useWholeLifeCarbonCalculations';

interface EmissionTotals {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

// EN 15978 building type benchmarks (kgCO2e/m² whole life)
const EN15978_BENCHMARKS: Record<string, { upfront: number; wholeLife: number }> = {
  residential: { upfront: 500, wholeLife: 1200 },
  commercial: { upfront: 600, wholeLife: 1500 },
  industrial: { upfront: 400, wholeLife: 1000 },
  retail: { upfront: 550, wholeLife: 1300 },
  education: { upfront: 480, wholeLife: 1100 },
  healthcare: { upfront: 700, wholeLife: 1800 },
};

// NCC 2024 Section J embodied carbon limits (kgCO2e/m² for A1-A5)
const NCC_2024_LIMITS: Record<string, number> = {
  class2: 520,  // Apartments
  class3: 580,  // Hotels
  class5: 430,  // Offices
  class6: 400,  // Retail
  class9a: 680, // Healthcare
  class9b: 450, // Education
  default: 500,
};

interface ComplianceRequirement {
  name: string;
  met: boolean;
  value?: number;
  threshold?: number;
  unit?: string;
  stage?: string;
}

interface ComplianceResult {
  ncc: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    requirements: ComplianceRequirement[];
  };
  gbca: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    score: number;
    maxScore: number;
    requirements: ComplianceRequirement[];
  };
  nabers: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    rating: number;
    maxRating: number;
    requirements: ComplianceRequirement[];
  };
  en15978: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    stages: {
      a1a5: { compliant: boolean; value: number; threshold: number };
      b1b7: { compliant: boolean; value: number; threshold: number };
      c1c4: { compliant: boolean; value: number; threshold: number };
      wholeLife: { compliant: boolean; value: number; threshold: number };
    };
    requirements: ComplianceRequirement[];
  };
  climateActive: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    requirements: ComplianceRequirement[];
  };
  isRating?: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    level: string;
    requirements: ComplianceRequirement[];
  };
}

export const useComplianceCheck = (
  totals: EmissionTotals,
  wholeLifeTotals?: WholeLifeCarbonTotals | null
): ComplianceResult => {
  const { currentProject } = useProject();

  return useMemo(() => {
    // Use type assertion to access size_sqm which exists in the database but may not be in the type
    const projectSize = (currentProject as any)?.size_sqm || 1000;
    const projectType = (currentProject as any)?.project_type || 'commercial';
    const buildingClass = (currentProject as any)?.ncc_compliance_level || 'default';
    const emissionsPerSqm = totals.total / projectSize;
    
    // Get benchmark for building type
    const benchmark = EN15978_BENCHMARKS[projectType] || EN15978_BENCHMARKS.commercial;
    const nccLimit = NCC_2024_LIMITS[buildingClass] || NCC_2024_LIMITS.default;
    
    // ===== NCC Section J Compliance Check =====
    // Based on NCC 2024 energy efficiency requirements + embodied carbon
    const nccEnergyTarget = 120; // kgCO2e/m² per year for operational
    const nccScope2Limit = 80; // kgCO2e/m² for purchased energy
    const upfrontIntensity = wholeLifeTotals 
      ? wholeLifeTotals.total_upfront / projectSize 
      : totals.scope3 / projectSize;
    
    const nccRequirements: ComplianceRequirement[] = [
      {
        name: 'Upfront embodied carbon (A1-A5) within NCC 2024 limit',
        met: upfrontIntensity < nccLimit,
        value: Math.round(upfrontIntensity),
        threshold: nccLimit,
        unit: 'kgCO₂e/m²',
        stage: 'A1-A5',
      },
      {
        name: 'Total emissions intensity below target',
        met: emissionsPerSqm < nccEnergyTarget,
        value: Math.round(emissionsPerSqm),
        threshold: nccEnergyTarget,
        unit: 'kgCO₂e/m²',
      },
      {
        name: 'Scope 2 (Energy) emissions within limit',
        met: (totals.scope2 / projectSize) < nccScope2Limit,
        value: Math.round(totals.scope2 / projectSize),
        threshold: nccScope2Limit,
        unit: 'kgCO₂e/m²',
      },
      {
        name: 'Building envelope performance documented',
        met: totals.total > 0,
      },
    ];

    const nccCompliantCount = nccRequirements.filter(r => r.met).length;
    const nccStatus = 
      nccCompliantCount === nccRequirements.length ? 'compliant' :
      nccCompliantCount > 0 ? 'partial' : 'non-compliant';

    // ===== GBCA Green Star Compliance Check =====
    // Based on Green Star Buildings v1.1
    const gbcaEmbodiedCarbonTarget = benchmark.upfront;
    const gbcaOperationalTarget = 60; // kgCO2e/m² per year
    const hasCircularEconomy = wholeLifeTotals && 
      (wholeLifeTotals.d_recycling + wholeLifeTotals.d_reuse + wholeLifeTotals.d_energy_recovery) < 0;
    
    const gbcaRequirements: ComplianceRequirement[] = [
      {
        name: 'Embodied carbon below benchmark',
        met: upfrontIntensity < gbcaEmbodiedCarbonTarget,
        value: Math.round(upfrontIntensity),
        threshold: gbcaEmbodiedCarbonTarget,
        unit: 'kgCO₂e/m²',
        stage: 'A1-A5',
      },
      {
        name: 'Operational carbon below benchmark',
        met: (totals.scope2 / projectSize) < gbcaOperationalTarget,
        value: Math.round(totals.scope2 / projectSize),
        threshold: gbcaOperationalTarget,
        unit: 'kgCO₂e/m²',
        stage: 'B6-B7',
      },
      {
        name: 'Renewable energy usage documented',
        met: totals.scope2 > 0,
      },
      {
        name: 'Circular economy principles applied (Credit 9)',
        met: Boolean(hasCircularEconomy),
        stage: 'Module D',
      },
      {
        name: 'Whole life carbon assessment completed',
        met: wholeLifeTotals !== null && wholeLifeTotals !== undefined,
        stage: 'A-D',
      },
    ];

    const gbcaCompliantCount = gbcaRequirements.filter(r => r.met).length;
    const gbcaScore = Math.round((gbcaCompliantCount / gbcaRequirements.length) * 100);
    const gbcaStatus = 
      gbcaScore >= 75 ? 'compliant' :
      gbcaScore >= 45 ? 'partial' : 'non-compliant';

    // ===== NABERS Energy Rating Calculation =====
    const nabersBaseEnergy = 100;
    const energyIntensity = (totals.scope2 / projectSize);
    const performanceRatio = energyIntensity > 0 ? nabersBaseEnergy / energyIntensity : 0;
    let nabersRating = Math.min(6, Math.max(0, Math.round(performanceRatio * 3)));
    
    const nabersRequirements: ComplianceRequirement[] = [
      {
        name: 'Minimum 12 months operational data',
        met: totals.scope2 > 0,
        stage: 'B6',
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

    const nabersStatus = 
      nabersRating >= 5 ? 'compliant' :
      nabersRating >= 3 ? 'partial' : 'non-compliant';

    // ===== EN 15978 Compliance Check =====
    const en15978Upfront = wholeLifeTotals?.total_upfront || totals.scope3;
    const en15978UsePhase = wholeLifeTotals 
      ? (wholeLifeTotals.b1_use + wholeLifeTotals.b2_maintenance + wholeLifeTotals.b3_repair + 
         wholeLifeTotals.b4_replacement + wholeLifeTotals.b5_refurbishment + 
         wholeLifeTotals.b6_operational_energy + wholeLifeTotals.b7_operational_water)
      : totals.scope2;
    const en15978EndOfLife = wholeLifeTotals 
      ? (wholeLifeTotals.c1_deconstruction + wholeLifeTotals.c2_transport + 
         wholeLifeTotals.c3_waste_processing + wholeLifeTotals.c4_disposal)
      : 0;
    const en15978WholeLife = wholeLifeTotals?.total_whole_life || totals.total;

    const en15978Stages = {
      a1a5: {
        compliant: (en15978Upfront / projectSize) < benchmark.upfront,
        value: Math.round(en15978Upfront / projectSize),
        threshold: benchmark.upfront,
      },
      b1b7: {
        compliant: (en15978UsePhase / projectSize) < benchmark.wholeLife * 0.4, // Use phase ~40% of whole life
        value: Math.round(en15978UsePhase / projectSize),
        threshold: Math.round(benchmark.wholeLife * 0.4),
      },
      c1c4: {
        compliant: (en15978EndOfLife / projectSize) < benchmark.wholeLife * 0.1, // End of life ~10%
        value: Math.round(en15978EndOfLife / projectSize),
        threshold: Math.round(benchmark.wholeLife * 0.1),
      },
      wholeLife: {
        compliant: (en15978WholeLife / projectSize) < benchmark.wholeLife,
        value: Math.round(en15978WholeLife / projectSize),
        threshold: benchmark.wholeLife,
      },
    };

    const en15978Requirements: ComplianceRequirement[] = [
      {
        name: 'Product & Construction Stage (A1-A5)',
        met: en15978Stages.a1a5.compliant,
        value: en15978Stages.a1a5.value,
        threshold: en15978Stages.a1a5.threshold,
        unit: 'kgCO₂e/m²',
        stage: 'A1-A5',
      },
      {
        name: 'Use Stage (B1-B7)',
        met: en15978Stages.b1b7.compliant,
        value: en15978Stages.b1b7.value,
        threshold: en15978Stages.b1b7.threshold,
        unit: 'kgCO₂e/m²',
        stage: 'B1-B7',
      },
      {
        name: 'End of Life Stage (C1-C4)',
        met: en15978Stages.c1c4.compliant,
        value: en15978Stages.c1c4.value,
        threshold: en15978Stages.c1c4.threshold,
        unit: 'kgCO₂e/m²',
        stage: 'C1-C4',
      },
      {
        name: 'Whole Life Carbon (A-C)',
        met: en15978Stages.wholeLife.compliant,
        value: en15978Stages.wholeLife.value,
        threshold: en15978Stages.wholeLife.threshold,
        unit: 'kgCO₂e/m²',
        stage: 'A-C',
      },
      {
        name: 'Module D benefits reported separately',
        met: wholeLifeTotals !== null && wholeLifeTotals !== undefined,
        stage: 'D',
      },
    ];

    const en15978CompliantCount = en15978Requirements.filter(r => r.met).length;
    const en15978Status = 
      en15978CompliantCount === en15978Requirements.length ? 'compliant' :
      en15978CompliantCount >= 3 ? 'partial' : 'non-compliant';

    // ===== Climate Active Carbon Neutral =====
    const climateActiveRequirements: ComplianceRequirement[] = [
      {
        name: 'Scope 1 emissions measured',
        met: totals.scope1 >= 0,
        value: Math.round(totals.scope1),
        unit: 'kgCO₂e',
        stage: 'Scope 1',
      },
      {
        name: 'Scope 2 emissions measured',
        met: totals.scope2 >= 0,
        value: Math.round(totals.scope2),
        unit: 'kgCO₂e',
        stage: 'Scope 2',
      },
      {
        name: 'Scope 3 emissions measured',
        met: totals.scope3 >= 0,
        value: Math.round(totals.scope3),
        unit: 'kgCO₂e',
        stage: 'Scope 3',
      },
      {
        name: 'Carbon neutral pathway documented',
        met: wholeLifeTotals !== null && wholeLifeTotals !== undefined,
      },
      {
        name: 'Module D benefits quantified for offsetting',
        met: Boolean(hasCircularEconomy),
        stage: 'Module D',
      },
    ];

    const climateActiveCompliantCount = climateActiveRequirements.filter(r => r.met).length;
    const climateActiveStatus = 
      climateActiveCompliantCount === climateActiveRequirements.length ? 'compliant' :
      climateActiveCompliantCount >= 3 ? 'partial' : 'non-compliant';

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
      en15978: {
        compliant: en15978Status === 'compliant',
        status: en15978Status,
        stages: en15978Stages,
        requirements: en15978Requirements,
      },
      climateActive: {
        compliant: climateActiveStatus === 'compliant',
        status: climateActiveStatus,
        requirements: climateActiveRequirements,
      },
    };
  }, [totals, wholeLifeTotals, currentProject]);
};
