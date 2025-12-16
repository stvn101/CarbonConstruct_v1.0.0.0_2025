/**
 * ECO Platform LCA Calculation Rules V2.0 Type Definitions
 * Aligned with EN 15804+A2 standards
 */

// ============================================================================
// ELECTRICITY MODELLING (Section 2.5.1)
// ============================================================================

export type AustralianState = 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'TAS' | 'NT' | 'ACT';

export type ElectricityModellingApproach = 'market-based' | 'location-based';

export type GridType = 
  | 'consumption-mix' 
  | 'residual-mix' 
  | 'contractual-instrument' 
  | 'own-generation' 
  | 'direct-connection';

export interface ElectricityModelling {
  approach: ElectricityModellingApproach;
  gridType: GridType;
  region: AustralianState;
  gwpTotal: number; // kgCO2e/kWh - MANDATORY if electricity >30% of A1-A3 energy
  dataSource: string;
  referenceYear: number;
}

export interface EnergyTransparencyDeclaration {
  electricityPercentageOfA1A3: number;
  electricityGwpTotal: number | null; // Required if >30%
  modellingApproach: ElectricityModellingApproach;
  gridFactorSource: string;
  gridFactorYear: number;
  declarationText: string;
}

// Australian sub-national consumption mix factors (2024)
export const AUSTRALIAN_GRID_FACTORS_2024: Record<AustralianState, number> = {
  NSW: 0.76,  // kgCO2e/kWh
  VIC: 0.90,
  QLD: 0.72,
  SA: 0.42,
  WA: 0.64,  // SWIS grid
  TAS: 0.14,
  NT: 0.54,
  ACT: 0.76  // Uses NSW grid
};

export const GRID_FACTOR_SOURCE = 'Australian National Greenhouse Accounts 2024';

// ============================================================================
// MASS BALANCE PROHIBITION (Section 2.4)
// ============================================================================

export type RecycledContentMethod = 'physical-tracing' | 'mass-balance' | 'unknown';

export interface MaterialDataIntegrity {
  usesRecycledContent: boolean;
  recycledContentMethod: RecycledContentMethod;
  ecoCompliant: boolean; // false if mass-balance
}

// ============================================================================
// CO-PRODUCT ALLOCATION (Section 2.6.1)
// ============================================================================

export type CoProductType = 
  | 'granulated-blast-furnace-slag'
  | 'crystallised-bof-slag'
  | 'fly-ash'
  | 'artificial-gypsum'
  | 'silica-fume'
  | 'aluminium-oxide-byproduct';

export type AllocationMethod = 'economic' | 'physical' | 'system-expansion' | 'unknown';

export interface CoProductAllocation {
  isCoProduct: boolean;
  coProductType?: CoProductType;
  allocationMethod: AllocationMethod;
  ecoCompliant: boolean; // Must be 'economic' for listed co-products
}

export const CO_PRODUCTS_REQUIRING_ECONOMIC_ALLOCATION: CoProductType[] = [
  'granulated-blast-furnace-slag',
  'crystallised-bof-slag',
  'fly-ash',
  'artificial-gypsum',
  'silica-fume',
  'aluminium-oxide-byproduct'
];

// ============================================================================
// BIOGENIC CARBON (Section 2.11)
// ============================================================================

export const C_TO_CO2_FACTOR = 44 / 12; // 3.667

export interface BiogenicCarbonContent {
  biogenicCarbonKgC: number;
  biogenicCarbonKgCO2e: number | null; // Required if >5% of mass
  biogenicCarbonPercentage: number;
  requiresCO2eDeclaration: boolean; // true if >5%
}

export interface PackagingBiogenicCarbon {
  packagingBiogenicCarbonKgC: number;
  packagingBiogenicCarbonPercentage: number;
  a3Uptake: number; // CO2 absorbed during growth
  a5Release: number; // CO2 released when packaging disposed
  isBalanced: boolean; // a3Uptake should equal a5Release
}

// ============================================================================
// CHARACTERISATION FACTORS (Section 2.9)
// ============================================================================

export type CharacterisationFactorVersion = 'JRC-EF-3.0' | 'JRC-EF-3.1' | 'other';

export interface CharacterisationFactorSet {
  version: CharacterisationFactorVersion;
  indicators: {
    gwpTotal: boolean;      // GWP-total (fossil + biogenic + luluc)
    gwpFossil: boolean;     // GWP-fossil
    gwpBiogenic: boolean;   // GWP-biogenic
    gwpLuluc: boolean;      // GWP-luluc
    odp: boolean;           // Ozone depletion
    ap: boolean;            // Acidification
    epFreshwater: boolean;  // Eutrophication freshwater
    epMarine: boolean;      // Eutrophication marine
    epTerrestrial: boolean; // Eutrophication terrestrial
    pocp: boolean;          // Photochemical ozone creation
    adpMinerals: boolean;   // Abiotic depletion (minerals)
    adpFossil: boolean;     // Abiotic depletion (fossil)
    wdp: boolean;           // Water deprivation
  };
  source: string;
  complianceNote: string;
}

// ============================================================================
// ECOINVENT METHODOLOGY (Section 2.8)
// ============================================================================

export type EcoinventMethodology = 'cut-off' | 'apos' | 'consequential' | 'not-applicable';

export interface BackgroundDataSource {
  database: 'ecoinvent' | 'auslci' | 'epd-australasia' | 'ice' | 'other';
  version: string;
  methodology?: EcoinventMethodology; // Only for ecoinvent
  ecoCompliant: boolean;
}

// ============================================================================
// MODULE B6 REQUIREMENTS (Section 2.10)
// ============================================================================

