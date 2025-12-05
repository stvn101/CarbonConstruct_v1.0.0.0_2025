import { memo, useMemo } from 'react';
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

export const EmissionsChart = memo(({ type, title, description, data, colors = VIBRANT_COLORS }: EmissionsChartProps) => {
  const chartConfig = useMemo(() => data.reduce((acc, item, idx) => {
    acc[item.category] = {
      label: item.category,
      color: colors[idx % colors.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>), [data, colors]);

  if (type === 'pie') {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <ChartContainer config={chartConfig} className="h-[280px] sm:h-[350px] w-full max-w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <Pie
                  data={data}
                  dataKey="emissions"
                  nameKey="category"
                  cx="50%"
                  cy="45%"
                  outerRadius="70%"
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
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
      <CardContent className="pb-8">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 60, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="category" 
                className="text-[10px]"
                angle={-35}
                textAnchor="end"
                height={80}
                interval={0}
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
});
