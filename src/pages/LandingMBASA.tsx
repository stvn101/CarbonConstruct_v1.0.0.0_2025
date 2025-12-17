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
  Shield,
  Users,
  Percent,
  Star,
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
    description: "Built-in compliance checking for South Australian building classes. No manual interpretation needed."
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "SA's Cleanest Grid (0.42 kgCO2e/kWh)",
    description: "South Australia leads Australia in renewable energy. Our calculations use your actual state grid factor."
  },
  {
    icon: <Award className="h-6 w-6" />,
    title: "Green Star & NABERS Ready",
    description: "Credit alignment for SA projects pursuing Green Star certification or NABERS ratings."
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Built by a Builder",
    description: "Created by Steven—17 years in construction, MBA member. Not consultants, not tech bros."
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "South Australia-Specific Data",
    description: "Australian EPD materials with SA grid factors (0.42), local suppliers, and regional climate zone support."
  }
];

const painPoints = [
  "Carbon reports taking days when you need them in hours",
  "Generic international tools that don't understand Australian compliance",
  "Consultants charging $10-20K per project for data you could calculate yourself",
  "Handing over reports with someone else's branding—undermining your professionalism",
  "Scrambling to understand NCC 2024 Section J requirements before your next project"
];

const whiteLabeFeatures = [
  "Your company logo on every PDF report",
  "Your business name in report headers",
  "Your contact details for client follow-up",
  "Professional reports that build YOUR brand",
  "No 'Powered by' watermarks or third-party branding"
];

export default function LandingMBASA() {
  const { trackEvent } = useAnalytics();
  const { getCampaignAttribution } = useUTMTracking();

  useEffect(() => {
    sessionStorage.setItem('discount_code', 'MBA20SA');
    
    trackEvent(AnalyticsEvents.CAMPAIGN_PAGE_VIEW, {
      audience: 'mba-south-australia',
      offer: '20-percent-off',
      ...getCampaignAttribution(),
    });
  }, [trackEvent, getCampaignAttribution]);

  const handleCTAClick = (ctaType: string) => {
    trackEvent(AnalyticsEvents.CAMPAIGN_CTA_CLICKED, {
      audience: 'mba-south-australia',
      cta_type: ctaType,
      offer: '20-percent-off',
      ...getCampaignAttribution(),
    });
  };

  return (
    <>
      <SEOHead 
        title="Master Builders South Australia | 20% Off CarbonConstruct Pro Yearly"
        description="Exclusive offer for MBA South Australia members: 20% off your first year of CarbonConstruct Pro. Get Level 1 White Label—your company logo on every carbon report."
        canonicalPath="/lp/mba-sa"
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
              Exclusive MBA South Australia Offer
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
                MBA South Australia members get 20% off their first year. Hand clients professional carbon reports with YOUR branding—not ours. NCC 2024 Section J compliance built in.
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
                Use code <span className="font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">MBA20SA</span> at checkout
              </p>
            </div>
          </div>
        </section>

        {/* SA Grid Factor Highlight */}
        <section className="py-8 bg-emerald-600/10 border-y border-emerald-500/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-600" />
                <span className="font-medium">SA Grid Factor: <span className="text-emerald-600 font-bold">0.42 kgCO2e/kWh</span></span>
              </div>
              <div className="hidden md:block h-6 w-px bg-border" />
              <span className="text-muted-foreground">Australia's cleanest mainland grid—your projects start with lower embedded emissions</span>
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
                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <Card className="border-2 border-emerald-500/30 bg-card/50 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold">Your Company Name</div>
                          <div className="text-sm text-muted-foreground">Carbon Assessment Report</div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Project:</span>
                          <span className="font-medium">Adelaide CBD Mixed-Use</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Emissions:</span>
                          <span className="font-medium text-emerald-600">1,245 tCO2e</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">NCC Compliance:</span>
                          <span className="font-medium text-emerald-600">✓ Pass</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center">
                        Your Contact Details Here
                      </div>
                    </CardContent>
                  </Card>
                  <div className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">
                    YOUR LOGO
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                Sound Familiar, SA Builders?
              </h2>
              <div className="space-y-4">
                {painPoints.map((point, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-background border border-border/50"
                  >
                    <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <p className="text-foreground/90">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why South Australian Builders Choose CarbonConstruct
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Purpose-built for Australian construction professionals who need accurate, compliant carbon reporting.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-border/50 hover:border-emerald-500/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Comparison */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                MBA Member Exclusive Pricing
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">Pro Yearly (Regular)</div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-bold line-through text-muted-foreground">$790</span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Unlimited calculations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Level 1 White Label
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        All compliance frameworks
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-emerald-500 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600">MBA SA Member</Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="text-sm text-emerald-600 font-medium mb-2">Pro Yearly (20% Off)</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-bold text-emerald-600">$632</span>
                      <span className="text-muted-foreground">/year</span>
                    </div>
                    <div className="text-sm text-emerald-600 mb-4">
                      Save $158 on your first year
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">Unlimited calculations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">Level 1 White Label included</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium">NCC, Green Star, NABERS</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="font-medium text-amber-600">Priority support</span>
                      </li>
                    </ul>
                    <Link to="/auth" onClick={() => handleCTAClick('pricing-cta')} className="block mt-6">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        Claim Your Discount
                      </Button>
                    </Link>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Code: MBA20SA
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8 text-center mb-12">
                <div>
                  <div className="text-3xl font-bold text-emerald-600">4,000+</div>
                  <div className="text-sm text-muted-foreground">Verified EPD Materials</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">0.42</div>
                  <div className="text-sm text-muted-foreground">SA Grid Factor</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">17+</div>
                  <div className="text-sm text-muted-foreground">Years Construction Experience</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">100%</div>
                  <div className="text-sm text-muted-foreground">Australian Owned</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-950/30 via-background to-emerald-950/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30 mb-6">
                Limited Time MBA Offer
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Own Your Carbon Reporting?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join South Australian builders who've upgraded from spreadsheets and consultants to professional, branded carbon reports they can actually control.
              </p>
              <Link to="/auth" onClick={() => handleCTAClick('final-cta')}>
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                  Claim 20% Off Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Use code <span className="font-mono font-bold text-emerald-600">MBA20SA</span> • Offer valid for MBA South Australia members
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img src="/logo-32.webp" alt="CarbonConstruct" className="h-6 w-6" />
                <span className="text-sm text-muted-foreground">© 2025 CarbonConstruct. Australian owned and operated.</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/help" className="hover:text-foreground transition-colors">Support</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
