import { AlertCircle, Crown, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const TrialBanner = () => {
  const { isOnTrial, userSubscription } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (!isOnTrial || dismissed || !userSubscription?.trial_end) return null;

  const trialEnd = new Date(userSubscription.trial_end);
  const daysLeft = Math.ceil((trialEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Alert className="relative border-primary/50 bg-primary/5">
      <Crown className="h-4 w-4 text-primary" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          <strong>{daysLeft} days</strong> left in your Pro trial. 
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
