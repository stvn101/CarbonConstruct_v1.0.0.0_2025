import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { CheckoutButton } from '@/components/CheckoutButton';
import { useNavigate } from 'react-router-dom';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
  limitType?: string;
}

export const UpgradeModal = ({ open, onOpenChange, feature, limitType }: UpgradeModalProps) => {
  const { tiers, currentTier } = useSubscription();
  const navigate = useNavigate();

  const proTier = tiers?.find(t => t.name === 'Pro');
  const freeTier = tiers?.find(t => t.name === 'Free');

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  const handleViewPlans = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  const getFeatureMessage = () => {
    if (feature) return feature;
    if (limitType === 'projects') return 'You\'ve reached your project limit';
    if (limitType === 'reports_per_month') return 'You\'ve reached your monthly report limit';
    if (limitType === 'lca_calculations') return 'LCA calculations require a Pro subscription';
    return 'This feature requires an upgrade';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            {getFeatureMessage()}. Unlock unlimited access with Pro.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 my-6">
          {/* Current Plan (Free) */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{freeTier?.name || 'Free'}</h3>
              {currentTier?.name === 'Free' && (
                <Badge variant="secondary">Current</Badge>
              )}
            </div>
            <div className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-3">
              {freeTier?.features.slice(0, 5).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-primary rounded-lg p-6 bg-primary/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                {proTier?.name || 'Pro'}
              </h3>
              <Badge>Recommended</Badge>
            </div>
            <div className="text-3xl font-bold mb-4">
              ${proTier?.price_monthly || 79}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-3 mb-6">
              {proTier?.features.slice(0, 7).map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {proTier?.stripe_price_id && (
              <>
                <CheckoutButton
                  priceId={proTier.stripe_price_id}
                  tierName={proTier.name}
                  className="w-full"
                  variant="default"
                >
                  Upgrade to Pro <ArrowRight className="ml-2 h-4 w-4" />
                </CheckoutButton>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  14-day free trial • Cancel anytime
                </p>
              </>
            )}
          </div>
        </div>

        {/* Comparison */}
        <div className="border-t pt-6">
          <h4 className="font-semibold mb-3">What you'll unlock:</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">Unlimited Projects</div>
                <div className="text-sm text-muted-foreground">Create as many projects as you need</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">Unlimited Reports</div>
                <div className="text-sm text-muted-foreground">Export professional reports anytime</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">Advanced LCA</div>
                <div className="text-sm text-muted-foreground">Full lifecycle assessment calculations</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="font-medium">Priority Support</div>
                <div className="text-sm text-muted-foreground">Get help when you need it</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={handleViewPlans}>
            View All Plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
