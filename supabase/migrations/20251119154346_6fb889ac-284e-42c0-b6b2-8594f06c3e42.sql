-- Create storage bucket for materials data files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'materials-data',
  'materials-data',
  false,
  52428800, -- 50MB limit
  ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv', 'application/json']
);

-- RLS policies for materials-data bucket
CREATE POLICY "Authenticated users can upload materials files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'materials-data' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view their materials files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'materials-data' AND auth.uid() IS NOT NULL);

CREATE POLICY "Service role has full access to materials files"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'materials-data');

-- Create materials_import_jobs table to track import progress
CREATE TABLE IF NOT EXISTS public.materials_import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  records_processed INTEGER DEFAULT 0,
  records_total INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.materials_import_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for import jobs
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

CREATE POLICY "Service role has full access to import jobs"
ON public.materials_import_jobs
FOR ALL
TO service_role
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_materials_import_jobs_updated_at
BEFORE UPDATE ON public.materials_import_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();