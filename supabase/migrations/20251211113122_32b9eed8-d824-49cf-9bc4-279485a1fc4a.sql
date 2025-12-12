-- Add column for yearly Stripe price IDs
ALTER TABLE subscription_tiers 
ADD COLUMN IF NOT EXISTS stripe_price_id_yearly text;