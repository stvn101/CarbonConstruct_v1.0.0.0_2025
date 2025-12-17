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
  Package, 
  FileText, 
  Scale,
  Clock,
  Shield,
  TrendingDown,
  Database,
  ClipboardCheck,
  Truck,
  Factory
} from 'lucide-react';

const benefits = [
  {
    icon: <Database className="h-6 w-6" />,
    title: "4,000+ Verified EPD Materials",
    description: "Access Australia's largest verified EPD database. Real data from real suppliers—not estimates or international averages."
  },
  {
    icon: <ClipboardCheck className="h-6 w-6" />,
    title: "Spec Compliance in Seconds",
    description: "Instantly verify if a supplier's material meets your project's embodied carbon specifications. No manual lookups."
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "Compare Suppliers Fairly",
    description: "Apples-to-apples carbon comparisons across suppliers using EN 15804 compliant data. Make defensible decisions."
  },
  {
    icon: <TrendingDown className="h-6 w-6" />,
    title: "Identify Carbon Hotspots",
    description: "See which materials drive the most emissions. Target your supplier engagement where it matters most."
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Full Supply Chain Visibility",
    description: "A1-A3 manufacturing plus A4 transport. See the complete picture of your procurement carbon footprint."
  },
  {
    icon: <Factory className="h-6 w-6" />,
    title: "Regional Manufacturing Data",
    description: "Materials tagged by manufacturing location. Know where your carbon is coming from—city and country level."
  }
];

const painPoints = [
  "Developers demanding embodied carbon specs but no tools to verify compliance",
  "Suppliers submitting EPDs in different formats—impossible to compare fairly",
  "Hours spent manually extracting carbon data from PDF EPDs",
  "No way to prove you selected the lowest-carbon option in tender evaluations",
  "NCC 2024 Section J requirements being passed down without clear guidance"
];

const complianceFeatures = [
  "NCC 2024 Section J compliance checking",
  "Green Star embodied carbon credit alignment",
  "NABERS Embodied Carbon requirements",
  "EN 15804+A2 methodology verification",
  "Climate Active Standard support"
];

const procurementFeatures = [
  "Material specification verification",
  "Supplier carbon comparison reports",
  "BOQ carbon analysis",
  "Tender evaluation documentation",
  "Supply chain carbon mapping"
];

