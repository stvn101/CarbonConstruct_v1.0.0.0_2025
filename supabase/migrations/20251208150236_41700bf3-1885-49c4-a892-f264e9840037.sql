-- Enable RLS on the user_subscriptions_safe view
ALTER VIEW public.user_subscriptions_safe SET (security_invoker = true);

-- Add RLS policy for users to view only their own subscription
CREATE POLICY "Users can view their own subscription via safe view"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Note: The security_invoker = true setting makes the view execute 
-- with the permissions of the querying user, so the existing RLS 
-- policies on user_subscriptions will be enforced through the view.