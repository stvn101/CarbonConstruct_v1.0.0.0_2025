import { z } from 'zod';

// Material validation schema
export const MaterialSchema = z.object({
  id: z.string(),
  category: z.string().min(1).max(50),
  typeId: z.string().min(1).max(50),
  name: z.string().min(1, "Material name is required").max(100, "Material name too long"),
  unit: z.string().min(1).max(20),
  factor: z.number().nonnegative("Emission factor cannot be negative").max(100000, "Emission factor too high"),
  source: z.string().max(100),
  quantity: z.number().nonnegative("Quantity cannot be negative").max(1000000, "Quantity too large"),
  isCustom: z.boolean()
});

// Fuel inputs validation schema
export const FuelInputsSchema = z.record(
  z.string().max(50), 
  z.union([
    z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
    z.number().nonnegative("Quantity cannot be negative").max(1000000, "Quantity too large")
  ])
);

// Electricity inputs validation schema
export const ElectricityInputsSchema = z.object({
  kwh: z.union([
    z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
    z.number().nonnegative("Quantity cannot be negative").max(10000000, "Quantity too large")
  ]).optional()
});

// Transport inputs validation schema
export const TransportInputsSchema = z.record(
  z.string().max(50),
  z.union([
    z.string().regex(/^\d*\.?\d*$/, "Must be a valid number"),
    z.number().nonnegative("Quantity cannot be negative").max(10000000, "Quantity too large")
  ])
);

// Project details validation schema
export const ProjectDetailsSchema = z.object({
  name: z.string().max(200, "Project name too long").optional(),
  location: z.enum(['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT']),
  period: z.string().max(100).optional(),
  auditor: z.string().max(100).optional()
});

// Complete calculation data validation schema
export const CalculationDataSchema = z.object({
  projectDetails: ProjectDetailsSchema,
  materials: z.array(MaterialSchema).max(500, "Too many materials (max 500)"),
  fuelInputs: FuelInputsSchema,
  electricityInputs: ElectricityInputsSchema,
  transportInputs: TransportInputsSchema
});

export type ValidationResult = {
  valid: boolean;
  errors?: string[];
  data?: z.infer<typeof CalculationDataSchema>;
};
