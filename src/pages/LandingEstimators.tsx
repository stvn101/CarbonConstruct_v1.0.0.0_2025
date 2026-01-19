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
  ClipboardList, 
  FileSpreadsheet, 
  Scale,
  Shield,
  TrendingDown,
  Database,
  Calculator,
  BarChart3,
  DollarSign,
  Layers,
  Target
} from 'lucide-react';

const benefits = [
  {
    icon: <FileSpreadsheet className="h-6 w-6" />,
    title: "BOQ Carbon Import",
    description: "Upload your quantity schedule and instantly see the carbon footprint of every line item. No manual data entry."
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "Cost-Carbon Trade-offs",
    description: "Compare material options by both cost and carbon. Make informed recommendations that balance budget and sustainability."
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "4,000+ Verified Materials",
    description: "Access Australia's largest EPD database. Real emission factors from real manufacturers—not generic estimates."
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: "Early Design Impact",
    description: "Run carbon estimates at feasibility stage. Influence material decisions before they're locked in."
  },
  {
    icon: <TrendingDown className="h-6 w-6" />,
    title: "Identify Carbon Hotspots",
    description: "See which materials drive the most emissions in your BOQ. Target value engineering where it matters most."
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Full Lifecycle Stages",
    description: "EN 15804 compliant data covering A1-A3 manufacturing, A4 transport, and beyond. Complete LCA visibility."
  }
];

const painPoints = [
  "Clients asking for 'carbon estimates' but no clear methodology or data",
  "Manual calculations from PDF EPDs taking hours per project",
  "No way to compare material alternatives fairly on carbon",
  "NCC 2024 embodied carbon limits added to project specs",
  "Design teams making decisions without carbon visibility"
];

const workflowSteps = [
  {
    step: "1",
    title: "Upload BOQ",
    description: "Import your quantity schedule—CSV, Excel, or manual entry"
  },
  {
    step: "2",
    title: "Auto-Match Materials",
    description: "AI matches BOQ items to verified EPD database"
  },
  {
    step: "3",
    title: "Review & Adjust",
    description: "Verify matches, swap alternatives, adjust factors"
  },
  {
    step: "4",
    title: "Generate Report",
    description: "Export carbon breakdown by element, material, lifecycle stage"
  }
];

const features = [
  "BOQ carbon analysis",
  "Material comparison reports",
  "NCC 2024 compliance checking",
  "Green Star credit alignment",
  "Cost-carbon optimisation",
  "Early stage estimates"
];

export default function LandingEstimators() {
  const { trackEvent } = useAnalytics();
  const { getCampaignAttribution } = useUTMTracking();

  useEffect(() => {
    trackEvent(AnalyticsEvents.CAMPAIGN_PAGE_VIEW, {
      audience: 'estimators',
      ...getCampaignAttribution(),
    });
  }, [trackEvent, getCampaignAttribution]);

  const handleCTAClick = (ctaType: string) => {
    trackEvent(AnalyticsEvents.CAMPAIGN_CTA_CLICKED, {
      audience: 'estimators',
      cta_type: ctaType,
      ...getCampaignAttribution(),
    });
  };

  return (
    <>
      <SEOHead 
        title="Carbon Estimating for QS | CarbonConstruct for Estimators"
        description="Turn BOQ into carbon estimates in minutes. 4,000+ verified EPD materials, cost-carbon trade-off analysis, NCC 2024 compliance. Built for quantity surveyors and estimators."
        canonicalPath="/lp/estimators"
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
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 px-4 py-1.5 text-sm font-medium">
              <ClipboardList className="h-4 w-4 mr-2" />
              For Quantity Surveyors & Estimators
            </Badge>
          </div>
          
          <div className="container mx-auto px-4 pt-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Turn Your BOQ Into
                <br />
                <span className="text-emerald-600">Carbon Estimates</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                Clients want carbon numbers. You've got quantities. We've got the factors.
              </p>
              
              <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-8">
                CarbonConstruct connects your BOQ to Australia's largest verified EPD database. Get carbon estimates at the same speed you do cost estimates—without the manual grunt work.
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
                  Carbon Is the New Line Item
                </h2>
                <p className="text-lg text-muted-foreground">
                  NCC 2024 mandates embodied carbon limits. Green Star rewards low-carbon design. Your clients are adding carbon clauses to every scope. But where's the data?
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

        {/* Workflow Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                From BOQ to Carbon Report in 4 Steps
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {workflowSteps.map((step, index) => (
                  <Card key={index} className="border-border/50 relative">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                        {step.step}
                      </div>
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                    {index < workflowSteps.length - 1 && (
                      <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built for How Estimators Work
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Not another sustainability tool. A practical extension of your existing workflow.
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

        {/* Features List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <Calculator className="h-6 w-6 text-emerald-600" />
                    <h3 className="text-2xl font-semibold">Estimator Features</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                  <div className="text-sm text-muted-foreground">Not Hours</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600">Free</div>
                  <div className="text-sm text-muted-foreground">Forever Tier</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Case */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                Real Estimating Scenarios
              </h2>
              
              <div className="space-y-6">
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Early Stage Feasibility</h3>
                        <p className="text-muted-foreground text-sm">
                          Client wants carbon numbers before schematic design. Use elemental quantities and benchmarks to provide directional estimates that guide early decisions.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Value Engineering</h3>
                        <p className="text-muted-foreground text-sm">
                          Budget is tight but carbon targets are fixed. Compare material alternatives on both cost and carbon to find the optimal balance for your client.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Compliance Documentation</h3>
                        <p className="text-muted-foreground text-sm">
                          NCC 2024 requires embodied carbon limits for new buildings. Generate defensible reports that document your carbon calculations for certification submissions.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-950/30 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Add Carbon to Your Toolkit
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your clients are asking. Your competitors are learning. Start estimating carbon alongside cost—for free.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth" onClick={() => handleCTAClick('footer-primary')}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8">
                    Start Free Forever
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/pricing" onClick={() => handleCTAClick('footer-pricing')}>
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                No credit card. No commitment. No expiration.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
