-- GST/ATO Compliance: Payment Tax Records Table
-- Required for Australian Taxation Office compliance and GST tracking

CREATE TABLE public.payment_tax_records (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    stripe_invoice_id TEXT NOT NULL,
    stripe_payment_intent_id TEXT,
    gross_amount_cents INTEGER NOT NULL,
    gst_amount_cents INTEGER NOT NULL,
    net_amount_cents INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'aud',
    invoice_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    payment_status TEXT NOT NULL DEFAULT 'succeeded',
    stripe_customer_id TEXT,
    subscription_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying by user and date range (ATO audits)
CREATE INDEX idx_payment_tax_records_user_date ON public.payment_tax_records(user_id, invoice_date);
CREATE INDEX idx_payment_tax_records_stripe_invoice ON public.payment_tax_records(stripe_invoice_id);

-- Enable RLS
ALTER TABLE public.payment_tax_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own tax records
CREATE POLICY "Users can view their own tax records"
ON public.payment_tax_records
FOR SELECT
USING (auth.uid() = user_id);

-- Service role can manage all tax records (for webhook processing)
CREATE POLICY "Service role can manage tax records"
ON public.payment_tax_records
FOR ALL
USING (true)
WITH CHECK (true);

-- Admins can view all tax records for reporting
CREATE POLICY "Admins can view all tax records"
ON public.payment_tax_records
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add consent versioning fields to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS consent_version TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS cookie_preferences JSONB DEFAULT '{"essential": true, "analytics": false, "marketing": false}'::jsonb;

-- Create trigger for updated_at
CREATE TRIGGER update_payment_tax_records_updated_at
BEFORE UPDATE ON public.payment_tax_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comment for ATO compliance documentation
COMMENT ON TABLE public.payment_tax_records IS 'GST/ATO compliance records - 5 year retention per ATO requirements';