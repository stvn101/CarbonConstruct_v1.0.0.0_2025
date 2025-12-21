-- Create verification history table
CREATE TABLE public.material_verification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_materials INTEGER NOT NULL,
  categories_count INTEGER NOT NULL,
  sources_count INTEGER NOT NULL,
  pass_rate NUMERIC NOT NULL,
  pass_count INTEGER NOT NULL,
  warn_count INTEGER NOT NULL,
  fail_count INTEGER NOT NULL,
  outliers_count INTEGER NOT NULL DEFAULT 0,
  category_stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata_completeness JSONB NOT NULL DEFAULT '{}'::jsonb,
  outlier_materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.material_verification_history ENABLE ROW LEVEL SECURITY;

-- RLS policies - admins only can view/manage verification history
CREATE POLICY "Admins can view verification history"
ON public.material_verification_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert verification history"
ON public.material_verification_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage verification history"
ON public.material_verification_history
FOR ALL
USING (true)
WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX idx_verification_history_verified_at ON public.material_verification_history(verified_at DESC);
CREATE INDEX idx_verification_history_user_id ON public.material_verification_history(user_id);