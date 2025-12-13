import { useState } from 'react';
import { Check, Zap, Building2, Crown, ArrowRight, Leaf, ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import { CheckoutButton } from '@/components/CheckoutButton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';

// Static pricing tiers with new Stripe price IDs (14-day trial enabled)
const PRICING_TIERS = [
  {
    name: 'Free',
    icon: Zap,
    price: 0,
    priceYearly: 0,
    description: 'Perfect for getting started',
    stripePriceId: null,
    stripePriceIdYearly: null,
    features: [
      '1 project',
      'ICM material database only',
      'PDF reports',
      'Email support',
    ],
    highlight: 'forever-free',
    ctaText: 'Start Free Forever',
  },
  {
    name: 'Professional',
    icon: Crown,
    price: 79,
    priceYearly: 790,
    description: 'For serious carbon tracking',
    stripePriceId: 'price_1Scw3eP7JT8gu0WnWKOJ5B6d',
    stripePriceIdYearly: 'price_1Scw3fP7JT8gu0WnQguub7mx',
    features: [
      'Unlimited projects',
      'Unlimited calculations',
      'Full EPD database (4,000+ materials)',
      'EN 15978 lifecycle stages',
      'Custom report branding',
      'AI carbon recommendations',
      'Priority support',
      '14-day free trial',
    ],
    highlight: 'popular',
    ctaText: 'Start 14-Day Free Trial',
  },
  {
    name: 'Business',
    icon: Building2,
    price: 249,
    priceYearly: 2490,
    description: 'For teams and organisations',
    stripePriceId: 'price_1Scw3dP7JT8gu0WnsZsM7ip0',
    stripePriceIdYearly: 'price_1Scw3eP7JT8gu0WnUwLw5drx',
    features: [
      'Everything in Professional',
      'Team collaboration',
      'SSO authentication',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced analytics',
      '14-day free trial',
    ],
    highlight: null,
    ctaText: 'Start 14-Day Free Trial',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: null, // Custom pricing
    priceYearly: null,
    description: 'Custom solutions for large organisations',
    stripePriceId: null,
    stripePriceIdYearly: null,
    features: [
      'Everything in Business',
      'Unlimited team members',
      'On-premise deployment option',
      'Custom SLA',
      'Dedicated support team',
      'White-label options',
      'Custom compliance modules',
      'Training & onboarding',
    ],
    highlight: null,
    ctaText: 'Contact Sales',
  },
];

const Pricing = () => {
  const { tier_name: currentTierName } = useSubscriptionStatus();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleGetStarted = (tierName: string) => {
    if (tierName === 'Enterprise') {
      window.location.href = 'mailto:sales@carbonconstruct.com.au?subject=Enterprise%20Inquiry';
    } else if (!user) {
      navigate('/auth');
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <SEOHead 
        title="Pricing" 
        description="Choose the right CarbonConstruct plan for your Australian construction carbon tracking needs. Free, Pro, and Enterprise options available."
        canonicalPath="/pricing"
      />
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that's right for your carbon accounting needs. All plans include Australian compliance standards.
        </p>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <div className="inline-flex items-center bg-muted rounded-full p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingPeriod === 'yearly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <Badge className="bg-emerald-600 text-white text-xs px-2 py-0.5">
              Save 17%
            </Badge>
          </button>
        </div>
      </div>

      {/* Stripe Climate Badge */}
      <Card className="mb-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 flex items-center justify-center md:justify-start gap-2">
                Climate Positive Subscriptions
                <Badge variant="secondary" className="text-xs">Stripe Climate</Badge>
              </h3>
              <p className="text-muted-foreground mb-3">
                0.5% of every subscription goes directly to carbon removal through Stripe Climate. 
                We're committed to helping reverse climate change while you track emissions.
              </p>
              <a 
                href="https://climate.stripe.com/qDm9Cw" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                Learn more about our impact
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Cards - Fixed Height Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 items-stretch">
        {PRICING_TIERS.map((tier) => {
          const Icon = tier.icon;
          const isCurrentTier = currentTierName === tier.name || (currentTierName === 'Pro' && tier.name === 'Professional');
          const isPopular = tier.highlight === 'popular';
          const isForeverFree = tier.highlight === 'forever-free';
          const isEnterprise = tier.name === 'Enterprise';

          return (
            <Card 
              key={tier.name} 
              className={`relative flex flex-col h-full ${
                isPopular 
                  ? 'border-primary border-2 shadow-xl scale-[1.02] z-10' 
                  : isForeverFree 
                    ? 'border-emerald-500/50 border-2 bg-emerald-500/5' 
                    : ''
              }`}
            >
              {/* Badges */}
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              {isForeverFree && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4">
                  Forever Free
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${isPopular ? 'bg-primary/10' : isForeverFree ? 'bg-emerald-500/10' : 'bg-muted'}`}>
                    <Icon className={`h-5 w-5 ${isPopular ? 'text-primary' : isForeverFree ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                </div>
                <CardDescription className="text-sm">{tier.description}</CardDescription>
                
                {/* Pricing */}
                <div className="mt-4">
                  {tier.price === null ? (
                    <div className="space-y-1">
                      <span className="text-3xl font-bold text-foreground">Custom</span>
                      <p className="text-sm text-muted-foreground">Tailored to your needs</p>
                    </div>
                  ) : tier.price === 0 ? (
                    <div className="space-y-1">
                      <span className="text-3xl font-bold text-emerald-600">$0</span>
                      <span className="text-sm text-muted-foreground ml-1">forever</span>
                      <p className="text-xs text-emerald-600 font-medium">No credit card required</p>
                    </div>
                  ) : billingPeriod === 'monthly' ? (
                    <div className="space-y-1">
                      <span className="text-3xl font-bold text-foreground">${tier.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                      <p className="text-xs text-muted-foreground">
                        Billed monthly
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-3xl font-bold text-foreground">${tier.priceYearly}</span>
                      <span className="text-sm text-muted-foreground">/year</span>
                      <p className="text-xs text-emerald-600 font-medium">
                        ${Math.round(tier.priceYearly! / 12)}/mo · Save ${tier.price * 12 - tier.priceYearly!}
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isPopular ? 'text-primary' : isForeverFree ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Upgrade prompt for Free tier */}
                {isForeverFree && (
                  <div className="mt-4 pt-4 border-t border-emerald-500/20">
                    <p className="text-xs text-muted-foreground">
                      Need more? <span className="text-primary font-medium">Upgrade to Professional</span> for unlimited access.
                    </p>
                  </div>
                )}
                
                {/* Carbon removal note for paid tiers */}
                {tier.price !== null && tier.price > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Leaf className="h-3.5 w-3.5 text-primary" />
                      <span>0.5% supports carbon removal</span>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-4">
                {isCurrentTier ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current Plan
                  </Button>
                ) : isEnterprise ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleGetStarted(tier.name)}
                  >
                    {tier.ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : tier.stripePriceId && user ? (
                  <CheckoutButton
                    priceId={billingPeriod === 'yearly' && tier.stripePriceIdYearly ? tier.stripePriceIdYearly : tier.stripePriceId}
                    tierName={tier.name}
                    variant={isPopular ? 'default' : isForeverFree ? 'outline' : 'outline'}
                    className={`w-full ${isForeverFree ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-500/10' : ''}`}
                  >
                    {tier.ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </CheckoutButton>
                ) : (
                  <Button 
                    className={`w-full ${isForeverFree ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                    variant={isPopular ? 'default' : isForeverFree ? 'default' : 'outline'}
                    onClick={() => handleGetStarted(tier.name)}
                  >
                    {tier.ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Why CarbonConstruct Section */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>Why CarbonConstruct?</CardTitle>
          <CardDescription>
            Built specifically for Australian construction compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">4,000+</div>
              <div className="text-sm text-muted-foreground">EPD materials in our database with verified emission factors</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">4</div>
              <div className="text-sm text-muted-foreground">Australian compliance frameworks supported (NCC, Green Star, NABERS, IS Rating)</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">EN 15978</div>
              <div className="text-sm text-muted-foreground">Full lifecycle assessment methodology (A1-D stages)</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            All emission factors sourced from NABERS 2025 EPD List and ICE Database 2019
          </p>
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
              Absolutely! Our Enterprise plan is fully customizable with pricing tailored to your organisation's needs. Contact our sales team to discuss your specific requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
