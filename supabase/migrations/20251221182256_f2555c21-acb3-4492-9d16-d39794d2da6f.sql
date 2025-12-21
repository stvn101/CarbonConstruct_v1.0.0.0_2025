-- Fix material_verification_history RLS - allow users to view their own verification history
-- Currently only admins can view, but users should see their own records

CREATE POLICY "Users can view own verification history" 
ON public.material_verification_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification history"
ON public.material_verification_history 
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Harden rate_limits - ensure users can only view their own (policy already exists but let's verify naming is clear)
-- Drop and recreate with explicit naming for clarity
DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.rate_limits;

CREATE POLICY "Users can only view own rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (auth.uid() = user_id);