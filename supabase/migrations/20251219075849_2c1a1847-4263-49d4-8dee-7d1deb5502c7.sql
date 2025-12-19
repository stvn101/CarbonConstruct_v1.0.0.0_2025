-- Create email campaign analytics table
CREATE TABLE public.email_campaign_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  audience TEXT NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  click_url TEXT,
  conversion_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_email_analytics_campaign ON public.email_campaign_analytics(campaign_id);
CREATE INDEX idx_email_analytics_audience ON public.email_campaign_analytics(audience);
CREATE INDEX idx_email_analytics_variant ON public.email_campaign_analytics(variant);
CREATE INDEX idx_email_analytics_sent_at ON public.email_campaign_analytics(sent_at);

-- Create email campaign schedules table
CREATE TABLE public.email_campaign_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  audience TEXT NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),
  recipient_filter JSONB DEFAULT '{}',
  sent_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_schedules ENABLE ROW LEVEL SECURITY;

-- Analytics are viewable by admins only
CREATE POLICY "Admins can view all campaign analytics"
  ON public.email_campaign_analytics
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Schedules are manageable by admins
CREATE POLICY "Admins can manage campaign schedules"
  ON public.email_campaign_schedules
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Service role can insert analytics (for edge functions)
CREATE POLICY "Service role can insert analytics"
  ON public.email_campaign_analytics
  FOR INSERT
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_email_campaign_schedules_updated_at
  BEFORE UPDATE ON public.email_campaign_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();