export default function LandingProcurement() {
  const { trackEvent } = useAnalytics();
  const { getCampaignAttribution } = useUTMTracking();

  useEffect(() => {
    trackEvent(AnalyticsEvents.CAMPAIGN_PAGE_VIEW, {
      audience: 'procurement',
      ...getCampaignAttribution(),
    });
  }, [trackEvent, getCampaignAttribution]);

  const handleCTAClick = (ctaType: string) => {
    trackEvent(AnalyticsEvents.CAMPAIGN_CTA_CLICKED, {
      audience: 'procurement',
      cta_type: ctaType,
      ...getCampaignAttribution(),
    });
  };

  return (
    <>
      <SEOHead 
        title="Procurement Carbon Management | CarbonConstruct for QS & Procurement"
        description="Verify supplier EPDs, compare material carbon footprints, and meet NCC 2024 embodied carbon specs. 4,000+ verified Australian materials. Built for procurement managers and quantity surveyors."
        canonicalPath="/lp/procurement"
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
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-background via-background to-emerald-950/20 overflow-hidden">
          {/* Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30 px-4 py-1.5 text-sm font-medium">
              <Package className="h-4 w-4 mr-2" />
              For Procurement & Quantity Surveyors
            </Badge>
          </div>
          
          <div className="container mx-auto px-4 pt-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Stop Being the Carbon
                <br />
                <span className="text-emerald-600">Compliance Bottleneck</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                Developers demand carbon specs. Suppliers send PDFs. You're stuck in the middle.
              </p>
              
              <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-8">
                CarbonConstruct gives procurement managers and QS professionals the tools to verify supplier EPDs, compare material options, and prove compliance—in minutes, not days.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth" onClick={() => handleCTAClick('hero-primary')}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                    Start Free Forever
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/demo" onClick={() => handleCTAClick('hero-secondary')}>
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    See Demo
                  </Button>
                </Link>
              </div>
              
              <p className="text-sm text-muted-foreground mt-4">
                No credit card required. Free tier never expires.
              </p>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  The Carbon Buck Stops With You
                </h2>
                <p className="text-lg text-muted-foreground">
                  NCC 2024 mandates embodied carbon limits. Developers write it into contracts. Builders pass it to procurement. But guess who has to actually verify compliance?
                </p>
              </div>
              
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

        {/* Supply Chain Visual */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                Your Role in the Carbon Supply Chain
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                {/* Developer */}
                <Card className="border-border/50 text-center">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Developer</div>
                    <div className="text-xs text-muted-foreground">Sets carbon specs</div>
                    <ArrowRight className="h-4 w-4 mx-auto mt-2 text-muted-foreground hidden md:block rotate-0" />
                  </CardContent>
                </Card>
                
                {/* Builder */}
                <Card className="border-border/50 text-center">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Builder</div>
                    <div className="text-xs text-muted-foreground">Passes to procurement</div>
                    <ArrowRight className="h-4 w-4 mx-auto mt-2 text-muted-foreground hidden md:block rotate-0" />
                  </CardContent>
                </Card>
                
                {/* You */}
                <Card className="border-2 border-emerald-500 text-center relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-xs">YOU</Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="text-sm font-medium mb-1">Procurement / QS</div>
                    <div className="text-xs text-emerald-600 font-medium">Verify & Select</div>
                    <ArrowRight className="h-4 w-4 mx-auto mt-2 text-muted-foreground hidden md:block rotate-0" />
                  </CardContent>
                </Card>
                
                {/* Suppliers */}
                <Card className="border-border/50 text-center">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Suppliers</div>
                    <div className="text-xs text-muted-foreground">Submit EPDs</div>
                    <ArrowRight className="h-4 w-4 mx-auto mt-2 text-muted-foreground hidden md:block rotate-0" />
                  </CardContent>
                </Card>
                
                {/* Subcontractors */}
                <Card className="border-border/50 text-center">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Subcontractors</div>
                    <div className="text-xs text-muted-foreground">Install materials</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center mt-8">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">No legislation requires subcontractors to report.</span> The responsibility sits with you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tools Built for Procurement Reality
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Stop wrestling with PDFs and spreadsheets. Get verified data you can actually use.
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

        {/* Two Column Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Compliance Features */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-xl font-semibold">Compliance Verification</h3>
                    </div>
                    <ul className="space-y-3">
                      {complianceFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Procurement Features */}
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="h-5 w-5 text-blue-600" />
                      <h3 className="text-xl font-semibold">Procurement Tools</h3>
                    </div>
                    <ul className="space-y-3">
                      {procurementFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-emerald-600">4,000+</div>
                  <div className="text-sm text-muted-foreground">Verified EPD Materials</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">58</div>
                  <div className="text-sm text-muted-foreground">Material Categories</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">Minutes</div>
                  <div className="text-sm text-muted-foreground">Not Days</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">Free</div>
                  <div className="text-sm text-muted-foreground">Forever Tier</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Case Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                Real Procurement Scenarios
              </h2>
              
              <div className="space-y-6">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Tender Evaluation</h3>
                        <p className="text-muted-foreground text-sm">
                          Three concrete suppliers submit quotes. Each claims "low carbon" but sends different EPD formats. Use CarbonConstruct to normalise the data and compare A1-A3 emissions per m³. Document your selection rationale.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Spec Verification</h3>
                        <p className="text-muted-foreground text-sm">
                          Developer requires &lt;500 kgCO2e/m³ for structural concrete. Supplier submits an EPD showing 485. Verify the EPD is EN 15804 compliant and the functional unit matches your spec. Generate compliance report.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">BOQ Carbon Analysis</h3>
                        <p className="text-muted-foreground text-sm">
                          QS needs total embodied carbon estimate for preliminary budget. Import BOQ quantities, match to EPD materials in database, generate project-wide carbon footprint report. Hours reduced to minutes.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-950/20 via-background to-emerald-950/20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stop Being the Bottleneck
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Get the tools to verify supplier carbon data, compare options fairly, and prove compliance—without the spreadsheet nightmares.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth" onClick={() => handleCTAClick('bottom-primary')}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                    Start Free Forever
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/pricing" onClick={() => handleCTAClick('bottom-secondary')}>
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Free tier includes 5 calculations/month. Upgrade anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/40 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img src="/logo-56.webp" alt="CarbonConstruct" className="h-6 w-6" />
                <span className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} CarbonConstruct. Australian carbon calculation tools.
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                <Link to="/help" className="hover:text-foreground transition-colors">Help</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
