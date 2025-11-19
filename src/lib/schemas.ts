import { z } from 'zod';

// Calculator material schema (for legacy Calculator component)
export const calculatorMaterialSchema = z.object({
  id: z.string(),
  name: z.string().max(200, 'Material name too long'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().max(50, 'Unit too long'),
  factor: z.number().min(0, 'Factor must be positive'),
  category: z.string().max(100, 'Category too long'),
  source: z.string().max(200, 'Source too long'),
  isCustom: z.boolean(),
});

export type CalculatorMaterial = z.infer<typeof calculatorMaterialSchema>;

// Unified calculations material schema (for unified_calculations table)
export const unifiedMaterialSchema = z.object({
  name: z.string().max(200, 'Material name too long'),
  category: z.string().max(100, 'Category too long'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().max(50, 'Unit too long'),
  emissionFactor: z.number().min(0, 'Emission factor must be positive'),
  totalEmissions: z.number().min(0, 'Total emissions must be positive'),
  source: z.string().max(200, 'Source too long').optional(),
  customNotes: z.string().max(500, 'Notes too long').optional(),
});

export type UnifiedMaterial = z.infer<typeof unifiedMaterialSchema>;

// Keep as alias for backward compatibility
export const materialItemSchema = calculatorMaterialSchema;
export type MaterialItem = CalculatorMaterial;

// Fuel input schema for Scope 1
export const fuelInputSchema = z.object({
  fuelType: z.string().max(100, 'Fuel type too long'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().max(50, 'Unit too long'),
  emissionFactor: z.number().min(0, 'Emission factor must be positive'),
  totalEmissions: z.number().min(0, 'Total emissions must be positive'),
});

export type FuelInput = z.infer<typeof fuelInputSchema>;

// Electricity input schema for Scope 2
export const electricityInputSchema = z.object({
  state: z.string().max(50, 'State too long'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().max(50, 'Unit too long'),
  emissionFactor: z.number().min(0, 'Emission factor must be positive'),
  totalEmissions: z.number().min(0, 'Total emissions must be positive'),
  renewablePercentage: z.number().min(0).max(100, 'Must be between 0-100').optional(),
});

export type ElectricityInput = z.infer<typeof electricityInputSchema>;

// Transport input schema for Scope 3
export const transportInputSchema = z.object({
  mode: z.string().max(100, 'Transport mode too long'),
  distance: z.number().min(0, 'Distance must be positive'),
  weight: z.number().min(0, 'Weight must be positive'),
  emissionFactor: z.number().min(0, 'Emission factor must be positive'),
  totalEmissions: z.number().min(0, 'Total emissions must be positive'),
});

export type TransportInput = z.infer<typeof transportInputSchema>;

// Totals schema
export const totalsSchema = z.object({
  scope1: z.number().min(0, 'Scope 1 must be positive'),
  scope2: z.number().min(0, 'Scope 2 must be positive'),
  scope3_materials: z.number().min(0, 'Scope 3 materials must be positive'),
  scope3_transport: z.number().min(0, 'Scope 3 transport must be positive'),
  total: z.number().min(0, 'Total must be positive'),
});

export type Totals = z.infer<typeof totalsSchema>;

// Complete unified calculation data schema
export const unifiedCalculationDataSchema = z.object({
  materials: z.array(materialItemSchema),
  fuelInputs: z.array(fuelInputSchema),
  electricityInputs: z.array(electricityInputSchema),
  transportInputs: z.array(transportInputSchema),
  totals: totalsSchema,
});

export type UnifiedCalculationData = z.infer<typeof unifiedCalculationDataSchema>;

// Helper function to safely parse JSONB data with fallback
export function parseJsonbField<T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  fieldName: string,
  fallback: T
): T {
  try {
    const parsed = schema.parse(data);
    return parsed;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[Validation Error] Invalid ${fieldName} data:`, error);
    }
    return fallback;
  }
}

// Helper to validate array of items with detailed error reporting
export function parseJsonbArray<T>(
  data: unknown,
  itemSchema: z.ZodSchema<T>,
  fieldName: string
): T[] {
  if (!Array.isArray(data)) {
    if (import.meta.env.DEV) {
      console.error(`[Validation Error] ${fieldName} is not an array, got:`, typeof data);
    }
    return [];
  }
  
  const validItems: T[] = [];
  const errors: Array<{ index: number; error: any }> = [];
  
  data.forEach((item, index) => {
    try {
      const parsed = itemSchema.parse(item);
      validItems.push(parsed);
    } catch (error) {
      errors.push({ index, error });
    }
  });
  
  if (errors.length > 0 && import.meta.env.DEV) {
    console.error(`[Validation Error] ${errors.length} invalid items in ${fieldName}:`, errors);
  }
  
  return validItems;
}
