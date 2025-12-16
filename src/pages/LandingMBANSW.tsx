import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Building2, Leaf, Shield, Clock, Users, Award, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnalytics, AnalyticsEvents } from '@/hooks/useAnalytics';
import { useUTMTracking } from '@/hooks/useUTMTracking';
import { SEOHead } from '@/components/SEOHead';

const LandingMBANSW = () => {
  const { trackEvent } = useAnalytics();
  const { getCampaignAttribution } = useUTMTracking();

  useEffect(() => {
    // Store discount code in sessionStorage for checkout flow
    sessionStorage.setItem('discount_code', 'MBA20NSW');
    
    trackEvent(AnalyticsEvents.CAMPAIGN_PAGE_VIEW, {
      audience: 'mba-nsw',
      offer: '20-percent-off',
      discount_code: 'MBA20NSW',
      ...getCampaignAttribution()
    });
  }, [trackEvent, getCampaignAttribution]);

  const benefits = [
    {
      icon: Percent,
      title: '20% Off Pro Yearly',
      description: 'Exclusive MBA NSW member discount on annual subscriptions'
    },
    {
      icon: Building2,
      title: 'NSW Grid Factor 0.76',
      description: 'Pre-configured with accurate NSW electricity emission factors'
    },
    {
      icon: Shield,
      title: 'NCC Section J Ready',
      description: 'Built-in compliance checking for Australian building codes'
    },
    {
      icon: Award,
      title: 'Level 1 White Label',
      description: 'Add your company branding to client reports'
    },
    {
      icon: Clock,
      title: 'Save 10+ Hours/Project',
      description: 'Automated calculations vs manual spreadsheet methods'
    },
    {
      icon: Users,
      title: 'Priority Support',
      description: 'Dedicated assistance for MBA member organisations'
    }
  ];

  const includedFeatures = [
    '4,000+ verified Australian EPD materials',
    'NSW-specific emission factors pre-loaded',
    'Green Star credit alignment tracking',
    'NABERS embodied carbon compliance',
    'Unlimited PDF report generation',
    'Company branding on reports',
    'Full EN 15978 lifecycle assessment',
    'Real-time Scope 3 calculations'
  ];

  return (
    <>
      <SEOHead
        title="MBA NSW Members | 20% Off CarbonConstruct Pro"
        description="Exclusive offer for Master Builders Association NSW members. Get 20% off CarbonConstruct Pro with NSW-specific grid factors and NCC Section J compliance tools."
        canonicalPath="/lp/mba-nsw"
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-emerald-500/10">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center lg:text-left">
                <Badge variant="outline" className="mb-4 border-emerald-500 text-emerald-600">
                  <Award className="w-4 h-4 mr-2" />
                  MBA NSW Member Exclusive
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Carbon Compliance for{' '}
                  <span className="text-emerald-600">NSW Builders</span>
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                  CarbonConstruct is the only carbon calculator built by Australian construction professionals, 
                  for Australian construction professionals. Now with exclusive MBA member pricing.
                </p>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6 mb-8">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-3">
                    <span className="text-4xl font-bold text-emerald-600">20% OFF</span>
                    <Badge className="bg-emerald-600">MBA20NSW</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Pro Yearly subscription • Automatically applied at checkout
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                    <Link to="/auth?mode=signup">
                      Claim Your Discount
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/pricing">
                      View All Plans
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex-1 max-w-md">
                <Card className="border-emerald-500/30 shadow-xl">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <p className="text-muted-foreground mb-2">Pro Yearly with MBA Discount</p>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-2xl text-muted-foreground line-through">$588</span>
                        <span className="text-5xl font-bold text-emerald-600">$470</span>
                        <span className="text-muted-foreground">/year</span>
                      </div>
                      <p className="text-sm text-emerald-600 mt-2">Save $118 per year</p>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {includedFeatures.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg" asChild>
                      <Link to="/auth?mode=signup">
                        Start 14-Day Free Trial
                      </Link>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      No credit card required • Cancel anytime
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Built for NSW Construction</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Pre-configured with NSW-specific data and compliance requirements
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-border/50 hover:border-emerald-500/30 transition-colors">
                  <CardContent className="p-6">
                    <benefit.icon className="h-10 w-10 text-emerald-600 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* NSW Specific Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <Leaf className="h-12 w-12 text-emerald-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Why NSW Builders Choose CarbonConstruct</h2>
            <p className="text-lg text-muted-foreground mb-8">
              With NSW's grid emission factor of 0.76 kgCO2e/kWh and increasing regulatory pressure 
              from NCC 2024 Section J requirements, accurate carbon calculations are essential. 
              CarbonConstruct comes pre-configured with NSW-specific data so you can focus on 
              building, not spreadsheets.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="text-base py-2 px-4">
                Sydney Metro Projects
              </Badge>
              <Badge variant="secondary" className="text-base py-2 px-4">
                Regional NSW Coverage
              </Badge>
              <Badge variant="secondary" className="text-base py-2 px-4">
                NCC Section J Ready
              </Badge>
              <Badge variant="secondary" className="text-base py-2 px-4">
                Green Star Aligned
              </Badge>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Simplify Carbon Compliance?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join other MBA NSW members already using CarbonConstruct to streamline their 
              carbon calculations and win more compliant projects.
            </p>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link to="/auth?mode=signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Use code <span className="font-mono font-bold text-emerald-600">MBA20NSW</span> for 20% off Pro Yearly
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default LandingMBANSW;
