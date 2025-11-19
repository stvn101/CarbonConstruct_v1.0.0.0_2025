-- Seed LCA Materials Database with Australian Construction Materials
-- Based on NMEF v2025.1 and AS 5377 emission factors

-- Structural Materials
INSERT INTO public.lca_materials (material_name, material_category, unit, embodied_carbon_a1a3, embodied_carbon_a4, embodied_carbon_a5, embodied_carbon_total, region, data_source, year) VALUES
-- Concrete
('Concrete 20MPa', 'Structural', 'm3', 280, 15, 5, 300, 'Australia', 'NMEF v2025.1', 2025),
('Concrete 25MPa', 'Structural', 'm3', 310, 16, 5, 331, 'Australia', 'NMEF v2025.1', 2025),
('Concrete 32MPa', 'Structural', 'm3', 350, 18, 6, 374, 'Australia', 'NMEF v2025.1', 2025),
('Concrete 40MPa', 'Structural', 'm3', 390, 20, 7, 417, 'Australia', 'NMEF v2025.1', 2025),
('Concrete 50MPa', 'Structural', 'm3', 450, 23, 8, 481, 'Australia', 'NMEF v2025.1', 2025),
('Reinforced Concrete 32MPa', 'Structural', 'm3', 420, 21, 7, 448, 'Australia', 'NMEF v2025.1', 2025),
('Precast Concrete Panel', 'Structural', 'm3', 380, 25, 10, 415, 'Australia', 'AS 5377:2023', 2023),
('Concrete with 30% Fly Ash', 'Structural', 'm3', 245, 14, 5, 264, 'Australia', 'NMEF v2025.1', 2025),
('Concrete with 50% Slag', 'Structural', 'm3', 210, 13, 4, 227, 'Australia', 'NMEF v2025.1', 2025),

-- Steel
('Structural Steel (Virgin)', 'Structural', 'tonne', 2100, 80, 30, 2210, 'Australia', 'NMEF v2025.1', 2025),
('Structural Steel (30% Recycled)', 'Structural', 'tonne', 1680, 75, 28, 1783, 'Australia', 'NMEF v2025.1', 2025),
('Structural Steel (100% Recycled)', 'Structural', 'tonne', 630, 60, 20, 710, 'Australia', 'NMEF v2025.1', 2025),
('Reinforcing Steel Bar (Rebar)', 'Structural', 'tonne', 1950, 75, 25, 2050, 'Australia', 'AS 5377:2023', 2023),
('Steel Mesh', 'Structural', 'tonne', 1900, 70, 22, 1992, 'Australia', 'AS 5377:2023', 2023),
('Cold Formed Steel', 'Structural', 'tonne', 1850, 72, 24, 1946, 'Australia', 'NMEF v2025.1', 2025),

-- Timber
('Hardwood Timber', 'Structural', 'm3', 95, 12, 3, 110, 'Australia', 'NMEF v2025.1', 2025),
('Softwood Timber', 'Structural', 'm3', 85, 11, 3, 99, 'Australia', 'NMEF v2025.1', 2025),
('Glulam Beams', 'Structural', 'm3', 120, 15, 4, 139, 'Australia', 'AS 5377:2023', 2023),
('Cross Laminated Timber (CLT)', 'Structural', 'm3', 145, 18, 5, 168, 'Australia', 'AS 5377:2023', 2023),
('Laminated Veneer Lumber (LVL)', 'Structural', 'm3', 135, 16, 4, 155, 'Australia', 'AS 5377:2023', 2023),
('Engineered Wood I-Joists', 'Structural', 'm3', 110, 14, 4, 128, 'Australia', 'NMEF v2025.1', 2025),

