import { z } from 'zod';

/**
 * Zod schemas for runtime validation
 */

export const LCAMaterialSchema = z.object({
  id: z.string().uuid(),
  material_name: z.string().min(1).max(200),
  material_category: z.string().min(1).max(100),
  embodied_carbon_a1a3: z.number().min(0).max(100000),
  embodied_carbon_a4: z.number().min(0).max(100000),
  embodied_carbon_a5: z.number().min(0).max(100000),
  embodied_carbon_total: z.number().min(0).max(300000),
  unit: z.string().min(1).max(50),
  region: z.string().max(100),
  data_source: z.string().max(200),
});

export const MaterialInputSchema = z.object({
  name: z.string().min(1, 'Material name is required').max(200),
  quantity: z.number().min(0, 'Quantity must be positive').max(10000000),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().min(1, 'Category is required'),
  factor: z.number().min(0),
});

export const UnifiedCalculationSchema = z.object({
  project_id: z.string().uuid(),
  user_id: z.string().uuid(),
  materials: z.array(MaterialInputSchema).default([]),
  fuel_inputs: z.record(z.string(), z.number().min(0)).default({}),
  electricity_inputs: z.record(z.string(), z.number().min(0)).default({}),
  transport_inputs: z.record(z.string(), z.number().min(0)).default({}),
  totals: z.object({
    scope1: z.number().min(0),
    scope2: z.number().min(0),
    scope3_materials: z.number().min(0),
    scope3_transport: z.number().min(0),
    total: z.number().min(0),
  }),
  is_draft: z.boolean().default(true),
  version: z.number().int().min(1).default(1),
});

export type LCAMaterial = z.infer<typeof LCAMaterialSchema>;
export type MaterialInput = z.infer<typeof MaterialInputSchema>;
export type UnifiedCalculation = z.infer<typeof UnifiedCalculationSchema>;
