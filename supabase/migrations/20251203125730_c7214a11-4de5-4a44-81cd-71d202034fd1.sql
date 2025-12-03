-- Drop the empty legacy lca_materials table
-- All materials are now stored in materials_epd (8,039+ records)
DROP TABLE IF EXISTS public.lca_materials;