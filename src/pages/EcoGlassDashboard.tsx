import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VegaChart from "@/components/VegaChart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, Eye, Leaf, Loader2, Wind, Zap } from "lucide-react";
import type { VisualizationSpec } from "vega-embed";

// Simulated carbon data
interface CarbonData {
  totalSaved: string;
  activeProjects: number;
  efficiency: number;
  trend: { day: string; savings: number }[];
  materials: { category: string; value: number }[];
  liveFeed: { user: string; anonUser: string; action: string; time: string }[];
}

const generateMockData = (): CarbonData => ({
  totalSaved: (Math.random() * 100 + 450).toFixed(1),
  activeProjects: Math.floor(Math.random() * 10) + 42,
  efficiency: Math.floor(Math.random() * 5) + 92,
  trend: [
    { day: "Mon", savings: Math.random() * 20 + 60 },
    { day: "Tue", savings: Math.random() * 20 + 65 },
    { day: "Wed", savings: Math.random() * 20 + 70 },
    { day: "Thu", savings: Math.random() * 20 + 75 },
    { day: "Fri", savings: Math.random() * 20 + 80 },
    { day: "Sat", savings: Math.random() * 20 + 72 },
    { day: "Sun", savings: Math.random() * 20 + 68 },
  ],
  materials: [
    { category: "Concrete", value: 35 },
    { category: "Steel", value: 28 },
    { category: "Timber", value: 22 },
    { category: "Other", value: 15 },
  ],
  liveFeed: [
    { user: "Sarah M.", anonUser: "User ***42", action: "Uploaded BlueScope EPD for structural steel", time: "2m ago" },
    { user: "James L.", anonUser: "User ***18", action: "Generated NABERS compliance report", time: "5m ago" },
    { user: "Emma K.", anonUser: "User ***91", action: "Added 12 materials to Project Alpha", time: "8m ago" },
    { user: "Michael R.", anonUser: "User ***33", action: "Achieved 15% carbon reduction target", time: "12m ago" },
    { user: "Lisa T.", anonUser: "User ***67", action: "Imported BOQ with 847 line items", time: "18m ago" },
  ],
});

export default function EcoGlassDashboard() {
  const [data, setData] = useState<CarbonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    const loadData = () => {
      setData(generateMockData());
      setLoading(false);
    };

    loadData();
    
    // Simulate live updates every 5 seconds
    const interval = setInterval(() => {
      setData(generateMockData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Vega-Lite spec for carbon savings trend
  const trendSpec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 200,
    data: { values: data.trend },
    mark: {
      type: "area",
      line: { color: "#39FF14" },
      color: {
        x1: 1,
        y1: 1,
        x2: 1,
        y2: 0,
        gradient: "linear",
        stops: [
          { offset: 0, color: "rgba(57, 255, 20, 0)" },
          { offset: 1, color: "rgba(57, 255, 20, 0.5)" },
        ],
      },
    },
    encoding: {
      x: { field: "day", type: "ordinal", axis: { labelAngle: 0, title: null } },
      y: { field: "savings", type: "quantitative", axis: { title: null, grid: false } },
      tooltip: [{ field: "day" }, { field: "savings", title: "CO2e Saved (t)" }],
    },
  };

  // Vega-Lite spec for material breakdown donut
  const materialSpec: VisualizationSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    width: "container",
    height: 200,
    data: { values: data.materials },
    mark: { type: "arc", innerRadius: 50, outerRadius: 80 },
    encoding: {
      theta: { field: "value", type: "quantitative" },
      color: {
        field: "category",
        type: "nominal",
        scale: { range: ["#39FF14", "#00E676", "#87BC87", "#2E7D32"] },
        legend: { title: null, orient: "bottom" },
      },
      tooltip: [{ field: "category" }, { field: "value", title: "Percentage" }],
    },
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20 neon-border">
            <Leaf className="h-8 w-8 text-primary neon-text" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              CarbonConstruct
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground text-sm">Live Dashboard</span>
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                <Eye className="h-3 w-3 mr-1" />
                PUBLIC VIEW
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="border-primary/30 hover:bg-primary/10">
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/pricing">
              Connect SaaS <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total CO2e Saved */}
        <Card className="glass dark:glass neon-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Leaf className="h-4 w-4 text-primary" /> Total CO2e Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-foreground neon-text">
              {data.totalSaved}t
            </p>
            <p className="text-xs text-primary mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        {/* Active Projects */}
        <Card className="glass dark:glass neon-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-foreground">
              {data.activeProjects}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Across Australia</p>
          </CardContent>
        </Card>

        {/* Material Efficiency */}
        <Card className="glass dark:glass neon-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wind className="h-4 w-4 text-primary" /> Material Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-heading font-bold text-foreground">
              {data.efficiency}%
            </p>
            <p className="text-xs text-primary mt-1">Top 5% of industry</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Carbon Savings Trend */}
        <Card className="glass dark:glass neon-border">
          <CardHeader>
            <CardTitle className="font-heading">Carbon Savings Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <VegaChart spec={trendSpec} className="w-full" />
          </CardContent>
        </Card>

        {/* Material Impact Breakdown */}
        <Card className="glass dark:glass neon-border">
          <CardHeader>
            <CardTitle className="font-heading">Material Impact Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <VegaChart spec={materialSpec} className="w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Live Activity Feed */}
      <Card className="glass dark:glass neon-border">
        <CardHeader>
          <CardTitle className="font-heading flex items-center justify-between">
            <div className="flex items-center gap-2">
              Live Activity
              <Badge variant="outline" className="bg-muted/50">
                <Eye className="h-3 w-3 mr-1" /> Anonymized
              </Badge>
            </div>
            <span className="flex items-center gap-2 text-xs font-normal">
              <span className="h-2 w-2 rounded-full bg-primary live-indicator" />
              LIVE
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {data.liveFeed.map((item, i) => (
                <div key={i}>
                  <div className="flex items-start justify-between py-3">
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {item.anonUser}
                      </span>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {item.time}
                    </span>
                  </div>
                  {i < data.liveFeed.length - 1 && <Separator className="bg-border/50" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        <p>CarbonConstruct © 2024 | ABN 12 345 678 901 | Built for Australian Construction</p>
      </footer>
    </div>
  );
}
