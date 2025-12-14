import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useEmissionTotals } from "@/hooks/useEmissionTotals";
import { useComplianceCheck } from "@/hooks/useComplianceCheck";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import ProjectSelector from "@/components/ProjectSelector";
import { EmissionsChart } from "@/components/EmissionsChart";
import { ComplianceCard } from "@/components/ComplianceCard";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { TrialBanner } from "@/components/TrialBanner";
import { CheckoutSuccessHandler } from "@/components/CheckoutSuccessHandler";
import { SEOHead } from "@/components/SEOHead";
import { FeatureTeaser } from "@/components/FeatureTeaser";
import { QuickCarbonCalculator } from "@/components/QuickCarbonCalculator";
import { FeatureCarousel } from "@/components/FeatureCarousel";
import { Factory, Zap, Truck, TrendingDown, Calculator, FileBarChart, RefreshCw, CheckCircle, User, Shield, Leaf, Check, X, HardHat, Award, Building2, Calendar, Crown, Clock } from "lucide-react";
import { CalculationHistory } from "@/components/CalculationHistory";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FloatingParticles } from "@/components/FloatingParticles";
const Index = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const {
    totals,
    scope1Details,
    scope2Details,
    scope3Details,
    loading: emissionsLoading,
    refetch
  } = useEmissionTotals();
  const compliance = useComplianceCheck(totals);
  const { tier_name, subscribed, is_trialing } = useSubscriptionStatus();
  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background noise-texture relative">
        <FloatingParticles count={25} />
        <SEOHead canonicalPath="/" />
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4 animate-fade-in">
              <div className="flex items-center justify-center gap-4">
              <picture>
                <source 
                  srcSet="/logo-56.webp" 
                  media="(max-width: 768px)" 
                  type="image/webp"
                />
                <source 
                  srcSet="/logo-96.webp" 
                  media="(min-width: 769px)" 
                  type="image/webp"
                />
                <img
                  src="/logo-96.webp"
                  alt="CarbonConstruct Logo"
                  className="w-16 h-16 md:w-24 md:h-24"
                  width="96"
                  height="96"
                  fetchPriority="high"
                  loading="eager"
                />
              </picture>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gradient-animated">
                  CarbonConstruct
                </h1>
              </div>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Professional carbon emissions calculator for Australian construction projects.
                NCC Section J compliant with Green Star and NABERS integration.
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto rounded-lg overflow-hidden shadow-glow animate-scale-in [animation-delay:0.2s]">
              <picture>
                <source
                  type="image/webp"
                  srcSet="/hero-carbon-calc.webp 640w, /hero-carbon-calc.webp 1024w, /hero-carbon-calc.webp 1920w"
                  sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
                />
                <source
                  type="image/jpeg"
                  srcSet="/hero-carbon-calc.jpg 640w, /hero-carbon-calc.jpg 1024w, /hero-carbon-calc.jpg 1920w"
                  sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
                />
                <img
                  src="/hero-carbon-calc.jpg"
                  alt="Carbon footprint calculation and environmental assessment"
                  className="w-full h-48 sm:h-64 md:h-96 object-cover"
                  width="1280"
                  height="549"
                  fetchPriority="high"
                  loading="eager"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end md:items-center justify-center p-6">
                <div className="text-center space-y-2 md:space-y-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    Professional Carbon Assessment
                  </h2>
                  <p className="text-sm sm:text-base text-white/90 max-w-md">
                    Comprehensive LCA methodologies for Australian construction projects. Calculate and track your project's carbon emissions across all three scopes with Australian NCC compliance standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Teaser Video Section */}
            <FeatureTeaser />

            {/* Feature Carousel - Glass Cards */}
            <section className="carbon-surface py-12 -mx-4 px-4 rounded-xl">
              <FeatureCarousel />
            </section>

            {/* Quick Carbon Estimator */}
            <div className="max-w-3xl mx-auto">
              <QuickCarbonCalculator />
            </div>

            {/* CTA Section - Freemium Emphasis */}
            <div className="space-y-4 md:space-y-5 animate-fade-in [animation-delay:0.4s]">
              <div className="flex flex-col items-center gap-2">
                <Badge className="bg-emerald-600/20 text-emerald-700 border-emerald-600/40 hover:bg-emerald-600/30 px-4 py-1.5 text-sm font-bold glass">
                  <Leaf className="h-4 w-4 mr-1.5" />
                  FOREVER FREE
                </Badge>
                <p className="text-lg md:text-xl font-bold text-foreground">
                  Start Free. Stay Free. Forever.
                </p>
                <p className="text-sm md:text-base text-muted-foreground max-w-md">
                  No credit card. No commitment. No expiration date.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                <Button onClick={() => navigate("/auth")} size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 hover-scale w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-semibold glow-ring">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Start Free Forever
                </Button>
                <Button onClick={() => navigate("/auth")} variant="glassOutline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 hover-scale w-full sm:w-auto">
                  Start 14-Day Pro Trial
                </Button>
                <Button 
                  onClick={() => window.open('https://calendar.app.google/1SMFPsNBFS7V5pu37', '_blank')} 
                  variant="outline" 
                  size="lg" 
                  className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 hover-scale w-full sm:w-auto border-accent/50"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book a Demo
                </Button>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground">
                Upgrade anytime when you need more • Keep your free account forever
              </p>
            </div>

            {/* Comparison Table Section */}
            <div className="max-w-5xl mx-auto animate-fade-in [animation-delay:0.5s]">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Why CarbonConstruct?</h2>
                <p className="text-muted-foreground">See how we compare to traditional methods and generic tools</p>
              </div>
              <Card variant="glass" className="border-primary/20 overflow-hidden glass-glow-hover">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Feature</TableHead>
                        <TableHead className="text-center font-semibold">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-primary">CarbonConstruct</span>
                          </div>
                        </TableHead>
                        <TableHead className="text-center font-semibold">Manual Spreadsheets</TableHead>
                        <TableHead className="text-center font-semibold">Generic Carbon Tools</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Australian Compliance</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Check className="h-5 w-5 text-primary" />
                            <span className="text-xs text-muted-foreground">NCC, Green Star, NABERS, IS Rating</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <X className="h-5 w-5 text-destructive/60" />
                            <span className="text-xs text-muted-foreground">Manual research</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <X className="h-5 w-5 text-destructive/60" />
                            <span className="text-xs text-muted-foreground">Basic or none</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Material Database</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Check className="h-5 w-5 text-primary" />
                            <span className="text-xs text-muted-foreground">4,000+ verified EPDs</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <X className="h-5 w-5 text-destructive/60" />
                            <span className="text-xs text-muted-foreground">Build your own</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <X className="h-5 w-5 text-destructive/60" />
                            <span className="text-xs text-muted-foreground">Limited, international</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Supply Chain Integration</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Check className="h-5 w-5 text-primary" />
                            <span className="text-xs text-muted-foreground">Real-time Scope 3</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <X className="h-5 w-5 text-destructive/60" />
                            <span className="text-xs text-muted-foreground">Disconnected</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <X className="h-5 w-5 text-destructive/60" />
                            <span className="text-xs text-muted-foreground">Bolted-on afterthought</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Built By</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <HardHat className="h-5 w-5 text-primary" />
                            <span className="text-xs text-muted-foreground">17 years construction</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground">N/A</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground">Consultants</span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Time to Report</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Check className="h-5 w-5 text-primary" />
                            <span className="text-xs text-muted-foreground">Minutes</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground">Days to weeks</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground">Hours</span>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Data Sources</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Check className="h-5 w-5 text-primary" />
                            <span className="text-xs text-muted-foreground">EPD Australasia, NABERS</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground">Self-sourced, unverified</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-muted-foreground">Varies, often unverified</span>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </Card>
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground mb-2">Want a personalized walkthrough?</p>
                <Button
                  onClick={() => window.open('https://calendar.app.google/1SMFPsNBFS7V5pu37', '_blank')}
                  variant="link"
                  className="text-primary"
                >
                  <Calendar className="mr-1 h-4 w-4" />
                  Book a Demo with Steven →
                </Button>
              </div>
            </div>

            {/* Founder Section - Expanded */}
            <div className="max-w-5xl mx-auto animate-fade-in [animation-delay:0.6s]">
              <Card variant="glass" className="border-accent/20 bg-gradient-to-br from-card via-card to-accent/5 overflow-hidden glass-glow-hover">
                <CardContent className="p-6 md:p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Photo & Credentials */}
                    <div className="flex flex-col items-center lg:items-start gap-4 lg:w-1/3">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg ring-4 ring-primary/20 glow-ring">
                        <User className="h-16 w-16 md:h-20 md:w-20 text-primary-foreground" />
                      </div>
                      <div className="text-center lg:text-left">
                        <h3 className="text-xl md:text-2xl font-bold">Steven</h3>
                        <p className="text-muted-foreground text-sm">Founder, CarbonConstruct</p>
                        <p className="text-muted-foreground text-xs mt-1">Director, United Facade Pty Ltd</p>
                      </div>
                      {/* Credentials Badges */}
                      <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                        <Badge variant="secondary" className="text-xs">
                          <HardHat className="h-3 w-3 mr-1" />
                          17 Years Construction
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          Cert IV WHS
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          MBA Queensland
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          GBCA Member
                        </Badge>
                      </div>
                    </div>

                    {/* Right Column - Story */}
                    <div className="flex-1 space-y-4">
                      <h4 className="text-lg md:text-xl font-bold text-primary">
                        Built By Someone Who's Actually Built Things
                      </h4>
                      
                      <div className="space-y-3 text-sm md:text-base text-muted-foreground">
                        <p>
                          I've spent 17 years building things—commercial towers, partitions, steel-framed systems across Southeast Queensland. I know what actually happens on construction sites. I know where materials come from, how they move through projects, and where carbon accounting breaks down in practice.
                        </p>
                        <p>
                          <strong className="text-foreground">Most carbon tools are built by people who've never stepped on a site. That's the problem.</strong>
                        </p>
                        <p>
                          I'm a carpenter and plasterer by trade, and I built CarbonConstruct because the tools that exist don't work for how construction actually operates. They're compliance checkboxes built by consultants who don't understand material flows, supply chain realities, or what happens when you're speccing materials at 6am before a pour.
                        </p>
                        <p>
                          CarbonConstruct isn't another calculator. It's infrastructure that makes carbon data, material sourcing, and project quoting exist in the same workflow. When you're speccing materials, the carbon is already there. Scope 3 downstream tracking isn't bolted on—it's integrated because I've lived the supply chain pressure points that most platforms completely miss.
                        </p>
                      </div>

                      {/* Key Quote */}
                      <blockquote className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg">
                        <p className="text-sm md:text-base font-medium italic">
                          "This is what construction carbon accountability looks like when it's built by someone who's actually built things."
                        </p>
                      </blockquote>

                      <div className="flex items-center gap-2 pt-2">
                        <Leaf className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">0.5% of every subscription supports carbon removal via Stripe Climate</span>
                      </div>
                      
                      <Button
                        onClick={() => window.open('https://calendar.app.google/1SMFPsNBFS7V5pu37', '_blank')}
                        variant="outline"
                        className="mt-4 w-full sm:w-auto"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Book a Demo with Steven
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Free vs Pro Comparison */}
            <div className="max-w-4xl mx-auto animate-fade-in [animation-delay:0.65s]">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Free vs Pro: Choose Your Path</h2>
                <p className="text-muted-foreground">Start free and upgrade when you're ready</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {/* Free Tier Card */}
                <Card className="relative border-2 border-emerald-600/50 bg-gradient-to-br from-emerald-600/5 to-emerald-600/10 overflow-hidden">
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-emerald-700 text-white border-0 px-3 py-1 font-semibold">
                      FOREVER FREE
                    </Badge>
                  </div>
                  <CardHeader className="pt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-emerald-700 font-bold">Free</CardTitle>
                        <CardDescription className="text-lg font-bold">$0/month forever</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                        <span>1 active project</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                        <span>4,000+ EPD materials database</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                        <span>Basic carbon calculations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                        <span>Standard PDF reports</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                        <span>NCC compliance checking</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => navigate("/auth")} 
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
                      size="lg"
                    >
                      Get Started Free
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      No credit card required
                    </p>
                  </CardContent>
                </Card>

                {/* Pro Tier Card */}
                <Card className="relative border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground border-0 px-3 py-1">
                      MOST POPULAR
                    </Badge>
                  </div>
                  <CardHeader className="pt-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-primary">Pro</CardTitle>
                        <CardDescription className="text-lg font-bold">$79/month</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span><strong>10 active projects</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>Everything in Free, plus:</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>AI BOQ import & parsing</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>EN 15978 lifecycle analysis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>Advanced compliance reports</span>
                      </li>
                    </ul>
                    <Button 
                      onClick={() => navigate("/auth")} 
                      className="w-full"
                      size="lg"
                    >
                      Start 14-Day Free Trial
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Then $79/month • Cancel anytime
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="text-center mt-4">
                <Button variant="link" onClick={() => navigate("/pricing")} className="text-primary">
                  See Business & Enterprise plans →
                </Button>
              </div>
            </div>

            {/* Why Start Free Callout */}
            <Card className="max-w-2xl mx-auto animate-fade-in [animation-delay:0.7s] border-emerald-600/30 bg-emerald-600/5">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Why Start Free?</h3>
                    <p className="text-sm text-muted-foreground">
                      Your free account never expires. Start with one project, explore the full materials database, 
                      and generate compliant reports. When you're ready for more projects or advanced features, 
                      upgrade seamlessly—your data stays with you.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground animate-fade-in [animation-delay:0.8s]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Bank-level encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>NCC 2024 compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                <span>Climate positive</span>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="space-y-4 md:space-y-6 lg:space-y-8 pb-6 md:pb-8">
      <SEOHead title="Dashboard" canonicalPath="/" />
      <CheckoutSuccessHandler />
      <OnboardingTutorial />
      <TrialBanner />
      {/* Header with user actions - Mobile Optimized */}
      <div className="flex flex-col gap-3 md:gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Carbon Assessment Dashboard
            </h1>
            {/* Subscription Badge */}
            {subscribed && tier_name !== 'Free' && (
              <Badge className={`${is_trialing ? 'bg-amber-600/20 text-amber-700 border-amber-600/40' : 'bg-primary/20 text-primary border-primary/40'} px-2 py-0.5 text-xs font-semibold`}>
                {is_trialing ? (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    {tier_name} Trial
                  </>
                ) : (
                  <>
                    <Crown className="h-3 w-3 mr-1" />
                    {tier_name}
                  </>
                )}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Welcome back! Select a project to continue.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refetch}
            size="sm"
            className="hover-scale text-xs md:text-sm"
            disabled={emissionsLoading}
          >
            <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 mr-1.5 ${emissionsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={signOut} size="sm" className="hover-scale text-xs md:text-sm">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Project Selector */}
      <ProjectSelector />

      {/* Emissions Overview - Animated Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card className="animate-fade-in hover-scale transition-all duration-300 hover:shadow-glow border-primary/20 col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Emissions</CardTitle>
            <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
              {emissionsLoading ? "..." : totals.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">tCO₂e per year</p>
          </CardContent>
        </Card>

      <Card className="animate-fade-in hover-scale transition-all duration-300 hover:shadow-glow border-scope1/20 [animation-delay:0.1s]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Scope 1</CardTitle>
            <Factory className="h-4 w-4 md:h-5 md:w-5 text-scope1" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-scope1">
              {emissionsLoading ? "..." : totals.scope1.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">
              {emissionsLoading ? "..." : totals.total > 0 ? (totals.scope1 / totals.total * 100).toFixed(1) : "0"}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover-scale transition-all duration-300 hover:shadow-glow border-scope2/20 [animation-delay:0.2s]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Scope 2</CardTitle>
            <Zap className="h-4 w-4 md:h-5 md:w-5 text-scope2" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-scope2">
              {emissionsLoading ? "..." : totals.scope2.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">
              {emissionsLoading ? "..." : totals.total > 0 ? (totals.scope2 / totals.total * 100).toFixed(1) : "0"}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in hover-scale transition-all duration-300 hover:shadow-glow border-scope3/20 [animation-delay:0.3s]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Scope 3</CardTitle>
            <Truck className="h-4 w-4 md:h-5 md:w-5 text-scope3" />
          </CardHeader>
          <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-scope3">
              {emissionsLoading ? "..." : totals.scope3.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">
              {emissionsLoading ? "..." : totals.total > 0 ? (totals.scope3 / totals.total * 100).toFixed(1) : "0"}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Unified Calculator - Prominent CTA */}
      <Card className="hover-scale transition-all duration-300 border-primary/40 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 shadow-glow">
        <CardContent className="p-6 md:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Calculator className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-primary-foreground" />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left space-y-3 md:space-y-4">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Unified Carbon Calculator
                </h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                  All-in-one calculator with materials database, AI BOQ import, and auto-save. Calculate Scope 1, 2, 3 emissions and embodied carbon in one streamlined workflow.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Button onClick={() => navigate("/calculator")} size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 hover-scale shadow-lg">
                  <Calculator className="mr-2 h-5 w-5" />
                  Start Calculator
                </Button>

                <Button onClick={() => navigate("/reports")} variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 hover-scale">
                  <FileBarChart className="mr-2 h-5 w-5" />
                  View Reports
                </Button>
              </div>

              <div className="flex flex-wrap gap-4 text-xs md:text-sm text-muted-foreground justify-center lg:justify-start">
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  Australian NMEF v2025.1
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                  Auto-Save Enabled
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                  AI BOQ Import
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Visualization & Compliance Tabs - Mobile Optimized */}
      <Tabs defaultValue="charts" className="space-y-3 md:space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="charts" className="text-xs sm:text-sm md:text-base py-2 md:py-2.5">
            <FileBarChart className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
            <span className="hidden sm:inline">Emission Charts</span>
            <span className="sm:hidden">Charts</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs sm:text-sm md:text-base py-2 md:py-2.5">
            <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
            <span className="hidden sm:inline">Compliance Status</span>
            <span className="sm:hidden">Compliance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-3 md:space-y-4 lg:space-y-6 mt-3 md:mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            <EmissionsChart type="pie" title="Emissions by Scope" description="Distribution of total emissions" data={[{
            category: 'Scope 1',
            emissions: totals.scope1,
            percentage: totals.total > 0 ? totals.scope1 / totals.total * 100 : 0
          }, {
            category: 'Scope 2',
            emissions: totals.scope2,
            percentage: totals.total > 0 ? totals.scope2 / totals.total * 100 : 0
          }, {
            category: 'Scope 3',
            emissions: totals.scope3,
            percentage: totals.total > 0 ? totals.scope3 / totals.total * 100 : 0
          }]} />

            <EmissionsChart type="bar" title="Emissions Comparison" description="Scope-by-scope breakdown" data={[{
            category: 'Scope 1',
            emissions: totals.scope1,
            percentage: totals.total > 0 ? totals.scope1 / totals.total * 100 : 0
          }, {
            category: 'Scope 2',
            emissions: totals.scope2,
            percentage: totals.total > 0 ? totals.scope2 / totals.total * 100 : 0
          }, {
            category: 'Scope 3',
            emissions: totals.scope3,
            percentage: totals.total > 0 ? totals.scope3 / totals.total * 100 : 0
          }]} />
          </div>

          {/* Scope 1 Breakdown */}
          {scope1Details.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 animate-fade-in">
              <EmissionsChart type="pie" title="Scope 1 Breakdown" description="Direct emissions by category" data={scope1Details} />
              <EmissionsChart type="bar" title="Scope 1 Comparison" description="Direct emissions detail" data={scope1Details} />
            </div>}

          {/* Scope 2 Breakdown */}
          {scope2Details.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 animate-fade-in">
              <EmissionsChart type="pie" title="Scope 2 Breakdown" description="Energy emissions by type" data={scope2Details} />
              <EmissionsChart type="bar" title="Scope 2 Comparison" description="Energy emissions detail" data={scope2Details} />
            </div>}

          {/* Scope 3 Breakdown */}
          {scope3Details.length > 0 && <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 animate-fade-in">
              <EmissionsChart type="pie" title="Scope 3 Breakdown" description="Value chain emissions" data={scope3Details} />
              <EmissionsChart type="bar" title="Scope 3 Comparison" description="Value chain detail" data={scope3Details} />
            </div>}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-3 md:space-y-4 lg:space-y-6 mt-3 md:mt-4">
          <div className="grid gap-3 md:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <ComplianceCard framework="NCC" title="NCC Section J" description="National Construction Code Energy Efficiency" overallCompliance={compliance.ncc.status} requirements={compliance.ncc.requirements} />

            <ComplianceCard framework="GBCA" title="Green Star Buildings" description="GBCA Sustainability Rating" overallCompliance={compliance.gbca.status} requirements={compliance.gbca.requirements} score={compliance.gbca.score} maxScore={compliance.gbca.maxScore} />

            <ComplianceCard framework="NABERS" title="NABERS Energy" description="National Built Environment Rating" overallCompliance={compliance.nabers.status} requirements={compliance.nabers.requirements} score={compliance.nabers.rating} maxScore={compliance.nabers.maxRating} />
          </div>

          <Card className="animate-fade-in bg-gradient-to-r from-success/5 to-accent/5 border-success/20">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg lg:text-xl">ISO Standards Compliance</CardTitle>
              <CardDescription className="text-xs md:text-sm">International carbon accounting standards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 p-4 pt-0 md:p-6 md:pt-0">
              <div className="space-y-1.5 md:space-y-2">
                <h4 className="font-semibold text-xs md:text-sm lg:text-base">ISO 14064-1:2018</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Specification with guidance for quantification and reporting of greenhouse gas emissions and removals
                </p>
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <h4 className="font-semibold text-xs md:text-sm lg:text-base">ISO 14067:2018</h4>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Greenhouse gases - Carbon footprint of products - Requirements and guidelines
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* History and Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Calculation History */}
        <CalculationHistory />

        {/* Reports Section - Enhanced */}
        <Card className="hover-scale transition-all duration-300 border-primary/20">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg lg:text-xl">
              <FileBarChart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              Generate Reports
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Create comprehensive emission reports for your project</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <Button onClick={() => navigate("/reports")} className="w-full sm:w-auto hover-scale">
              <FileBarChart className="mr-2 h-4 w-4" />
              <span className="text-sm md:text-base">View Reports</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Index;