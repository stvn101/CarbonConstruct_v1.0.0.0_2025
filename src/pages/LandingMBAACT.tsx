import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/components/SEOHead';
import { useAnalytics, AnalyticsEvents } from '@/hooks/useAnalytics';
import { useUTMTracking } from '@/hooks/useUTMTracking';
import { 
  CheckCircle, 
  ArrowRight, 
  Building2, 
  FileText, 
  Award,
  Clock,
  Shield,
  Users,
  Percent,
  MapPin,
  Zap
} from 'lucide-react';

const benefits = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Your Logo, Your Reports",
    description: "Level 1 White Label included with Pro Yearly. Every PDF report features YOUR company branding—not ours."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "NCC 2024 Section J Compliant",
    description: "Built-in compliance checking for ACT building classes. No manual interpretation needed."
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Reports in Minutes",
    description: "What used to take days now takes minutes. More time on site, less time in spreadsheets."
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Green Star & NABERS Ready",
    description: "Credit alignment for ACT projects pursuing Green Star certification or NABERS ratings."
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Built by a Builder",
    description: "Created by Steven—17 years in construction, MBA member. Not consultants, not tech bros."
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "ACT-Specific Data",
    description: "Australian EPD materials with ACT grid factors, local suppliers, and regional climate zone support."
  }
];

const whiteLabeFeatures = [
  "Your company logo on every PDF report",
  "Your business name in report headers",
  "Your contact details for client follow-up",
  "Professional reports that build YOUR brand",
  "No 'Powered by' watermarks or third-party branding"
];

const includedFeatures = [
  "4,000+ verified Australian EPD materials",
  "ACT-specific emission factors pre-loaded",
  "Green Star credit alignment tracking",
  "NABERS embodied carbon compliance",
  "Unlimited PDF report generation",
  "Company branding on reports",
  "Full EN 15978 lifecycle assessment",
  "Real-time Scope 3 calculations"
];

export default function LandingMBAACT() {
  const { trackEvent } = useAnalytics();
  const { getCampaignAttribution } = useUTMTracking();

  useEffect(() => {
    sessionStorage.setItem('discount_code', 'MBA20ACT');
    
    trackEvent(AnalyticsEvents.CAMPAIGN_PAGE_VIEW, {
      audience: 'mba-act',
      offer: '20-percent-off',
      ...getCampaignAttribution(),
    });
  }, [trackEvent, getCampaignAttribution]);

  const handleCTAClick = (ctaType: string) => {
    trackEvent(AnalyticsEvents.CAMPAIGN_CTA_CLICKED, {
      audience: 'mba-act',
      cta_type: ctaType,
      offer: '20-percent-off',
      ...getCampaignAttribution(),
    });
  };

  return (
    <>
      <SEOHead 
        title="Master Builders ACT | 20% Off CarbonConstruct Pro Yearly"
        description="Exclusive offer for MBA ACT members: 20% off your first year of CarbonConstruct Pro. Get Level 1 White Label—your company logo on every carbon report."
        canonicalPath="/lp/mba-act"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo-56.webp" 
                alt="CarbonConstruct" 
                className="h-8 w-8"
              />
              <span className="font-semibold text-lg">CarbonConstruct</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth" onClick={() => handleCTAClick('header-cta')}>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Claim 20% Off
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-background via-background to-emerald-950/20 overflow-hidden">
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 px-4 py-1.5 text-sm font-medium">
              <Award className="h-4 w-4 mr-2" />
              Exclusive MBA ACT Offer
            </Badge>
          </div>
          
          <div className="container mx-auto px-4 pt-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  <Percent className="h-5 w-5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold text-lg">20% OFF</span>
                </div>
                <span className="text-muted-foreground">First Year • Pro Yearly</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Your Logo. Your Reports.
                <br />
                <span className="text-emerald-600">Your Competitive Edge.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                Level 1 White Label included with Pro Yearly
              </p>
              
              <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-8">
                MBA ACT members get 20% off their first year. Hand clients professional carbon reports with YOUR branding—not ours. NCC 2024 Section J compliance built in.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth" onClick={() => handleCTAClick('hero-primary')}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                    Claim Your 20% Discount
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/pricing" onClick={() => handleCTAClick('hero-secondary')}>
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Compare Plans
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Use code <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">MBA20ACT</span> at checkout
              </p>
            </div>
          </div>
        </section>

        {/* ACT Grid Factor Highlight */}
        <section className="py-8 bg-emerald-600/10 border-y border-emerald-500/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">ACT Grid Factor: <span className="text-emerald-600 font-bold">0.76 kgCO2e/kWh</span></span>
              </div>
              <div className="hidden md:block h-6 w-px bg-border" />
              <span className="text-muted-foreground">ACT's 100% renewable electricity target—accurate calculations for carbon-conscious projects</span>
            </div>
          </div>
        </section>

        {/* White Label Feature Section */}
        <section className="py-16 bg-gradient-to-r from-emerald-950/20 via-background to-emerald-950/20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="bg-emerald-600 mb-4">Level 1 White Label</Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Reports That Build YOUR Brand
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    When you hand a carbon report to a client, certifier, or council—it should look like YOUR work. Because it is.
                  </p>
                  <ul className="space-y-3">
                    {whiteLabeFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-muted/50 rounded-xl p-6 border border-border">
                  <div className="aspect-[4/3] bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                      <p className="text-lg font-semibold">Your Company Name</p>
                      <p className="text-sm text-muted-foreground">Carbon Assessment Report</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why ACT Builders Choose CarbonConstruct
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Built specifically for Australian construction—pre-configured with ACT data and compliance requirements.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-border/50 hover:border-emerald-500/30 transition-colors">
                    <CardContent className="p-6">
                      <div className="text-emerald-600 mb-4">{benefit.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  MBA ACT Member Pricing
                </h2>
                <p className="text-lg text-muted-foreground">
                  Exclusive 20% discount on Pro Yearly—includes Level 1 White Label
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">Pro Yearly (Regular)</div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold line-through text-muted-foreground">$790</span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        All Pro features included
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Level 1 White Label
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="border-emerald-500/50 bg-emerald-500/5 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600">MBA Member Price</Badge>
                  </div>
                  <CardContent className="p-6 pt-8">
                    <div className="text-sm text-emerald-600 font-medium mb-2">Pro Yearly (20% Off)</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-bold text-emerald-600">$632</span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                    <div className="text-sm text-emerald-600 mb-4">
                      Save $158 on your first year
                    </div>
                    <ul className="space-y-2 text-sm">
                      {includedFeatures.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to="/auth" onClick={() => handleCTAClick('pricing-cta')}>
                      <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700">
                        Claim Your Discount
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Streamline Your Carbon Compliance?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join other Canberra builders using CarbonConstruct to win more tenders with professional carbon reports.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth" onClick={() => handleCTAClick('final-cta')}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Use code <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">MBA20ACT</span> at checkout • 14-day free trial • No credit card required
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
