import { Check, Zap, Building2, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { CheckoutButton } from '@/components/CheckoutButton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const { tiers, currentTier, loading } = useSubscription();
  const { tier_name: currentTierName } = useSubscriptionStatus();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Free': return Zap;
      case 'Pro': return Crown;
      case 'Business': return Building2;
      case 'Enterprise': return Building2;
      default: return Zap;
    }
  };

  const handleGetStarted = (tierName: string) => {
    if (!user) {
      navigate('/auth');
    } else if (tierName === 'Enterprise') {
      window.location.href = 'mailto:sales@carbonconstruct.com.au';
    } else {
      // TODO: Open checkout or upgrade modal
      console.log('Upgrade to:', tierName);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">Loading pricing...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that's right for your carbon accounting needs. All plans include Australian compliance standards.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {tiers?.map((tier) => {
        const Icon = getTierIcon(tier.name);
        const isCurrentTier = currentTierName === tier.name;
        const isPro = tier.name === 'Pro';

          return (
            <Card 
              key={tier.id} 
              className={`relative ${isPro ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {isPro && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle>{tier.name}</CardTitle>
                </div>
                <CardDescription>
                  <div className="text-3xl font-bold text-foreground">
                    {tier.price_monthly === 0 ? 'Free' : `$${tier.price_monthly}`}
                    {tier.price_monthly > 0 && (
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    )}
                  </div>
                  {tier.price_annual && tier.price_annual > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      or ${tier.price_annual}/year (save ${(tier.price_monthly * 12 - tier.price_annual).toFixed(0)})
                    </div>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrentTier ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : tier.name === 'Free' ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate('/auth')}
                    disabled={!!user}
                  >
                    {user ? 'Current Plan' : 'Get Started'}
                  </Button>
                ) : tier.name === 'Enterprise' ? (
                  <Button 
                    className="w-full" 
                    variant={isPro ? 'default' : 'outline'}
                    onClick={() => handleGetStarted(tier.name)}
                  >
                    Contact Sales
                  </Button>
                ) : tier.stripe_price_id && user ? (
                  <CheckoutButton
                    priceId={tier.stripe_price_id}
                    tierName={tier.name}
                    variant={isPro ? 'default' : 'outline'}
                    className="w-full"
                  >
                    Start 14-Day Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </CheckoutButton>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={isPro ? 'default' : 'outline'}
                    onClick={() => navigate('/auth')}
                  >
                    Sign Up to Subscribe
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* ROI Calculator Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Calculate Your ROI</CardTitle>
          <CardDescription>
            See how much time and money you can save with automated carbon accounting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">40+</div>
              <div className="text-sm text-muted-foreground">Hours saved per month on manual calculations</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">$15K+</div>
              <div className="text-sm text-muted-foreground">Average annual savings on compliance costs</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">99%</div>
              <div className="text-sm text-muted-foreground">Accuracy with Australian emission factors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Pricing Table Embed */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-4">Or Choose Your Plan with Stripe</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Select your subscription directly through our secure Stripe checkout
        </p>
        <div 
          className="w-full" 
          dangerouslySetInnerHTML={{
            __html: `
              <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
              <stripe-pricing-table 
                pricing-table-id="prctbl_1SULtHP7JT8gu0Wn7fABNU0I"
                publishable-key="pk_live_51RKejrP7JT8gu0WngS6oEMcUaQdgGb5XaYcEy5e2kq6Dx75lgaizFV1Fk2lmpgE7nGav6F0fDlMhSYcgecftwpu800mMRyCFJz">
              </stripe-pricing-table>
            `
          }}
        />
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Can I switch plans at any time?</h3>
            <p className="text-muted-foreground">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What compliance standards do you support?</h3>
            <p className="text-muted-foreground">
              We support Australian NCC 2024, GBCA Green Star, NABERS, and ISO 14040-44 LCA methodologies. All emission factors are Australian-specific and regularly updated.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial for Pro and Business plans?</h3>
            <p className="text-muted-foreground">
              Yes! All paid plans include a 14-day free trial. No credit card required to start your trial.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, PayPal, and can arrange invoicing for Business and Enterprise plans.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Do you offer custom enterprise solutions?</h3>
            <p className="text-muted-foreground">
              Absolutely! Our Enterprise plan is fully customizable. Contact our sales team to discuss your specific requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
