-- Create unified_calculations table for streamlined calculator
CREATE TABLE IF NOT EXISTS public.unified_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  materials JSONB DEFAULT '[]'::jsonb,
  fuel_inputs JSONB DEFAULT '{}'::jsonb,
  electricity_inputs JSONB DEFAULT '{}'::jsonb,
  transport_inputs JSONB DEFAULT '{}'::jsonb,
  totals JSONB DEFAULT '{"scope1": 0, "scope2": 0, "scope3_materials": 0, "scope3_transport": 0, "total": 0}'::jsonb,
  is_draft BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unified_calculations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own calculations"
  ON public.unified_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculations"
  ON public.unified_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations"
  ON public.unified_calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations"
  ON public.unified_calculations FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_unified_calculations_updated_at
  BEFORE UPDATE ON public.unified_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Populate emission_factors with Australian material database
INSERT INTO public.emission_factors (category, subcategory, fuel_type, factor_value, unit, scope, source, region, year, methodology) VALUES
-- Concrete
('Materials', 'Concrete', '20 MPa', 201, 'kgCO2e/m³', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Concrete', '25 MPa', 222, 'kgCO2e/m³', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Concrete', '32 MPa', 249, 'kgCO2e/m³', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Concrete', '40 MPa', 305, 'kgCO2e/m³', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Concrete', '50 MPa', 354, 'kgCO2e/m³', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
-- Steel & Framing
('Materials', 'Steel', 'Cold Rolled Studs', 3013, 'kgCO2e/tonne', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Steel', 'Reinforcing Rebar', 1380, 'kgCO2e/tonne', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Steel', 'Structural Hot Rolled', 1250, 'kgCO2e/tonne', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Aluminium', 'Extruded', 12741, 'kgCO2e/tonne', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
-- Walls & Linings
('Materials', 'Plasterboard', '10mm', 5.9, 'kgCO2e/m²', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Plasterboard', '13mm', 7.2, 'kgCO2e/m²', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'AAC', 'Hebel Panel', 0.45, 'kgCO2e/kg', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Glass', 'Flat Glass', 1.66, 'kgCO2e/kg', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Fibre Cement', 'Sheet', 7.2, 'kgCO2e/m²', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
-- Flooring
('Materials', 'Flooring', 'Carpet Tiles Nylon', 13.2, 'kgCO2e/m²', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Flooring', 'Vinyl', 15.9, 'kgCO2e/m²', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Flooring', 'Engineered Timber', 9.5, 'kgCO2e/m²', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Flooring', 'Ceramic Tiles', 11.0, 'kgCO2e/m²', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
-- Doors & Windows
('Materials', 'Doors', 'Solid Timber', 28, 'kgCO2e/m²', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Windows', 'Alum Frame Glazed', 65, 'kgCO2e/m²', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
-- Timber
('Materials', 'Timber', 'Sawn Softwood Pine', 233, 'kgCO2e/m³', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Timber', 'Sawn Hardwood', 320, 'kgCO2e/m³', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44'),
('Materials', 'Timber', 'LVL', 430, 'kgCO2e/m³', 3, 'NMEF v2025.1', 'Australia', 2025, 'ISO 14040-44')
ON CONFLICT DO NOTHING;