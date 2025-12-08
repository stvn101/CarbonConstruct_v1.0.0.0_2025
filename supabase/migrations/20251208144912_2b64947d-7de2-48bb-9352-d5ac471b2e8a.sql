-- Create storage bucket for EPD PDF archives
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'epd-archive',
  'epd-archive',
  false,
  20971520, -- 20MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for epd-archive bucket
CREATE POLICY "Admins can upload EPD PDFs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'epd-archive' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can view EPD PDFs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'epd-archive' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete EPD PDFs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'epd-archive' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);