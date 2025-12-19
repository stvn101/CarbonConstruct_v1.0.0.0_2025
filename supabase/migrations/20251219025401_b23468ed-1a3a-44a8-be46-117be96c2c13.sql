-- Create ICE import jobs table for tracking and audit trail
CREATE TABLE public.ice_import_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'parsing', 'validating', 'importing', 'completed', 'failed', 'cancelled')),
  worksheet_name TEXT,
  header_row INTEGER,
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  imported_count INTEGER DEFAULT 0,
  updated_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  column_mappings JSONB,
  validation_preview JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ice_import_jobs ENABLE ROW LEVEL SECURITY;

-- Admins can see all import jobs
CREATE POLICY "Admins can view all import jobs"
ON public.ice_import_jobs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own import jobs
CREATE POLICY "Users can view own import jobs"
ON public.ice_import_jobs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own import jobs
CREATE POLICY "Users can create own import jobs"
ON public.ice_import_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own import jobs
CREATE POLICY "Users can update own import jobs"
ON public.ice_import_jobs
FOR UPDATE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_ice_import_jobs_updated_at
BEFORE UPDATE ON public.ice_import_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint to materials_epd for deduplication
-- Use material_name + data_source + unit as the unique key for ICE materials
CREATE UNIQUE INDEX IF NOT EXISTS idx_materials_epd_dedupe 
ON public.materials_epd (material_name, data_source, unit) 
WHERE data_source = 'ICE Database';