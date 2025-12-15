import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SEOHead } from '@/components/SEOHead';
import { useAnalytics, AnalyticsEvents } from '@/hooks/useAnalytics';
import { useUTMTracking } from '@/hooks/useUTMTracking';
import { CheckCircle, ArrowRight, Building } from 'lucide-react';

export interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface CampaignLandingPageProps {
  audience: string;
  audienceLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  benefits: Benefit[];
  painPoints: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
  ctaText?: string;
  ctaSecondaryText?: string;
  seoTitle: string;
  seoDescription: string;
  customSections?: React.ReactNode;
}

export function CampaignLandingPage({
  audience,
  audienceLabel,
  heroTitle,
  heroSubtitle,
  heroDescription,
  benefits,
  painPoints,
  testimonial,
  ctaText = "Start Free Today",
  ctaSecondaryText = "See Pricing",
  seoTitle,
  seoDescription,
  customSections,
}: CampaignLandingPageProps) {
  const { trackEvent } = useAnalytics();
  const { getCampaignAttribution } = useUTMTracking();

  // Track campaign page view
  useEffect(() => {
    trackEvent(AnalyticsEvents.CAMPAIGN_PAGE_VIEW, {
      audience,
      ...getCampaignAttribution(),
    });
  }, [audience, trackEvent, getCampaignAttribution]);

  const handleCTAClick = (ctaType: 'primary' | 'secondary') => {
    trackEvent(AnalyticsEvents.CAMPAIGN_CTA_CLICKED, {
      audience,
      cta_type: ctaType,
      cta_text: ctaType === 'primary' ? ctaText : ctaSecondaryText,
      ...getCampaignAttribution(),
    });
  };

  return (
    <>
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
        canonicalPath={`/lp/${audience}`}
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
              <Link to="/auth" onClick={() => handleCTAClick('primary')}>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  {ctaText}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-background via-background to-emerald-950/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-6">
                <Building className="h-4 w-4" />
                Built for {audienceLabel}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                {heroTitle}
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                {heroSubtitle}
              </p>
              
              <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-8">
                {heroDescription}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth" onClick={() => handleCTAClick('primary')}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                    {ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/pricing" onClick={() => handleCTAClick('secondary')}>
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    {ctaSecondaryText}
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                Free forever plan available. No credit card required.
              </p>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                Sound Familiar?
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
                How CarbonConstruct Helps
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

        {/* Social Proof */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8 text-center mb-12">
                <div>
                  <div className="text-3xl font-bold text-emerald-600">4,000+</div>
                  <div className="text-sm text-muted-foreground">Verified EPD Materials</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">17 Years</div>
                  <div className="text-sm text-muted-foreground">Construction Experience</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">NCC 2024</div>
                  <div className="text-sm text-muted-foreground">Compliant Reporting</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">Free</div>
                  <div className="text-sm text-muted-foreground">Forever Plan</div>
                </div>
              </div>
              
              {testimonial && (
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-8">
                    <blockquote className="text-lg md:text-xl italic text-center mb-4">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="text-center">
                      <div className="font-semibold">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        {/* Custom Sections */}
        {customSections}

        {/* Features Checklist */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
                Everything You Need
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "4,000+ verified EPD materials",
                  "NCC 2024 Section J compliance",
                  "Green Star credit alignment",
                  "NABERS benchmarking",
                  "EN 15978 lifecycle assessment",
                  "Professional PDF reports",
                  "Real-time calculations",
                  "Mobile-friendly interface",
                  "Scope 1, 2 & 3 tracking",
                  "Material comparison tools",
                  "Australian climate zones",
                  "Free forever tier",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-950/30 via-background to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Simplify Your Carbon Reporting?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join construction professionals across Australia who trust CarbonConstruct for accurate, compliant carbon assessment.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth" onClick={() => handleCTAClick('primary')}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                    {ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/demo">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Watch Demo
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Free forever plan • No credit card required • Start in minutes
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border/40">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img src="/logo-32.webp" alt="CarbonConstruct" className="h-6 w-6" />
                <span className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} CarbonConstruct. All rights reserved.
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground">Terms</Link>
                <Link to="/help" className="hover:text-foreground">Help</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default CampaignLandingPage;
