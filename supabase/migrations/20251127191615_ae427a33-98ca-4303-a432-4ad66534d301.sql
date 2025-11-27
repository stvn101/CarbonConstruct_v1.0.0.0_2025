-- Create a new clean EPD materials table for all 4000+ regional materials
CREATE TABLE public.materials_epd (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Material identification
  material_name text NOT NULL,
  material_category text NOT NULL,
  subcategory text,
  
  -- Manufacturer/Plant info (critical for regional EPDs)
  manufacturer text,
  plant_location text,
  region text DEFAULT 'Australia',
  state text,
  
  -- Unit of measurement
  unit text NOT NULL,
  
  -- EN 15804 Lifecycle stage emission factors (kgCO2e per unit)
  ef_a1a3 numeric DEFAULT 0,  -- Product stage (raw materials, transport to factory, manufacturing)
  ef_a4 numeric DEFAULT 0,     -- Transport to site
  ef_a5 numeric DEFAULT 0,     -- Construction/installation
  ef_b1b5 numeric DEFAULT 0,   -- Use stage
  ef_c1c4 numeric DEFAULT 0,   -- End of life
  ef_d numeric DEFAULT 0,      -- Benefits beyond system boundary
  ef_total numeric NOT NULL,   -- Total embodied carbon
  
  -- Scope factors (for operational emissions)
  scope1_factor numeric DEFAULT 0,
  scope2_factor numeric DEFAULT 0,
  scope3_factor numeric DEFAULT 0,
  
  -- Data quality and compliance
  data_source text NOT NULL,
  epd_url text,
  epd_number text,
  data_quality_tier text DEFAULT 'industry_average',
  uncertainty_percent numeric DEFAULT 20,
  
  -- Validity
  year integer,
  publish_date date,
  expiry_date date,
  
  -- Additional metadata
  recycled_content numeric DEFAULT 0,
  carbon_sequestration numeric DEFAULT 0,
  notes text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for fast searching
CREATE INDEX idx_materials_epd_name ON public.materials_epd(material_name);
CREATE INDEX idx_materials_epd_category ON public.materials_epd(material_category);
CREATE INDEX idx_materials_epd_manufacturer ON public.materials_epd(manufacturer);
CREATE INDEX idx_materials_epd_region ON public.materials_epd(region);
CREATE INDEX idx_materials_epd_state ON public.materials_epd(state);

-- Enable RLS
ALTER TABLE public.materials_epd ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read materials
CREATE POLICY "Authenticated users can view EPD materials"
ON public.materials_epd
FOR SELECT
USING (auth.role() = 'authenticated');

-- Only service role can modify EPD materials (for imports)
CREATE POLICY "Only service role can modify EPD materials"
ON public.materials_epd
FOR ALL
USING (auth.role() = 'service_role');

-- Add updated_at trigger
CREATE TRIGGER update_materials_epd_updated_at
BEFORE UPDATE ON public.materials_epd
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();