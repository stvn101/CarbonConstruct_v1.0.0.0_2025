import { useNavigate } from "react-router-dom";
import { ScopeCard } from "@/components/ScopeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEmissionTotals } from "@/hooks/useEmissionTotals";
import ProjectSelector from "@/components/ProjectSelector";
import { DemoDataButton } from "@/components/DemoDataButton";
import { Factory, Zap, Truck, TrendingDown, Calculator, FileBarChart } from "lucide-react";
import heroImage from "@/assets/hero-carbon-calc.jpg";

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { totals, loading: emissionsLoading } = useEmissionTotals();

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

      {/* Compliance Section */}
      <Card className="bg-gradient-to-r from-success/5 to-accent/5 border-success/20">
        <CardHeader>
          <CardTitle className="text-xl text-success">Australian Compliance Ready</CardTitle>
          <CardDescription>
            This calculator is designed to meet Australian environmental standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="font-semibold text-success">NCC Compliant</div>
              <div className="text-sm text-muted-foreground">National Construction Code</div>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="font-semibold text-success">Green Star Ready</div>
              <div className="text-sm text-muted-foreground">GBCA Rating System</div>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="font-semibold text-success">NABERS Aligned</div>
              <div className="text-sm text-muted-foreground">Energy Rating System</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;