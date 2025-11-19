-- Add version column to usage_metrics for optimistic locking
ALTER TABLE public.usage_metrics 
ADD COLUMN version integer NOT NULL DEFAULT 1;

-- Add index on user_id, metric_type, and period for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_metrics_lookup 
ON public.usage_metrics(user_id, metric_type, period_start, period_end);

-- Add unique constraint to prevent duplicate metrics for same period
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_metrics_unique_period
ON public.usage_metrics(user_id, metric_type, period_start, period_end);

-- Add trigger to increment version on update
CREATE OR REPLACE FUNCTION public.increment_usage_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usage_metrics_version_trigger
BEFORE UPDATE ON public.usage_metrics
FOR EACH ROW
EXECUTE FUNCTION public.increment_usage_version();