-- Cladding
('Aluminum Cladding (Virgin)', 'Cladding', 'm2', 45, 3, 1, 49, 'Australia', 'NMEF v2025.1', 2025),
('Aluminum Cladding (Recycled)', 'Cladding', 'm2', 18, 2.5, 0.8, 21.3, 'Australia', 'NMEF v2025.1', 2025),
('Brick Veneer', 'Cladding', 'm2', 58, 4, 1.5, 63.5, 'Australia', 'AS 5377:2023', 2023),
('Clay Brick', 'Cladding', 'm2', 62, 4.2, 1.6, 67.8, 'Australia', 'AS 5377:2023', 2023),
('Fiber Cement Sheet', 'Cladding', 'm2', 22, 2, 0.8, 24.8, 'Australia', 'NMEF v2025.1', 2025),
('Weatherboard Timber', 'Cladding', 'm2', 15, 1.8, 0.5, 17.3, 'Australia', 'NMEF v2025.1', 2025),
('Compressed Cement Sheet', 'Cladding', 'm2', 25, 2.2, 0.9, 28.1, 'Australia', 'AS 5377:2023', 2023),
('Metal Deck Roofing', 'Cladding', 'm2', 28, 2.5, 1, 31.5, 'Australia', 'NMEF v2025.1', 2025),

-- Insulation
('Glasswool Batts R2.5', 'Insulation', 'm2', 8.5, 0.8, 0.3, 9.6, 'Australia', 'NMEF v2025.1', 2025),
('Glasswool Batts R4.0', 'Insulation', 'm2', 12, 1, 0.4, 13.4, 'Australia', 'NMEF v2025.1', 2025),
('Rockwool Batts R2.5', 'Insulation', 'm2', 9.2, 0.9, 0.35, 10.45, 'Australia', 'AS 5377:2023', 2023),
('Rockwool Batts R4.0', 'Insulation', 'm2', 13, 1.1, 0.45, 14.55, 'Australia', 'AS 5377:2023', 2023),
('Polyester Insulation R2.5', 'Insulation', 'm2', 7.8, 0.75, 0.28, 8.83, 'Australia', 'NMEF v2025.1', 2025),
('Expanded Polystyrene (EPS)', 'Insulation', 'm3', 95, 8, 3, 106, 'Australia', 'NMEF v2025.1', 2025),
('Extruded Polystyrene (XPS)', 'Insulation', 'm3', 125, 10, 4, 139, 'Australia', 'AS 5377:2023', 2023),
('Polyurethane Foam', 'Insulation', 'm3', 145, 11, 4.5, 160.5, 'Australia', 'NMEF v2025.1', 2025),
('Cellulose Insulation', 'Insulation', 'm3', 45, 4, 1.5, 50.5, 'Australia', 'AS 5377:2023', 2023),

-- Glazing
('Single Glazed Clear Glass 6mm', 'Glazing', 'm2', 28, 2.5, 1, 31.5, 'Australia', 'NMEF v2025.1', 2025),
('Double Glazed Clear Glass', 'Glazing', 'm2', 55, 4.5, 2, 61.5, 'Australia', 'AS 5377:2023', 2023),
('Double Glazed Low-E Glass', 'Glazing', 'm2', 62, 5, 2.2, 69.2, 'Australia', 'AS 5377:2023', 2023),
('Triple Glazed Low-E Glass', 'Glazing', 'm2', 85, 7, 3, 95, 'Australia', 'NMEF v2025.1', 2025),
('Laminated Safety Glass', 'Glazing', 'm2', 38, 3.2, 1.3, 42.5, 'Australia', 'NMEF v2025.1', 2025),