export interface ModuleB6Declaration {
  isEnergyUsingProduct: boolean;
  energyConsumptionType: 'direct' | 'indirect'; // indirect = cables, transformers
  b6EnergyConsumption: {
    electricityKwh: number;
    gasKwh: number;
    otherEnergyKwh: number;
    totalKwh: number;
    perYear: number;
    referenceServiceLife: number; // years
  };
  scenarioDescription: string; // MANDATORY - describe use scenario
  regulatoryReference?: string; // Reference applicable regulations
  presentedSeparately: boolean; // MUST be true for ECO compliance
}

export interface LCAModuleResult {
  value: number;
  unit: string;
  description?: string;
}

export interface UseStageMaintenance {
  b2Maintenance: LCAModuleResult | null;
  b3Repair: LCAModuleResult | null;
  b4Replacement: LCAModuleResult | null;
  declaredServiceLife: number;
  maintenanceScheduleDescription: string;
}

// ============================================================================
// MANUFACTURING SITE LOCATION (Section 2.12)
// ============================================================================

export interface ManufacturingSite {
  country: string;
  city: string;
  state?: string; // For countries like Australia
  siteId?: string;
}

export interface MaterialProvenance {
  manufacturingSites: ManufacturingSite[];
  isMultiSite: boolean;
  representativeType?: 'average' | 'worst-case' | 'specific-site';
}

// ============================================================================
// DATA QUALITY REQUIREMENTS (Section 2.7)
// ============================================================================

export type DataQualityLevel = 'very-good' | 'good' | 'fair' | 'poor';
export type DataQualityRating = 'A' | 'B' | 'C' | 'D' | 'E';

export interface DataQualityIndicators {
  technologicalRepresentativeness: DataQualityLevel;
  geographicalRepresentativeness: DataQualityLevel;
  temporalRepresentativeness: DataQualityLevel;
  completeness: DataQualityLevel;
  reliability: DataQualityLevel;
  overallQualityRating: DataQualityRating;
  referenceYear: number;
  dataAge: number; // years since data collection
}

// ============================================================================
// MODULE D - NO MULTI-RECYCLING (Section 2.13)
// ============================================================================

export type ModuleDCalculationMethod = 'cut-off-100-0' | 'other';

export interface ModuleDCalculation {
  recyclingCredits: number;
  reuseCredits: number;
  energyRecoveryCredits: number;
  totalModuleD: number;
  includesMultiRecycling: boolean; // MUST be false for ECO compliance
  calculationMethod: ModuleDCalculationMethod;
}

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationResult {
  isCompliant: boolean;
  errors: string[];
  warnings?: string[];
  recommendations?: string[];
}

// ============================================================================
// ECO PLATFORM COMPLIANCE REPORT
// ============================================================================

export interface EcoPlatformComplianceReport {
  // Header declarations
  standardsCompliance: {
    en15804A2: boolean;
    ecoPlatformV2: boolean;
    iso14025: boolean;
    iso21930: boolean;
  };
  
  // Energy transparency (Section 2.5.3)
  energyTransparency: {
    electricityModellingApproach: ElectricityModellingApproach;
    electricityPercentageOfA1A3: number;
    electricityGwpKgCO2ePerKwh: number | null; // Required if >30%
    gasPercentageOfA1A3: number;
    gasGwpKgCO2ePerMJ: number | null; // Required if >30%
    contractualInstrumentsUsed: boolean;
    contractualInstrumentDetails?: string;
  };
  
  // Characterisation factors
  characterisationFactors: {
    version: string;
    source: string;
  };
  
  // Allocation statement
  allocationStatement: {
    coProductsPresent: boolean;
    allocationMethodUsed: string;
    economicAllocationForSlagFlyAsh: boolean;
  };
  
  // Data quality summary
  dataQuality: {
    overallRating: string;
    temporalCoverage: string;
    geographicalCoverage: string;
  };
  
  // Manufacturing locations
  manufacturingLocations: ManufacturingSite[];
  
  // Biogenic carbon
  biogenicCarbon: {
    totalBiogenicCarbonKgC: number;
    biogenicCarbonKgCO2e: number | null;
    packagingBiogenicBalanced: boolean;
  };
  
  // Compliance validation
  complianceValidation: {
    isFullyCompliant: boolean;
    nonCompliantItems: string[];
    warnings: string[];
    complianceScore: number; // 0-100
  };
  
  // Metadata
  generatedAt: string;
  projectId: string;
  projectName: string;
}

// ============================================================================
// MATERIAL WITH ECO PLATFORM FIELDS
// ============================================================================

export interface EcoPlatformMaterial {
  id: string;
  materialName: string;
  materialCategory: string;
  
  // ECO Platform specific fields
  characterisationFactorVersion: CharacterisationFactorVersion;
  allocationMethod: AllocationMethod | null;
  isCoProduct: boolean;
  coProductType: CoProductType | null;
  usesMassBalance: boolean;
  biogenicCarbonKgC: number | null;
  biogenicCarbonPercentage: number | null;
  manufacturingCountry: string | null;
  manufacturingCity: string | null;
  ecoinventMethodology: EcoinventMethodology | null;
  ecoPlatformCompliant: boolean;
  dataQualityRating: DataQualityRating | null;
  referenceYear: number | null;
  dataRepresentativeness: DataQualityIndicators | null;
}

// ============================================================================
// PROJECT WITH ECO PLATFORM FIELDS
// ============================================================================

export interface EcoPlatformProject {
  id: string;
  name: string;
  
  // ECO Platform specific fields
  electricityPercentageA1A3: number | null;
  electricityModellingApproach: ElectricityModellingApproach;
  gridFactorSource: string | null;
  ecoComplianceEnabled: boolean;
  ecoComplianceReport: EcoPlatformComplianceReport | null;
}
