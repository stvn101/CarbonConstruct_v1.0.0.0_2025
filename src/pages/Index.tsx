import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useEmissionTotals } from "@/hooks/useEmissionTotals";
import { useComplianceCheck } from "@/hooks/useComplianceCheck";
import ProjectSelector from "@/components/ProjectSelector";
import { DemoDataButton } from "@/components/DemoDataButton";
import { MigrationButton } from "@/components/MigrationButton";
import { EmissionsChart } from "@/components/EmissionsChart";
import { ComplianceCard } from "@/components/ComplianceCard";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { TrialBanner } from "@/components/TrialBanner";
import { CheckoutSuccessHandler } from "@/components/CheckoutSuccessHandler";
import { Factory, Zap, Truck, TrendingDown, Calculator, FileBarChart, RefreshCw } from "lucide-react";
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
  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="space-y-3 md:space-y-4 animate-fade-in">
              <div className="flex items-center justify-center gap-4">
                <picture>
                  <source srcSet="/logo.webp" type="image/webp" />
                  <img src="/logo.png" alt="CarbonConstruct Logo" className="w-16 h-16 md:w-24 md:h-24" width="96" height="96" fetchPriority="high" loading="eager" />
                </picture>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  CarbonConstruct
                </h1>
              </div>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                











              </p>
            </div>
            
            <div className="relative max-w-4xl mx-auto rounded-lg overflow-hidden shadow-glow animate-scale-in" style={{
            animationDelay: '0.2s'
          }}>
              <picture>
                <source srcSet="/hero-carbon-calc.webp" type="image/webp" />
                <img src="/hero-carbon-calc.jpg" alt="Carbon footprint calculation and environmental assessment" className="w-full h-48 sm:h-64 md:h-96 object-cover" width="1280" height="549" fetchPriority="high" loading="eager" />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end md:items-center justify-center p-6">
                <div className="text-center space-y-2 md:space-y-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                    Professional Carbon Assessment
                  </h2>
                  <p className="text-sm sm:text-base text-white/90 max-w-md">
                    Comprehensive LCA methodologies for Australian construction projects
Calculate and track your project's carbon emissions across all three scopes with Australian NCC compliance standards.


                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 animate-fade-in" style={{
            animationDelay: '0.4s'
          }}>
              <Button onClick={() => navigate("/auth")} size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 hover-scale w-full sm:w-auto">
                Get Started
              </Button>
              <p className="text-xs md:text-sm text-muted-foreground">
                Sign up to start calculating your carbon footprint
              </p>
            </div>
          </div>
        </div>
      </div>;
  }
  return <div className="space-y-4 md:space-y-6 lg:space-y-8 pb-6 md:pb-8">
      <CheckoutSuccessHandler />
      <OnboardingTutorial />
      <TrialBanner />
      {/* Header with user actions - Mobile Optimized */}
      <div className="flex flex-col gap-3 md:gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Carbon Assessment Dashboard
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Welcome back! Select a project to continue.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MigrationButton />
          
          <DemoDataButton />
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

        <Card className="animate-fade-in hover-scale transition-all duration-300 hover:shadow-glow border-scope1/20" style={{
        animationDelay: '0.1s'
      }}>
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

        <Card className="animate-fade-in hover-scale transition-all duration-300 hover:shadow-glow border-scope2/20" style={{
        animationDelay: '0.2s'
      }}>
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

        <Card className="animate-fade-in hover-scale transition-all duration-300 hover:shadow-glow border-scope3/20" style={{
        animationDelay: '0.3s'
      }}>
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
    </div>;
};
export default Index;