-- Create missing boq-files storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('boq-files', 'boq-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for boq-files bucket
CREATE POLICY "Users can upload to boq-files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'boq-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own boq files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'boq-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own boq files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'boq-files' AND auth.uid()::text = (storage.foldername(name))[1]);