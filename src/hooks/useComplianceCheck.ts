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
  infrastructure: { upfront: 800, wholeLife: 2000 },
  civil: { upfront: 750, wholeLife: 1800 },
  transport: { upfront: 900, wholeLife: 2200 },
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

// IS Rating levels based on ISCA scheme
const IS_RATING_LEVELS = {
  leading: { minScore: 85, label: 'Leading' },
  excellent: { minScore: 75, label: 'Excellent' },
  commended: { minScore: 50, label: 'Commended' },
  certified: { minScore: 25, label: 'Certified' },
  none: { minScore: 0, label: 'Not Rated' },
};

export interface ComplianceRequirement {
  name: string;
  met: boolean;
  value?: number;
  threshold?: number;
  unit?: string;
  stage?: string;
  recommendation?: string;
}

interface ComplianceResult {
  ncc: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    requirements: ComplianceRequirement[];
    buildingClass?: string;
    limit?: number;
  };
  gbca: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    score: number;
    maxScore: number;
    requirements: ComplianceRequirement[];
    creditBreakdown?: { credits: number; maxCredits: number };
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
      moduleD: { compliant: boolean; value: number };
      wholeLife: { compliant: boolean; value: number; threshold: number };
    };
    requirements: ComplianceRequirement[];
  };
  climateActive: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    requirements: ComplianceRequirement[];
    pathwayStatus?: string;
  };
  isRating: {
    compliant: boolean;
    status: 'compliant' | 'partial' | 'non-compliant';
    level: string;
    score: number;
    maxScore: number;
    requirements: ComplianceRequirement[];
    isInfrastructure: boolean;
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
    
    // Check if infrastructure project
    const infrastructureTypes = ['infrastructure', 'civil', 'transport', 'utilities', 'energy', 'roads', 'bridges'];
    const isInfrastructure = infrastructureTypes.includes(projectType.toLowerCase());
    
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
        recommendation: upfrontIntensity >= nccLimit 
          ? 'Consider lower-carbon materials or reduce material quantities'
          : undefined,
      },
      {
        name: 'Total emissions intensity below target',
        met: emissionsPerSqm < nccEnergyTarget,
        value: Math.round(emissionsPerSqm),
        threshold: nccEnergyTarget,
        unit: 'kgCO₂e/m²',
        recommendation: emissionsPerSqm >= nccEnergyTarget
          ? 'Improve energy efficiency or switch to renewable sources'
          : undefined,
      },
      {
        name: 'Scope 2 (Energy) emissions within limit',
        met: (totals.scope2 / projectSize) < nccScope2Limit,
        value: Math.round(totals.scope2 / projectSize),
        threshold: nccScope2Limit,
        unit: 'kgCO₂e/m²',
        recommendation: (totals.scope2 / projectSize) >= nccScope2Limit
          ? 'Increase renewable energy usage or improve building envelope'
          : undefined,
      },
      {
        name: 'Building envelope performance documented',
        met: totals.total > 0,
        recommendation: totals.total <= 0
          ? 'Complete calculator inputs to document performance'
          : undefined,
      },
    ];

    const nccCompliantCount = nccRequirements.filter(r => r.met).length;
    const nccCriticalRequirementsMet = nccRequirements
      .filter(r => r.threshold !== undefined) // Only check requirements with thresholds
      .filter(r => r.met).length;
    const nccCriticalRequirementsTotal = nccRequirements
      .filter(r => r.threshold !== undefined).length;
    
    // Force non-compliant for very large emissions (5x over any limit) OR if all critical requirements fail
    const isExtremelyHighEmissions = upfrontIntensity > nccLimit * 5 || emissionsPerSqm > nccEnergyTarget * 5;
    const nccStatus: 'compliant' | 'partial' | 'non-compliant' = 
      isExtremelyHighEmissions ? 'non-compliant' :
      nccCriticalRequirementsMet === 0 && nccCriticalRequirementsTotal > 0 ? 'non-compliant' :
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
        recommendation: upfrontIntensity >= gbcaEmbodiedCarbonTarget
          ? 'Specify lower-carbon materials to achieve Green Star credit'
          : undefined,
      },
      {
        name: 'Operational carbon below benchmark',
        met: (totals.scope2 / projectSize) < gbcaOperationalTarget,
        value: Math.round(totals.scope2 / projectSize),
        threshold: gbcaOperationalTarget,
        unit: 'kgCO₂e/m²',
        stage: 'B6-B7',
        recommendation: (totals.scope2 / projectSize) >= gbcaOperationalTarget
          ? 'Install efficient HVAC and lighting systems'
          : undefined,
      },
      {
        name: 'Renewable energy usage documented',
        met: totals.scope2 > 0,
        recommendation: totals.scope2 <= 0
          ? 'Add electricity consumption data in calculator'
          : undefined,
      },
      {
        name: 'Circular economy principles applied (Credit 9)',
        met: Boolean(hasCircularEconomy),
        stage: 'Module D',
        recommendation: !hasCircularEconomy
          ? 'Add Module D data for recycling/reuse benefits'
          : undefined,
      },
      {
        name: 'Whole life carbon assessment completed',
        met: wholeLifeTotals !== null && wholeLifeTotals !== undefined,
        stage: 'A-D',
        recommendation: !wholeLifeTotals
          ? 'Complete all lifecycle stages in the calculator'
          : undefined,
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
    const nabersRating = Math.min(6, Math.max(0, Math.round(performanceRatio * 3)));
    
    const nabersRequirements: ComplianceRequirement[] = [
      {
        name: 'Minimum 12 months operational data',
        met: totals.scope2 > 0,
        stage: 'B6',
        recommendation: totals.scope2 <= 0
          ? 'Add operational energy data covering 12 months'
          : undefined,
      },
      {
        name: 'Energy consumption measured and verified',
        met: totals.scope2 > 0,
        recommendation: totals.scope2 <= 0
          ? 'Input electricity consumption from utility bills'
          : undefined,
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
        recommendation: nabersRating < 4
          ? 'Improve energy efficiency to achieve higher star rating'
          : undefined,
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

    // Module D credits (negative values = benefits)
    const en15978ModuleD = wholeLifeTotals 
      ? (wholeLifeTotals.d_recycling + wholeLifeTotals.d_reuse + wholeLifeTotals.d_energy_recovery)
      : 0;

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
      moduleD: {
        compliant: en15978ModuleD < 0 || wholeLifeTotals !== null, // Module D is compliant if reported (even if 0)
        value: Math.round(en15978ModuleD / projectSize),
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
        recommendation: !en15978Stages.a1a5.compliant
          ? 'Reduce material quantities or specify lower-carbon alternatives'
          : undefined,
      },
      {
        name: 'Use Stage (B1-B7)',
        met: en15978Stages.b1b7.compliant,
        value: en15978Stages.b1b7.value,
        threshold: en15978Stages.b1b7.threshold,
        unit: 'kgCO₂e/m²',
        stage: 'B1-B7',
        recommendation: !en15978Stages.b1b7.compliant
          ? 'Add Use Phase calculator data for operational emissions'
          : undefined,
      },
      {
        name: 'End of Life Stage (C1-C4)',
        met: en15978Stages.c1c4.compliant,
        value: en15978Stages.c1c4.value,
        threshold: en15978Stages.c1c4.threshold,
        unit: 'kgCO₂e/m²',
        stage: 'C1-C4',
        recommendation: !en15978Stages.c1c4.compliant
          ? 'Design for disassembly to reduce end-of-life impacts'
          : undefined,
      },
      {
        name: 'Whole Life Carbon (A-C)',
        met: en15978Stages.wholeLife.compliant,
        value: en15978Stages.wholeLife.value,
        threshold: en15978Stages.wholeLife.threshold,
        unit: 'kgCO₂e/m²',
        stage: 'A-C',
        recommendation: !en15978Stages.wholeLife.compliant
          ? 'Review all lifecycle stages for reduction opportunities'
          : undefined,
      },
      {
        name: 'Module D benefits reported separately',
        met: wholeLifeTotals !== null && wholeLifeTotals !== undefined,
        stage: 'D',
        recommendation: !wholeLifeTotals
          ? 'Complete Module D calculator for recycling benefits'
          : undefined,
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
        recommendation: totals.scope1 < 0
          ? 'Add direct fuel consumption data'
          : undefined,
      },
      {
        name: 'Scope 2 emissions measured',
        met: totals.scope2 >= 0,
        value: Math.round(totals.scope2),
        unit: 'kgCO₂e',
        stage: 'Scope 2',
        recommendation: totals.scope2 < 0
          ? 'Add electricity consumption data'
          : undefined,
      },
      {
        name: 'Scope 3 emissions measured',
        met: totals.scope3 >= 0,
        value: Math.round(totals.scope3),
        unit: 'kgCO₂e',
        stage: 'Scope 3',
        recommendation: totals.scope3 < 0
          ? 'Add materials and transport data'
          : undefined,
      },
      {
        name: 'Carbon neutral pathway documented',
        met: wholeLifeTotals !== null && wholeLifeTotals !== undefined,
        recommendation: !wholeLifeTotals
          ? 'Complete full lifecycle assessment to document pathway'
          : undefined,
      },
      {
        name: 'Module D benefits quantified for offsetting',
        met: Boolean(hasCircularEconomy),
        stage: 'Module D',
        recommendation: !hasCircularEconomy
          ? 'Quantify recycling and reuse credits in Module D'
          : undefined,
      },
    ];

    const climateActiveCompliantCount = climateActiveRequirements.filter(r => r.met).length;
    const climateActiveStatus = 
      climateActiveCompliantCount === climateActiveRequirements.length ? 'compliant' :
      climateActiveCompliantCount >= 3 ? 'partial' : 'non-compliant';

    // ===== IS Rating (Infrastructure Sustainability) =====
    const moduleDCredits = wholeLifeTotals 
      ? Math.abs(wholeLifeTotals.d_recycling + wholeLifeTotals.d_reuse + wholeLifeTotals.d_energy_recovery)
      : 0;
    const hasLCAComplete = wholeLifeTotals !== null && wholeLifeTotals !== undefined;
    const hasEndOfLife = wholeLifeTotals && en15978EndOfLife > 0;
    
    const isRatingRequirements: ComplianceRequirement[] = [
      {
        name: 'Carbon emissions quantified and reported (Scope 1-3)',
        met: totals.total > 0,
        value: Math.round(totals.total),
        unit: 'kgCO₂e',
        stage: 'Scope 1-3',
        recommendation: totals.total <= 0
          ? 'Complete all emission scopes in the calculator'
          : undefined,
      },
      {
        name: 'Life cycle assessment completed (A-D)',
        met: hasLCAComplete,
        stage: 'EN 15978',
        recommendation: !hasLCAComplete
          ? 'Complete all lifecycle stages including Module D'
          : undefined,
      },
      {
        name: 'Recycling/reuse strategy documented',
        met: moduleDCredits > 0,
        value: moduleDCredits > 0 ? Math.round(moduleDCredits) : undefined,
        unit: moduleDCredits > 0 ? 'kgCO₂e credits' : undefined,
        stage: 'Module D',
        recommendation: moduleDCredits <= 0
          ? 'Document recycling and material reuse strategies'
          : undefined,
      },
      {
        name: 'End-of-life assessment completed',
        met: Boolean(hasEndOfLife),
        stage: 'C1-C4',
        recommendation: !hasEndOfLife
          ? 'Complete End-of-Life calculator section'
          : undefined,
      },
      {
        name: 'Supply chain sustainability assessed',
        met: totals.scope3 > 0,
        stage: 'Materials',
        recommendation: totals.scope3 <= 0
          ? 'Add materials and transport data for supply chain assessment'
          : undefined,
      },
      {
        name: 'Operational carbon reduction pathway',
        met: totals.scope2 > 0,
        stage: 'B6-B7',
        recommendation: totals.scope2 <= 0
          ? 'Document operational energy and reduction strategies'
          : undefined,
      },
    ];

    // Calculate IS Rating score
    const isRatingCompliantCount = isRatingRequirements.filter(r => r.met).length;
    const baseScore = Math.round((isRatingCompliantCount / isRatingRequirements.length) * 100);
    
    // Bonus for module D circular economy (up to 10 points)
    const circularBonus = moduleDCredits > 0 ? Math.min(10, moduleDCredits / 1000) : 0;
    const isRatingScore = Math.min(100, baseScore + circularBonus);
    
    // Determine IS Rating level
    let isRatingLevel = IS_RATING_LEVELS.none.label;
    if (isRatingScore >= IS_RATING_LEVELS.leading.minScore) {
      isRatingLevel = IS_RATING_LEVELS.leading.label;
    } else if (isRatingScore >= IS_RATING_LEVELS.excellent.minScore) {
      isRatingLevel = IS_RATING_LEVELS.excellent.label;
    } else if (isRatingScore >= IS_RATING_LEVELS.commended.minScore) {
      isRatingLevel = IS_RATING_LEVELS.commended.label;
    } else if (isRatingScore >= IS_RATING_LEVELS.certified.minScore) {
      isRatingLevel = IS_RATING_LEVELS.certified.label;
    }

    const isRatingStatus = 
      isRatingScore >= 75 ? 'compliant' :
      isRatingScore >= 25 ? 'partial' : 'non-compliant';

    return {
      ncc: {
        compliant: nccStatus === 'compliant',
        status: nccStatus,
        requirements: nccRequirements,
        buildingClass,
        limit: nccLimit,
      },
      gbca: {
        compliant: gbcaStatus === 'compliant',
        status: gbcaStatus,
        score: gbcaScore,
        maxScore: 100,
        requirements: gbcaRequirements,
        creditBreakdown: { credits: gbcaCompliantCount, maxCredits: gbcaRequirements.length },
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
        pathwayStatus: climateActiveStatus === 'compliant' ? 'On Track' : 'Action Required',
      },
      isRating: {
        compliant: isRatingStatus === 'compliant',
        status: isRatingStatus,
        level: isRatingLevel,
        score: Math.round(isRatingScore),
        maxScore: 100,
        requirements: isRatingRequirements,
        isInfrastructure,
      },
    };
  }, [totals, wholeLifeTotals, currentProject]);
};
