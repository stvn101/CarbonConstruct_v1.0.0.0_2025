import { Factory, Zap, Truck, TrendingDown, Calculator, FileBarChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScopeCard } from "@/components/ScopeCard";
import heroImage from "@/assets/hero-carbon-calc.jpg";

const Index = () => {
  // Sample data - in real app this would come from backend
  const totalEmissions = 847.2;
  const scopeData = {
    scope1: 156.4,
    scope2: 298.1,
    scope3: 392.7
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent text-white">
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Carbon footprint visualization with industrial buildings and green energy" 
            className="h-full w-full object-cover"
          />
        </div>
        <div className="relative p-8 md:p-12">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Professional Carbon Calculator
            </h1>
            <p className="mb-6 text-lg opacity-90 md:text-xl">
              Calculate Scope 1, 2 & 3 emissions with Australian NCC compliance. 
              Generate reports for Green Star and NABERS ratings.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="secondary" className="shadow-lg">
                <Calculator className="mr-2 h-5 w-5" />
                Start New Assessment
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <FileBarChart className="mr-2 h-5 w-5" />
                View Sample Report
              </Button>
            </div>
          </div>
        </div>
      </div>

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
              {totalEmissions.toLocaleString()}
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
              {scopeData.scope1}
            </div>
            <div className="text-sm text-muted-foreground">
              {((scopeData.scope1 / totalEmissions) * 100).toFixed(1)}% of total
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
              {scopeData.scope2}
            </div>
            <div className="text-sm text-muted-foreground">
              {((scopeData.scope2 / totalEmissions) * 100).toFixed(1)}% of total
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
              {scopeData.scope3}
            </div>
            <div className="text-sm text-muted-foreground">
              {((scopeData.scope3 / totalEmissions) * 100).toFixed(1)}% of total
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
            emissions={scopeData.scope1}
            actionUrl="/scope-1"
          />
          
          <ScopeCard
            title="Scope 2: Energy Emissions"
            description="Purchased electricity, heating, cooling"
            icon={Zap}
            scopeNumber={2}
            emissions={scopeData.scope2}
            actionUrl="/scope-2"
          />
          
          <ScopeCard
            title="Scope 3: Value Chain"
            description="Upstream & downstream supply chain activities"
            icon={Truck}
            scopeNumber={3}
            emissions={scopeData.scope3}
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
