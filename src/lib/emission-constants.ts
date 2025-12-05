/**
 * Emission Constants
 *
 * Centralized emission factors and constants for carbon calculations
 * All factors are based on Australian standards (NMEF v2025.1, NGA Factors 2023)
 */

/**
 * Australian Grid Emission Factors by State/Territory
 * Unit: kg CO2-e per kWh
 * Source: National Greenhouse Accounts Factors 2023
 */
export const AUSTRALIAN_GRID_EMISSION_FACTORS = {
  NSW: 0.79,  // New South Wales
  VIC: 1.02,  // Victoria (highest - brown coal)
  QLD: 0.81,  // Queensland
  SA: 0.55,   // South Australia (high renewable penetration)
  WA: 0.70,   // Western Australia
  TAS: 0.17,  // Tasmania (lowest - mostly hydro)
  NT: 0.58,   // Northern Territory
  ACT: 0.79,  // Australian Capital Territory
} as const;

/**
 * Default grid emission factor (used when state is not specified)
 * Uses NSW factor as national average approximation
 */
export const DEFAULT_GRID_EMISSION_FACTOR = 0.79;

/**
 * Scope 1 Default Emission Factors
 * Used as fallbacks when database lookup fails
 */
export const SCOPE1_DEFAULT_FACTORS = {
  // Fuel Combustion (kg CO2-e per liter/kg)
  DIESEL: 2.31,        // kg CO2-e per liter
  PETROL: 2.23,        // kg CO2-e per liter
  LPG: 1.51,           // kg CO2-e per liter
  NATURAL_GAS: 1.93,   // kg CO2-e per cubic meter

  // Company Vehicles (kg CO2-e per km)
  VEHICLE_DEFAULT: 0.2,  // Average vehicle emissions

  // Industrial Processes (kg CO2-e per unit)
  PROCESS_DEFAULT: 1.0,

  // Fugitive Emissions - Global Warming Potential (kg CO2-e per kg)
  R134A: 1810,    // Common refrigerant
  R410A: 2088,    // Air conditioning refrigerant
  R404A: 3922,    // Commercial refrigeration
  R32: 675,       // Modern air conditioning
  CO2: 1,         // Carbon dioxide baseline
} as const;

/**
 * Scope 2 Energy Emission Factors
 */
export const SCOPE2_EMISSION_FACTORS = {
  // Natural Gas Heating/Cooling
  NATURAL_GAS: 0.185,  // kg CO2-e per kWh

  // Purchased Steam
  STEAM_PER_GJ: 0.3,   // tCO2-e per GJ (already in tonnes)
} as const;

/**
 * Unit Conversion Factors
 * For converting between different energy and mass units
 */
export const UNIT_CONVERSION_FACTORS = {
  // Energy Conversions to kWh
  MWH_TO_KWH: 1000,
  GJ_TO_KWH: 277.778,
  M3_GAS_TO_KWH: 10.55,  // Natural gas cubic meters to kWh

  // Steam Energy Conversions to GJ
  MMBTU_TO_GJ: 1.055,
  TONNES_STEAM_TO_GJ: 2.5,
  KLB_TO_GJ: 1.134,

  // Mass Conversions
  KG_TO_TONNES: 0.001,
  TONNES_TO_KG: 1000,
} as const;

/**
 * Emission Unit Standards
 * Defines the standard units used throughout the application
 */
export const EMISSION_UNITS = {
  STORED: 'kgCO2e',      // How emissions are stored in database
  DISPLAY: 'tCO2e',      // How emissions are displayed to users
  CONVERSION_FACTOR: 1000, // Factor to convert between stored and display units
} as const;

/**
 * Data Quality Levels
 * Used to indicate the accuracy and source of emission data
 */
export const DATA_QUALITY_LEVELS = {
  MEASURED: 'measured',                 // Direct measurement
  SUPPLIER_SPECIFIC: 'supplier_specific', // From supplier data
  ESTIMATED: 'estimated',               // Calculated estimate
  INDUSTRY_AVERAGE: 'industry_average', // Industry standard factor
} as const;

