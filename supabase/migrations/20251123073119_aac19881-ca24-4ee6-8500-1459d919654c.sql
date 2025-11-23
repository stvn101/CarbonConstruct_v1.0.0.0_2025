-- =====================================================
-- AUSTRALIAN EMISSION FACTORS DATABASE SEEDING
-- =====================================================
-- Sources: 
-- - National Greenhouse Accounts (NGA) Factors 2023
-- - Australian Energy Market Operator (AEMO)
-- - Department of Climate Change, Energy, Environment and Water (DCCEEW)
-- =====================================================

-- SCOPE 1: FUEL COMBUSTION EMISSIONS (Australian factors)
INSERT INTO public.emission_factors (category, subcategory, fuel_type, scope, factor_value, unit, year, source, region, methodology) VALUES
-- Diesel & Petrol
('Fuel Combustion', 'Stationary Energy', 'Diesel', 1, 2.6844, 'kg CO2-e/L', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Fuel Combustion', 'Stationary Energy', 'Petrol/Gasoline', 1, 2.3098, 'kg CO2-e/L', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Fuel Combustion', 'Transport', 'Diesel', 1, 2.6844, 'kg CO2-e/L', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Fuel Combustion', 'Transport', 'Petrol/Gasoline', 1, 2.3098, 'kg CO2-e/L', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),

-- Natural Gas
('Fuel Combustion', 'Stationary Energy', 'Natural Gas', 1, 51.33, 'kg CO2-e/GJ', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Fuel Combustion', 'Commercial/Industrial', 'Natural Gas', 1, 51.33, 'kg CO2-e/GJ', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),

-- LPG
('Fuel Combustion', 'Stationary Energy', 'LPG', 1, 1.5493, 'kg CO2-e/L', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Fuel Combustion', 'Transport', 'LPG', 1, 1.5493, 'kg CO2-e/L', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),

-- Heavy Fuel Oil
('Fuel Combustion', 'Stationary Energy', 'Heavy Fuel Oil', 1, 3.1209, 'kg CO2-e/L', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),

-- Coal
('Fuel Combustion', 'Stationary Energy', 'Black Coal', 1, 89.32, 'kg CO2-e/GJ', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Fuel Combustion', 'Stationary Energy', 'Brown Coal', 1, 92.08, 'kg CO2-e/GJ', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007');

-- SCOPE 2: ELECTRICITY EMISSIONS (by Australian state/territory)
INSERT INTO public.emission_factors (category, subcategory, scope, factor_value, unit, year, source, region, methodology) VALUES
('Electricity', 'Grid Electricity', 2, 0.710, 'kg CO2-e/kWh', 2023, 'NGA Factors 2023', 'NSW', 'NGER Act 2007'),
('Electricity', 'Grid Electricity', 2, 0.590, 'kg CO2-e/kWh', 2023, 'NGA Factors 2023', 'VIC', 'NGER Act 2007'),
('Electricity', 'Grid Electricity', 2, 0.690, 'kg CO2-e/kWh', 2023, 'NGA Factors 2023', 'QLD', 'NGER Act 2007'),
('Electricity', 'Grid Electricity', 2, 0.530, 'kg CO2-e/kWh', 2023, 'NGA Factors 2023', 'SA', 'NGER Act 2007'),
('Electricity', 'Grid Electricity', 2, 0.490, 'kg CO2-e/kWh', 2023, 'NGA Factors 2023', 'WA', 'NGER Act 2007'),
('Electricity', 'Grid Electricity', 2, 0.110, 'kg CO2-e/kWh', 2023, 'NGA Factors 2023', 'TAS', 'NGER Act 2007'),
('Electricity', 'Grid Electricity', 2, 0.640, 'kg CO2-e/kWh', 2023, 'NGA Factors 2023', 'NT', 'NGER Act 2007'),
('Electricity', 'Grid Electricity', 2, 0.085, 'kg CO2-e/kWh', 2023, 'NGA Factors 2023', 'ACT', 'NGER Act 2007'),
-- National Average
('Electricity', 'Grid Electricity', 2, 0.610, 'kg CO2-e/kWh', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007');

-- SCOPE 3: TRANSPORT & LOGISTICS
INSERT INTO public.emission_factors (category, subcategory, scope, factor_value, unit, year, source, region, methodology) VALUES
-- Road Transport
('Transport', 'Road Freight', 3, 0.1021, 'kg CO2-e/tonne.km', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Transport', 'Rigid Truck', 3, 0.7854, 'kg CO2-e/km', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Transport', 'Articulated Truck', 3, 1.1243, 'kg CO2-e/km', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Transport', 'Light Commercial Vehicle', 3, 0.2451, 'kg CO2-e/km', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Transport', 'Passenger Vehicle', 3, 0.1856, 'kg CO2-e/km', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),

-- Rail Transport
('Transport', 'Rail Freight', 3, 0.0172, 'kg CO2-e/tonne.km', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),

-- Sea Transport
('Transport', 'Sea Freight', 3, 0.0131, 'kg CO2-e/tonne.km', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),

-- Air Transport
('Transport', 'Air Freight', 3, 1.0934, 'kg CO2-e/tonne.km', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Transport', 'Domestic Flight', 3, 0.1456, 'kg CO2-e/passenger.km', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Transport', 'International Flight', 3, 0.1154, 'kg CO2-e/passenger.km', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007');

-- SCOPE 3: CONSTRUCTION ACTIVITIES
INSERT INTO public.emission_factors (category, subcategory, scope, factor_value, unit, year, source, region, methodology) VALUES
('Construction Activities', 'Concrete Batching', 3, 28.5, 'kg CO2-e/m³', 2023, 'Australian LCA Database', 'Australia', 'ISO 14040/14044'),
('Construction Activities', 'Steel Fabrication', 3, 1850, 'kg CO2-e/tonne', 2023, 'Australian LCA Database', 'Australia', 'ISO 14040/14044'),
('Construction Activities', 'Earthworks', 3, 2.3, 'kg CO2-e/m³', 2023, 'Australian LCA Database', 'Australia', 'ISO 14040/14044'),
('Construction Activities', 'Site Operations', 3, 15.6, 'kg CO2-e/day', 2023, 'Australian LCA Database', 'Australia', 'ISO 14040/14044'),
('Construction Activities', 'Crane Operations', 3, 45.2, 'kg CO2-e/day', 2023, 'Australian LCA Database', 'Australia', 'ISO 14040/14044');

-- SCOPE 3: WASTE MANAGEMENT
INSERT INTO public.emission_factors (category, subcategory, scope, factor_value, unit, year, source, region, methodology) VALUES
('Waste', 'Landfill - General Waste', 3, 0.567, 'kg CO2-e/kg', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Waste', 'Landfill - Concrete/Masonry', 3, 0.012, 'kg CO2-e/kg', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Waste', 'Landfill - Timber', 3, 1.234, 'kg CO2-e/kg', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Waste', 'Recycling - Mixed Materials', 3, 0.089, 'kg CO2-e/kg', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007'),
('Waste', 'Recycling - Metals', 3, 0.045, 'kg CO2-e/kg', 2023, 'NGA Factors 2023', 'Australia', 'NGER Act 2007');

-- =====================================================
-- AUSTRALIAN LCA MATERIALS DATABASE SEEDING
-- =====================================================
-- Sources:
-- - Australian Life Cycle Inventory (AusLCI) Database
-- - Environmental Product Declarations (EPDs) Australia
-- - ALCAS (Australian Life Cycle Assessment Society)
-- - Embodied Carbon Database Australia
-- =====================================================

-- CONCRETE & CEMENTITIOUS MATERIALS
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Portland Cement', 'Concrete & Cementitious', 'kg', 0.820, 0.015, 0.008, 0.843, 2023, 'AusLCI Database / EPD Australia', 'Australia'),
('General Purpose Cement', 'Concrete & Cementitious', 'kg', 0.745, 0.015, 0.008, 0.768, 2023, 'AusLCI Database / EPD Australia', 'Australia'),
('Blended Cement (30% GGBS)', 'Concrete & Cementitious', 'kg', 0.580, 0.015, 0.008, 0.603, 2023, 'AusLCI Database / EPD Australia', 'Australia'),
('Blended Cement (50% GGBS)', 'Concrete & Cementitious', 'kg', 0.410, 0.015, 0.008, 0.433, 2023, 'AusLCI Database / EPD Australia', 'Australia'),
('Ready Mix Concrete 20MPa', 'Concrete & Cementitious', 'm³', 235, 12, 8, 255, 2023, 'EPD Australia / CCAA', 'Australia'),
('Ready Mix Concrete 25MPa', 'Concrete & Cementitious', 'm³', 270, 12, 8, 290, 2023, 'EPD Australia / CCAA', 'Australia'),
('Ready Mix Concrete 32MPa', 'Concrete & Cementitious', 'm³', 310, 12, 8, 330, 2023, 'EPD Australia / CCAA', 'Australia'),
('Ready Mix Concrete 40MPa', 'Concrete & Cementitious', 'm³', 365, 12, 8, 385, 2023, 'EPD Australia / CCAA', 'Australia'),
('Ready Mix Concrete 50MPa', 'Concrete & Cementitious', 'm³', 425, 12, 8, 445, 2023, 'EPD Australia / CCAA', 'Australia'),
('Geopolymer Concrete 32MPa', 'Concrete & Cementitious', 'm³', 185, 12, 8, 205, 2023, 'EPD Australia / CCAA', 'Australia'),
('Recycled Aggregate Concrete', 'Concrete & Cementitious', 'm³', 210, 8, 8, 226, 2023, 'EPD Australia / CCAA', 'Australia'),
('Concrete Blocks (Standard)', 'Concrete & Cementitious', 'm²', 58, 4, 2, 64, 2023, 'AusLCI / CMAA', 'Australia'),
('Concrete Blocks (Hollow)', 'Concrete & Cementitious', 'm²', 42, 4, 2, 48, 2023, 'AusLCI / CMAA', 'Australia'),
('Precast Concrete Panel', 'Concrete & Cementitious', 'm²', 195, 15, 10, 220, 2023, 'EPD Australia / National Precast', 'Australia');

-- STEEL & METALS
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Steel - Virgin Structural', 'Steel & Metals', 'kg', 2.10, 0.08, 0.12, 2.30, 2023, 'AusLCI / Steel Australia', 'Australia'),
('Steel - Recycled Content (30%)', 'Steel & Metals', 'kg', 1.65, 0.08, 0.12, 1.85, 2023, 'AusLCI / Steel Australia', 'Australia'),
('Steel - Recycled Content (50%)', 'Steel & Metals', 'kg', 1.35, 0.08, 0.12, 1.55, 2023, 'AusLCI / Steel Australia', 'Australia'),
('Steel - High Recycled (80%+)', 'Steel & Metals', 'kg', 0.85, 0.08, 0.12, 1.05, 2023, 'AusLCI / Steel Australia', 'Australia'),
('Reinforcement Steel Bar', 'Steel & Metals', 'kg', 1.95, 0.08, 0.10, 2.13, 2023, 'EPD Australia / ASI', 'Australia'),
('Steel Mesh (SL72)', 'Steel & Metals', 'm²', 5.8, 0.3, 0.4, 6.5, 2023, 'EPD Australia / ASI', 'Australia'),
('Structural Steel Section', 'Steel & Metals', 'kg', 2.05, 0.08, 0.15, 2.28, 2023, 'EPD Australia / ASI', 'Australia'),
('Steel Decking', 'Steel & Metals', 'm²', 12.5, 0.6, 0.8, 13.9, 2023, 'EPD Australia / ASI', 'Australia'),
('Galvanised Steel', 'Steel & Metals', 'kg', 2.35, 0.08, 0.12, 2.55, 2023, 'AusLCI Database', 'Australia'),
('Aluminium - Virgin', 'Steel & Metals', 'kg', 12.80, 0.15, 0.25, 13.20, 2023, 'AusLCI / Aluminium Australia', 'Australia'),
('Aluminium - Recycled (50%)', 'Steel & Metals', 'kg', 7.20, 0.15, 0.25, 7.60, 2023, 'AusLCI / Aluminium Australia', 'Australia'),
('Aluminium Window Frame', 'Steel & Metals', 'm', 45, 2, 3, 50, 2023, 'EPD Australia / AWA', 'Australia'),
('Copper Pipe', 'Steel & Metals', 'kg', 4.20, 0.12, 0.18, 4.50, 2023, 'AusLCI Database', 'Australia'),
('Stainless Steel', 'Steel & Metals', 'kg', 6.80, 0.10, 0.15, 7.05, 2023, 'AusLCI Database', 'Australia');

-- TIMBER & WOOD PRODUCTS
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Hardwood - Sawn Timber', 'Timber & Wood Products', 'm³', -650, 35, 15, -600, 2023, 'AusLCI / FWPA', 'Australia'),
('Softwood - Sawn Timber', 'Timber & Wood Products', 'm³', -580, 35, 15, -530, 2023, 'AusLCI / FWPA', 'Australia'),
('Treated Pine (H3)', 'Timber & Wood Products', 'm³', -520, 35, 25, -460, 2023, 'AusLCI / FWPA', 'Australia'),
('Treated Pine (H4)', 'Timber & Wood Products', 'm³', -510, 35, 28, -447, 2023, 'AusLCI / FWPA', 'Australia'),
('Engineered Timber - Glulam', 'Timber & Wood Products', 'm³', -480, 40, 35, -405, 2023, 'EPD Australia / FWPA', 'Australia'),
('Engineered Timber - LVL', 'Timber & Wood Products', 'm³', -420, 40, 40, -340, 2023, 'EPD Australia / FWPA', 'Australia'),
('Cross Laminated Timber (CLT)', 'Timber & Wood Products', 'm³', -385, 45, 42, -298, 2023, 'EPD Australia / FWPA', 'Australia'),
('Plywood - Structural', 'Timber & Wood Products', 'm²', 8.5, 0.8, 0.6, 9.9, 2023, 'AusLCI / FWPA', 'Australia'),
('MDF (Medium Density Fibreboard)', 'Timber & Wood Products', 'm²', 12.3, 1.2, 0.8, 14.3, 2023, 'AusLCI Database', 'Australia'),
('Particleboard', 'Timber & Wood Products', 'm²', 10.8, 1.0, 0.7, 12.5, 2023, 'AusLCI Database', 'Australia'),
('Oriented Strand Board (OSB)', 'Timber & Wood Products', 'm²', 11.5, 1.1, 0.8, 13.4, 2023, 'AusLCI Database', 'Australia'),
('Hardwood Flooring', 'Timber & Wood Products', 'm²', 25, 3, 2, 30, 2023, 'EPD Australia / ATFA', 'Australia');

-- MASONRY & BRICKWORK
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Clay Brick - Extruded', 'Masonry & Brickwork', 'brick', 0.85, 0.04, 0.02, 0.91, 2023, 'EPD Australia / TBA', 'Australia'),
('Clay Brick - Pressed', 'Masonry & Brickwork', 'brick', 0.92, 0.04, 0.02, 0.98, 2023, 'EPD Australia / TBA', 'Australia'),
('Clay Brick Wall', 'Masonry & Brickwork', 'm²', 125, 6, 4, 135, 2023, 'EPD Australia / TBA', 'Australia'),
('AAC Block (Hebel)', 'Masonry & Brickwork', 'm²', 45, 3, 2, 50, 2023, 'EPD Australia / CSR', 'Australia'),
('Limestone Block', 'Masonry & Brickwork', 'm²', 78, 5, 3, 86, 2023, 'AusLCI Database', 'Australia');

-- INSULATION
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Glasswool Batts R2.5', 'Insulation', 'm²', 8.5, 0.5, 0.3, 9.3, 2023, 'EPD Australia / Insulation Council', 'Australia'),
('Glasswool Batts R4.0', 'Insulation', 'm²', 12.8, 0.7, 0.4, 13.9, 2023, 'EPD Australia / Insulation Council', 'Australia'),
('Polyester Insulation R2.5', 'Insulation', 'm²', 6.2, 0.4, 0.3, 6.9, 2023, 'EPD Australia / Insulation Council', 'Australia'),
('Polyester Insulation R4.0', 'Insulation', 'm²', 9.8, 0.6, 0.4, 10.8, 2023, 'EPD Australia / Insulation Council', 'Australia'),
('Rockwool R2.5', 'Insulation', 'm²', 11.2, 0.6, 0.4, 12.2, 2023, 'EPD Australia', 'Australia'),
('Expanded Polystyrene (EPS)', 'Insulation', 'm³', 85, 4, 2, 91, 2023, 'AusLCI Database', 'Australia'),
('Extruded Polystyrene (XPS)', 'Insulation', 'm³', 125, 5, 3, 133, 2023, 'AusLCI Database', 'Australia'),
('Polyurethane Foam', 'Insulation', 'm³', 145, 6, 3, 154, 2023, 'AusLCI Database', 'Australia'),
('Sheep Wool Insulation', 'Insulation', 'm²', 4.8, 0.3, 0.2, 5.3, 2023, 'EPD Australia', 'Australia'),
('Cellulose Insulation', 'Insulation', 'm²', 3.2, 0.2, 0.2, 3.6, 2023, 'AusLCI Database', 'Australia');

-- PLASTERBOARD & LININGS
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Plasterboard Standard 10mm', 'Plasterboard & Linings', 'm²', 5.8, 0.4, 0.3, 6.5, 2023, 'EPD Australia / Gypsum Board Manufacturers', 'Australia'),
('Plasterboard Standard 13mm', 'Plasterboard & Linings', 'm²', 7.2, 0.5, 0.4, 8.1, 2023, 'EPD Australia / Gypsum Board Manufacturers', 'Australia'),
('Plasterboard Fire Rated 16mm', 'Plasterboard & Linings', 'm²', 9.5, 0.6, 0.4, 10.5, 2023, 'EPD Australia / Gypsum Board Manufacturers', 'Australia'),
('Plasterboard Moisture Resistant', 'Plasterboard & Linings', 'm²', 8.2, 0.5, 0.4, 9.1, 2023, 'EPD Australia / Gypsum Board Manufacturers', 'Australia'),
('Fibre Cement Sheet', 'Plasterboard & Linings', 'm²', 12.5, 0.8, 0.5, 13.8, 2023, 'EPD Australia / James Hardie', 'Australia');

-- GLASS & GLAZING
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Float Glass 6mm', 'Glass & Glazing', 'm²', 28, 2, 1, 31, 2023, 'EPD Australia / AGWA', 'Australia'),
('Double Glazed Unit (6mm-12mm-6mm)', 'Glass & Glazing', 'm²', 68, 4, 2, 74, 2023, 'EPD Australia / AGWA', 'Australia'),
('Low-E Double Glazed Unit', 'Glass & Glazing', 'm²', 75, 4, 2, 81, 2023, 'EPD Australia / AGWA', 'Australia'),
('Laminated Glass', 'Glass & Glazing', 'm²', 42, 3, 2, 47, 2023, 'EPD Australia / AGWA', 'Australia'),
('Toughened Glass', 'Glass & Glazing', 'm²', 35, 2, 2, 39, 2023, 'EPD Australia / AGWA', 'Australia');

-- ROOFING MATERIALS
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Terracotta Roof Tiles', 'Roofing', 'm²', 32, 2, 1, 35, 2023, 'EPD Australia / Roof Tile Association', 'Australia'),
('Concrete Roof Tiles', 'Roofing', 'm²', 28, 2, 1, 31, 2023, 'EPD Australia / Roof Tile Association', 'Australia'),
('Metal Roof (Colorbond)', 'Roofing', 'm²', 18, 1, 1, 20, 2023, 'EPD Australia / BlueScope', 'Australia'),
('Metal Roof (Zincalume)', 'Roofing', 'm²', 16, 1, 1, 18, 2023, 'EPD Australia / BlueScope', 'Australia'),
('Bituminous Membrane', 'Roofing', 'm²', 12, 1, 0.5, 13.5, 2023, 'AusLCI Database', 'Australia'),
('Single Ply Membrane (TPO)', 'Roofing', 'm²', 14, 1, 0.6, 15.6, 2023, 'AusLCI Database', 'Australia');

-- FLOORING
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Ceramic Tiles', 'Flooring', 'm²', 28, 2, 1, 31, 2023, 'EPD Australia', 'Australia'),
('Porcelain Tiles', 'Flooring', 'm²', 35, 2, 1, 38, 2023, 'EPD Australia', 'Australia'),
('Vinyl Flooring', 'Flooring', 'm²', 18, 1, 0.5, 19.5, 2023, 'AusLCI Database', 'Australia'),
('Carpet - Nylon', 'Flooring', 'm²', 22, 1, 0.8, 23.8, 2023, 'AusLCI Database', 'Australia'),
('Carpet - Wool', 'Flooring', 'm²', 15, 1, 0.8, 16.8, 2023, 'AusLCI Database', 'Australia'),
('Polished Concrete Floor', 'Flooring', 'm²', 45, 2, 3, 50, 2023, 'EPD Australia', 'Australia'),
('Bamboo Flooring', 'Flooring', 'm²', 12, 1, 0.8, 13.8, 2023, 'EPD Australia', 'Australia');

-- PAINTS & COATINGS
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Water-Based Paint', 'Paints & Coatings', 'L', 2.8, 0.2, 0.1, 3.1, 2023, 'AusLCI Database', 'Australia'),
('Solvent-Based Paint', 'Paints & Coatings', 'L', 4.2, 0.2, 0.2, 4.6, 2023, 'AusLCI Database', 'Australia'),
('Low VOC Paint', 'Paints & Coatings', 'L', 2.5, 0.2, 0.1, 2.8, 2023, 'AusLCI Database', 'Australia'),
('Powder Coating', 'Paints & Coatings', 'kg', 3.5, 0.1, 0.2, 3.8, 2023, 'AusLCI Database', 'Australia');

-- PLASTIC & COMPOSITE MATERIALS
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('PVC Pipe', 'Plastics & Composites', 'kg', 2.8, 0.1, 0.1, 3.0, 2023, 'AusLCI Database', 'Australia'),
('HDPE Pipe', 'Plastics & Composites', 'kg', 1.9, 0.1, 0.1, 2.1, 2023, 'AusLCI Database', 'Australia'),
('Polycarbonate Sheet', 'Plastics & Composites', 'm²', 32, 2, 1, 35, 2023, 'AusLCI Database', 'Australia'),
('Acrylic Sheet', 'Plastics & Composites', 'm²', 28, 2, 1, 31, 2023, 'AusLCI Database', 'Australia'),
('GRP (Fibreglass)', 'Plastics & Composites', 'kg', 8.5, 0.3, 0.2, 9.0, 2023, 'AusLCI Database', 'Australia');

-- AGGREGATE & FILL MATERIALS
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Crushed Rock', 'Aggregates & Fill', 'tonne', 4.5, 2.0, 0.5, 7.0, 2023, 'AusLCI Database', 'Australia'),
('Sand', 'Aggregates & Fill', 'tonne', 3.2, 1.8, 0.4, 5.4, 2023, 'AusLCI Database', 'Australia'),
('Gravel', 'Aggregates & Fill', 'tonne', 3.8, 1.9, 0.4, 6.1, 2023, 'AusLCI Database', 'Australia'),
('Recycled Concrete Aggregate', 'Aggregates & Fill', 'tonne', 2.1, 1.5, 0.3, 3.9, 2023, 'AusLCI Database', 'Australia');

-- WATERPROOFING & MEMBRANES
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, year, data_source, region) VALUES
('Liquid Waterproofing Membrane', 'Waterproofing', 'm²', 8.5, 0.5, 0.3, 9.3, 2023, 'AusLCI Database', 'Australia'),
('Sheet Waterproofing Membrane', 'Waterproofing', 'm²', 12.3, 0.8, 0.4, 13.5, 2023, 'AusLCI Database', 'Australia'),
('Tanking Membrane', 'Waterproofing', 'm²', 15.8, 1.0, 0.5, 17.3, 2023, 'AusLCI Database', 'Australia');