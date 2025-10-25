import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface EmissionData {
  category: string;
  emissions: number;
  percentage: number;
}

interface EmissionsChartProps {
  type: 'bar' | 'pie';
  title: string;
  description: string;
  data: EmissionData[];
  colors?: string[];
}

const VIBRANT_COLORS = [
  'hsl(15, 86%, 55%)',   // Scope 1 - Vibrant orange-red
  'hsl(48, 89%, 50%)',   // Scope 2 - Golden yellow
  'hsl(142, 76%, 36%)',  // Scope 3 - Forest green
  'hsl(210, 85%, 50%)',  // Electric blue
  'hsl(280, 70%, 55%)',  // Royal purple
  'hsl(180, 75%, 45%)',  // Teal
  'hsl(30, 90%, 55%)',   // Bright orange
  'hsl(340, 75%, 55%)',  // Hot pink
];

export const EmissionsChart = ({ type, title, description, data, colors = VIBRANT_COLORS }: EmissionsChartProps) => {
  const chartConfig = data.reduce((acc, item, idx) => {
    acc[item.category] = {
      label: item.category,
      color: colors[idx % colors.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  if (type === 'pie') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="emissions"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                  labelLine={true}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="category" 
                className="text-xs"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                className="text-xs"
                label={{ value: 'tCO₂e', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="emissions" 
                radius={[8, 8, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
