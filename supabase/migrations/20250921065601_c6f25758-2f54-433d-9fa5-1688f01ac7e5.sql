-- Enable Row Level Security on emission_factors table
ALTER TABLE public.emission_factors ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on lca_materials table  
ALTER TABLE public.lca_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for emission_factors table
-- Allow all authenticated users to read emission factors (reference data)
CREATE POLICY "Authenticated users can view emission factors" 
ON public.emission_factors 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Restrict write access to prevent unauthorized modifications
-- Only service role can insert/update/delete emission factors
CREATE POLICY "Only service role can modify emission factors" 
ON public.emission_factors 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create policies for lca_materials table
-- Allow all authenticated users to read LCA materials (reference data)
CREATE POLICY "Authenticated users can view lca materials" 
ON public.lca_materials 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Restrict write access to prevent unauthorized modifications
-- Only service role can insert/update/delete LCA materials
CREATE POLICY "Only service role can modify lca materials" 
ON public.lca_materials 
FOR ALL 
USING (auth.role() = 'service_role');