import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLCAMaterials } from '@/hooks/useLCAMaterials';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, TrendingUp, Factory, Truck, Building, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

const STAGE_COLORS = {
  a1a3: 'hsl(var(--chart-1))',
  a4: 'hsl(var(--chart-2))',
  a5: 'hsl(var(--chart-3))',
};

export const LCADashboard = () => {
  const { materials, loading, stageBreakdown, categoryBreakdown } = useLCAMaterials();
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    try {
      // Prepare CSV content
      let csvContent = 'LCA Material Database - Embodied Carbon Report\n\n';
      
      // Add summary section
      csvContent += 'LIFECYCLE STAGE SUMMARY\n';
      csvContent += 'Stage,Emissions (kgCO2e)\n';
      csvContent += `A1-A3: Product Stage,${stageBreakdown.a1a3.toFixed(2)}\n`;
      csvContent += `A4: Transport,${stageBreakdown.a4.toFixed(2)}\n`;
      csvContent += `A5: Construction,${stageBreakdown.a5.toFixed(2)}\n`;
      csvContent += `Total,${stageBreakdown.total.toFixed(2)}\n\n`;
      
      // Add category breakdown
      csvContent += 'CATEGORY BREAKDOWN\n';
      csvContent += 'Category,A1-A3 (kgCO2e),A4 (kgCO2e),A5 (kgCO2e),Total (kgCO2e)\n';
      categoryBreakdown.forEach(cat => {
        csvContent += `${cat.category},${cat.a1a3.toFixed(2)},${cat.a4.toFixed(2)},${cat.a5.toFixed(2)},${cat.total.toFixed(2)}\n`;
      });
      csvContent += '\n';
      
      // Add material details
      csvContent += 'MATERIAL DATABASE\n';
      csvContent += 'Material Name,Category,A1-A3 (kgCO2e),A4 (kgCO2e),A5 (kgCO2e),Total (kgCO2e),Unit,Region,Data Source\n';
      materials.forEach(material => {
        csvContent += `"${material.material_name}",${material.material_category},${material.embodied_carbon_a1a3?.toFixed(2) || '0.00'},${material.embodied_carbon_a4?.toFixed(2) || '0.00'},${material.embodied_carbon_a5?.toFixed(2) || '0.00'},${material.embodied_carbon_total?.toFixed(2) || '0.00'},${material.unit},${material.region},"${material.data_source}"\n`;
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `lca-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Export Successful',
        description: 'LCA data exported to CSV',
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export CSV file',
        variant: 'destructive',
      });
    }
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      const element = document.getElementById('lca-dashboard-content');
      if (element) {
        const html2pdf = (await import('html2pdf.js')).default;
        await html2pdf()
          .set({
            margin: 15,
            filename: `lca-dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          })
          .from(element)
          .save();
        
        toast({
          title: 'Export Successful',
          description: 'LCA dashboard exported to PDF',
        });
      }
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export PDF file',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading LCA data...</p>
        </div>
      </div>
    );
  }

  const stageChartData = [
    { name: 'A1-A3: Product Stage', value: stageBreakdown.a1a3, color: STAGE_COLORS.a1a3, icon: Factory },
    { name: 'A4: Transport', value: stageBreakdown.a4, color: STAGE_COLORS.a4, icon: Truck },
    { name: 'A5: Construction', value: stageBreakdown.a5, color: STAGE_COLORS.a5, icon: Building },
  ];

  const categoryChartData = categoryBreakdown.map(cat => ({
    category: cat.category,
    'A1-A3': cat.a1a3,
    'A4': cat.a4,
    'A5': cat.a5,
  }));

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>LCA Data Export</CardTitle>
              <CardDescription>Download compliance reports for Australian standards (NCC, Green Star, NABERS)</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={exportToPDF} disabled={exporting} size="sm">
                <FileText className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div id="lca-dashboard-content" className="space-y-6">
      {/* Report Header for PDF Export */}
      <div className="print:block hidden mb-6">
        <div className="text-center space-y-2 pb-4 border-b-2 border-primary">
          <h1 className="text-3xl font-bold text-primary">Life Cycle Assessment Report</h1>
          <p className="text-lg text-muted-foreground">Embodied Carbon Analysis - Lifecycle Stages A1-A5</p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span>Generated: {new Date().toLocaleDateString('en-AU')}</span>
            <span>•</span>
            <span>Standards: ISO 21930, AS 5377, NMEF v2025.1</span>
          </div>
        </div>
      </div>
      
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Embodied Carbon</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stageBreakdown.total.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">kgCO₂e per unit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A1-A3: Product Stage</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stageBreakdown.a1a3.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stageBreakdown.total > 0 ? ((stageBreakdown.a1a3 / stageBreakdown.total) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A4: Transport</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stageBreakdown.a4.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stageBreakdown.total > 0 ? ((stageBreakdown.a4 / stageBreakdown.total) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">A5: Construction</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stageBreakdown.a5.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stageBreakdown.total > 0 ? ((stageBreakdown.a5 / stageBreakdown.total) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visualization Tabs */}
      <Tabs defaultValue="stages" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stages">By Stage</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="materials">Material Details</TabsTrigger>
        </TabsList>

        {/* Stage Breakdown */}
        <TabsContent value="stages" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle Stage Distribution</CardTitle>
                <CardDescription>Embodied carbon by lifecycle stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stageChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name.split(':')[0]}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stageChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toFixed(2)} kgCO₂e`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stage Comparison</CardTitle>
                <CardDescription>Detailed breakdown by stage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stageChartData.map((stage, index) => {
                  const Icon = stage.icon;
                  const percentage = stageBreakdown.total > 0 
                    ? (stage.value / stageBreakdown.total) * 100 
                    : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: stage.color }} />
                          <span className="text-sm font-medium">{stage.name}</span>
                        </div>
                        <Badge variant="secondary">{stage.value.toFixed(2)} kgCO₂e</Badge>
                      </div>
                      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: stage.color
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Category Breakdown */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emissions by Material Category</CardTitle>
              <CardDescription>Lifecycle stage breakdown for each material category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis label={{ value: 'kgCO₂e', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)} kgCO₂e`} />
                    <Legend />
                    <Bar dataKey="A1-A3" stackId="a" fill={STAGE_COLORS.a1a3} name="A1-A3: Product Stage" />
                    <Bar dataKey="A4" stackId="a" fill={STAGE_COLORS.a4} name="A4: Transport" />
                    <Bar dataKey="A5" stackId="a" fill={STAGE_COLORS.a5} name="A5: Construction" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categoryBreakdown.map((cat, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base capitalize">{cat.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">A1-A3:</span>
                    <span className="font-medium">{cat.a1a3.toFixed(2)} kgCO₂e</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">A4:</span>
                    <span className="font-medium">{cat.a4.toFixed(2)} kgCO₂e</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">A5:</span>
                    <span className="font-medium">{cat.a5.toFixed(2)} kgCO₂e</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between text-sm font-semibold">
                    <span>Total:</span>
                    <span>{cat.total.toFixed(2)} kgCO₂e</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Material Details Table */}
        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>Material Database</CardTitle>
              <CardDescription>
                Australian emission factors for construction materials (NMEF v2025.1)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">A1-A3</TableHead>
                      <TableHead className="text-right">A4</TableHead>
                      <TableHead className="text-right">A5</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Region</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.material_name}</TableCell>
                        <TableCell className="capitalize">{material.material_category}</TableCell>
                        <TableCell className="text-right">{material.embodied_carbon_a1a3?.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{material.embodied_carbon_a4?.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{material.embodied_carbon_a5?.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold">{material.embodied_carbon_total?.toFixed(2)}</TableCell>
                        <TableCell>{material.unit}</TableCell>
                        <TableCell>{material.region}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Alert */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Understanding Lifecycle Stages</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="space-y-1">
            <p><strong>A1-A3 (Product Stage):</strong> Raw material extraction, transport to factory, and manufacturing processes</p>
            <p><strong>A4 (Transport):</strong> Transportation of products from factory to construction site</p>
            <p><strong>A5 (Construction):</strong> Installation and construction activities on-site</p>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Data based on Australian National Material Emission Factors (NMEF) v2025.1 and aligned with ISO 21930 standards for EPD
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};
