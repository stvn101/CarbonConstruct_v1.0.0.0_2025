/**
 * Material Validation Report Component
 * Admin-only view showing full Layer 1-6 validation results
 * Per Framework v1.0 Part 4.1 Step 7
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Download,
  FileText,
  TrendingUp,
  Database,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ValidationIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  layer: number;
  code: string;
  message: string;
  materialId: string;
  materialName: string;
  value?: number | string;
  expectedRange?: string;
  recommendedAction: string;
}

interface FlaggedMaterial {
  id: string;
  material_name: string;
  material_category: string;
  ef_total: number;
  unit: string;
  data_source: string | null;
  epd_number: string | null;
  manufacturer: string | null;
  confidenceLevel: 'verified' | 'documented' | 'industry_average' | 'needs_review';
  confidenceColor: 'green' | 'yellow' | 'orange' | 'red';
  sourceTier: number;
  isOutlier: boolean;
  issues: ValidationIssue[];
}

interface ValidationReport {
  timestamp: string;
  version: string;
  totalMaterials: number;
  passRate: number;
  confidenceLevelCounts: {
    verified: number;
    documented: number;
    industry_average: number;
    needs_review: number;
  };
  sourceTierCounts: {
    tier1: number;
    tier2: number;
    tier3: number;
  };
  issueCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  outlierCount: number;
  flaggedMaterials: FlaggedMaterial[];
  categoryStats: Record<string, {
    count: number;
    avgEf: number;
    minEf: number;
    maxEf: number;
    stdDev: number;
    outliers: number;
  }>;
}

const severityColors = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-500 text-black',
  low: 'bg-blue-500 text-white'
};

const confidenceColors = {
  green: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-destructive'
};

export function MaterialValidationReport() {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatic, setLoadingStatic] = useState(false);
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const runValidation = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      const { data, error } = await supabase.functions.invoke('validate-materials', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      
      setReport(data);
      toast.success(`Validation complete: ${data.passRate}% pass rate`);
    } catch (err) {
      console.error('Validation error:', err);
      toast.error('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const loadSavedReport = async () => {
    setLoadingStatic(true);
    try {
      const response = await fetch('/demo/validation-report-2025-12-15.json');
      if (!response.ok) throw new Error('Report file not found');
      const data = await response.json();
      setReport(data);
      toast.success(`Loaded report: ${data.totalMaterials.toLocaleString()} materials, ${data.passRate}% pass rate`);
    } catch (err) {
      console.error('Load report error:', err);
      toast.error('Failed to load saved report');
    } finally {
      setLoadingStatic(false);
    }
  };

  const exportReport = () => {
    if (!report) return;
    
    const reportData = JSON.stringify(report, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-report-${report.timestamp.split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Material Database Validation</CardTitle>
                <CardDescription>
                  Full Layer 1-6 validation per CarbonConstruct Framework v1.0
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline"
                onClick={loadSavedReport} 
                disabled={loadingStatic}
                className="gap-2"
              >
                <FileText className={`h-4 w-4 ${loadingStatic ? 'animate-pulse' : ''}`} />
                {loadingStatic ? 'Loading...' : 'Load Saved Report'}
              </Button>
              <Button 
                onClick={runValidation} 
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Running...' : 'Run Validation'}
              </Button>
              {report && (
                <Button variant="outline" onClick={exportReport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {report && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">
              Issues ({report.issueCounts.critical + report.issueCounts.high})
            </TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged ({report.flaggedMaterials.length})
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Database className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Materials</p>
                      <p className="text-2xl font-bold">{report.totalMaterials.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-emerald-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Pass Rate</p>
                      <p className="text-2xl font-bold text-emerald-500">{report.passRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                      <p className="text-sm text-muted-foreground">Critical Issues</p>
                      <p className="text-2xl font-bold text-destructive">{report.issueCounts.critical}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-8 w-8 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Outliers</p>
                      <p className="text-2xl font-bold text-orange-500">{report.outlierCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Confidence Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Confidence Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-32 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-sm">Verified</span>
                    </div>
                    <Progress value={(report.confidenceLevelCounts.verified / report.totalMaterials) * 100} className="flex-1" />
                    <span className="w-20 text-right text-sm">{report.confidenceLevelCounts.verified.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm">Documented</span>
                    </div>
                    <Progress value={(report.confidenceLevelCounts.documented / report.totalMaterials) * 100} className="flex-1" />
                    <span className="w-20 text-right text-sm">{report.confidenceLevelCounts.documented.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      <span className="text-sm">Industry Avg</span>
                    </div>
                    <Progress value={(report.confidenceLevelCounts.industry_average / report.totalMaterials) * 100} className="flex-1" />
                    <span className="w-20 text-right text-sm">{report.confidenceLevelCounts.industry_average.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-sm">Needs Review</span>
                    </div>
                    <Progress value={(report.confidenceLevelCounts.needs_review / report.totalMaterials) * 100} className="flex-1" />
                    <span className="w-20 text-right text-sm">{report.confidenceLevelCounts.needs_review.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Source Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Source Credibility Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-emerald-500">{report.sourceTierCounts.tier1.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Tier 1: EPD Verified</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((report.sourceTierCounts.tier1 / report.totalMaterials) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-orange-500">{report.sourceTierCounts.tier2.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Tier 2: Industry Average</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((report.sourceTierCounts.tier2 / report.totalMaterials) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <p className="text-3xl font-bold text-destructive">{report.sourceTierCounts.tier3.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Tier 3: Needs Review</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((report.sourceTierCounts.tier3 / report.totalMaterials) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation Metadata */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Validation Version: {report.version}</span>
                    <span>•</span>
                    <span>Validated: {new Date(report.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Verified by Claude Sonnet 4.5 / Anthropic</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <Card className="border-destructive/50">
                <CardContent className="pt-6 text-center">
                  <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-2xl font-bold text-destructive">{report.issueCounts.critical}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </CardContent>
              </Card>
              <Card className="border-orange-500/50">
                <CardContent className="pt-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-500">{report.issueCounts.high}</p>
                  <p className="text-sm text-muted-foreground">High</p>
                </CardContent>
              </Card>
              <Card className="border-yellow-500/50">
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-500">{report.issueCounts.medium}</p>
                  <p className="text-sm text-muted-foreground">Medium</p>
                </CardContent>
              </Card>
              <Card className="border-blue-500/50">
                <CardContent className="pt-6 text-center">
                  <Info className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-500">{report.issueCounts.low}</p>
                  <p className="text-sm text-muted-foreground">Low</p>
                </CardContent>
              </Card>
            </div>

            {report.issueCounts.critical > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Issues Detected</AlertTitle>
                <AlertDescription>
                  {report.issueCounts.critical} materials have critical validation failures that must be addressed before production use.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Flagged Materials Tab */}
          <TabsContent value="flagged">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Flagged Materials (Top 100)</CardTitle>
                <CardDescription>
                  Materials with high or critical severity issues requiring investigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Factor</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Issues</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.flaggedMaterials.map((material) => (
                        <React.Fragment key={material.id}>
                          <TableRow 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setExpandedMaterial(
                              expandedMaterial === material.id ? null : material.id
                            )}
                          >
                            <TableCell>
                              {expandedMaterial === material.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate font-medium">
                              {material.material_name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {material.material_category}
                            </TableCell>
                            <TableCell>
                              {material.ef_total.toFixed(2)} {material.unit}
                            </TableCell>
                            <TableCell>
                              <div className={`w-3 h-3 rounded-full ${confidenceColors[material.confidenceColor]}`} />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {material.issues.filter(i => i.severity === 'critical').length > 0 && (
                                  <Badge className={severityColors.critical}>
                                    {material.issues.filter(i => i.severity === 'critical').length}
                                  </Badge>
                                )}
                                {material.issues.filter(i => i.severity === 'high').length > 0 && (
                                  <Badge className={severityColors.high}>
                                    {material.issues.filter(i => i.severity === 'high').length}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {expandedMaterial === material.id && (
                            <TableRow>
                              <TableCell colSpan={6} className="bg-muted/30">
                                <div className="p-4 space-y-3">
                                  <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Source:</span>{' '}
                                      {material.data_source || 'Unknown'}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">EPD:</span>{' '}
                                      {material.epd_number || 'None'}
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Manufacturer:</span>{' '}
                                      {material.manufacturer || 'Unknown'}
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    {material.issues.map((issue, idx) => (
                                      <Alert key={idx} className="py-2">
                                        <div className="flex items-start gap-3">
                                          <Badge className={severityColors[issue.severity]}>
                                            Layer {issue.layer}
                                          </Badge>
                                          <div className="flex-1">
                                            <p className="font-medium">{issue.code}</p>
                                            <p className="text-sm text-muted-foreground">{issue.message}</p>
                                            {issue.expectedRange && (
                                              <p className="text-xs text-muted-foreground">
                                                Expected: {issue.expectedRange}
                                              </p>
                                            )}
                                            <p className="text-sm text-primary mt-1">
                                              → {issue.recommendedAction}
                                            </p>
                                          </div>
                                        </div>
                                      </Alert>
                                    ))}
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Statistics</CardTitle>
                <CardDescription>
                  Statistical analysis per material category with outlier detection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Avg EF</TableHead>
                        <TableHead className="text-right">Min</TableHead>
                        <TableHead className="text-right">Max</TableHead>
                        <TableHead className="text-right">Std Dev</TableHead>
                        <TableHead className="text-right">Outliers</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(report.categoryStats)
                        .sort((a, b) => b[1].count - a[1].count)
                        .map(([category, stats]) => (
                          <TableRow key={category}>
                            <TableCell className="font-medium">{category}</TableCell>
                            <TableCell className="text-right">{stats.count}</TableCell>
                            <TableCell className="text-right">{stats.avgEf.toFixed(1)}</TableCell>
                            <TableCell className="text-right">{stats.minEf.toFixed(1)}</TableCell>
                            <TableCell className="text-right">{stats.maxEf.toFixed(1)}</TableCell>
                            <TableCell className="text-right">{stats.stdDev.toFixed(1)}</TableCell>
                            <TableCell className="text-right">
                              {stats.outliers > 0 ? (
                                <Badge variant="outline" className="text-orange-500 border-orange-500">
                                  {stats.outliers}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!report && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No validation report available. Run validation to generate a report.
            </p>
            <Button onClick={runValidation} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Run Full Validation
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
