-- Create comprehensive emissions tracking database schema

-- Projects table for tracking carbon assessment projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'construction',
  location TEXT,
  size_sqm DECIMAL,
  ncc_compliance_level TEXT,
  green_star_target INTEGER,
  nabers_target DECIMAL,
  assessment_period_start DATE,
  assessment_period_end DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create policies for projects
CREATE POLICY "Users can view their own projects" 
ON public.projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Scope 1 emissions data
CREATE TABLE public.scope1_emissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- fuel_combustion, vehicles, processes, fugitive
  subcategory TEXT,
  fuel_type TEXT,
  quantity DECIMAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  emission_factor DECIMAL,
  emissions_tco2e DECIMAL NOT NULL DEFAULT 0,
  calculation_method TEXT,
  data_quality TEXT DEFAULT 'estimated',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for scope1_emissions
ALTER TABLE public.scope1_emissions ENABLE ROW LEVEL SECURITY;

-- Create policies for scope1_emissions
CREATE POLICY "Users can access scope1 data for their projects" 
ON public.scope1_emissions 
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Scope 2 emissions data
CREATE TABLE public.scope2_emissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  energy_type TEXT NOT NULL, -- electricity, steam, heating, cooling
  state_region TEXT, -- NSW, VIC, QLD, etc for grid factors
  quantity DECIMAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL, -- kWh, MWh, GJ
  emission_factor DECIMAL,
  emissions_tco2e DECIMAL NOT NULL DEFAULT 0,
  renewable_percentage DECIMAL DEFAULT 0,
  calculation_method TEXT,
  data_quality TEXT DEFAULT 'estimated',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for scope2_emissions
ALTER TABLE public.scope2_emissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access scope2 data for their projects" 
ON public.scope2_emissions 
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Scope 3 emissions data
CREATE TABLE public.scope3_emissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category INTEGER NOT NULL, -- 1-15 (Scope 3 categories)
  category_name TEXT NOT NULL,
  subcategory TEXT,
  activity_description TEXT,
  quantity DECIMAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  emission_factor DECIMAL,
  emissions_tco2e DECIMAL NOT NULL DEFAULT 0,
  lca_stage TEXT, -- A1-A3, A4, A5, B1-B7, C1-C4, D
  calculation_method TEXT,
  data_quality TEXT DEFAULT 'estimated',
  supplier_data BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for scope3_emissions
ALTER TABLE public.scope3_emissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access scope3 data for their projects" 
ON public.scope3_emissions 
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Australian emission factors table
CREATE TABLE public.emission_factors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL, -- 'NGERS', 'DEFRA', 'IEA', etc
  category TEXT NOT NULL,
  subcategory TEXT,
  fuel_type TEXT,
  region TEXT, -- Australian state/territory
  factor_value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  scope INTEGER, -- 1, 2, or 3
  year INTEGER NOT NULL,
  methodology TEXT,
  uncertainty_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- LCA materials data
CREATE TABLE public.lca_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_name TEXT NOT NULL,
  material_category TEXT NOT NULL,
  embodied_carbon_a1a3 DECIMAL, -- Product stage (A1-A3)
  embodied_carbon_a4 DECIMAL, -- Transport to site (A4)
  embodied_carbon_a5 DECIMAL, -- Construction/installation (A5)
  embodied_carbon_total DECIMAL,
  unit TEXT NOT NULL,
  data_source TEXT,
  region TEXT DEFAULT 'Australia',
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reports table for compliance reporting
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'ncc', 'green_star', 'nabers', 'executive'
  report_data JSONB,
  total_scope1 DECIMAL DEFAULT 0,
  total_scope2 DECIMAL DEFAULT 0,
  total_scope3 DECIMAL DEFAULT 0,
  total_emissions DECIMAL DEFAULT 0,
  compliance_status TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access reports for their projects" 
ON public.reports 
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scope1_emissions_updated_at
BEFORE UPDATE ON public.scope1_emissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scope2_emissions_updated_at
BEFORE UPDATE ON public.scope2_emissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scope3_emissions_updated_at
BEFORE UPDATE ON public.scope3_emissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emission_factors_updated_at
BEFORE UPDATE ON public.emission_factors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lca_materials_updated_at
BEFORE UPDATE ON public.lca_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();