-- Finishes
('Plasterboard 10mm', 'Finishes', 'm2', 5.8, 0.6, 0.2, 6.6, 'Australia', 'NMEF v2025.1', 2025),
('Plasterboard 13mm', 'Finishes', 'm2', 7.2, 0.75, 0.25, 8.2, 'Australia', 'NMEF v2025.1', 2025),
('Ceramic Tiles', 'Finishes', 'm2', 24, 2, 0.8, 26.8, 'Australia', 'AS 5377:2023', 2023),
('Porcelain Tiles', 'Finishes', 'm2', 28, 2.3, 0.9, 31.2, 'Australia', 'AS 5377:2023', 2023),
('Vinyl Flooring', 'Finishes', 'm2', 18, 1.5, 0.6, 20.1, 'Australia', 'NMEF v2025.1', 2025),
('Carpet (Nylon)', 'Finishes', 'm2', 22, 1.8, 0.7, 24.5, 'Australia', 'NMEF v2025.1', 2025),
('Carpet (Wool)', 'Finishes', 'm2', 15, 1.4, 0.5, 16.9, 'Australia', 'AS 5377:2023', 2023),
('Timber Flooring (Hardwood)', 'Finishes', 'm2', 32, 2.8, 1, 35.8, 'Australia', 'NMEF v2025.1', 2025),
('Laminate Flooring', 'Finishes', 'm2', 16, 1.3, 0.5, 17.8, 'Australia', 'NMEF v2025.1', 2025),
('Acrylic Paint', 'Finishes', 'litre', 3.2, 0.3, 0.1, 3.6, 'Australia', 'NMEF v2025.1', 2025),
('Oil-Based Paint', 'Finishes', 'litre', 4.5, 0.4, 0.15, 5.05, 'Australia', 'NMEF v2025.1', 2025),

-- MEP (Mechanical, Electrical, Plumbing)
('Copper Pipe 15mm', 'MEP', 'metre', 2.8, 0.25, 0.08, 3.13, 'Australia', 'NMEF v2025.1', 2025),
('Copper Pipe 25mm', 'MEP', 'metre', 4.5, 0.35, 0.12, 4.97, 'Australia', 'NMEF v2025.1', 2025),
('PVC Pipe 100mm', 'MEP', 'metre', 1.2, 0.12, 0.04, 1.36, 'Australia', 'NMEF v2025.1', 2025),
('PVC Pipe 150mm', 'MEP', 'metre', 1.8, 0.15, 0.05, 2, 'Australia', 'NMEF v2025.1', 2025),
('HDPE Pipe 100mm', 'MEP', 'metre', 1.5, 0.14, 0.045, 1.685, 'Australia', 'AS 5377:2023', 2023),
('Electrical Cable 2.5mm2', 'MEP', 'metre', 0.45, 0.04, 0.015, 0.505, 'Australia', 'NMEF v2025.1', 2025),
('Electrical Cable 6mm2', 'MEP', 'metre', 0.95, 0.08, 0.03, 1.06, 'Australia', 'NMEF v2025.1', 2025),
('LED Light Fitting', 'MEP', 'unit', 12, 1.2, 0.4, 13.6, 'Australia', 'AS 5377:2023', 2023),
('Fluorescent Light Fitting', 'MEP', 'unit', 18, 1.5, 0.5, 20, 'Australia', 'NMEF v2025.1', 2025),
('Air Conditioning Unit (Split)', 'MEP', 'unit', 450, 35, 12, 497, 'Australia', 'NMEF v2025.1', 2025),
('Ducted HVAC System', 'MEP', 'kW', 280, 25, 10, 315, 'Australia', 'AS 5377:2023', 2023),

-- Alternative/Sustainable Materials
('Recycled Plastic Lumber', 'Structural', 'm3', 180, 16, 5, 201, 'Australia', 'AS 5377:2023', 2023),
('Hempcrete', 'Insulation', 'm3', 35, 3.5, 1.2, 39.7, 'Australia', 'AS 5377:2023', 2023),
('Bamboo Flooring', 'Finishes', 'm2', 18, 1.6, 0.6, 20.2, 'Australia', 'AS 5377:2023', 2023),
('Cork Flooring', 'Finishes', 'm2', 14, 1.3, 0.5, 15.8, 'Australia', 'AS 5377:2023', 2023),
('Recycled Steel Studs', 'Structural', 'tonne', 750, 62, 22, 834, 'Australia', 'NMEF v2025.1', 2025),
('Straw Bale', 'Insulation', 'm3', 12, 1.5, 0.5, 14, 'Australia', 'AS 5377:2023', 2023),
('Rammed Earth', 'Structural', 'm3', 45, 4, 1.5, 50.5, 'Australia', 'AS 5377:2023', 2023),
('Recycled Glass Aggregate', 'Structural', 'tonne', 55, 5.5, 2, 62.5, 'Australia', 'NMEF v2025.1', 2025);