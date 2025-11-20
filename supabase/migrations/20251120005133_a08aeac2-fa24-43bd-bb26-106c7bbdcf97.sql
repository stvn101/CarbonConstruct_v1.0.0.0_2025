-- Update default values to be arrays instead of objects for better data consistency
ALTER TABLE unified_calculations 
  ALTER COLUMN fuel_inputs SET DEFAULT '[]'::jsonb;

ALTER TABLE unified_calculations 
  ALTER COLUMN electricity_inputs SET DEFAULT '[]'::jsonb;

ALTER TABLE unified_calculations 
  ALTER COLUMN transport_inputs SET DEFAULT '[]'::jsonb;