-- Harden RLS policies for rate_limits table
-- Remove overly permissive service role policy
DROP POLICY IF EXISTS "Service role can manage all rate limits" ON public.rate_limits;

-- Add admin access policy using has_role function
CREATE POLICY "Admins can manage all rate limits"
ON public.rate_limits
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Harden RLS policies for materials_import_jobs table
-- Remove overly permissive service role policy  
DROP POLICY IF EXISTS "Service role has full access to import jobs" ON public.materials_import_jobs;

-- Add admin access policy using has_role function
CREATE POLICY "Admins can manage all import jobs"
ON public.materials_import_jobs
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add delete policy for users to clean up their own jobs
CREATE POLICY "Users can delete their own import jobs"
ON public.materials_import_jobs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);