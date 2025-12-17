import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, TrendingUp, Users, MousePointer, Target } from "lucide-react";

interface VariantStats {
  variant: string;
  description: string;
  assigned: number;
  shown: number;
  conversions: number;
  conversionRate: number;
}

export function ABTestDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VariantStats[]>([]);
  const [totalAssigned, setTotalAssigned] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get all A/B test events
      const { data: events } = await supabase
        .from("analytics_events")
        .select("event_name, event_data")
        .in("event_name", ["ab_test_assigned", "popup_shown", "whitepaper_popup_download"])
        .like("page_url", "%subcontractors%");

      if (!events) {
        setLoading(false);
        return;
      }

      // Count by variant
      const variantMap: Record<string, { assigned: number; shown: number; conversions: number }> = {
        A: { assigned: 0, shown: 0, conversions: 0 },
        B: { assigned: 0, shown: 0, conversions: 0 },
        C: { assigned: 0, shown: 0, conversions: 0 },
      };

      events.forEach((event) => {
        const data = event.event_data as Record<string, unknown> | null;
        const variant = (data?.variant || data?.ab_variant) as string;
        
        if (!variant || !variantMap[variant]) return;

        if (event.event_name === "ab_test_assigned") {
          variantMap[variant].assigned++;
        } else if (event.event_name === "popup_shown") {
          variantMap[variant].shown++;
        } else if (event.event_name === "whitepaper_popup_download") {
          variantMap[variant].conversions++;
        }
      });

      const descriptions: Record<string, string> = {
        A: "10 second delay",
        B: "20 second delay",
        C: "Exit intent",
      };

      const statsArray: VariantStats[] = Object.entries(variantMap).map(([variant, counts]) => ({
        variant,
        description: descriptions[variant],
        assigned: counts.assigned,
        shown: counts.shown,
        conversions: counts.conversions,
        conversionRate: counts.shown > 0 ? (counts.conversions / counts.shown) * 100 : 0,
      }));

      setStats(statsArray);
      setTotalAssigned(statsArray.reduce((sum, s) => sum + s.assigned, 0));
      setTotalConversions(statsArray.reduce((sum, s) => sum + s.conversions, 0));
    } catch (err) {
      console.error("Error loading A/B test stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getWinnerVariant = () => {
    if (stats.length === 0) return null;
    const sorted = [...stats].sort((a, b) => b.conversionRate - a.conversionRate);
    if (sorted[0].conversionRate > 0) return sorted[0];
    return null;
  };

  const winner = getWinnerVariant();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              A/B/C Test Results: Popup Timing
            </CardTitle>
            <CardDescription>
              Subcontractor landing page whitepaper download popup conversion rates
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Total Assigned
            </p>
            <p className="text-2xl font-bold">{totalAssigned}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MousePointer className="h-3 w-3" /> Total Conversions
            </p>
            <p className="text-2xl font-bold">{totalConversions}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Overall Rate</p>
            <p className="text-2xl font-bold">
              {stats.reduce((sum, s) => sum + s.shown, 0) > 0
                ? ((totalConversions / stats.reduce((sum, s) => sum + s.shown, 0)) * 100).toFixed(1)
                : "0.0"}%
            </p>
          </div>
          <div className={`p-4 rounded-lg ${winner ? "bg-emerald-500/10" : "bg-muted"}`}>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Leading Variant
            </p>
            <p className="text-2xl font-bold">
              {winner ? (
                <span className="text-emerald-600">
                  {winner.variant} ({winner.conversionRate.toFixed(1)}%)
                </span>
              ) : (
                "N/A"
              )}
            </p>
          </div>
        </div>

        {/* Variant Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variant</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Assigned</TableHead>
              <TableHead className="text-right">Shown</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">Conv. Rate</TableHead>
              <TableHead className="w-32">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.variant}>
                <TableCell>
                  <Badge variant={stat.variant === winner?.variant ? "default" : "outline"}>
                    Variant {stat.variant}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{stat.description}</TableCell>
                <TableCell className="text-right font-medium">{stat.assigned}</TableCell>
                <TableCell className="text-right font-medium">{stat.shown}</TableCell>
                <TableCell className="text-right font-medium">{stat.conversions}</TableCell>
                <TableCell className="text-right">
                  <span className={stat.variant === winner?.variant ? "text-emerald-600 font-bold" : ""}>
                    {stat.conversionRate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell>
                  <Progress 
                    value={winner ? (stat.conversionRate / Math.max(winner.conversionRate, 1)) * 100 : 0} 
                    className="h-2"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalAssigned === 0 && !loading && (
          <p className="text-center text-muted-foreground py-8">
            No A/B test data yet. Data will appear when users visit the subcontractor landing page.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
