-- Create table for EPD reminder settings
CREATE TABLE public.epd_reminder_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    reminder_days INTEGER[] NOT NULL DEFAULT ARRAY[30, 60, 90],
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    last_reminder_sent TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create table for supplier contacts
CREATE TABLE public.supplier_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_name TEXT NOT NULL,
    contact_type TEXT NOT NULL CHECK (contact_type IN ('manufacturer', 'program_operator', 'distributor')),
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    notes TEXT,
    epd_numbers TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.epd_reminder_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for epd_reminder_settings
CREATE POLICY "Users can view their own reminder settings"
ON public.epd_reminder_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminder settings"
ON public.epd_reminder_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder settings"
ON public.epd_reminder_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder settings"
ON public.epd_reminder_settings FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for supplier_contacts
CREATE POLICY "Users can view their own supplier contacts"
ON public.supplier_contacts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplier contacts"
ON public.supplier_contacts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplier contacts"
ON public.supplier_contacts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplier contacts"
ON public.supplier_contacts FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_epd_reminder_settings_user_id ON public.epd_reminder_settings(user_id);
CREATE INDEX idx_supplier_contacts_user_id ON public.supplier_contacts(user_id);
CREATE INDEX idx_supplier_contacts_company_name ON public.supplier_contacts(company_name);

-- Add updated_at triggers
CREATE TRIGGER update_epd_reminder_settings_updated_at
BEFORE UPDATE ON public.epd_reminder_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_contacts_updated_at
BEFORE UPDATE ON public.supplier_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();