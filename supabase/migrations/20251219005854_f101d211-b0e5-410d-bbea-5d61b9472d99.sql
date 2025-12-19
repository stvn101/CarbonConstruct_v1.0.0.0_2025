-- Create EPD renewal workflow tracker table
CREATE TABLE public.epd_renewal_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  material_id TEXT NOT NULL,
  material_name TEXT NOT NULL,
  epd_number TEXT,
  manufacturer TEXT,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'requested', 'received', 'verified', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  supplier_contact_id UUID REFERENCES public.supplier_contacts(id) ON DELETE SET NULL,
  contact_date TIMESTAMP WITH TIME ZONE,
  request_date TIMESTAMP WITH TIME ZONE,
  expected_response_date TIMESTAMP WITH TIME ZONE,
  received_date TIMESTAMP WITH TIME ZONE,
  new_epd_number TEXT,
  new_expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.epd_renewal_workflows ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own renewal workflows" 
ON public.epd_renewal_workflows 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own renewal workflows" 
ON public.epd_renewal_workflows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own renewal workflows" 
ON public.epd_renewal_workflows 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own renewal workflows" 
ON public.epd_renewal_workflows 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_epd_renewal_workflows_updated_at
BEFORE UPDATE ON public.epd_renewal_workflows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_epd_renewal_workflows_user_status ON public.epd_renewal_workflows(user_id, status);
CREATE INDEX idx_epd_renewal_workflows_material ON public.epd_renewal_workflows(material_id);