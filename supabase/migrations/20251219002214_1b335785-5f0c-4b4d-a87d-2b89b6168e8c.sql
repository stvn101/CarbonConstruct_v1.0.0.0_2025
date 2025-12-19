-- Create table for syncing user's favorite materials across devices
CREATE TABLE public.user_material_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  material_id TEXT NOT NULL,
  material_name TEXT NOT NULL,
  material_category TEXT NOT NULL,
  unit TEXT NOT NULL,
  factor NUMERIC NOT NULL,
  source TEXT,
  epd_number TEXT,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, material_id)
);

-- Enable RLS
ALTER TABLE public.user_material_favorites ENABLE ROW LEVEL SECURITY;

-- Users can only access their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.user_material_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.user_material_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
  ON public.user_material_favorites
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.user_material_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_material_favorites_user_id ON public.user_material_favorites(user_id);
CREATE INDEX idx_user_material_favorites_usage ON public.user_material_favorites(user_id, usage_count DESC);