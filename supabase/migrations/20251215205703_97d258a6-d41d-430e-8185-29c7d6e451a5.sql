-- Add NABERS EPD v2025.1 specific columns to materials_epd table
ALTER TABLE public.materials_epd
ADD COLUMN IF NOT EXISTS epd_type text,
ADD COLUMN IF NOT EXISTS program_operator text,
ADD COLUMN IF NOT EXISTS validity text,
ADD COLUMN IF NOT EXISTS average_specific text,
ADD COLUMN IF NOT EXISTS lca_practitioner text,
ADD COLUMN IF NOT EXISTS lca_verifier text,
ADD COLUMN IF NOT EXISTS gwp_fossil_a1a3 numeric,
ADD COLUMN IF NOT EXISTS gwp_biogenic_a1a3 numeric,
ADD COLUMN IF NOT EXISTS gwp_luluc_a1a3 numeric,
ADD COLUMN IF NOT EXISTS number_of_sites integer,
ADD COLUMN IF NOT EXISTS date_added date,
ADD COLUMN IF NOT EXISTS date_updated date;