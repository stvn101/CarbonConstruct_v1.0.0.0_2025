import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Activity, BarChart3, RefreshCw, Search, Shield, CheckCircle, XCircle, Clock, Database, Upload, FileText, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { SecurityAuditReportDownload } from "@/components/SecurityAuditReport";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { MaterialValidationReport } from "@/components/MaterialValidationReport";
interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  severity: string;
  page_url: string | null;
  created_at: string;
  user_id: string | null;
}

interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  page_url: string | null;
  device_type: string | null;
  created_at: string;
}

interface AnalyticsEvent {
  id: string;
  event_name: string;
  event_data: Record<string, unknown> | null;
  page_url: string | null;
  session_id: string | null;
  created_at: string;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  total_latency: number;
  checks: Record<string, { status: string; latency?: number; error?: string }>;
  metrics?: { recent_errors_1h: number };
}

export default function AdminMonitoring() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  
  // Import states
  const [importLoading, setImportLoading] = useState(false);
  const [epdImportLoading, setEpdImportLoading] = useState(false);
  const [nabersImportLoading, setNabersImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    total: number;
    imported: number;
    failed: number;
    status: string;
  } | null>(null);
  const [nabersImportResult, setNabersImportResult] = useState<{
    success: boolean;
    total?: number;
    inserted?: number;
    failed?: number;
    skipped?: number;
    error?: string;
    sample?: any[];
  } | null>(null);
  const [icmImportLoading, setIcmImportLoading] = useState(false);
  const [icmImportResult, setIcmImportResult] = useState<{
    success: boolean;
    total?: number;
    inserted?: number;
    failed?: number;
    skipped?: number;
    duplicates?: number;
    error?: string;
    sample?: any[];
  } | null>(null);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [epdMaterialsCount, setEpdMaterialsCount] = useState(0);
  
  // Filters
  const [errorSearch, setErrorSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [metricFilter, setMetricFilter] = useState("all");

  useEffect(() => {
    const checkAdminAndLoad = async () => {
      if (authLoading) return;
      
      if (!user) {
        navigate("/auth");
        return;
      }
      
      // Check if user has admin role using security definer function
      const { data: hasAdminRole, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      
      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      if (hasAdminRole) {
        setIsAdmin(true);
        loadAllData();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };
    
    checkAdminAndLoad();
  }, [user, authLoading, navigate]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadErrorLogs(),
      loadPerformanceMetrics(),
      loadAnalyticsEvents(),
      loadHealthStatus(),
      loadMaterialsCount(),
      loadEpdMaterialsCount(),
    ]);
    setLoading(false);
  };
  
  const loadMaterialsCount = async () => {
    // Legacy count - lca_materials table is deprecated
    setMaterialsCount(0);
  };
  
  const loadEpdMaterialsCount = async () => {
    const { count } = await supabase
      .from("materials_epd")
      .select("*", { count: 'exact', head: true });
    setEpdMaterialsCount(count || 0);
  };
  
  const handleNabersFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    setNabersImportLoading(true);
    setNabersImportResult(null);
    
    try {
      // Read file as base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      toast.info('Processing XLSX file... This may take a moment.');
      
      const { data, error } = await supabase.functions.invoke("import-nabers-epd", {
        body: { action: 'import', fileData, sheetIndex: 1 }
      });
      
      if (error) throw error;
      
      setNabersImportResult(data);
      
      if (data?.success) {
        toast.success(`Imported ${data.inserted || 0} EPD materials from NABERS file`);
      } else if (data?.error) {
        toast.error(data.error);
      }
      
      // Refresh count
      await loadEpdMaterialsCount();
    } catch (err: any) {
      console.error("NABERS Import error:", err);
      toast.error(err.message || "Import failed");
      setNabersImportResult({ success: false, error: err.message });
    } finally {
      setNabersImportLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };
  
  const clearEpdMaterials = async () => {
    if (!confirm('Are you sure you want to delete ALL EPD materials? This cannot be undone.')) {
      return;
    }
    
    setEpdImportLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-nabers-epd", {
        body: { action: 'clear' }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Cleared all EPD materials');
        setNabersImportResult(null);
      } else if (data?.error) {
        toast.error(data.error);
      }
      
      await loadEpdMaterialsCount();
    } catch (err: any) {
      console.error("Clear EPD error:", err);
      toast.error(err.message || "Clear failed");
    } finally {
      setEpdImportLoading(false);
    }
  };
  
  const handleIcmFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    setIcmImportLoading(true);
    setIcmImportResult(null);
    
    try {
      // Read file as base64
      const reader = new FileReader();
      const fileData = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      toast.info('Processing ICM Database XLSX file...');
      
      const { data, error } = await supabase.functions.invoke("import-icm-materials", {
        body: { action: 'import', fileData }
      });
      
      if (error) throw error;
      
      setIcmImportResult(data);
      
      if (data?.success) {
        toast.success(`Imported ${data.inserted || 0} materials from ICM Database`);
      } else if (data?.error) {
        toast.error(data.error);
      }
      
      // Refresh count
      await loadEpdMaterialsCount();
    } catch (err: any) {
      console.error("ICM Import error:", err);
      toast.error(err.message || "Import failed");
      setIcmImportResult({ success: false, error: err.message });
    } finally {
      setIcmImportLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };
  
  const clearIcmMaterials = async () => {
    if (!confirm('Are you sure you want to delete all ICM Database materials? This cannot be undone.')) {
      return;
    }
    
    setIcmImportLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("import-icm-materials", {
        body: { action: 'clear_icm' }
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Cleared all ICM Database materials');
        setIcmImportResult(null);
      } else if (data?.error) {
        toast.error(data.error);
      }
      
      await loadEpdMaterialsCount();
    } catch (err: any) {
      console.error("Clear ICM error:", err);
      toast.error(err.message || "Clear failed");
    } finally {
      setIcmImportLoading(false);
    }
  };
  
  const triggerMaterialsImport = async () => {
    setImportLoading(true);
    setImportProgress(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("import-materials", {
        body: { tableName: "unified_materials", batchSize: 100 }
      });
      
      if (error) throw error;
      
      if (data?.progress) {
        setImportProgress(data.progress);
        toast.success(`Imported ${data.progress.imported} materials`);
      } else if (data?.error) {
        toast.error(data.error);
      }
      
      // Refresh EPD materials count (primary table)
      await loadEpdMaterialsCount();
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error(err.message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const loadErrorLogs = async () => {
    const { data } = await supabase
      .from("error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setErrorLogs((data as ErrorLog[]) || []);
  };

  const loadPerformanceMetrics = async () => {
    const { data } = await supabase
      .from("performance_metrics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setPerformanceMetrics((data as PerformanceMetric[]) || []);
  };

  const loadAnalyticsEvents = async () => {
    const { data } = await supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setAnalyticsEvents((data as AnalyticsEvent[]) || []);
  };

  const loadHealthStatus = async () => {
    try {
      const { data } = await supabase.functions.invoke("health-check");
      setHealthStatus(data);
    } catch {
      setHealthStatus(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "error": return "destructive";
      case "warning": return "secondary";
      default: return "outline";
    }
  };

  const getMetricStatus = (name: string, value: number) => {
    switch (name) {
      case "LCP": return value < 2500 ? "good" : value < 4000 ? "needs-improvement" : "poor";
      case "FID": return value < 100 ? "good" : value < 300 ? "needs-improvement" : "poor";
      case "CLS": return value < 0.1 ? "good" : value < 0.25 ? "needs-improvement" : "poor";
      case "TTFB": return value < 800 ? "good" : value < 1800 ? "needs-improvement" : "poor";
      default: return "neutral";
    }
  };

  const filteredErrors = errorLogs.filter(log => {
    const matchesSearch = errorSearch === "" || 
      log.error_message.toLowerCase().includes(errorSearch.toLowerCase()) ||
      log.error_type.toLowerCase().includes(errorSearch.toLowerCase());
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const filteredMetrics = performanceMetrics.filter(metric => {
    return metricFilter === "all" || metric.metric_name === metricFilter;
  });

  const uniqueMetricNames = [...new Set(performanceMetrics.map(m => m.metric_name))];

  // Calculate aggregates
  const errorCounts = {
    critical: errorLogs.filter(e => e.severity === "critical").length,
    error: errorLogs.filter(e => e.severity === "error").length,
    warning: errorLogs.filter(e => e.severity === "warning").length,
  };

  const avgMetrics = uniqueMetricNames.reduce((acc, name) => {
    const metrics = performanceMetrics.filter(m => m.metric_name === name);
    acc[name] = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.metric_value, 0) / metrics.length 
      : 0;
    return acc;
  }, {} as Record<string, number>);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <Shield className="h-6 w-6" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              You don't have permission to view this page. Admin access is required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">System health, errors, and analytics overview</p>
        </div>
        <Button onClick={loadAllData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {healthStatus?.status === "healthy" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{healthStatus?.status || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              Latency: {healthStatus?.total_latency || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Critical Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{errorCounts.critical}</p>
            <p className="text-xs text-muted-foreground">Last 100 logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Avg LCP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgMetrics["LCP"]?.toFixed(0) || 0}ms</p>
            <p className="text-xs text-muted-foreground">
              {getMetricStatus("LCP", avgMetrics["LCP"] || 0) === "good" ? "✓ Good" : "⚠ Needs work"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Events Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {analyticsEvents.filter(e => 
                new Date(e.created_at).toDateString() === new Date().toDateString()
              ).length}
            </p>
            <p className="text-xs text-muted-foreground">Analytics events</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Admin Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/material-verification">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Material Verification Report
              </Button>
            </Link>
            <SecurityAuditReportDownload />
          </div>
        </CardContent>
      </Card>

      {/* Service Health */}
      {healthStatus?.checks && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(healthStatus.checks).map(([service, check]) => (
                <div key={service} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {check.status === "healthy" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium capitalize">{service}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant={check.status === "healthy" ? "outline" : "destructive"}>
                      {check.status}
                    </Badge>
                    {check.latency && (
                      <p className="text-xs text-muted-foreground mt-1">{check.latency}ms</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Error Logs ({errorLogs.length})
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Activity className="h-4 w-4" />
            Performance ({performanceMetrics.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics ({analyticsEvents.length})
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data Import
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="validation" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Validation
          </TabsTrigger>
        </TabsList>

        {/* Validation Tab */}
        <TabsContent value="validation">
          <MaterialValidationReport />
        </TabsContent>

        {/* Data Import Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Materials Database Import
              </CardTitle>
              <CardDescription>
                Import LCA materials from external database (4,000+ EPD records)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Current Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{materialsCount.toLocaleString()}</p>
                  </CardContent>
                </Card>
                
                {importProgress && (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Import Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Progress 
                          value={importProgress.total > 0 ? (importProgress.imported / importProgress.total) * 100 : 0} 
                          className="mb-2"
                        />
                        <p className="text-sm text-muted-foreground">
                          {importProgress.imported} / {importProgress.total} ({importProgress.status})
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Failed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-destructive">{importProgress.failed}</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={triggerMaterialsImport} 
                  disabled={importLoading}
                  className="gap-2"
                >
                  {importLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Import from External DB
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={loadMaterialsCount}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Count
                </Button>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Import Notes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Imports from EXTERNAL_SUPABASE_URL configured in secrets</li>
                  <li>• Processes in batches of 100 records</li>
                  <li>• Maps to lca_materials schema (material_name, category, embodied carbon A1-A5, etc.)</li>
                  <li>• Duplicate entries may occur - consider clearing table first if needed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* NABERS XLSX Import - Real EPD Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                NABERS EPD Import (Real Data)
              </CardTitle>
              <CardDescription>
                Import ~3,500 verified EPD materials from the NABERS 2025 Excel file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">EPD Materials (materials_epd)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{epdMaterialsCount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Verified EPD records</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Data Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>✓ Real EPD registration numbers</li>
                      <li>✓ Official EPD URLs</li>
                      <li>✓ Verified GWP values</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleNabersFileUpload}
                  disabled={nabersImportLoading || epdImportLoading}
                  className="hidden"
                  id="nabers-file-upload"
                />
                <label 
                  htmlFor="nabers-file-upload" 
                  className={`cursor-pointer ${nabersImportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {nabersImportLoading ? (
                      <>
                        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                        <p className="text-sm font-medium">Processing XLSX...</p>
                        <p className="text-xs text-muted-foreground">This may take a minute</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-primary" />
                        <p className="text-sm font-medium">Upload NABERS XLSX File</p>
                        <p className="text-xs text-muted-foreground">
                          National_material_emission_factors_database_-_EPD_list_-_v2025.1-6.xlsx
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 flex-wrap">
                <Button 
                  variant="destructive" 
                  onClick={clearEpdMaterials} 
                  disabled={epdImportLoading || nabersImportLoading}
                  className="gap-2"
                >
                  Clear All EPD Materials
                </Button>
                <Button variant="outline" onClick={loadEpdMaterialsCount}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Count
                </Button>
              </div>
              
              {/* Import Result */}
              {nabersImportResult && (
                <Card className={nabersImportResult.success ? 'border-green-500/50' : 'border-destructive/50'}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {nabersImportResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      Import Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {nabersImportResult.success ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">{nabersImportResult.inserted?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Imported</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-destructive">{nabersImportResult.failed?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Failed</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-muted-foreground">{nabersImportResult.skipped?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Skipped</p>
                          </div>
                        </div>
                        {nabersImportResult.sample && nabersImportResult.sample.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium mb-2">Sample Records:</p>
                            <div className="bg-muted rounded p-2 text-xs overflow-x-auto">
                              <pre>{JSON.stringify(nabersImportResult.sample, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-destructive">{nabersImportResult.error}</p>
                    )}
                  </CardContent>
                </Card>
              )}
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2 text-primary">NABERS Import Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ ~3,500 verified EPD records from NABERS 2025 database</li>
                  <li>✓ Real EPD registration numbers (S-P-XXXXX format)</li>
                  <li>✓ Official EPD document URLs</li>
                  <li>✓ Verified GWP values from certified EPDs</li>
                  <li>✓ Publication and expiry dates</li>
                  <li>✓ Manufacturer and plant location extraction</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* ICM Database 2019 Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                ICM Database 2019 Import (~656 materials)
              </CardTitle>
              <CardDescription>
                Import AusLCI-based lifecycle inventory data from UNSW Sydney ICM Database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Data Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">ICM Database 2019 (AusLCI)</p>
                    <p className="text-xs text-muted-foreground">National LCI data quality</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Data Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>✓ Process-based CFIs (A1-A3)</li>
                      <li>✓ Hybrid CFIs (Total LCA)</li>
                      <li>✓ ICM & AusLCI IDs preserved</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-amber-600/30 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleIcmFileUpload}
                  disabled={icmImportLoading}
                  className="hidden"
                  id="icm-file-upload"
                />
                <label 
                  htmlFor="icm-file-upload" 
                  className={`cursor-pointer ${icmImportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {icmImportLoading ? (
                      <>
                        <RefreshCw className="h-8 w-8 text-amber-600 animate-spin" />
                        <p className="text-sm font-medium">Processing ICM Database...</p>
                        <p className="text-xs text-muted-foreground">This may take a moment</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-amber-600" />
                        <p className="text-sm font-medium">Upload ICM Database XLSX File</p>
                        <p className="text-xs text-muted-foreground">
                          ICM_Database_2019_FINAL.xlsx
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 flex-wrap">
                <Button 
                  variant="outline" 
                  onClick={clearIcmMaterials} 
                  disabled={icmImportLoading}
                  className="gap-2 border-amber-600/50 text-amber-600 hover:bg-amber-600/10"
                >
                  Clear ICM Materials Only
                </Button>
              </div>
              
              {/* Import Result */}
              {icmImportResult && (
                <Card className={icmImportResult.success ? 'border-green-500/50' : 'border-destructive/50'}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {icmImportResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      ICM Import Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {icmImportResult.success ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">{icmImportResult.inserted?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Imported</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-destructive">{icmImportResult.failed?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Failed</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-muted-foreground">{icmImportResult.skipped?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Skipped</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-amber-600">{icmImportResult.duplicates?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Duplicates</p>
                          </div>
                        </div>
                        {icmImportResult.sample && icmImportResult.sample.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium mb-2">Sample Records:</p>
                            <div className="bg-muted rounded p-2 text-xs overflow-x-auto">
                              <pre>{JSON.stringify(icmImportResult.sample, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-destructive">{icmImportResult.error}</p>
                    )}
                  </CardContent>
                </Card>
              )}
              
              <div className="bg-amber-600/5 p-4 rounded-lg border border-amber-600/20">
                <h4 className="font-medium mb-2 text-amber-600">ICM Database Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ ~656 Australian building material records</li>
                  <li>✓ Process-based carbon footprint intensities (CFIs)</li>
                  <li>✓ Hybrid LCA carbon footprint intensities</li>
                  <li>✓ AusLCI-verified national inventory data</li>
                  <li>✓ ICM ID and AusLCI ID traceability</li>
                  <li>✓ Automatic deduplication against existing materials</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error Logs Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div>
                  <CardTitle>Error Logs</CardTitle>
                  <CardDescription>Recent application errors and exceptions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search errors..."
                      value={errorSearch}
                      onChange={(e) => setErrorSearch(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="max-w-[300px]">Message</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredErrors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No error logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredErrors.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.error_type}</TableCell>
                          <TableCell className="max-w-[300px] truncate" title={log.error_message}>
                            {log.error_message}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {log.page_url?.replace(window.location.origin, "") || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {format(new Date(log.created_at), "MMM d, HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Core Web Vitals and page load timing</CardDescription>
                </div>
                <Select value={metricFilter} onValueChange={setMetricFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Metrics</SelectItem>
                    {uniqueMetricNames.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {/* Metric Averages */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {Object.entries(avgMetrics).map(([name, value]) => {
                  const status = getMetricStatus(name, value);
                  return (
                    <div key={name} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xl font-bold">
                        {name === "CLS" ? value.toFixed(3) : `${value.toFixed(0)}ms`}
                      </p>
                      <Badge 
                        variant={status === "good" ? "outline" : status === "needs-improvement" ? "secondary" : "destructive"}
                        className="mt-1"
                      >
                        {status === "good" ? "Good" : status === "needs-improvement" ? "Needs Work" : "Poor"}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMetrics.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No performance metrics found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMetrics.slice(0, 50).map((metric) => {
                        const status = getMetricStatus(metric.metric_name, metric.metric_value);
                        return (
                          <TableRow key={metric.id}>
                            <TableCell className="font-medium">{metric.metric_name}</TableCell>
                            <TableCell className="font-mono">
                              {metric.metric_name === "CLS" 
                                ? metric.metric_value.toFixed(3) 
                                : `${metric.metric_value.toFixed(0)}ms`}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={status === "good" ? "outline" : status === "needs-improvement" ? "secondary" : "destructive"}
                              >
                                {status === "good" ? "Good" : status === "needs-improvement" ? "OK" : "Poor"}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize">{metric.device_type || "-"}</TableCell>
                            <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                              {metric.page_url?.replace(window.location.origin, "") || "-"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(new Date(metric.created_at), "MMM d, HH:mm")}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Events</CardTitle>
                <CardDescription>User activity and feature usage tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Event Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(
                    analyticsEvents.reduce((acc, e) => {
                      acc[e.event_name] = (acc[e.event_name] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 4)
                    .map(([name, count]) => (
                      <div key={name} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xl font-bold">{count}</p>
                      </div>
                    ))}
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsEvents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No analytics events found
                          </TableCell>
                        </TableRow>
                      ) : (
                        analyticsEvents.slice(0, 50).map((event) => (
                          <TableRow key={event.id}>
                            <TableCell className="font-medium">{event.event_name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                              {event.event_data ? JSON.stringify(event.event_data).slice(0, 50) : "-"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground truncate max-w-[150px]">
                              {event.page_url?.replace(window.location.origin, "") || "-"}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {event.session_id?.slice(0, 8) || "-"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                              {format(new Date(event.created_at), "MMM d, HH:mm")}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Security Dashboard */}
            <SecurityDashboard />
            
            {/* Security Audit Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Security Audit Report
                </CardTitle>
                <CardDescription>
                  Download the comprehensive security audit report for compliance and stakeholder distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <SecurityAuditReportDownload />
                
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Report Contents:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Audit metadata and scope</li>
                    <li>• Security scan results summary</li>
                    <li>• Remediation actions completed (8 issues fixed)</li>
                    <li>• Security controls verification checklist</li>
                    <li>• Database security verification (18 tables)</li>
                    <li>• Compliance attestation (Privacy Act, OWASP, NCC 2024)</li>
                    <li>• Certification statement</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }
