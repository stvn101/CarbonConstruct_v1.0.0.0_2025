import { useNavigate } from "react-router-dom";
import { ScopeCard } from "@/components/ScopeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useEmissionTotals } from "@/hooks/useEmissionTotals";
import { useComplianceCheck } from "@/hooks/useComplianceCheck";
import ProjectSelector from "@/components/ProjectSelector";
import { DemoDataButton } from "@/components/DemoDataButton";
import { EmissionsChart } from "@/components/EmissionsChart";
import { ComplianceCard } from "@/components/ComplianceCard";
import { Factory, Zap, Truck, TrendingDown, Calculator, FileBarChart, RefreshCw, Package } from "lucide-react";
import heroImage from "@/assets/hero-carbon-calc.jpg";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { totals, scope1Details, scope2Details, scope3Details, loading: emissionsLoading, refetch } = useEmissionTotals();
  const compliance = useComplianceCheck(totals);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Carbon Calculator
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Calculate and track your project's carbon emissions across all three scopes with Australian NCC compliance standards.
              </p>
            </div>
            
            <div className="relative max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Carbon footprint calculation and environmental assessment" 
                className="w-full h-64 md:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Professional Carbon Assessment
                  </h2>
                  <p className="text-white/90 max-w-md">
                    Comprehensive LCA methodologies for Australian construction projects
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Button onClick={() => navigate("/auth")}>Get Started</Button>
              </Button>
              <p className="text-sm text-muted-foreground">
                Sign up to start calculating your carbon footprint
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      {/* Header with user actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Carbon Assessment Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Select a project to continue.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            disabled={emissionsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${emissionsLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <DemoDataButton />
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </div>

      {/* Project Selector */}
      <ProjectSelector />

      {/* Current Emissions Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-accent" />
              <CardTitle className="text-lg">Total Emissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent mb-1">
              {emissionsLoading ? "..." : totals.total.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">tCO₂e per year</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Scope 1</CardTitle>
            <CardDescription>Direct Emissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-scope-1 mb-1">
              {emissionsLoading ? "..." : totals.scope1.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">
              {emissionsLoading ? "..." : totals.total > 0 ? ((totals.scope1 / totals.total) * 100).toFixed(1) : "0"}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Scope 2</CardTitle>
            <CardDescription>Energy Emissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-scope-2 mb-1">
              {emissionsLoading ? "..." : totals.scope2.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">
              {emissionsLoading ? "..." : totals.total > 0 ? ((totals.scope2 / totals.total) * 100).toFixed(1) : "0"}% of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Scope 3</CardTitle>
            <CardDescription>Value Chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-scope-3 mb-1">
              {emissionsLoading ? "..." : totals.scope3.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">
              {emissionsLoading ? "..." : totals.total > 0 ? ((totals.scope3 / totals.total) * 100).toFixed(1) : "0"}% of total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scope Calculation Cards */}
      <div>
        <h2 className="mb-6 text-2xl font-bold">Emission Scopes</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ScopeCard
            title="Scope 1: Direct Emissions"
            description="Fuel combustion, company vehicles, manufacturing"
            icon={Factory}
            scopeNumber={1}
            emissions={totals.scope1}
            actionUrl="/scope-1"
          />
          
          <ScopeCard
            title="Scope 2: Energy Emissions"
            description="Purchased electricity, heating, cooling"
            icon={Zap}
            scopeNumber={2}
            emissions={totals.scope2}
            actionUrl="/scope-2"
          />
          
          <ScopeCard
            title="Scope 3: Value Chain"
            description="Upstream & downstream supply chain activities"
            icon={Truck}
            scopeNumber={3}
            emissions={totals.scope3}
            actionUrl="/scope-3"
          />
        </div>
      </div>

      {/* LCA / Embodied Carbon Section */}
      <Card className="bg-gradient-to-r from-lca-material/5 to-lca-construction/5 border-lca-material/20">
        <CardHeader>
          <CardTitle className="text-xl">Life Cycle Assessment (LCA)</CardTitle>
          <CardDescription>
            Calculate embodied carbon following ISO 14040/14044 standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/lca')} className="w-full" size="lg">
            <Package className="h-5 w-5 mr-2" />
            Start LCA Calculation
          </Button>
        </CardContent>
      </Card>

      {/* Data Visualization & Compliance Tabs */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="charts">Emission Charts</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Status</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <EmissionsChart
              type="pie"
              title="Emissions by Scope"
              description="Distribution of total emissions across all scopes"
              data={[
                { category: 'Scope 1', emissions: totals.scope1, percentage: totals.total > 0 ? (totals.scope1 / totals.total) * 100 : 0 },
                { category: 'Scope 2', emissions: totals.scope2, percentage: totals.total > 0 ? (totals.scope2 / totals.total) * 100 : 0 },
                { category: 'Scope 3', emissions: totals.scope3, percentage: totals.total > 0 ? (totals.scope3 / totals.total) * 100 : 0 },
              ]}
            />

            {scope1Details.length > 0 && (
              <EmissionsChart
                type="bar"
                title="Scope 1 Breakdown"
                description="Direct emissions by category"
                data={scope1Details}
              />
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {scope2Details.length > 0 && (
              <EmissionsChart
                type="bar"
                title="Scope 2 Breakdown"
                description="Energy emissions by type"
                data={scope2Details}
              />
            )}

            {scope3Details.length > 0 && (
              <EmissionsChart
                type="bar"
                title="Scope 3 Breakdown"
                description="Value chain emissions by category"
                data={scope3Details}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <ComplianceCard
              framework="NCC"
              title="NCC Section J"
              description="National Construction Code Energy Efficiency"
              overallCompliance={compliance.ncc.status}
              requirements={compliance.ncc.requirements}
            />

            <ComplianceCard
              framework="GBCA"
              title="Green Star Buildings"
              description="GBCA Sustainability Rating"
              overallCompliance={compliance.gbca.status}
              requirements={compliance.gbca.requirements}
              score={compliance.gbca.score}
              maxScore={compliance.gbca.maxScore}
            />

            <ComplianceCard
              framework="NABERS"
              title="NABERS Energy"
              description="National Built Environment Rating"
              overallCompliance={compliance.nabers.status}
              requirements={compliance.nabers.requirements}
              score={compliance.nabers.rating}
              maxScore={compliance.nabers.maxRating}
            />
          </div>

          <Card className="bg-gradient-to-r from-success/5 to-accent/5 border-success/20">
            <CardHeader>
              <CardTitle className="text-xl">ISO Standards Compliance</CardTitle>
              <CardDescription>
                This calculator follows international environmental management standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-card rounded-lg border">
                  <div className="font-semibold mb-2">ISO 14040/14044</div>
                  <div className="text-sm text-muted-foreground">
                    Life Cycle Assessment principles and framework for embodied carbon calculations
                  </div>
                </div>
                <div className="p-4 bg-card rounded-lg border">
                  <div className="font-semibold mb-2">ISO 14067</div>
                  <div className="text-sm text-muted-foreground">
                    Carbon footprint of products - greenhouse gas quantification and reporting
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;