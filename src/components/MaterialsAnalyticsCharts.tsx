import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, Database, Layers, FileText } from "lucide-react";

interface CategoryData {
  name: string;
  count: number;
  [key: string]: string | number;
}

interface SourceData {
  name: string;
  count: number;
  [key: string]: string | number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff8042',
];

export function MaterialsAnalyticsCharts() {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch category breakdown (top 10)
      const { data: categories } = await supabase
        .from('materials_epd')
        .select('material_category')
        .not('material_category', 'is', null);

      if (categories) {
        const categoryCounts: Record<string, number> = {};
        categories.forEach(m => {
          const cat = m.material_category || 'Unknown';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        const sortedCategories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setCategoryData(sortedCategories);
        setTotalMaterials(categories.length);
      }

      // Fetch data source breakdown
      const { data: sources } = await supabase
        .from('materials_epd')
        .select('data_source')
        .not('data_source', 'is', null);

      if (sources) {
        const sourceCounts: Record<string, number> = {};
        sources.forEach(m => {
          const src = m.data_source || 'Unknown';
          sourceCounts[src] = (sourceCounts[src] || 0) + 1;
        });

        const sortedSources = Object.entries(sourceCounts)
          .map(([name, count]) => ({ 
            name: name.length > 30 ? name.substring(0, 27) + '...' : name, 
            count 
          }))
          .sort((a, b) => b.count - a.count);

        setSourceData(sortedSources);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Summary Stats */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Materials Database Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-primary">{totalMaterials.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Materials</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-chart-1">{categoryData.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-3xl font-bold text-chart-2">{sourceData.length}</div>
              <div className="text-sm text-muted-foreground">Data Sources</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4" />
            Top Categories
          </CardTitle>
          <CardDescription>Material distribution by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120} 
                className="text-xs"
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data Source Distribution - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Data Sources
          </CardTitle>
          <CardDescription>Materials by source database</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="count"
                nameKey="name"
                label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {sourceData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number | undefined, name?: string) => [(value ?? 0).toLocaleString(), name ?? '']}
              />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
