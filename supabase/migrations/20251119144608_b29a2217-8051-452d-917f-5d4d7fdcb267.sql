-- Fix search_path for the increment_usage_version function
CREATE OR REPLACE FUNCTION public.increment_usage_version()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;