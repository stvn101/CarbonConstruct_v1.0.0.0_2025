import { Crown, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const TrialBanner = () => {
  const { trial_end, tier_name } = useSubscriptionStatus();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  const isOnTrial = trial_end ? new Date(trial_end) > new Date() : false;

  if (!isOnTrial || dismissed || !trial_end) return null;

  const trialEnd = new Date(trial_end);
  const daysLeft = Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Alert className="relative border-primary/50 bg-primary/5">
      <Crown className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>{daysLeft} days</strong> left in your {tier_name} trial. 
          Upgrade now to keep unlimited access.
        </span>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={() => navigate('/pricing')}
          >
            Upgrade to Pro
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
