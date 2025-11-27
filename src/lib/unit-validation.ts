import { z } from 'zod';
import { logger } from '@/lib/logger';

/**
 * Standard units for different input types in the calculator
 * All stored values should be in kgCO2e, displayed in tCO2e
 */
export const STANDARD_UNITS = {
  // Material units
  materials: ['kg', 'm³', 'm²', 'm', 'unit', 'tonne', 't'],
  // Fuel units
  fuel: ['L', 'kL', 'GJ', 'm³'],
  // Electricity units
  electricity: ['kWh', 'MWh', 'GJ'],
  // Transport units
  transport: ['km', 'tonne-km', 't-km'],
  // Emission output units
  emissions: {
    stored: 'kgCO2e',
    display: 'tCO2e',
    conversionFactor: 1000 // kgCO2e / 1000 = tCO2e
  }
} as const;

/**
 * Validation schema for material with unit checking
 */
export const MaterialUnitSchema = z.object({
  name: z.string(),
  quantity: z.number().nonnegative(),
  unit: z.enum(['kg', 'm³', 'm²', 'm', 'unit', 'tonne', 't'] as const),
  emissionFactor: z.number().nonnegative(),
  totalEmissions: z.number() // Can be negative for sequestration
});

/**
 * Validation schema for fuel input with unit checking
 */
export const FuelUnitSchema = z.object({
  fuelType: z.string(),
  quantity: z.number().nonnegative(),
  unit: z.enum(['L', 'kL', 'GJ', 'm³'] as const),
  emissionFactor: z.number().nonnegative(),
  totalEmissions: z.number().nonnegative()
});

/**
 * Validation schema for electricity input with unit checking
 */
export const ElectricityUnitSchema = z.object({
  state: z.string(),
  quantity: z.number().nonnegative(),
  unit: z.enum(['kWh', 'MWh', 'GJ'] as const),
  emissionFactor: z.number().nonnegative(),
  totalEmissions: z.number().nonnegative()
});

/**
 * Validation schema for transport input with unit checking
 */
export const TransportUnitSchema = z.object({
  mode: z.string(),
  distance: z.number().nonnegative(),
  weight: z.number().nonnegative(),
  emissionFactor: z.number().nonnegative(),
  totalEmissions: z.number().nonnegative()
});

export interface UnitValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  correctedData?: any;
}

/**
 * Validates that stored emissions are in kgCO2e and flags potential unit issues
 */
