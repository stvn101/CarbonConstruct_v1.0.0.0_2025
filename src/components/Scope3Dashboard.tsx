import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Factory, Truck, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/contexts/ProjectContext";
import { Badge } from "@/components/ui/badge";

interface CategoryData {
  category: number;
  name: string;
  emissions: number;
  type: "upstream" | "downstream";
}

export function Scope3Dashboard() {
  const { currentProject } = useProject();
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [upstreamTotal, setUpstreamTotal] = useState(0);
  const [downstreamTotal, setDownstreamTotal] = useState(0);

  useEffect(() => {
    if (currentProject?.id) {
      fetchScope3Data();
    }
  }, [currentProject?.id]);

  const fetchScope3Data = async () => {
    if (!currentProject?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scope3_emissions")
        .select("*")
        .eq("project_id", currentProject.id);

      if (error) throw error;

      // Group by category and sum emissions
      const grouped: { [key: number]: { emissions: number; name: string } } = {};
      
      data?.forEach((item) => {
        if (!grouped[item.category]) {
          grouped[item.category] = {
            emissions: 0,
            name: item.category_name || `Category ${item.category}`,
          };
        }
        grouped[item.category].emissions += Number(item.emissions_tco2e);
      });

      // Convert to array with type classification
      const categoryArray: CategoryData[] = Object.entries(grouped).map(
        ([category, data]) => ({
          category: Number(category),
          name: data.name,
          emissions: Number(data.emissions.toFixed(2)),
          type: Number(category) <= 8 ? "upstream" : "downstream",
        })
      );

      // Calculate totals
      const upstream = categoryArray
        .filter((cat) => cat.type === "upstream")
        .reduce((sum, cat) => sum + cat.emissions, 0);
      const downstream = categoryArray
        .filter((cat) => cat.type === "downstream")
        .reduce((sum, cat) => sum + cat.emissions, 0);

      setCategoryData(categoryArray.sort((a, b) => a.category - b.category));
      setUpstreamTotal(Number(upstream.toFixed(2)));
      setDownstreamTotal(Number(downstream.toFixed(2)));
    } catch (error) {
      console.error("Error fetching Scope 3 data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Scope 3 Summary...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading emissions data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-scope-3" />
            Scope 3 Emissions Summary
          </CardTitle>
          <CardDescription>No emissions data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Calculate emissions to see your summary dashboard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalEmissions = upstreamTotal + downstreamTotal;
  const upstreamPercentage = totalEmissions > 0 ? ((upstreamTotal / totalEmissions) * 100).toFixed(1) : "0";
  const downstreamPercentage = totalEmissions > 0 ? ((downstreamTotal / totalEmissions) * 100).toFixed(1) : "0";

  // Prepare data for bar chart
  const chartData = categoryData.map((cat) => ({
    category: `Cat ${cat.category}`,
    name: cat.name.length > 20 ? cat.name.substring(0, 20) + "..." : cat.name,
    emissions: cat.emissions,
    type: cat.type,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-scope-3/5 to-scope-3/10 border-scope-3/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Scope 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-scope-3">
              {totalEmissions.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-2">tCO₂-e</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Upstream (1-8)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {upstreamTotal.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-2">tCO₂-e</span>
            </div>
            <Badge variant="secondary" className="mt-2">
              {upstreamPercentage}% of total
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Downstream (9-15)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {downstreamTotal.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-2">tCO₂-e</span>
            </div>
            <Badge variant="secondary" className="mt-2">
              {downstreamPercentage}% of total
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-scope-3" />
            Emissions by Category
          </CardTitle>
          <CardDescription>
            Breakdown of all 15 Scope 3 categories (hover for details)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                height={80}
                className="text-xs"
              />
              <YAxis
                label={{ value: "Emissions (tCO₂-e)", angle: -90, position: "insideLeft" }}
                className="text-xs"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                        <p className="font-semibold text-sm">{data.name}</p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {data.type === "upstream" ? "Upstream" : "Downstream"}
                        </p>
                        <p className="text-lg font-bold text-scope-3">
                          {data.emissions} tCO₂-e
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                content={() => (
                  <div className="flex justify-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-500" />
                      <span>Upstream (1-8)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-orange-500" />
                      <span>Downstream (9-15)</span>
                    </div>
                  </div>
                )}
              />
              <Bar dataKey="emissions" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.type === "upstream" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Detailed emissions breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categoryData.map((cat) => (
              <div
                key={cat.category}
                className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {cat.type === "upstream" ? (
                    <Factory className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Truck className="h-4 w-4 text-orange-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      Category {cat.category}: {cat.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cat.type === "upstream" ? "Upstream" : "Downstream"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-scope-3">{cat.emissions}</p>
                  <p className="text-xs text-muted-foreground">tCO₂-e</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
