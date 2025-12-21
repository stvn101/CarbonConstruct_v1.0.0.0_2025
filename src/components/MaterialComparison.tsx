import { useState, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useEPDMaterials, EPDMaterial } from '@/hooks/useEPDMaterials';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { X, TrendingDown, TrendingUp, Minus, ArrowUpDown, Search, Leaf, CheckCircle2, Download, FileText, FileSpreadsheet, Database } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/EmptyState';
import { LIMITS } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const COMPARISON_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

// Preset comparisons using name patterns for EPD materials
const PRESET_COMPARISONS = [
  { name: 'CLT vs Concrete (Structural)', searches: ['CLT', 'Concrete 32'] },
  { name: 'Steel vs Timber (Framing)', searches: ['Steel Section', 'Hardwood'] },
  { name: 'Brick vs AAC Block', searches: ['Clay Brick', 'AAC Block'] },
  { name: 'Standard vs Low-Carbon Concrete', searches: ['Concrete 32MPa', 'Low Carbon'] },
];

export const MaterialComparison = memo(() => {
  const { allMaterials: materials, loading, error, dataSources } = useEPDMaterials();
  const [selectedMaterials, setSelectedMaterials] = useState<EPDMaterial[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(null);

  // Filter materials by search term and data source with fuzzy matching
  const filteredMaterials = useMemo(() => {
    if (searchTerm.length < 1) return [];
    
    // Split search into words for multi-term matching
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
    if (searchWords.length === 0) return [];
    
    return materials
      .filter(m => {
        // Filter by data source first
        if (selectedDataSource && m.data_source !== selectedDataSource) {
          return false;
        }
        
        // Create searchable text from all relevant fields
        const searchableText = [
          m.material_name,
          m.material_category,
          m.subcategory,
          m.manufacturer,
          m.plant_location
        ].filter(Boolean).join(' ').toLowerCase();
        
        // All search words must match somewhere in the searchable text
        return searchWords.every(word => searchableText.includes(word));
      })
      .slice(0, 50); // Show more results
  }, [materials, searchTerm, selectedDataSource]);

  const addMaterial = (material: EPDMaterial) => {
    if (selectedMaterials.length >= LIMITS.MAX_MATERIALS_COMPARISON) {
      toast({
        title: 'Maximum Reached',
        description: `You can compare up to ${LIMITS.MAX_MATERIALS_COMPARISON} materials at once`,
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
    setSearchTerm('');
    setShowSearch(false);
  };

  const removeMaterial = (id: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m.id !== id));
  };

  const clearAll = () => {
    setSelectedMaterials([]);
  };

  const loadPreset = (searches: string[]) => {
    // Find materials matching the search patterns
    const presetMaterials: EPDMaterial[] = [];
    for (const search of searches) {
      const term = search.toLowerCase();
      const found = materials.find(m => 
        m.material_name.toLowerCase().includes(term)
      );
      if (found && !presetMaterials.find(p => p.id === found.id)) {
        presetMaterials.push(found);
      }
    }
    
    if (presetMaterials.length > 0) {
      setSelectedMaterials(presetMaterials);
    } else {
      toast({
        title: 'Preset Not Available',
        description: 'No matching materials found for this preset',
        variant: 'destructive',
      });
    }
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

  if (error || materials.length === 0) {
    return (
      <EmptyState
        icon={ArrowUpDown}
        title="No Materials Available"
        description={error || "The material database is empty. Materials must be imported before you can use the comparison tool."}
      />
    );
  }

  // Calculate comparison metrics including sequestration
  const comparisonMetrics = useMemo(() => {
    return selectedMaterials.map(mat => {
      const grossCarbon = mat.ef_total;
      // EPD materials may have carbon_sequestration field (timber materials)
      const sequestration = (mat as any).carbon_sequestration ? Math.abs((mat as any).carbon_sequestration) : 0;
      const netCarbon = grossCarbon - sequestration;
      
      return {
        material: mat,
        grossCarbon,
        sequestration,
        netCarbon,
        hasSequestration: sequestration > 0,
        a1a3: mat.ef_a1a3 || 0,
        a4: mat.ef_a4 || 0,
        a5: mat.ef_a5 || 0,
      };
    });
  }, [selectedMaterials]);

  // Prepare comparison chart data
  const comparisonData = [
    {
      stage: 'A1-A3: Product',
      ...selectedMaterials.reduce((acc, mat) => ({
        ...acc,
        [mat.material_name]: mat.ef_a1a3 || 0
      }), {})
    },
    {
      stage: 'A4: Transport',
      ...selectedMaterials.reduce((acc, mat) => ({
        ...acc,
        [mat.material_name]: mat.ef_a4 || 0
      }), {})
    },
    {
      stage: 'A5: Construction',
      ...selectedMaterials.reduce((acc, mat) => ({
        ...acc,
        [mat.material_name]: mat.ef_a5 || 0
      }), {})
    },
  ];

  // Net carbon comparison data (including sequestration)
  const netCarbonData = comparisonMetrics
    .map((m, idx) => ({
      name: m.material.material_name,
      gross: m.grossCarbon,
      sequestration: -m.sequestration,
      net: m.netCarbon,
      fill: COMPARISON_COLORS[idx],
      hasSequestration: m.hasSequestration,
    }))
    .sort((a, b) => a.net - b.net);

  // Calculate savings potential
  const calculateSavings = () => {
    if (comparisonMetrics.length < 2) return [];
    
    const maxNet = Math.max(...comparisonMetrics.map(m => m.netCarbon));
    return comparisonMetrics.map(m => ({
      ...m,
      savings: maxNet - m.netCarbon,
      percentageSavings: maxNet > 0 ? ((maxNet - m.netCarbon) / maxNet) * 100 : 0
    })).sort((a, b) => b.savings - a.savings);
  };

  const savingsData = calculateSavings();
  const bestOption = savingsData[0];
  const worstOption = savingsData[savingsData.length - 1];

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (comparisonMetrics.length === 0) return;
    
    const headers = ['Material', 'Category', 'A1-A3 (kgCO₂e)', 'A4 (kgCO₂e)', 'A5 (kgCO₂e)', 'Gross Total (kgCO₂e)', 'Sequestration (kgCO₂e)', 'Net Total (kgCO₂e)', 'Unit'];
    const rows = comparisonMetrics.map(m => [
      m.material.material_name,
      m.material.material_category,
      m.a1a3.toFixed(2),
      m.a4.toFixed(2),
      m.a5.toFixed(2),
      m.grossCarbon.toFixed(2),
      m.hasSequestration ? (-m.sequestration).toFixed(2) : '0',
      m.netCarbon.toFixed(2),
      m.material.unit
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `material-comparison-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: 'Export Complete',
      description: 'Comparison data exported to CSV',
    });
  }, [comparisonMetrics]);

  // Export to text report
  const exportToReport = useCallback(() => {
    if (comparisonMetrics.length === 0) return;
    
    let report = `MATERIAL CARBON COMPARISON REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `${'='.repeat(60)}\n\n`;
    
    report += `MATERIALS COMPARED: ${comparisonMetrics.length}\n\n`;
    
    comparisonMetrics.forEach((m, idx) => {
      report += `${idx + 1}. ${m.material.material_name}\n`;
      report += `   Category: ${m.material.material_category}\n`;
      report += `   A1-A3: ${m.a1a3.toFixed(2)} kgCO₂e/${m.material.unit}\n`;
      report += `   A4: ${m.a4.toFixed(2)} kgCO₂e/${m.material.unit}\n`;
      report += `   A5: ${m.a5.toFixed(2)} kgCO₂e/${m.material.unit}\n`;
      report += `   Gross Total: ${m.grossCarbon.toFixed(2)} kgCO₂e/${m.material.unit}\n`;
      if (m.hasSequestration) {
        report += `   Carbon Sequestration: -${m.sequestration.toFixed(2)} kgCO₂e/${m.material.unit}\n`;
      }
      report += `   Net Total: ${m.netCarbon.toFixed(2)} kgCO₂e/${m.material.unit}\n\n`;
    });
    
    if (bestOption && worstOption && comparisonMetrics.length >= 2) {
      report += `${'='.repeat(60)}\n`;
      report += `RECOMMENDATION\n`;
      report += `${'='.repeat(60)}\n\n`;
      report += `Best Option: ${bestOption.material.material_name}\n`;
      report += `Net Carbon: ${bestOption.netCarbon.toFixed(2)} kgCO₂e/${bestOption.material.unit}\n\n`;
      
      if (bestOption.material.id !== worstOption.material.id) {
        const savings = worstOption.netCarbon - bestOption.netCarbon;
        const percent = (savings / worstOption.netCarbon * 100).toFixed(1);
        report += `Choosing ${bestOption.material.material_name} over ${worstOption.material.material_name}\n`;
        report += `could save ${savings.toFixed(2)} kgCO₂e per unit (${percent}% reduction).\n`;
      }
    }
    
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `material-comparison-report-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    
    toast({
      title: 'Export Complete',
      description: 'Comparison report exported',
    });
  }, [comparisonMetrics, bestOption, worstOption]);

  return (
    <div className="space-y-6">
      {/* Material Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Material Carbon Comparison
          </CardTitle>
          <CardDescription>
            Compare embodied carbon across different material alternatives. Timber materials show carbon sequestration benefits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground mr-2">Quick compare:</span>
            {PRESET_COMPARISONS.map((preset, i) => (
              <Button 
                key={i} 
                variant="outline" 
                size="sm" 
                onClick={() => loadPreset(preset.searches)}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>

          {/* Search and Data Source Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials to compare (e.g., concrete, timber, steel)..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                className="pl-10"
              />
            </div>
            
            {/* Data Source Filter */}
            <Select value={selectedDataSource || "all"} onValueChange={(v) => setSelectedDataSource(v === "all" ? null : v)}>
              <SelectTrigger className="w-[140px] bg-background">
                <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Sources</SelectItem>
                {dataSources.map((source) => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Search Results */}
          <div className="relative">
            
            {showSearch && filteredMaterials.length > 0 && (
              <Card className="absolute z-20 w-full mt-1 p-2 shadow-lg bg-popover">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-1 pr-3">
                    {filteredMaterials.map(m => (
                      <button
                        key={m.id}
                        onClick={() => addMaterial(m)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded flex justify-between items-center"
                        disabled={selectedMaterials.find(sm => sm.id === m.id) !== undefined}
                      >
                        <span className="flex items-center gap-2">
                          {m.material_name}
                          {(m as any).carbon_sequestration && (
                            <Leaf className="h-3 w-3 text-emerald-500" />
                          )}
                          <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                            {m.data_source}
                          </Badge>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.ef_total.toFixed(1)} kgCO₂/{m.unit}
                        </span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            )}
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
                    className="pr-1 text-sm flex items-center gap-1"
                    style={{ backgroundColor: COMPARISON_COLORS[idx] + '20', color: COMPARISON_COLORS[idx] }}
                  >
                    {(material as any).carbon_sequestration && <Leaf className="h-3 w-3" />}
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
          {/* Export Actions */}
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Results
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToReport} className="gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Export as Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {comparisonMetrics.map((m, idx) => (
              <Card key={m.material.id} className={bestOption?.material.id === m.material.id && savingsData.length > 1 ? 'ring-2 ring-emerald-500' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {m.material.material_name}
                      {m.hasSequestration && <Leaf className="h-4 w-4 text-emerald-500" />}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {bestOption?.material.id === m.material.id && savingsData.length > 1 && (
                        <Badge className="bg-emerald-500 text-xs">Best</Badge>
                      )}
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: COMPARISON_COLORS[idx] }}
                      />
                    </div>
                  </div>
                  <CardDescription className="capitalize">{m.material.material_category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{m.grossCarbon.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground">kgCO₂e per {m.material.unit} (gross)</p>
                    {m.hasSequestration && (
                      <>
                        <div className="text-sm text-emerald-600 flex items-center gap-1">
                          <Leaf className="h-3 w-3" />
                          -{m.sequestration.toFixed(1)} stored
                        </div>
                        <div className={`text-lg font-bold ${m.netCarbon <= 0 ? 'text-blue-600' : 'text-foreground'}`}>
                          = {m.netCarbon.toFixed(1)} net
                          {m.netCarbon <= 0 && ' 🌱'}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Net Carbon Comparison (with sequestration) */}
          {comparisonMetrics.some(m => m.hasSequestration) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-500" />
                  Net Carbon Comparison (Including Sequestration)
                </CardTitle>
                <CardDescription>
                  Timber materials store carbon during growth, reducing their net carbon impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={netCarbonData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" label={{ value: 'kgCO₂e per unit', position: 'insideBottom', offset: -5 }} />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(1)} kgCO₂e`,
                          name === 'gross' ? 'Gross Emissions' : name === 'sequestration' ? 'Carbon Stored' : 'Net Carbon'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="gross" name="Gross Emissions" fill="hsl(var(--chart-1))" stackId="a" />
                      <Bar dataKey="sequestration" name="Carbon Stored" fill="hsl(142 76% 36%)" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-sm text-emerald-800">
                  <strong>Note:</strong> Carbon sequestration values represent CO₂ absorbed during tree growth. 
                  Net carbon = Gross emissions − Carbon stored. Negative values indicate carbon-negative materials.
                </div>
              </CardContent>
            </Card>
          )}

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
                <CardTitle>Total Embodied Carbon</CardTitle>
                <CardDescription>Overall carbon impact per unit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedMaterials.map((m, idx) => ({
                        name: m.material_name,
                        total: m.ef_total,
                        fill: COMPARISON_COLORS[idx]
                      }))}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" label={{ value: 'kgCO₂e', position: 'insideBottom', offset: -5 }} />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip formatter={(value) => `${Number(value).toFixed(2)} kgCO₂e`} />
                      <Bar dataKey="total">
                        {selectedMaterials.map((_material, idx) => (
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
                  <TrendingDown className="h-5 w-5 text-emerald-500" />
                  Carbon Savings Potential
                </CardTitle>
                <CardDescription>
                  Comparison against highest net carbon material (accounts for sequestration)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savingsData.map((item, idx) => {
                    const Icon = item.savings > 0 ? TrendingDown : item.savings < 0 ? TrendingUp : Minus;
                    const color = item.savings > 0 ? 'text-emerald-600' : item.savings < 0 ? 'text-destructive' : 'text-muted-foreground';
                    const materialIdx = selectedMaterials.findIndex(m => m.id === item.material.id);
                    
                    return (
                      <div key={item.material.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: COMPARISON_COLORS[materialIdx] }}
                            />
                            <span className="font-medium flex items-center gap-2">
                              {item.material.material_name}
                              {item.hasSequestration && <Leaf className="h-3 w-3 text-emerald-500" />}
                            </span>
                            <Badge variant={item.savings > 0 ? 'default' : 'secondary'}>
                              {item.netCarbon.toFixed(1)} kgCO₂e/{item.material.unit} net
                            </Badge>
                            {idx === 0 && <Badge className="bg-emerald-500"><CheckCircle2 className="h-3 w-3 mr-1" />Best</Badge>}
                          </div>
                          <div className={`flex items-center gap-2 ${color}`}>
                            <Icon className="h-4 w-4" />
                            <span className="font-semibold">
                              {item.savings > 0 ? '-' : item.savings < 0 ? '+' : ''}
                              {Math.abs(item.savings).toFixed(1)} kgCO₂e
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
                              width: `${Math.max(0, (item.netCarbon / Math.max(...comparisonMetrics.map(m => m.netCarbon), 1)) * 100)}%`,
                              backgroundColor: COMPARISON_COLORS[materialIdx]
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
              <CardDescription>Side-by-side breakdown including carbon sequestration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">A1-A3</TableHead>
                      <TableHead className="text-right">A4</TableHead>
                      <TableHead className="text-right">A5</TableHead>
                      <TableHead className="text-right">Gross Total</TableHead>
                      <TableHead className="text-right text-emerald-600">Sequestration</TableHead>
                      <TableHead className="text-right font-bold">Net Total</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonMetrics.map((m, idx) => (
                      <TableRow key={m.material.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full" 
                              style={{ backgroundColor: COMPARISON_COLORS[idx] }}
                            />
                            {m.material.material_name}
                            {m.hasSequestration && <Leaf className="h-3 w-3 text-emerald-500" />}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{m.material.material_category}</TableCell>
                        <TableCell className="text-right">{m.a1a3.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{m.a4.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{m.a5.toFixed(1)}</TableCell>
                        <TableCell className="text-right">{m.grossCarbon.toFixed(1)}</TableCell>
                        <TableCell className="text-right text-emerald-600">
                          {m.hasSequestration ? `-${m.sequestration.toFixed(1)}` : '—'}
                        </TableCell>
                        <TableCell className={`text-right font-bold ${m.netCarbon <= 0 ? 'text-blue-600' : ''}`}>
                          {m.netCarbon.toFixed(1)}
                        </TableCell>
                        <TableCell>{m.material.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {selectedMaterials.length >= 2 && bestOption && worstOption && (
            <Card className="border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-foreground">
                  <p>
                    <strong className="text-emerald-500">{bestOption.material.material_name}</strong> has the lowest net embodied carbon at{' '}
                    <strong>{bestOption.netCarbon.toFixed(1)} kgCO₂e/{bestOption.material.unit}</strong>
                    {bestOption.hasSequestration && (
                      <span className="text-emerald-500"> (including {bestOption.sequestration.toFixed(1)} kgCO₂e of carbon storage)</span>
                    )}.
                  </p>
                  {bestOption.material.id !== worstOption.material.id && (
                    <p>
                      Choosing <strong>{bestOption.material.material_name}</strong> over{' '}
                      <strong>{worstOption.material.material_name}</strong> could reduce net embodied carbon by{' '}
                      <strong className="text-emerald-500">
                        {(worstOption.netCarbon - bestOption.netCarbon).toFixed(1)} kgCO₂e/{bestOption.material.unit}
                      </strong> ({((worstOption.netCarbon - bestOption.netCarbon) / worstOption.netCarbon * 100).toFixed(1)}% reduction).
                    </p>
                  )}
                  {comparisonMetrics.some(m => m.hasSequestration) && (
                    <p className="text-emerald-400 dark:text-emerald-300 flex items-center gap-2 mt-4 p-3 bg-emerald-500/20 rounded-lg">
                      <Leaf className="h-4 w-4 flex-shrink-0" />
                      <span>
                        <strong>Carbon storage benefit:</strong> Timber materials sequester CO₂ during tree growth. 
                        This stored carbon reduces their net climate impact compared to materials like concrete and steel.
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    Consider material performance, cost, availability, structural requirements, and durability alongside carbon impact for optimal material selection.
                  </p>
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
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Search for materials or use a quick preset above to compare their embodied carbon values
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PRESET_COMPARISONS.slice(0, 2).map((preset, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => loadPreset(preset.searches)}
                >
                  Try: {preset.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

MaterialComparison.displayName = 'MaterialComparison';
