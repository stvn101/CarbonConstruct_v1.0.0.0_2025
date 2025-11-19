-- Add reasonable bounds constraints to emissions tables for defense-in-depth security

-- Scope 1 Emissions: Add constraints for quantity and emissions values
ALTER TABLE scope1_emissions 
ADD CONSTRAINT scope1_quantity_reasonable CHECK (quantity >= 0 AND quantity <= 10000000),
ADD CONSTRAINT scope1_emissions_reasonable CHECK (emissions_tco2e >= 0 AND emissions_tco2e <= 100000000);

-- Scope 2 Emissions: Add constraints for quantity and emissions values
ALTER TABLE scope2_emissions 
ADD CONSTRAINT scope2_quantity_reasonable CHECK (quantity >= 0 AND quantity <= 10000000),
ADD CONSTRAINT scope2_emissions_reasonable CHECK (emissions_tco2e >= 0 AND emissions_tco2e <= 100000000);

-- Scope 3 Emissions: Add constraints for quantity and emissions values
ALTER TABLE scope3_emissions 
ADD CONSTRAINT scope3_quantity_reasonable CHECK (quantity >= 0 AND quantity <= 10000000),
ADD CONSTRAINT scope3_emissions_reasonable CHECK (emissions_tco2e >= 0 AND emissions_tco2e <= 100000000);

COMMENT ON CONSTRAINT scope1_quantity_reasonable ON scope1_emissions IS 'Defense-in-depth: Prevent extreme quantity values (max 10M units)';
COMMENT ON CONSTRAINT scope1_emissions_reasonable ON scope1_emissions IS 'Defense-in-depth: Prevent extreme emission values (max 100M tCO2e)';
COMMENT ON CONSTRAINT scope2_quantity_reasonable ON scope2_emissions IS 'Defense-in-depth: Prevent extreme quantity values (max 10M units)';
COMMENT ON CONSTRAINT scope2_emissions_reasonable ON scope2_emissions IS 'Defense-in-depth: Prevent extreme emission values (max 100M tCO2e)';
COMMENT ON CONSTRAINT scope3_quantity_reasonable ON scope3_emissions IS 'Defense-in-depth: Prevent extreme quantity values (max 10M units)';
COMMENT ON CONSTRAINT scope3_emissions_reasonable ON scope3_emissions IS 'Defense-in-depth: Prevent extreme emission values (max 100M tCO2e)';