/**
 * Calculation Methods
 * Standard methods for calculating emissions
 */
export const CALCULATION_METHODS = {
  ACTIVITY_DATA_X_FACTOR: 'activity_data_x_emission_factor',
  LOCATION_BASED: 'location_based',
  MARKET_BASED: 'market_based',
  SPEND_BASED: 'spend_based',
} as const;

/**
 * LCA (Life Cycle Assessment) Module Labels
 * Based on EN 15978 standard
 */
export const LCA_MODULES = {
  // Product Stage (A1-A3)
  A1: 'Raw material supply',
  A2: 'Transport to manufacturer',
  A3: 'Manufacturing',

  // Construction Stage (A4-A5)
  A4: 'Transport to site',
  A5: 'Construction/Installation',

  // Use Stage (B1-B7)
  B1: 'Use',
  B2: 'Maintenance',
  B3: 'Repair',
  B4: 'Replacement',
  B5: 'Refurbishment',
  B6: 'Operational energy use',
  B7: 'Operational water use',

  // End of Life Stage (C1-C4)
  C1: 'Deconstruction/Demolition',
  C2: 'Transport to waste processing',
  C3: 'Waste processing',
  C4: 'Disposal',

  // Benefits Beyond System Boundary (D)
  D: 'Reuse/Recovery/Recycling potential',
} as const;

/**
 * Compliance Thresholds
 * Australian building standards compliance levels
 */
export const COMPLIANCE_THRESHOLDS = {
  // NCC Section J targets (kg CO2-e per m² per year)
  NCC_SECTION_J: {
    CLASS_5_6: 60,      // Office buildings
    CLASS_9B: 45,       // Hospitals
    CLASS_9C: 50,       // Aged care
    RESIDENTIAL: 40,    // Residential
  },

  // Green Star rating thresholds (kg CO2-e per m² per year)
  GREEN_STAR: {
    FOUR_STAR: 80,
    FIVE_STAR: 60,
    SIX_STAR: 40,
  },

  // NABERS Energy rating equivalents (kg CO2-e per m² per year)
  NABERS: {
    TWO_STAR: 100,
    THREE_STAR: 80,
    FOUR_STAR: 60,
    FIVE_STAR: 40,
    SIX_STAR: 20,
  },
} as const;

/**
 * Helper function to get emission factor for a state
 * Returns default factor if state not found
 */
export function getStateEmissionFactor(state?: string): number {
  if (!state) return DEFAULT_GRID_EMISSION_FACTOR;

  const stateKey = state.toUpperCase() as keyof typeof AUSTRALIAN_GRID_EMISSION_FACTORS;
  return AUSTRALIAN_GRID_EMISSION_FACTORS[stateKey] ?? DEFAULT_GRID_EMISSION_FACTOR;
}

/**
 * Helper function to convert emissions between units
 */
export function convertEmissionUnits(
  value: number,
  from: 'kgCO2e' | 'tCO2e',
  to: 'kgCO2e' | 'tCO2e'
): number {
  if (from === to) return value;

  if (from === 'kgCO2e' && to === 'tCO2e') {
    return value / EMISSION_UNITS.CONVERSION_FACTOR;
  }

  if (from === 'tCO2e' && to === 'kgCO2e') {
    return value * EMISSION_UNITS.CONVERSION_FACTOR;
  }

  return value;
}

/**
 * Type exports for TypeScript
 */
export type StateCode = keyof typeof AUSTRALIAN_GRID_EMISSION_FACTORS;
export type DataQuality = typeof DATA_QUALITY_LEVELS[keyof typeof DATA_QUALITY_LEVELS];
export type CalculationMethod = typeof CALCULATION_METHODS[keyof typeof CALCULATION_METHODS];
export type LCAModule = keyof typeof LCA_MODULES;