export function validateEmissionUnits(
  storedValue: number,
  displayValue: number,
  fieldName: string
): UnitValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Expected: storedValue (kgCO2e) / 1000 ≈ displayValue (tCO2e)
  const expectedDisplay = storedValue / STANDARD_UNITS.emissions.conversionFactor;
  const tolerance = 0.01; // 1% tolerance for floating point
  
  if (Math.abs(expectedDisplay - displayValue) / Math.max(expectedDisplay, 1) > tolerance) {
    warnings.push(
      `${fieldName}: Potential unit mismatch. Stored: ${storedValue.toFixed(2)} kgCO2e, ` +
      `Display: ${displayValue.toFixed(2)} tCO2e (expected ${expectedDisplay.toFixed(2)} tCO2e)`
    );
  }
  
  // Flag suspiciously large values that might indicate wrong units
  if (storedValue > 1000000000) { // > 1 billion kg = 1 million tonnes
    warnings.push(
      `${fieldName}: Unusually large value (${storedValue.toLocaleString()} kgCO2e). ` +
      `Verify this is correct.`
    );
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates material data and checks for unit consistency
 */
export function validateMaterialData(materials: any[]): UnitValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const correctedData: any[] = [];
  
  materials.forEach((mat, index) => {
    // Check if unit is valid
    if (!STANDARD_UNITS.materials.includes(mat.unit)) {
      warnings.push(`Material ${index + 1} (${mat.name}): Non-standard unit "${mat.unit}"`);
    }
    
    // Validate emission calculation
    const expectedEmissions = (mat.quantity * mat.emissionFactor);
    const storedEmissions = mat.totalEmissions * 1000; // Convert back to kg for comparison
    const tolerance = 1; // Allow 1 kg tolerance
    
    if (Math.abs(expectedEmissions - storedEmissions) > tolerance) {
      warnings.push(
        `Material ${index + 1} (${mat.name}): Emission calculation mismatch. ` +
        `Expected: ${(expectedEmissions / 1000).toFixed(4)} tCO2e, ` +
        `Stored: ${mat.totalEmissions.toFixed(4)} tCO2e`
      );
    }
    
    // Check for negative quantities (should only be sequestration)
    if (mat.quantity < 0 && !mat.name.toLowerCase().includes('timber') && 
        !mat.name.toLowerCase().includes('wood') && !mat.name.toLowerCase().includes('sequester')) {
      warnings.push(
        `Material ${index + 1} (${mat.name}): Negative quantity may indicate data error`
      );
    }
    
    correctedData.push({
      ...mat,
      unit: mat.unit || 'kg'
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    correctedData
  };
}

/**
 * Validates fuel input data
 */
export function validateFuelData(fuelInputs: any[]): UnitValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  fuelInputs.forEach((fuel, index) => {
    if (!STANDARD_UNITS.fuel.includes(fuel.unit)) {
      warnings.push(`Fuel ${index + 1} (${fuel.fuelType}): Non-standard unit "${fuel.unit}"`);
    }
    
    // Validate reasonable ranges
    if (fuel.quantity > 1000000) { // > 1 million litres
      warnings.push(
        `Fuel ${index + 1} (${fuel.fuelType}): Unusually high quantity (${fuel.quantity.toLocaleString()} ${fuel.unit})`
      );
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates electricity input data
 */
export function validateElectricityData(electricityInputs: any[]): UnitValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  electricityInputs.forEach((elec, index) => {
    if (!STANDARD_UNITS.electricity.includes(elec.unit)) {
      warnings.push(`Electricity ${index + 1} (${elec.state}): Non-standard unit "${elec.unit}"`);
    }
    
    // Validate reasonable ranges for a construction project
    if (elec.quantity > 10000000) { // > 10 million kWh
      warnings.push(
        `Electricity ${index + 1} (${elec.state}): Unusually high quantity (${elec.quantity.toLocaleString()} ${elec.unit})`
      );
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates totals consistency
 */
export function validateTotals(totals: {
  scope1: number;
  scope2: number;
  scope3_materials: number;
  scope3_transport: number;
  total: number;
}): UnitValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const calculatedTotal = totals.scope1 + totals.scope2 + totals.scope3_materials + totals.scope3_transport;
  const tolerance = 1; // 1 kg tolerance
  
  if (Math.abs(calculatedTotal - totals.total) > tolerance) {
    warnings.push(
      `Total mismatch: Sum of scopes (${calculatedTotal.toFixed(2)}) ` +
      `doesn't match stored total (${totals.total.toFixed(2)})`
    );
  }
  
  // Check for unrealistic totals
  if (totals.total > 1000000000) { // > 1 million tonnes
    warnings.push(
      `Total emissions (${(totals.total / 1000).toLocaleString()} tCO2e) seem unusually high. ` +
      `Please verify calculations.`
    );
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Master validation function for all calculation data
 */
export function validateCalculationData(data: {
  materials: any[];
  fuelInputs: any[];
  electricityInputs: any[];
  transportInputs: any[];
  totals: any;
}): UnitValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  const materialResult = validateMaterialData(data.materials);
  const fuelResult = validateFuelData(data.fuelInputs);
  const electricityResult = validateElectricityData(data.electricityInputs);
  const totalsResult = validateTotals(data.totals);
  
  allErrors.push(...materialResult.errors, ...fuelResult.errors, 
                 ...electricityResult.errors, ...totalsResult.errors);
  allWarnings.push(...materialResult.warnings, ...fuelResult.warnings,
                   ...electricityResult.warnings, ...totalsResult.warnings);
  
  // Log validation results
  if (allWarnings.length > 0) {
    logger.warn('UnitValidation:warnings', allWarnings.join('; '));
  }
  if (allErrors.length > 0) {
    logger.error('UnitValidation:errors', allErrors.join('; '));
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Converts value between units with validation
 */
export function convertEmissionUnits(
  value: number, 
  fromUnit: 'kgCO2e' | 'tCO2e', 
  toUnit: 'kgCO2e' | 'tCO2e'
): number {
  if (fromUnit === toUnit) return value;
  
  if (fromUnit === 'kgCO2e' && toUnit === 'tCO2e') {
    return value / 1000;
  }
  
  if (fromUnit === 'tCO2e' && toUnit === 'kgCO2e') {
    return value * 1000;
  }
  
  return value;
}
