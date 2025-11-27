-- Create error_logs table for production error tracking
CREATE TABLE public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  page_url TEXT,
  browser_info JSONB,
  severity TEXT NOT NULL DEFAULT 'error',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance_metrics table for APM
CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  page_url TEXT,
  device_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_events table for user analytics
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table for system alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  message TEXT NOT NULL,
  metadata JSONB,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for error_logs (service role can insert, users can view their own)
CREATE POLICY "Service role can manage error logs"
ON public.error_logs FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own error logs"
ON public.error_logs FOR SELECT
USING (auth.uid() = user_id);

-- RLS policies for performance_metrics
CREATE POLICY "Service role can manage performance metrics"
ON public.performance_metrics FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own performance metrics"
ON public.performance_metrics FOR SELECT
USING (auth.uid() = user_id);

-- RLS policies for analytics_events
CREATE POLICY "Service role can manage analytics events"
ON public.analytics_events FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own analytics events"
ON public.analytics_events FOR SELECT
USING (auth.uid() = user_id);

-- RLS policies for alerts (service role only)
CREATE POLICY "Service role can manage alerts"
ON public.alerts FOR ALL
USING (auth.role() = 'service_role');

-- Create indexes for better query performance
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_metric_name ON public.performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_created_at ON public.performance_metrics(created_at DESC);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX idx_alerts_alert_type ON public.alerts(alert_type);
CREATE INDEX idx_alerts_resolved ON public.alerts(resolved);