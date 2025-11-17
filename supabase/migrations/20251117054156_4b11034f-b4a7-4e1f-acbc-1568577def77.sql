-- Create subscription tiers table
CREATE TABLE public.subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  stripe_price_id text UNIQUE,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_annual numeric,
  features jsonb NOT NULL DEFAULT '{}',
  limits jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES public.subscription_tiers(id),
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'active',
  trial_end timestamp with time zone,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create usage metrics table
CREATE TABLE public.usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_type, period_start)
);

-- Enable RLS
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_tiers (publicly readable)
CREATE POLICY "Anyone can view subscription tiers"
  ON public.subscription_tiers
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for usage_metrics
CREATE POLICY "Users can view their own usage metrics"
  ON public.usage_metrics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage metrics"
  ON public.usage_metrics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage metrics"
  ON public.usage_metrics
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for subscription_tiers updated_at
CREATE TRIGGER update_subscription_tiers_updated_at
  BEFORE UPDATE ON public.subscription_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for user_subscriptions updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for usage_metrics updated_at
CREATE TRIGGER update_usage_metrics_updated_at
  BEFORE UPDATE ON public.usage_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, price_monthly, price_annual, features, limits, display_order) VALUES
('Free', 0, 0, 
  '["Up to 2 projects", "Basic carbon calculations", "2 PDF reports per month", "Community support", "Access to emission factors database"]',
  '{"projects": 2, "reports_per_month": 2, "lca_calculations": false, "team_collaboration": false}'::jsonb,
  1),
('Pro', 79, 790,
  '["Unlimited projects", "Advanced LCA calculations", "Unlimited professional reports", "Priority email support", "Advanced analytics", "Export to Excel/CSV", "Custom branding on reports"]',
  '{"projects": -1, "reports_per_month": -1, "lca_calculations": true, "team_collaboration": false}'::jsonb,
  2),
('Business', 249, 2490,
  '["Everything in Pro", "Team collaboration (up to 10 users)", "API access", "Dedicated account manager", "Custom emission factors", "White-label reports", "SSO integration", "Advanced compliance reporting"]',
  '{"projects": -1, "reports_per_month": -1, "lca_calculations": true, "team_collaboration": true, "team_size": 10, "api_access": true}'::jsonb,
  3),
('Enterprise', 0, 0,
  '["Everything in Business", "Unlimited team members", "Custom integrations", "On-premise deployment option", "24/7 phone support", "Training & onboarding", "SLA guarantee", "Custom feature development"]',
  '{"projects": -1, "reports_per_month": -1, "lca_calculations": true, "team_collaboration": true, "team_size": -1, "api_access": true, "custom_integrations": true}'::jsonb,
  4);

-- Function to get user's current subscription tier
CREATE OR REPLACE FUNCTION public.get_user_tier(user_id_param uuid)
RETURNS TABLE (
  tier_name text,
  tier_limits jsonb,
  subscription_status text,
  trial_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    st.name,
    st.limits,
    COALESCE(us.status, 'free'),
    CASE 
      WHEN us.trial_end IS NOT NULL AND us.trial_end > now() THEN true
      ELSE false
    END as trial_active
  FROM public.subscription_tiers st
  LEFT JOIN public.user_subscriptions us ON us.tier_id = st.id AND us.user_id = user_id_param
  WHERE (us.user_id = user_id_param OR st.name = 'Free')
  ORDER BY st.display_order DESC
  LIMIT 1;
$$;

-- Function to check if user can perform action based on limits
CREATE OR REPLACE FUNCTION public.can_perform_action(
  user_id_param uuid,
  action_type text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tier_limits jsonb;
  current_usage integer;
  limit_value integer;
BEGIN
  -- Get user's tier limits
  SELECT limits INTO tier_limits
  FROM public.get_user_tier(user_id_param);
  
  -- Get the limit for this action
  limit_value := (tier_limits->>action_type)::integer;
  
  -- -1 means unlimited
  IF limit_value = -1 THEN
    RETURN true;
  END IF;
  
  -- Get current usage
  SELECT count INTO current_usage
  FROM public.usage_metrics
  WHERE user_id = user_id_param
    AND metric_type = action_type
    AND period_start <= now()
    AND period_end >= now();
  
  -- If no usage record, assume 0
  IF current_usage IS NULL THEN
    current_usage := 0;
  END IF;
  
  RETURN current_usage < limit_value;
END;
$$;