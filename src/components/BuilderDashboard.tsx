import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmissionTotals } from "@/hooks/useEmissionTotals";
import { useUnifiedCalculations } from "@/hooks/useUnifiedCalculations";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Building2,
  Layers,
  Square,
  PaintBucket,
  Construction,
  ArrowRight,
  FileText,
  Clock,
  Package
} from "lucide-react";

interface BuilderDashboardProps {
  projectName?: string;
  className?: string;
}

// Category icons mapping
const CATEGORY_ICONS: Record<string, typeof Construction> = {
  steel: Construction,
  concrete: Layers,
  glass: Square,
  timber: Building2,
  masonry: PaintBucket,
  default: Package,
};

export function BuilderDashboard({ className }: BuilderDashboardProps) {
  const navigate = useNavigate();
  const { totals, loading: totalsLoading } = useEmissionTotals();
  const { data: calculationData, loading: calcLoading } = useUnifiedCalculations();

  // Derive high-impact components from real materials data
  const highImpactComponents = useMemo(() => {
    if (!calculationData?.materials || calculationData.materials.length === 0) {
      return [];
    }

    // Calculate total emissions from materials
    const totalMaterialEmissions = calculationData.materials.reduce(
      (sum, m) => sum + (m.totalEmissions || 0), 
      0
    );

    // Sort by emissions descending and take top 5
    return calculationData.materials
      .map(m => ({
        name: m.name,
        category: m.category?.toLowerCase() || 'default',
        emissions: m.totalEmissions || 0,
        percentage: totalMaterialEmissions > 0 
          ? ((m.totalEmissions || 0) / totalMaterialEmissions) * 100 
          : 0
      }))
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 5);
  }, [calculationData?.materials]);

  // Derive recent actions from calculation data timestamps
  const recentActions = useMemo(() => {
    const actions: Array<{ action: string; impact: string | null; time: string }> = [];
    
    if (calculationData?.updatedAt) {
      const updatedDate = new Date(calculationData.updatedAt);
      const now = new Date();
      const diffMs = now.getTime() - updatedDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let timeAgo = '';
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else {
        timeAgo = 'Just now';
      }

      actions.push({
        action: 'Calculation updated',
        impact: calculationData.materials?.length 
          ? `${calculationData.materials.length} materials tracked` 
          : null,
        time: timeAgo
      });
    }

    // Add material count if available
    if (calculationData?.materials && calculationData.materials.length > 0) {
      const topMaterial = calculationData.materials
        .sort((a, b) => (b.totalEmissions || 0) - (a.totalEmissions || 0))[0];
      
      if (topMaterial) {
        actions.push({
          action: `Top emitter: ${topMaterial.name}`,
          impact: `${(topMaterial.totalEmissions || 0).toFixed(1)} tCO₂e`,
          time: 'Current'
        });
      }
    }

    // Add fuel/electricity summary if available
    if (calculationData?.fuelInputs && calculationData.fuelInputs.length > 0) {
      const totalFuelEmissions = calculationData.fuelInputs.reduce(
        (sum, f) => sum + (f.totalEmissions || 0), 0
      );
      actions.push({
        action: 'Fuel emissions tracked',
        impact: `${totalFuelEmissions.toFixed(1)} tCO₂e`,
        time: 'Current'
      });
    }

    return actions.slice(0, 3);
  }, [calculationData]);

  const loading = totalsLoading || calcLoading;

  // Calculate total emissions
  const totalEmissions = totals.scope1 + totals.scope2 + totals.scope3;
  const embodiedEmissions = totals.scope3; // Scope 3 = embodied
  const operationalEmissions = totals.scope1 + totals.scope2; // Scope 1+2 = operational
  
  // Target emissions (mock - would come from project settings)
  const targetEmissions = 480;
  const emissionsGap = totalEmissions - targetEmissions;
  const isOverTarget = emissionsGap > 0;
  const gapPercentage = targetEmissions > 0 ? ((emissionsGap / targetEmissions) * 100).toFixed(1) : "0";

  // Compliance status
  const isNccCompliant = !isOverTarget;
  const greenStarRating = isOverTarget ? 4 : 5;
  const nabersRating = 5.5;

  if (loading) {
    return (
      <div className="grid gap-6 animate-pulse">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Top Row: Compliance Status + Project Emissions */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Compliance Status Card */}
        <Card variant="glass" className="border-border/30 neon-border glass-glow-hover">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* NCC Section J */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                {isNccCompliant ? (
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive" />
                )}
                <div>
                  <p className="font-medium">NCC Section J</p>
                  <p className="text-xs text-muted-foreground">
                    {isNccCompliant 
                      ? "On track for compliance" 
                      : `Over by ${emissionsGap.toFixed(1)} tCO₂e (${gapPercentage}%)`
                    }
                  </p>
                </div>
              </div>
              {!isNccCompliant && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => navigate("/calculator")}
                >
                  Optimize Materials
                </Button>
              )}
            </div>

            {/* Green Star Rating */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-5 w-5 ${star <= greenStarRating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
                <div>
                  <p className="font-medium">Green Star Rating</p>
                  <p className="text-xs text-muted-foreground">
                    Current: {greenStarRating}-Star • Next: {greenStarRating + 1}-Star
                  </p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-xs text-primary"
                onClick={() => navigate("/reports")}
              >
                View Requirements
              </Button>
            </div>

            {/* NABERS Rating */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-600 text-white px-2 py-1 text-sm font-bold">
                  {nabersRating}★
                </Badge>
                <div>
                  <p className="font-medium">NABERS Rating</p>
                  <p className="text-xs text-muted-foreground">Eligible for disclosure</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-xs text-primary"
                onClick={() => navigate("/reports")}
              >
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project Emissions Card */}
        <Card variant="glass" className={`border-border/30 neon-border glass-glow-hover ${isOverTarget ? 'border-destructive/50' : 'border-emerald-500/50'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Project Emissions</CardTitle>
            <CardDescription>
              Target: {targetEmissions.toFixed(1)} tCO₂e
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Total emissions */}
              <div className="text-center">
                <p className={`text-4xl font-bold ${isOverTarget ? 'text-destructive' : 'text-emerald-500'}`}>
                  {totalEmissions.toFixed(1)} tCO₂e
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total Project Footprint</p>
                {isOverTarget && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-destructive">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Over by {emissionsGap.toFixed(1)} tCO₂e ({gapPercentage}%)
                    </span>
                  </div>
                )}
                {!isOverTarget && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-emerald-500">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Under target by {Math.abs(emissionsGap).toFixed(1)} tCO₂e
                    </span>
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                <div className="text-center">
                  <p className="text-xl font-semibold">{embodiedEmissions.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Embodied (tCO₂e)</p>
                  <p className="text-xs text-muted-foreground">
                    {totalEmissions > 0 ? ((embodiedEmissions / totalEmissions) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold">{operationalEmissions.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Operational (tCO₂e)</p>
                  <p className="text-xs text-muted-foreground">
                    {totalEmissions > 0 ? ((operationalEmissions / totalEmissions) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => navigate("/reports")}
              >
                View Full Breakdown
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* High-Impact Components Table */}
      <Card variant="glass" className="border-border/30 neon-border glass-glow-hover mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">High-Impact Components</CardTitle>
          <CardDescription>Top contributors to project emissions</CardDescription>
        </CardHeader>
        <CardContent>
          {highImpactComponents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No materials added yet</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-3"
                onClick={() => navigate("/calculator")}
              >
                Add Materials
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead className="text-right">Emissions (tCO₂e)</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highImpactComponents.map((component) => {
                  const Icon = CATEGORY_ICONS[component.category] || CATEGORY_ICONS.default;
                  const needsOptimization = component.percentage > 25;
                  return (
                    <TableRow key={component.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium truncate max-w-[200px]">{component.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {component.emissions.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={needsOptimization ? "destructive" : "secondary"} className="text-xs">
                          {component.percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant={needsOptimization ? "default" : "ghost"}
                          className="text-xs h-7"
                          onClick={() => navigate("/calculator")}
                        >
                          {needsOptimization ? "Optimize" : "Review"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Actions */}
      <Card variant="glass" className="border-border/30 neon-border glass-glow-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Recent Actions</CardTitle>
          <CardDescription>Latest project activity</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
              <p className="text-xs mt-1">Start by adding materials to your project</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActions.map((action, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {action.impact ? (
                      <TrendingDown className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{action.action}</p>
                      {action.impact && (
                        <p className="text-xs text-emerald-500">{action.impact}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {action.time}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
