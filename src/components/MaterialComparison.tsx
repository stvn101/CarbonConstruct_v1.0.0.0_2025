import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLCAMaterials, LCAMaterialData } from '@/hooks/useLCAMaterials';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import { Plus, X, TrendingDown, TrendingUp, Minus, ArrowUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

const COMPARISON_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export const MaterialComparison = () => {
  const { materials, loading } = useLCAMaterials();
  const [selectedMaterials, setSelectedMaterials] = useState<LCAMaterialData[]>([]);
  const [currentSelection, setCurrentSelection] = useState<string>('');

  const addMaterialToComparison = () => {
    if (!currentSelection) {
      toast({
        title: 'No Material Selected',
        description: 'Please select a material to add to comparison',
        variant: 'destructive',
      });
      return;
    }

    const material = materials.find(m => m.id === currentSelection);
    if (!material) return;

    if (selectedMaterials.length >= 5) {
      toast({
        title: 'Maximum Reached',
        description: 'You can compare up to 5 materials at once',
        variant: 'destructive',
      });
      return;
    }

    if (selectedMaterials.find(m => m.id === material.id)) {
      toast({
        title: 'Already Added',
        description: 'This material is already in the comparison',
        variant: 'destructive',
      });
      return;
    }

    setSelectedMaterials([...selectedMaterials, material]);
    setCurrentSelection('');
  };

  const removeMaterial = (id: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== id));
  };

  const clearAll = () => {
    setSelectedMaterials([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading materials...</p>
        </div>
      </div>
    );
  }

  // Prepare comparison chart data
  const comparisonData = [
    {
      stage: 'A1-A3: Product',
      ...selectedMaterials.reduce((acc, mat, idx) => ({
        ...acc,
        [mat.material_name]: mat.embodied_carbon_a1a3
      }), {})
    },
    {
      stage: 'A4: Transport',
      ...selectedMaterials.reduce((acc, mat, idx) => ({
        ...acc,
        [mat.material_name]: mat.embodied_carbon_a4
      }), {})
    },
    {
      stage: 'A5: Construction',
      ...selectedMaterials.reduce((acc, mat, idx) => ({
        ...acc,
        [mat.material_name]: mat.embodied_carbon_a5
      }), {})
    },
  ];

  // Prepare radar chart data for total comparison
  const radarData = selectedMaterials.map(mat => ({
    material: mat.material_name,
    'A1-A3': mat.embodied_carbon_a1a3,
    'A4': mat.embodied_carbon_a4,
    'A5': mat.embodied_carbon_a5,
  }));

  // Calculate savings potential (compare to highest)
  const calculateSavings = () => {
    if (selectedMaterials.length < 2) return [];
    
    const maxTotal = Math.max(...selectedMaterials.map(m => m.embodied_carbon_total));
    return selectedMaterials.map(mat => ({
      material: mat,
      savings: maxTotal - mat.embodied_carbon_total,
      percentageSavings: ((maxTotal - mat.embodied_carbon_total) / maxTotal) * 100
    }));
  };

  const savingsData = calculateSavings();

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Material Comparison Tool</CardTitle>
          <CardDescription>
            Compare embodied carbon across different material alternatives to identify lower-impact options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={currentSelection} onValueChange={setCurrentSelection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a material to compare..." />
                </SelectTrigger>
                <SelectContent>
                  {materials.map(material => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.material_name} ({material.material_category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addMaterialToComparison} size="default">
              <Plus className="h-4 w-4 mr-2" />
              Add to Comparison
            </Button>
          </div>

          {/* Selected Materials */}
          {selectedMaterials.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Selected Materials ({selectedMaterials.length}/5)</p>
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMaterials.map((material, idx) => (
                  <Badge
                    key={material.id}
                    variant="secondary"
                    className="pr-1 text-sm"
                    style={{ backgroundColor: COMPARISON_COLORS[idx] + '20', color: COMPARISON_COLORS[idx] }}
                  >
                    {material.material_name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-2"
                      onClick={() => removeMaterial(material.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {selectedMaterials.length > 0 && (
        <>
          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {selectedMaterials.map((material, idx) => (
              <Card key={material.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{material.material_name}</CardTitle>
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: COMPARISON_COLORS[idx] }}
                    />
                  </div>
                  <CardDescription className="capitalize">{material.material_category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{material.embodied_carbon_total.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">kgCO₂e per {material.unit}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Side-by-Side Comparison Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Lifecycle Stage Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle Stage Breakdown</CardTitle>
                <CardDescription>Compare emissions across A1-A5 stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stage" />
                      <YAxis label={{ value: 'kgCO₂e', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => `${Number(value).toFixed(2)} kgCO₂e`} />
                      <Legend />
                      {selectedMaterials.map((material, idx) => (
                        <Bar
                          key={material.id}
                          dataKey={material.material_name}
                          fill={COMPARISON_COLORS[idx]}
                          name={material.material_name}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Total Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Total Embodied Carbon Comparison</CardTitle>
                <CardDescription>Overall carbon impact per unit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedMaterials.map((m, idx) => ({
                        name: m.material_name,
                        total: m.embodied_carbon_total,
                        fill: COMPARISON_COLORS[idx]
                      }))}
                      layout="horizontal"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" label={{ value: 'kgCO₂e', position: 'insideBottom', offset: -5 }} />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip formatter={(value) => `${Number(value).toFixed(2)} kgCO₂e`} />
                      <Bar dataKey="total">
                        {selectedMaterials.map((material, idx) => (
                          <Cell key={`cell-${idx}`} fill={COMPARISON_COLORS[idx]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Analysis */}
          {selectedMaterials.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Carbon Savings Potential
                </CardTitle>
                <CardDescription>
                  Comparison against highest-carbon material option
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savingsData
                    .sort((a, b) => b.savings - a.savings)
                    .map((item, idx) => {
                      const Icon = item.savings > 0 ? TrendingDown : item.savings < 0 ? TrendingUp : Minus;
                      const color = item.savings > 0 ? 'text-success' : item.savings < 0 ? 'text-destructive' : 'text-muted-foreground';
                      
                      return (
                        <div key={item.material.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-3 w-3 rounded-full" 
                                style={{ backgroundColor: COMPARISON_COLORS[selectedMaterials.indexOf(item.material)] }}
                              />
                              <span className="font-medium">{item.material.material_name}</span>
                              <Badge variant={item.savings > 0 ? 'default' : 'secondary'}>
                                {item.material.embodied_carbon_total.toFixed(2)} kgCO₂e/{item.material.unit}
                              </Badge>
                            </div>
                            <div className={`flex items-center gap-2 ${color}`}>
                              <Icon className="h-4 w-4" />
                              <span className="font-semibold">
                                {item.savings > 0 ? '-' : item.savings < 0 ? '+' : ''}
                                {Math.abs(item.savings).toFixed(2)} kgCO₂e
                              </span>
                              <span className="text-sm">
                                ({item.percentageSavings > 0 ? '-' : ''}
                                {Math.abs(item.percentageSavings).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="absolute h-full transition-all"
                              style={{ 
                                width: `${(item.material.embodied_carbon_total / Math.max(...selectedMaterials.map(m => m.embodied_carbon_total))) * 100}%`,
                                backgroundColor: COMPARISON_COLORS[selectedMaterials.indexOf(item.material)]
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
              <CardDescription>Side-by-side breakdown of all lifecycle stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">A1-A3 (Product)</TableHead>
                      <TableHead className="text-right">A4 (Transport)</TableHead>
                      <TableHead className="text-right">A5 (Construction)</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedMaterials.map((material, idx) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: COMPARISON_COLORS[idx] }}
                            />
                            {material.material_name}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{material.material_category}</TableCell>
                        <TableCell className="text-right">{material.embodied_carbon_a1a3.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{material.embodied_carbon_a4.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{material.embodied_carbon_a5.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">{material.embodied_carbon_total.toFixed(2)}</TableCell>
                        <TableCell>{material.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {selectedMaterials.length >= 2 && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-success" />
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(() => {
                    const lowest = savingsData.reduce((min, item) => 
                      item.material.embodied_carbon_total < min.material.embodied_carbon_total ? item : min
                    );
                    const highest = savingsData.reduce((max, item) => 
                      item.material.embodied_carbon_total > max.material.embodied_carbon_total ? item : max
                    );
                    
                    return (
                      <>
                        <p className="text-sm">
                          <strong className="text-success">{lowest.material.material_name}</strong> has the lowest embodied carbon at{' '}
                          <strong>{lowest.material.embodied_carbon_total.toFixed(2)} kgCO₂e/{lowest.material.unit}</strong>.
                        </p>
                        {lowest.material.id !== highest.material.id && (
                          <p className="text-sm">
                            Choosing <strong>{lowest.material.material_name}</strong> over{' '}
                            <strong>{highest.material.material_name}</strong> could reduce embodied carbon by{' '}
                            <strong className="text-success">
                              {(highest.material.embodied_carbon_total - lowest.material.embodied_carbon_total).toFixed(2)} kgCO₂e/{lowest.material.unit}
                            </strong> ({((highest.material.embodied_carbon_total - lowest.material.embodied_carbon_total) / highest.material.embodied_carbon_total * 100).toFixed(1)}% reduction).
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-3">
                          Consider material performance, cost, availability, and structural requirements alongside carbon impact for optimal material selection.
                        </p>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {selectedMaterials.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ArrowUpDown className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Materials Selected</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Select materials from the dropdown above to begin comparing their embodied carbon values across lifecycle stages
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
