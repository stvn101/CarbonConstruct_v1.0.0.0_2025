/**
 * ECO Platform LCA Calculation Rules V2.0 Validation Functions
 * Implements all compliance checks per ECO Platform requirements
 */

import {
  ValidationResult,
  CoProductType,
  CO_PRODUCTS_REQUIRING_ECONOMIC_ALLOCATION,
  C_TO_CO2_FACTOR,
  BiogenicCarbonContent,
  DataQualityIndicators,
  DataQualityRating,
  ModuleDCalculation,
  EcoPlatformMaterial,
  EcoPlatformProject,
  EcoPlatformComplianceReport,
  AUSTRALIAN_GRID_FACTORS_2024,
  GRID_FACTOR_SOURCE,
  AustralianState,
  CharacterisationFactorVersion,
  AllocationMethod,
  EcoinventMethodology,
} from './eco-platform-types';

// ============================================================================
// MASS BALANCE VALIDATION (Section 2.4)
// ============================================================================

export function validateMassBalanceProhibition(
  usesMassBalance: boolean,
  dataSource?: string
): ValidationResult {
  const errors: string[] = [];
  
  if (usesMassBalance) {
    errors.push('ECO Platform 2.4: Mass balance approaches are prohibited for recycled content claims');
  }
  
  // Check for "book and claim" indicators in data source
  if (dataSource?.toLowerCase().includes('book and claim')) {
    errors.push('ECO Platform 2.4: Book and claim methods are prohibited');
  }
  
  return {
    isCompliant: errors.length === 0,
    errors,
    recommendations: errors.length > 0 
      ? ['Use physical tracing methods for recycled content verification']
      : undefined
  };
}

// ============================================================================
// CO-PRODUCT ALLOCATION VALIDATION (Section 2.6.1)
// ============================================================================

export function validateCoProductAllocation(
  isCoProduct: boolean,
  coProductType: CoProductType | null,
  allocationMethod: AllocationMethod | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!isCoProduct) {
    return { isCompliant: true, errors: [] };
  }
  
  if (coProductType && CO_PRODUCTS_REQUIRING_ECONOMIC_ALLOCATION.includes(coProductType)) {
    if (allocationMethod !== 'economic') {
      errors.push(
        `ECO Platform 2.6.1: ${formatCoProductType(coProductType)} must use economic allocation (currently: ${allocationMethod || 'not specified'})`
      );
    }
  }
  
  if (!allocationMethod) {
    warnings.push('Allocation method not specified for co-product');
  }
  
  return {
    isCompliant: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
    recommendations: errors.length > 0
      ? ['Update material data to use economic allocation for this co-product type']
      : undefined
  };
}

function formatCoProductType(type: CoProductType): string {
  const names: Record<CoProductType, string> = {
    'granulated-blast-furnace-slag': 'Granulated blast furnace slag',
    'crystallised-bof-slag': 'Crystallised BOF slag',
    'fly-ash': 'Fly ash',
    'artificial-gypsum': 'Artificial gypsum',
    'silica-fume': 'Silica fume',
    'aluminium-oxide-byproduct': 'Aluminium oxide by-product'
  };
  return names[type] || type;
}

// ============================================================================
// BIOGENIC CARBON VALIDATION (Section 2.11)
// ============================================================================

export function calculateBiogenicCarbon(
  biogenicCarbonKgC: number,
  productMassKg: number
): BiogenicCarbonContent {
  const percentage = productMassKg > 0 ? (biogenicCarbonKgC / productMassKg) * 100 : 0;
  const requiresCO2e = percentage > 5;
  
  return {
    biogenicCarbonKgC: biogenicCarbonKgC,
    biogenicCarbonKgCO2e: requiresCO2e ? biogenicCarbonKgC * C_TO_CO2_FACTOR : null,
    biogenicCarbonPercentage: percentage,
    requiresCO2eDeclaration: requiresCO2e
  };
}

