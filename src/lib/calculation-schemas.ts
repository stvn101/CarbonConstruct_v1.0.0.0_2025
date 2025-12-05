/**
 * Calculation Validation Schemas
 *
 * Zod schemas for validating carbon calculation inputs
 * Ensures data integrity and type safety at runtime
 */

import { z } from 'zod';

/**
 * Common validation rules
 */
const positiveNumber = z.number().positive('Must be a positive number');
const optionalString = z.string().optional();
const requiredString = z.string().min(1, 'Required field');

/**
 * Scope 1 Form Data Schemas
 */

export const fuelCombustionEntrySchema = z.object({
  fuelType: requiredString,
  quantity: positiveNumber,
  unit: requiredString,
  notes: optionalString,
});

export const vehicleEntrySchema = z.object({
  vehicleType: requiredString,
  fuelType: requiredString,
  quantity: positiveNumber,
  unit: requiredString,
  notes: optionalString,
});

export const processEntrySchema = z.object({
  processType: requiredString,
  quantity: positiveNumber,
  unit: requiredString,
  notes: optionalString,
});

export const fugitiveEmissionEntrySchema = z.object({
  refrigerantType: requiredString,
  quantity: positiveNumber,
  unit: requiredString,
  notes: optionalString,
});

export const scope1FormDataSchema = z.object({
  fuelCombustion: z.array(fuelCombustionEntrySchema).optional(),
  vehicles: z.array(vehicleEntrySchema).optional(),
  processes: z.array(processEntrySchema).optional(),
  fugitiveEmissions: z.array(fugitiveEmissionEntrySchema).optional(),
}).refine(
  (data) => {
    // At least one array must have items
    const hasFuel = (data.fuelCombustion?.length ?? 0) > 0;
    const hasVehicles = (data.vehicles?.length ?? 0) > 0;
    const hasProcesses = (data.processes?.length ?? 0) > 0;
    const hasFugitive = (data.fugitiveEmissions?.length ?? 0) > 0;
    return hasFuel || hasVehicles || hasProcesses || hasFugitive;
  },
  {
    message: 'At least one emission source must be provided',
  }
);

/**
 * Scope 2 Form Data Schemas
 */

export const electricityEntrySchema = z.object({
  quantity: positiveNumber,
  unit: z.enum(['kWh', 'MWh', 'GJ'], {
    errorMap: () => ({ message: 'Unit must be kWh, MWh, or GJ' }),
  }),
  state: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']).optional(),
  renewablePercentage: z.number()
    .min(0, 'Renewable percentage must be at least 0')
    .max(100, 'Renewable percentage must be at most 100')
    .optional(),
  notes: optionalString,
});

export const heatingEntrySchema = z.object({
  quantity: positiveNumber,
  unit: z.enum(['kWh', 'MWh', 'GJ', 'm3'], {
    errorMap: () => ({ message: 'Unit must be kWh, MWh, GJ, or m3' }),
  }),
  state: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']).optional(),
  notes: optionalString,
});

export const steamEntrySchema = z.object({
  quantity: positiveNumber,
  unit: z.enum(['GJ', 'MMBtu', 'tonnes', 'klb'], {
    errorMap: () => ({ message: 'Unit must be GJ, MMBtu, tonnes, or klb' }),
  }),
  state: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']).optional(),
  notes: optionalString,
});

export const scope2FormDataSchema = z.object({
  electricity: z.array(electricityEntrySchema).optional(),
  heating: z.array(heatingEntrySchema).optional(),
  steam: z.array(steamEntrySchema).optional(),
}).refine(
  (data) => {
    // At least one array must have items
    const hasElectricity = (data.electricity?.length ?? 0) > 0;
    const hasHeating = (data.heating?.length ?? 0) > 0;
    const hasSteam = (data.steam?.length ?? 0) > 0;
    return hasElectricity || hasHeating || hasSteam;
  },
  {
    message: 'At least one energy source must be provided',
  }
);

/**
 * Scope 3 Form Data Schemas
 */

export const activityEntrySchema = z.object({
  category: z.number()
    .int('Category must be an integer')
    .min(1, 'Category must be between 1 and 15')
    .max(15, 'Category must be between 1 and 15'),
  categoryName: optionalString,
  subcategory: optionalString,
  description: optionalString,
  lcaStage: optionalString,
  quantity: positiveNumber,
  unit: requiredString,
  emissionFactor: positiveNumber,
  supplierData: z.boolean().optional(),
  notes: optionalString,
});

export const scope3FormDataSchema = z.object({
  upstreamActivities: z.array(activityEntrySchema).optional(),
  downstreamActivities: z.array(activityEntrySchema).optional(),
}).refine(
  (data) => {
    // At least one array must have items
    const hasUpstream = (data.upstreamActivities?.length ?? 0) > 0;
    const hasDownstream = (data.downstreamActivities?.length ?? 0) > 0;
    return hasUpstream || hasDownstream;
  },
  {
    message: 'At least one activity (upstream or downstream) must be provided',
  }
);

/**
 * Type exports - inferred from schemas for type safety
 */
export type FuelCombustionEntry = z.infer<typeof fuelCombustionEntrySchema>;
export type VehicleEntry = z.infer<typeof vehicleEntrySchema>;
export type ProcessEntry = z.infer<typeof processEntrySchema>;
export type FugitiveEmissionEntry = z.infer<typeof fugitiveEmissionEntrySchema>;
export type Scope1FormData = z.infer<typeof scope1FormDataSchema>;

export type ElectricityEntry = z.infer<typeof electricityEntrySchema>;
export type HeatingEntry = z.infer<typeof heatingEntrySchema>;
export type SteamEntry = z.infer<typeof steamEntrySchema>;
export type Scope2FormData = z.infer<typeof scope2FormDataSchema>;

export type ActivityEntry = z.infer<typeof activityEntrySchema>;
export type Scope3FormData = z.infer<typeof scope3FormDataSchema>;

/**
 * Validation helper functions
 */

export function validateScope1Data(data: unknown) {
  return scope1FormDataSchema.safeParse(data);
}

export function validateScope2Data(data: unknown) {
  return scope2FormDataSchema.safeParse(data);
}

export function validateScope3Data(data: unknown) {
  return scope3FormDataSchema.safeParse(data);
}

/**
 * Error formatter for better user-facing error messages
 */
export function formatValidationErrors(errors: z.ZodError): string {
  return errors.errors
    .map((error) => {
      const path = error.path.join(' → ');
      return `${path}: ${error.message}`;
    })
    .join('\n');
}
