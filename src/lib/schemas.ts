import { z } from 'zod';

// Material schema for Scope 3 materials
export const materialItemSchema = z.object({
  id: z.string(),
  name: z.string().max(200, 'Material name too long'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().max(50, 'Unit too long'),
  factor: z.number().min(0, 'Factor must be positive'),
  category: z.string().max(100, 'Category too long'),
  source: z.string().max(200, 'Source too long'),
  isCustom: z.boolean(),
});

export type MaterialItem = z.infer<typeof materialItemSchema>;

// Fuel input schema for Scope 1
export const fuelInputSchema = z.object({
  diesel_transport: z.number().min(0).optional(),
  diesel_stationary: z.number().min(0).optional(),
  petrol: z.number().min(0).optional(),
  lpg: z.number().min(0).optional(),
  natural_gas: z.number().min(0).optional(),
});

export type FuelInput = z.infer<typeof fuelInputSchema>;

// Electricity input schema for Scope 2
export const electricityInputSchema = z.object({
  kwh: z.number().min(0).optional(),
});

export type ElectricityInput = z.infer<typeof electricityInputSchema>;

// Transport input schema for Scope 3
export const transportInputSchema = z.object({
  commute_car: z.number().min(0).optional(),
  commute_ute: z.number().min(0).optional(),
  waste: z.number().min(0).optional(),
});

export type TransportInput = z.infer<typeof transportInputSchema>;

// Totals schema
export const totalsSchema = z.object({
  scope1: z.number().min(0),
  scope2: z.number().min(0),
  scope3_materials: z.number().min(0),
  scope3_transport: z.number().min(0),
  total: z.number().min(0),
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
    console.error(`Invalid ${fieldName} data:`, error);
    return fallback;
  }
}

// Helper to validate array of items
export function parseJsonbArray<T>(
  data: unknown,
  itemSchema: z.ZodSchema<T>,
  fieldName: string
): T[] {
  if (!Array.isArray(data)) {
    console.error(`${fieldName} is not an array`);
    return [];
  }
  
  return data
    .map((item, index) => {
      try {
        return itemSchema.parse(item);
      } catch (error) {
        console.error(`Invalid ${fieldName} item at index ${index}:`, error);
        return null;
      }
    })
    .filter((item): item is T => item !== null);
}
