-- Add account status tracking to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS status_changed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deletion_scheduled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deletion_token uuid;

-- Add index for finding pending deletions
CREATE INDEX IF NOT EXISTS idx_user_preferences_deletion_scheduled 
ON public.user_preferences(deletion_scheduled_at) 
WHERE deletion_scheduled_at IS NOT NULL;

-- Add check constraint for valid statuses
ALTER TABLE public.user_preferences 
ADD CONSTRAINT valid_account_status 
CHECK (account_status IN ('active', 'suspended', 'pending_deletion'));