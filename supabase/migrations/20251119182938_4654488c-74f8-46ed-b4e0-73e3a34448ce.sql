-- Phase 1: Add database constraints for input validation

-- Add reasonable bounds to scope1_emissions
ALTER TABLE scope1_emissions 
  ADD CONSTRAINT quantity_bounds CHECK (quantity >= 0 AND quantity <= 10000000),
  ADD CONSTRAINT emissions_bounds CHECK (emissions_tco2e >= 0 AND emissions_tco2e <= 100000000);

-- Add reasonable bounds to scope2_emissions
ALTER TABLE scope2_emissions 
  ADD CONSTRAINT quantity_bounds CHECK (quantity >= 0 AND quantity <= 10000000),
  ADD CONSTRAINT emissions_bounds CHECK (emissions_tco2e >= 0 AND emissions_tco2e <= 100000000);

-- Add reasonable bounds to scope3_emissions
ALTER TABLE scope3_emissions 
  ADD CONSTRAINT quantity_bounds CHECK (quantity >= 0 AND quantity <= 10000000),
  ADD CONSTRAINT emissions_bounds CHECK (emissions_tco2e >= 0 AND emissions_tco2e <= 100000000);

-- Ensure unified_calculations has version column for optimistic locking (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'unified_calculations' AND column_name = 'version'
  ) THEN
    ALTER TABLE unified_calculations 
      ADD COLUMN version INTEGER NOT NULL DEFAULT 1;
  END IF;
END $$;