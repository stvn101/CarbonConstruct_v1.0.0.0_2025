-- Fix 2: Harden storage bucket policies for materials-data
-- Remove existing policies
DROP POLICY IF EXISTS "Authenticated users can upload materials data" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view their own materials data" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own materials data" ON storage.objects;

-- Create new policies with folder-based ownership checks
CREATE POLICY "Users can upload to their own folder in materials-data"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'materials-data' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view files in their own folder in materials-data"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'materials-data' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update files in their own folder in materials-data"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'materials-data' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'materials-data' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete files in their own folder in materials-data"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'materials-data' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix 3: Harden RLS policies to explicitly target authenticated role
-- Projects table
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Unified calculations table
DROP POLICY IF EXISTS "Users can view their own calculations" ON public.unified_calculations;
DROP POLICY IF EXISTS "Users can insert their own calculations" ON public.unified_calculations;
DROP POLICY IF EXISTS "Users can update their own calculations" ON public.unified_calculations;
DROP POLICY IF EXISTS "Users can delete their own calculations" ON public.unified_calculations;

CREATE POLICY "Users can view their own calculations"
ON public.unified_calculations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculations"
ON public.unified_calculations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations"
ON public.unified_calculations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations"
ON public.unified_calculations
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Usage metrics table
DROP POLICY IF EXISTS "Users can view their own usage metrics" ON public.usage_metrics;
DROP POLICY IF EXISTS "Users can insert their own usage metrics" ON public.usage_metrics;
DROP POLICY IF EXISTS "Users can update their own usage metrics" ON public.usage_metrics;
DROP POLICY IF EXISTS "Users can delete their own usage metrics" ON public.usage_metrics;

CREATE POLICY "Users can view their own usage metrics"
ON public.usage_metrics
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage metrics"
ON public.usage_metrics
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage metrics"
ON public.usage_metrics
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own usage metrics"
ON public.usage_metrics
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- User subscriptions table
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
ON public.user_subscriptions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Rate limits table
DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can insert their own rate limits" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can update their own rate limits" ON public.rate_limits;

CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rate limits"
ON public.rate_limits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rate limits"
ON public.rate_limits
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Materials import jobs table
DROP POLICY IF EXISTS "Users can view their own import jobs" ON public.materials_import_jobs;
DROP POLICY IF EXISTS "Users can create their own import jobs" ON public.materials_import_jobs;
DROP POLICY IF EXISTS "Users can update their own import jobs" ON public.materials_import_jobs;

CREATE POLICY "Users can view their own import jobs"
ON public.materials_import_jobs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own import jobs"
ON public.materials_import_jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own import jobs"
ON public.materials_import_jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Scope 1, 2, 3 emissions tables (project-based access)
DROP POLICY IF EXISTS "Users can access scope1 data for their projects" ON public.scope1_emissions;
CREATE POLICY "Users can access scope1 data for their projects"
ON public.scope1_emissions
FOR ALL
TO authenticated
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

DROP POLICY IF EXISTS "Users can access scope2 data for their projects" ON public.scope2_emissions;
CREATE POLICY "Users can access scope2 data for their projects"
ON public.scope2_emissions
FOR ALL
TO authenticated
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

DROP POLICY IF EXISTS "Users can access scope3 data for their projects" ON public.scope3_emissions;
CREATE POLICY "Users can access scope3 data for their projects"
ON public.scope3_emissions
FOR ALL
TO authenticated
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

-- Reports table (project-based access)
DROP POLICY IF EXISTS "Users can access reports for their projects" ON public.reports;
CREATE POLICY "Users can access reports for their projects"
ON public.reports
FOR ALL
TO authenticated
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