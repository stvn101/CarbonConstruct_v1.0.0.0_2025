-- Fix scope1_emissions policy to include WITH CHECK clause
DROP POLICY IF EXISTS "Users can access scope1 data for their projects" ON public.scope1_emissions;
CREATE POLICY "Users can access scope1 data for their projects" 
ON public.scope1_emissions 
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Fix scope2_emissions policy to include WITH CHECK clause
DROP POLICY IF EXISTS "Users can access scope2 data for their projects" ON public.scope2_emissions;
CREATE POLICY "Users can access scope2 data for their projects" 
ON public.scope2_emissions 
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Fix scope3_emissions policy to include WITH CHECK clause
DROP POLICY IF EXISTS "Users can access scope3 data for their projects" ON public.scope3_emissions;
CREATE POLICY "Users can access scope3 data for their projects" 
ON public.scope3_emissions 
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Fix reports table policy to include WITH CHECK clause
DROP POLICY IF EXISTS "Users can access reports for their projects" ON public.reports;
CREATE POLICY "Users can access reports for their projects" 
ON public.reports 
FOR ALL
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);