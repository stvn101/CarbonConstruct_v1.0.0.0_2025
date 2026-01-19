import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import ProjectSelector from "@/components/ProjectSelector";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { TrialBanner } from "@/components/TrialBanner";
import { CheckoutSuccessHandler } from "@/components/CheckoutSuccessHandler";
import { SEOHead } from "@/components/SEOHead";
// FeatureTeaser removed from landing page - BOQ uploader under repair
import { QuickCarbonCalculator } from "@/components/QuickCarbonCalculator";
import { FeatureCarousel } from "@/components/FeatureCarousel";
import { CheckCircle, Shield, Leaf, Check, X, HardHat, Award, Calendar, Crown, Clock, Linkedin, User, Building2, FileText, Database, ExternalLink, Globe } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FloatingParticles } from "@/components/FloatingParticles";
import { ParallaxSection } from "@/components/ParallaxSection";
import { WhitepaperSummary } from "@/components/WhitepaperSummary";
import { BuilderDashboard } from "@/components/BuilderDashboard";
import { PartnersSection } from "@/components/PartnersSection";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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
              <p className="text-lg md:text-xl font-semibold text-foreground max-w-3xl mx-auto px-4">
                Carbon compliance built by a builder who knows how projects actually get built.
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
                Full life cycle assessment for Australian construction. NCC Section J compliant. Green Star and NABERS ready. 4,000+ verified materials integrated directly into quoting and procurement—not bolted on as an afterthought.
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
                Calculate your project. Track Scope 3 downstream. Meet compliance requirements without consultant fees.
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20 flex items-end md:items-center justify-center p-6">
                <div className="text-center space-y-2 md:space-y-4 bg-background/85 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-lg">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                    Professional Carbon Assessment
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                    Comprehensive LCA methodologies for Australian construction projects. Calculate and track your project's carbon emissions across all three scopes with Australian NCC compliance standards.
                  </p>
                </div>
              </div>
            </div>

            {/* EC3 Global Database Hero Section */}
            <div className="max-w-5xl mx-auto mt-8 animate-fade-in [animation-delay:0.25s]">
              <Card variant="glass" className="relative border-2 border-blue-500/30 bg-gradient-to-br from-blue-600/5 via-blue-500/10 to-cyan-500/5 overflow-hidden glass-glow-hover">
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-blue-600 text-white border-0 px-4 py-1.5 font-bold text-xs">
                    <Globe className="h-3 w-3 mr-1" />
                    PRO FEATURE
                  </Badge>
                </div>
                <CardContent className="p-6 md:p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center">
                    {/* Left - Content */}
                    <div className="flex-1 space-y-4 text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                          <Globe className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold text-foreground">EC3 Global Database</h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Powered by Building Transparency</p>
                        </div>
                      </div>
                      
                      <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                        90,000+ EPDs at Your Fingertips
                      </p>
                      
                      <p className="text-muted-foreground text-sm md:text-base max-w-xl">
                        Access the world's largest free database of Environmental Product Declarations. Search verified EPDs from manufacturers worldwide with real-time GWP data, lifecycle stages, and geographic filtering.
                      </p>
                      
                      <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                        <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          <Database className="h-3 w-3 mr-1" />
                          Real-time Search
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          A1-D Lifecycle Stages
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          Global Coverage
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                        <Button 
                          onClick={() => navigate("/lp/ec3")} 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          size="lg"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Learn More
                        </Button>
                        <Button 
                          onClick={() => navigate("/pricing")} 
                          variant="outline"
                          size="lg"
                          className="border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                    
                    {/* Right - Visual */}
                    <div className="hidden lg:flex flex-col items-center justify-center w-48">
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center">
                            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">90K+</span>
                          </div>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full px-2 py-1">
                          LIVE
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center mt-3">Verified EPDs from BuildingTransparency.org</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sign In Section - Replaced BOQ video teaser */}
            <div className="py-8 md:py-12">
              <Card variant="glass" className="max-w-xl mx-auto p-6 md:p-8 text-center glass-glow-hover">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold">Ready to Start?</h3>
                  <p className="text-muted-foreground">
                    Sign in to access your carbon calculator, material database, and compliance reports.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button 
                      onClick={() => navigate("/auth")} 
                      size="lg" 
                      className="text-base px-8 py-5 bg-primary hover:bg-primary/90 font-semibold"
                    >
                      <User className="mr-2 h-5 w-5" />
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => navigate("/auth")} 
                      variant="outline" 
                      size="lg" 
                      className="text-base px-8 py-5"
                    >
                      Create Free Account
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Feature Carousel - Glass Cards */}
            <ParallaxSection speed={0.2} className="carbon-surface py-12 -mx-4 px-4 rounded-xl">
              <FeatureCarousel />
            </ParallaxSection>

            {/* Quick Carbon Estimator */}
            <ParallaxSection speed={0.15}>
              <div className="max-w-3xl mx-auto">
                <QuickCarbonCalculator />
              </div>
            </ParallaxSection>

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
                  Start Free Assessment
                </Button>
                <Button onClick={() => navigate("/auth")} variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 hover-scale w-full sm:w-auto">
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

            {/* Whitepaper Research Section */}
            <WhitepaperSummary className="max-w-5xl mx-auto animate-fade-in [animation-delay:0.55s]" />

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
                      
                      <div className="flex flex-wrap gap-3 mt-4">
                        <Button
                          onClick={() => window.open('https://calendar.app.google/1SMFPsNBFS7V5pu37', '_blank')}
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Book a Demo with Steven
                        </Button>
                        <a 
                          href="https://www.linkedin.com/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=steven-j-carbonconstruct" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0A66C2] hover:bg-[#004182] rounded-full transition-colors w-full sm:w-auto"
                        >
                          <Linkedin className="h-4 w-4" />
                          Follow on LinkedIn
                        </a>
                      </div>
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

            {/* Trust & Transparency Section */}
            <div className="max-w-4xl mx-auto animate-fade-in [animation-delay:0.75s]">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Trust & Transparency</h2>
                <p className="text-muted-foreground">Full documentation of our methodology, data sources, and compliance standards</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Card 
                  variant="glass" 
                  className="cursor-pointer glass-glow-hover border-primary/20 transition-all duration-300 hover:-translate-y-1"
                  onClick={() => navigate("/methodology")}
                >
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        Methodology & Compliance
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        EN 15978 compliance, calculation methodology, data quality standards, and Australian scheme alignment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card 
                  variant="glass" 
                  className="cursor-pointer glass-glow-hover border-emerald-500/20 transition-all duration-300 hover:-translate-y-1"
                  onClick={() => navigate("/materials/status")}
                >
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Database className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                        Materials Database Status
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        4,600+ verified materials. Real-time validation statistics, source breakdown, and data quality metrics.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Partners & Integrations Section */}
            <PartnersSection />

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground animate-fade-in [animation-delay:0.85s]">
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
  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 pb-6 md:pb-8">
      <SEOHead title="Dashboard" canonicalPath="/" />
      <CheckoutSuccessHandler />
      <OnboardingTutorial />
      <TrialBanner />
      
      {/* Header with user actions */}
      <div className="flex flex-col gap-3 md:gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Carbon Assessment Dashboard
            </h1>
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
          <Button variant="outline" onClick={signOut} size="sm" className="hover-scale text-xs md:text-sm">
            Sign Out
          </Button>
        </div>
      </div>

      {/* Project Selector */}
      <ProjectSelector />

      {/* Builder Dashboard - Compliance-Focused Design */}
      <BuilderDashboard />
    </div>
  );
};

export default Index;