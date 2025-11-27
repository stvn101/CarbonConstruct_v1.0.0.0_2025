-- Fix the security definer view issue by explicitly setting SECURITY INVOKER
-- This ensures RLS policies of the querying user are respected

ALTER VIEW public.user_subscriptions_safe SET (security_invoker = true);