-- ECO Platform LCA Compliance Schema Updates V2.0

-- Add ECO Platform fields to materials_epd table
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS characterisation_factor_version TEXT DEFAULT 'JRC-EF-3.1';
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS allocation_method TEXT;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS is_co_product BOOLEAN DEFAULT FALSE;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS co_product_type TEXT;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS uses_mass_balance BOOLEAN DEFAULT FALSE;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS biogenic_carbon_kg_c NUMERIC;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS biogenic_carbon_percentage NUMERIC;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS manufacturing_country TEXT;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS manufacturing_city TEXT;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS ecoinvent_methodology TEXT;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS eco_platform_compliant BOOLEAN DEFAULT TRUE;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS data_quality_rating TEXT;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS reference_year INTEGER;
ALTER TABLE materials_epd ADD COLUMN IF NOT EXISTS data_representativeness JSONB;

-- Add ECO Platform fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS electricity_percentage_a1a3 NUMERIC;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS electricity_modelling_approach TEXT DEFAULT 'location-based';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS grid_factor_source TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS eco_compliance_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS eco_compliance_report JSONB;

-- Add comments for documentation
COMMENT ON COLUMN materials_epd.characterisation_factor_version IS 'JRC EF version used (3.0 or 3.1) per ECO Platform 2.9';
COMMENT ON COLUMN materials_epd.allocation_method IS 'Allocation method: economic, physical, system-expansion per ECO Platform 2.6';
COMMENT ON COLUMN materials_epd.is_co_product IS 'Flag for co-products requiring economic allocation per ECO Platform 2.6.1';
COMMENT ON COLUMN materials_epd.co_product_type IS 'Type: granulated-blast-furnace-slag, fly-ash, silica-fume, artificial-gypsum, aluminium-oxide-byproduct';
COMMENT ON COLUMN materials_epd.uses_mass_balance IS 'Mass balance approaches prohibited per ECO Platform 2.4';
COMMENT ON COLUMN materials_epd.biogenic_carbon_kg_c IS 'Biogenic carbon content in kg C per ECO Platform 2.11';
COMMENT ON COLUMN materials_epd.biogenic_carbon_percentage IS 'Biogenic carbon as percentage of product mass';
COMMENT ON COLUMN materials_epd.manufacturing_country IS 'Manufacturing site country per ECO Platform 2.12';
COMMENT ON COLUMN materials_epd.manufacturing_city IS 'Manufacturing site city per ECO Platform 2.12';
COMMENT ON COLUMN materials_epd.ecoinvent_methodology IS 'Ecoinvent methodology: cut-off only allowed per ECO Platform 2.8';
COMMENT ON COLUMN materials_epd.eco_platform_compliant IS 'Overall ECO Platform V2.0 compliance flag';
COMMENT ON COLUMN materials_epd.data_quality_rating IS 'Data quality rating A-E per EN 15941';
COMMENT ON COLUMN projects.electricity_percentage_a1a3 IS 'Electricity as percentage of A1-A3 energy per ECO Platform 2.5.1';
COMMENT ON COLUMN projects.electricity_modelling_approach IS 'market-based or location-based per ECO Platform 2.5.1';
COMMENT ON COLUMN projects.eco_compliance_enabled IS 'ECO Platform compliance mode toggle';
COMMENT ON COLUMN projects.eco_compliance_report IS 'Generated ECO Platform compliance report JSON';