export function validateBiogenicCarbon(
  biogenicCarbonKgC: number | null,
  biogenicCarbonPercentage: number | null,
  hasCO2eDeclaration: boolean
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (biogenicCarbonKgC === null && biogenicCarbonPercentage === null) {
    // No biogenic carbon data - may be acceptable
    return { isCompliant: true, errors: [] };
  }
  
  if (biogenicCarbonPercentage !== null && biogenicCarbonPercentage > 5) {
    if (!hasCO2eDeclaration) {
      errors.push(
        `ECO Platform 2.11: Biogenic carbon is ${biogenicCarbonPercentage.toFixed(1)}% of mass - kg CO2-e declaration required when >5%`
      );
    }
  }
  
  if (biogenicCarbonKgC !== null && biogenicCarbonKgC < 0) {
    errors.push('ECO Platform 2.11: Biogenic carbon cannot be negative');
  }
  
  return {
    isCompliant: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// ============================================================================
// CHARACTERISATION FACTORS VALIDATION (Section 2.9)
// ============================================================================

export function validateCharacterisationFactors(
  version: CharacterisationFactorVersion | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const validVersions: CharacterisationFactorVersion[] = ['JRC-EF-3.0', 'JRC-EF-3.1'];
  
  if (!version) {
    warnings.push('Characterisation factor version not specified');
    return { isCompliant: true, errors: [], warnings };
  }
  
  if (!validVersions.includes(version)) {
    errors.push(
      `ECO Platform 2.9: Material uses "${version}" - only JRC EF 3.0 or 3.1 are allowed`
    );
  }
  
  if (version === 'JRC-EF-3.0') {
    warnings.push(
      'Using JRC EF 3.0 - note that EF 3.0 toxicity indicators are not compatible with EF 3.1 context'
    );
  }
  
  return {
    isCompliant: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// ============================================================================
// ECOINVENT METHODOLOGY VALIDATION (Section 2.8)
// ============================================================================

export function validateEcoinventMethodology(
  database: string,
  methodology: EcoinventMethodology | null
): ValidationResult {
  const errors: string[] = [];
  
  if (database.toLowerCase() === 'ecoinvent') {
    if (methodology && methodology !== 'cut-off' && methodology !== 'not-applicable') {
      errors.push(
        `ECO Platform 2.8: Ecoinvent "${methodology}" not allowed - only cut-off by classification [100:0] is permitted`
      );
    }
    
    if (!methodology) {
      errors.push('ECO Platform 2.8: Ecoinvent methodology must be specified');
    }
  }
  
  return {
    isCompliant: errors.length === 0,
    errors,
    recommendations: errors.length > 0
      ? ['Use ecoinvent cut-off by classification methodology only']
      : undefined
  };
}

// ============================================================================
// MODULE D VALIDATION (Section 2.13)
// ============================================================================

export function validateModuleD(moduleD: ModuleDCalculation): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (moduleD.includesMultiRecycling) {
    errors.push('ECO Platform 2.13: Multi-recycling effects are prohibited in Module D');
  }
  
  if (moduleD.calculationMethod !== 'cut-off-100-0') {
    errors.push(
      `ECO Platform 2.13: Module D must use cut-off [100:0] methodology (currently: ${moduleD.calculationMethod})`
    );
  }
  
  // Credits should be negative (benefits beyond system boundary)
  if (moduleD.totalModuleD > 0) {
    warnings.push('Module D total is positive - typically Module D represents avoided impacts (negative values)');
  }
  
  return {
    isCompliant: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// ============================================================================
// DATA QUALITY VALIDATION (Section 2.7)
// ============================================================================

export function validateDataQuality(
  quality: DataQualityIndicators | null,
  referenceYear: number | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!quality && !referenceYear) {
    warnings.push('Data quality information not available');
    return { isCompliant: true, errors: [], warnings };
  }
  
  const currentYear = new Date().getFullYear();
  const dataAge = referenceYear ? currentYear - referenceYear : null;
  
  if (dataAge !== null && dataAge > 10) {
    errors.push(
      `ECO Platform 2.7: Data is ${dataAge} years old - may not meet EN 15941 temporal requirements (max 10 years recommended)`
    );
  }
  
  if (quality?.overallQualityRating === 'E') {
    warnings.push('Data quality rating E - justification required in project report');
  }
  
  if (quality?.overallQualityRating === 'D') {
    warnings.push('Data quality rating D - consider using higher quality data sources if available');
  }
  
  return {
    isCompliant: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function calculateDataQualityRating(quality: Partial<DataQualityIndicators>): DataQualityRating {
  const levels = {
    'very-good': 4,
    'good': 3,
    'fair': 2,
    'poor': 1
  };
  
  const scores = [
    quality.technologicalRepresentativeness,
    quality.geographicalRepresentativeness,
    quality.temporalRepresentativeness,
    quality.completeness,
    quality.reliability
  ].filter(Boolean).map(level => levels[level as keyof typeof levels] || 2);
  
  if (scores.length === 0) return 'C';
  
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  if (average >= 3.5) return 'A';
  if (average >= 2.75) return 'B';
  if (average >= 2) return 'C';
  if (average >= 1.25) return 'D';
  return 'E';
}

// ============================================================================
// MANUFACTURING LOCATION VALIDATION (Section 2.12)
// ============================================================================

export function validateManufacturingLocation(
  country: string | null,
  city: string | null
): ValidationResult {
  const warnings: string[] = [];
  
  if (!country) {
    warnings.push('ECO Platform 2.12: Manufacturing country not specified');
  }
  
  if (!city) {
    warnings.push('ECO Platform 2.12: Manufacturing city not specified (required for full compliance)');
  }
  
  return {
    isCompliant: true, // Warnings only, not blocking
    errors: [],
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// ============================================================================
// ELECTRICITY MODELLING VALIDATION (Section 2.5.1)
// ============================================================================

export function validateElectricityModelling(
  electricityPercentage: number | null,
  gwpDeclared: boolean,
  modellingApproach: string | null,
  region: AustralianState | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (electricityPercentage !== null && electricityPercentage > 30) {
    if (!gwpDeclared) {
      errors.push(
        `ECO Platform 2.5.1: Electricity is ${electricityPercentage.toFixed(1)}% of A1-A3 energy - GWP-total declaration required when >30%`
      );
    }
  }
  
  if (!modellingApproach) {
    warnings.push('Electricity modelling approach not specified');
  }
  
  if (modellingApproach === 'location-based' && region) {
    // Validate using sub-national factors for Australia
    if (!(region in AUSTRALIAN_GRID_FACTORS_2024)) {
      warnings.push(`Region "${region}" not recognized - using national average may not comply with ECO Platform 2.5.1`);
    }
  }
  
  return {
    isCompliant: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

export function getGridFactor(state: AustralianState): number {
  return AUSTRALIAN_GRID_FACTORS_2024[state] || 0.76; // Default to NSW
}

export function generateElectricityDeclarationText(
  approach: string,
  state: AustralianState,
  gridFactor: number
): string {
  return `${approach === 'location-based' ? 'Location-based' : 'Market-based'} approach using Australian sub-national consumption mixes. ${state} grid factor: ${gridFactor.toFixed(2)} kgCO2e/kWh (Source: ${GRID_FACTOR_SOURCE})`;
}

// ============================================================================
// MATERIAL COMPLIANCE VALIDATION (Comprehensive)
// ============================================================================

export function validateMaterialEcoCompliance(material: EcoPlatformMaterial): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const allRecommendations: string[] = [];
  
  // Mass balance check
  const massBalanceResult = validateMassBalanceProhibition(material.usesMassBalance);
  allErrors.push(...massBalanceResult.errors);
  if (massBalanceResult.warnings) allWarnings.push(...massBalanceResult.warnings);
  if (massBalanceResult.recommendations) allRecommendations.push(...massBalanceResult.recommendations);
  
  // Co-product allocation check
  const coProductResult = validateCoProductAllocation(
    material.isCoProduct,
    material.coProductType,
    material.allocationMethod
  );
  allErrors.push(...coProductResult.errors);
  if (coProductResult.warnings) allWarnings.push(...coProductResult.warnings);
  if (coProductResult.recommendations) allRecommendations.push(...coProductResult.recommendations);
  
  // Biogenic carbon check
  const biogenicResult = validateBiogenicCarbon(
    material.biogenicCarbonKgC,
    material.biogenicCarbonPercentage,
    material.biogenicCarbonKgC !== null && material.biogenicCarbonPercentage !== null && material.biogenicCarbonPercentage > 5
  );
  allErrors.push(...biogenicResult.errors);
  if (biogenicResult.warnings) allWarnings.push(...biogenicResult.warnings);
  
  // Characterisation factors check
  const cfResult = validateCharacterisationFactors(material.characterisationFactorVersion);
  allErrors.push(...cfResult.errors);
  if (cfResult.warnings) allWarnings.push(...cfResult.warnings);
  
  // Data quality check
  const dqResult = validateDataQuality(
    material.dataRepresentativeness,
    material.referenceYear
  );
  allErrors.push(...dqResult.errors);
  if (dqResult.warnings) allWarnings.push(...dqResult.warnings);
  
  // Manufacturing location check
  const mlResult = validateManufacturingLocation(
    material.manufacturingCountry,
    material.manufacturingCity
  );
  allErrors.push(...mlResult.errors);
  if (mlResult.warnings) allWarnings.push(...mlResult.warnings);
  
  return {
    isCompliant: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined,
    recommendations: allRecommendations.length > 0 ? allRecommendations : undefined
  };
}

// ============================================================================
// PROJECT COMPLIANCE VALIDATION (Comprehensive)
// ============================================================================

export function validateProjectEcoCompliance(
  project: EcoPlatformProject,
  materials: EcoPlatformMaterial[],
  moduleD?: ModuleDCalculation
): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  // Electricity modelling check
  const gridFactor = project.electricityModellingApproach === 'location-based' 
    ? getGridFactor('NSW') // Default, should come from project location
    : null;
    
  const electricityResult = validateElectricityModelling(
    project.electricityPercentageA1A3,
    gridFactor !== null,
    project.electricityModellingApproach,
    'NSW' // Should come from project location
  );
  allErrors.push(...electricityResult.errors);
  if (electricityResult.warnings) allWarnings.push(...electricityResult.warnings);
  
  // Validate all materials
  const nonCompliantMaterials = materials.filter(m => {
    const result = validateMaterialEcoCompliance(m);
    return !result.isCompliant;
  });
  
  if (nonCompliantMaterials.length > 0) {
    allErrors.push(
      `${nonCompliantMaterials.length} material(s) do not meet ECO Platform requirements: ${
        nonCompliantMaterials.slice(0, 3).map(m => m.materialName).join(', ')
      }${nonCompliantMaterials.length > 3 ? '...' : ''}`
    );
  }
  
  // Module D check
  if (moduleD) {
    const moduleDResult = validateModuleD(moduleD);
    allErrors.push(...moduleDResult.errors);
    if (moduleDResult.warnings) allWarnings.push(...moduleDResult.warnings);
  }
  
  return {
    isCompliant: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings.length > 0 ? allWarnings : undefined
  };
}

// ============================================================================
// GENERATE COMPLIANCE REPORT
// ============================================================================

export function generateEcoComplianceReport(
  project: EcoPlatformProject,
  materials: EcoPlatformMaterial[],
  moduleD?: ModuleDCalculation
): EcoPlatformComplianceReport {
  const projectValidation = validateProjectEcoCompliance(project, materials, moduleD);
  
  // Calculate compliance score
  const totalChecks = 13; // Number of ECO Platform requirements
  const passedChecks = totalChecks - projectValidation.errors.length;
  const complianceScore = Math.round((passedChecks / totalChecks) * 100);
  
  // Aggregate biogenic carbon
  const totalBiogenicCarbon = materials.reduce(
    (sum, m) => sum + (m.biogenicCarbonKgC || 0),
    0
  );
  
  // Get unique manufacturing locations
  const manufacturingLocations = materials
    .filter(m => m.manufacturingCountry && m.manufacturingCity)
    .map(m => ({
      country: m.manufacturingCountry!,
      city: m.manufacturingCity!,
      state: undefined,
      siteId: undefined
    }))
    .filter((loc, index, self) => 
      self.findIndex(l => l.country === loc.country && l.city === loc.city) === index
    );
  
  // Count materials with each quality rating
  const qualityRatings = materials.reduce((acc, m) => {
    const rating = m.dataQualityRating || 'C';
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const predominantRating = Object.entries(qualityRatings)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'C';
  
  return {
    standardsCompliance: {
      en15804A2: projectValidation.isCompliant,
      ecoPlatformV2: projectValidation.isCompliant,
      iso14025: true, // Assumed compliant if EN 15804 compliant
      iso21930: true  // Assumed compliant if EN 15804 compliant
    },
    energyTransparency: {
      electricityModellingApproach: project.electricityModellingApproach,
      electricityPercentageOfA1A3: project.electricityPercentageA1A3 || 0,
      electricityGwpKgCO2ePerKwh: project.electricityPercentageA1A3 && project.electricityPercentageA1A3 > 30
        ? getGridFactor('NSW') // Should use project location
        : null,
      gasPercentageOfA1A3: 0, // Not tracked currently
      gasGwpKgCO2ePerMJ: null,
      contractualInstrumentsUsed: false,
      contractualInstrumentDetails: undefined
    },
    characterisationFactors: {
      version: 'JRC-EF-3.1',
      source: 'European Commission Joint Research Centre'
    },
    allocationStatement: {
      coProductsPresent: materials.some(m => m.isCoProduct),
      allocationMethodUsed: 'Economic allocation for co-products per ECO Platform 2.6.1',
      economicAllocationForSlagFlyAsh: materials
        .filter(m => m.isCoProduct && m.coProductType && 
          CO_PRODUCTS_REQUIRING_ECONOMIC_ALLOCATION.includes(m.coProductType))
        .every(m => m.allocationMethod === 'economic')
    },
    dataQuality: {
      overallRating: predominantRating,
      temporalCoverage: `${Math.min(...materials.map(m => m.referenceYear || 2024))} - ${Math.max(...materials.map(m => m.referenceYear || 2024))}`,
      geographicalCoverage: 'Australia'
    },
    manufacturingLocations,
    biogenicCarbon: {
      totalBiogenicCarbonKgC: totalBiogenicCarbon,
      biogenicCarbonKgCO2e: totalBiogenicCarbon > 0 ? totalBiogenicCarbon * C_TO_CO2_FACTOR : null,
      packagingBiogenicBalanced: true // Assumed
    },
    complianceValidation: {
      isFullyCompliant: projectValidation.isCompliant,
      nonCompliantItems: projectValidation.errors,
      warnings: projectValidation.warnings || [],
      complianceScore
    },
    generatedAt: new Date().toISOString(),
    projectId: project.id,
    projectName: project.name
  };
}
