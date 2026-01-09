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
import { AlertTriangle, Activity, BarChart3, RefreshCw, Search, Shield, CheckCircle, XCircle, Clock, Database, Upload, FileText, FileCheck, Bug, Zap, ShieldAlert, Leaf, Target, ArrowRight, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { SecurityAuditReportDownload } from "@/components/SecurityAuditReport";
import { SecurityDashboard } from "@/components/SecurityDashboard";
import { MaterialValidationReport } from "@/components/MaterialValidationReport";
import { BluescopeEPDImporter } from "@/components/BluescopeEPDImporter";
import BulkEPDUploader from "@/components/BulkEPDUploader";
import { ABTestDashboard } from "@/components/ABTestDashboard";
import { AdminSidebar } from "@/components/AdminSidebar";
import { ProductionAlertingPanel } from "@/components/ProductionAlertingPanel";
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

function SecuritySummaryWidget() {
  const [stats, setStats] = useState({
    honeypotTriggers: 0,
    rateLimitViolations: 0,
    authFailures: 0,
    activeAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      // Load security events from last 24h
      const { data: events } = await supabase
        .from("error_logs")
        .select("error_type")
        .like("error_type", "security_%")
        .gte("created_at", twentyFourHoursAgo);

      // Load active alerts
      const { data: alerts } = await supabase
        .from("alerts")
        .select("id")
        .like("alert_type", "security_%")
        .eq("resolved", false);

      if (events) {
        setStats({
          honeypotTriggers: events.filter(e => e.error_type === "security_honeypot_triggered").length,
          rateLimitViolations: events.filter(e => e.error_type === "security_rate_limit_exceeded").length,
          authFailures: events.filter(e => e.error_type === "security_auth_failure").length,
          activeAlerts: alerts?.length || 0
        });
      }
      setLoading(false);
    };

    loadStats();
  }, []);

  const getThreatLevel = () => {
    if (stats.activeAlerts > 0 || stats.honeypotTriggers > 5) return { level: 'high', color: 'text-destructive', bg: 'bg-destructive/10' };
    if (stats.rateLimitViolations > 10 || stats.authFailures > 5) return { level: 'medium', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { level: 'low', color: 'text-green-500', bg: 'bg-green-500/10' };
  };

  const threat = getThreatLevel();

  if (loading) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Security Summary (24h)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`p-3 rounded-lg ${threat.bg}`}>
            <p className={`text-sm font-medium ${threat.color}`}>Threat Level</p>
            <p className={`text-xl font-bold capitalize ${threat.color}`}>{threat.level}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Active Alerts
            </p>
            <p className="text-xl font-bold">{stats.activeAlerts}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Bug className="h-3 w-3" /> Honeypot
            </p>
            <p className="text-xl font-bold">{stats.honeypotTriggers}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3" /> Rate Limits
            </p>
            <p className="text-xl font-bold">{stats.rateLimitViolations}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Auth Failures
            </p>
            <p className="text-xl font-bold">{stats.authFailures}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
  
  const [epdImportLoading, setEpdImportLoading] = useState(false);
  const [nabersImportLoading, setNabersImportLoading] = useState(false);
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
  const [ngerImportLoading, setNgerImportLoading] = useState(false);
  const [ngerImportResult, setNgerImportResult] = useState<{
    success: boolean;
    type?: string;
    total?: number;
    inserted?: number;
    failed?: number;
    skipped?: number;
    duplicates?: number;
    error?: string;
    sample?: any[];
  } | null>(null);
  const [epicImportLoading, setEpicImportLoading] = useState(false);
  const [epicImportResult, setEpicImportResult] = useState<{
    success: boolean;
    total?: number;
    inserted?: number;
    failed?: number;
    skipped?: number;
    duplicates?: number;
    categories?: Record<string, number>;
    error?: string;
    sample?: any[];
  } | null>(null);
  const [epdMaterialsCount, setEpdMaterialsCount] = useState(0);
  
  // Unified materials import states
  const [unifiedImportMode, setUnifiedImportMode] = useState<'replace' | 'merge'>('replace');
  const [unifiedImportLoading, setUnifiedImportLoading] = useState(false);
  const [unifiedImportResult, setUnifiedImportResult] = useState<{
    success: boolean;
    previousCount?: number;
    newCount?: number;
    imported?: number;
    skippedDuplicates?: number;
    skippedInvalid?: number;
    failed?: number;
    deletedExisting?: number;
    error?: string;
    sources?: Record<string, number>;
    dataQuality?: {
      withEpdUrl: number;
      withManufacturer: number;
      withExpiryDate: number;
      totalCount: number;
    };
  } | null>(null);
  
  // Last import info
  const [lastImportInfo, setLastImportInfo] = useState<{
    completedAt: string;
    recordsImported: number;
    mode: string;
  } | null>(null);
  
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
      loadEpdMaterialsCount(),
      loadLastImportInfo(),
    ]);
    setLoading(false);
  };
  
  const loadEpdMaterialsCount = async () => {
    const { count } = await supabase
      .from("materials_epd")
      .select("*", { count: 'exact', head: true });
    setEpdMaterialsCount(count || 0);
  };
  
  const loadLastImportInfo = async () => {
    const { data } = await supabase
      .from("import_metadata")
      .select("completed_at, records_imported, mode")
      .eq("import_type", "unified_materials")
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (data && data.completed_at && data.records_imported !== null && data.mode) {
      setLastImportInfo({
        completedAt: data.completed_at,
        recordsImported: data.records_imported,
        mode: data.mode
      });
    } else {
      setLastImportInfo(null);
    }
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
  
  const triggerUnifiedMaterialsImport = async () => {
    setUnifiedImportLoading(true);
    setUnifiedImportResult(null);
    
    const previousCount = epdMaterialsCount;
    
    try {
      toast.info(unifiedImportMode === 'replace' 
        ? 'Replacing all materials... This may take 2-5 minutes.' 
        : 'Merging materials... This may take 2-5 minutes.');
      
      const { data, error } = await supabase.functions.invoke("import-materials", {
        body: { 
          tableName: "unified_materials", 
          batchSize: 100,
          mode: unifiedImportMode
        }
      });
      
      if (error) throw error;
      
      // Refresh count after import
      await loadEpdMaterialsCount();
      
      // Get new count
      const { count: newCount } = await supabase
        .from("materials_epd")
        .select("*", { count: 'exact', head: true });
      
      // Verify data quality
      const dataQuality = await verifyImportDataQuality();
      
      // Get source breakdown
      const sources = await getSourceBreakdown();
      
      if (data?.progress) {
        setUnifiedImportResult({
          success: true,
          previousCount,
          newCount: newCount || 0,
          imported: data.progress.imported,
          skippedDuplicates: data.progress.skippedDuplicates || 0,
          skippedInvalid: data.progress.skippedInvalid || 0,
          failed: data.progress.failed,
          deletedExisting: data.progress.deletedExisting || 0,
          sources,
          dataQuality
        });
        toast.success(`Successfully imported ${data.progress.imported} materials`);
        // Refresh last import info
        await loadLastImportInfo();
      } else if (data?.error) {
        setUnifiedImportResult({
          success: false,
          previousCount,
          error: data.error
        });
        toast.error(data.error);
      }
    } catch (err: any) {
      console.error("Unified import error:", err);
      setUnifiedImportResult({
        success: false,
        previousCount,
        error: err.message || "Import failed"
      });
      toast.error(err.message || "Import failed");
    } finally {
      setUnifiedImportLoading(false);
    }
  };
  
  // Quick restore function - restores ICE + NGER data (no file uploads needed)
  const [quickRestoreLoading, setQuickRestoreLoading] = useState(false);
  const quickRestoreMaterials = async () => {
    setQuickRestoreLoading(true);
    let iceImported = 0;
    let ngerImported = 0;
    
    try {
      toast.info('Quick Restore: Importing ICE + NGER data...');
      
      // Step 1: Import ICE materials from JSON
      const iceResponse = await fetch("/demo/ice-materials-v4.1.json");
      if (iceResponse.ok) {
        const materials = await iceResponse.json();
        const { data: iceData, error: iceError } = await supabase.functions.invoke("import-ice-materials", {
          body: { materials }
        });
        if (!iceError && iceData?.imported) {
          iceImported = iceData.imported;
        }
      }
      
      // Step 2: Import NGER materials (embedded data)
      const { data: ngerData, error: ngerError } = await supabase.functions.invoke("import-nger-data", {
        body: { action: 'import-materials' }
      });
      if (!ngerError && ngerData?.inserted) {
        ngerImported = ngerData.inserted;
      }
      
      // Step 3: Import NGER operational factors
      await supabase.functions.invoke("import-nger-data", {
        body: { action: 'import-operational' }
      });
      
      await loadEpdMaterialsCount();
      toast.success(`Quick Restore complete! ICE: ${iceImported}, NGER: ${ngerImported}`);
      
    } catch (err: any) {
      console.error("Quick restore error:", err);
      toast.error(err.message || "Quick restore failed");
    } finally {
      setQuickRestoreLoading(false);
    }
  };

  const verifyImportDataQuality = async () => {
    // Get counts for data quality metrics
    const { count: withEpdUrl } = await supabase
      .from("materials_epd")
      .select("*", { count: 'exact', head: true })
      .not('epd_url', 'is', null);
    
    const { count: withManufacturer } = await supabase
      .from("materials_epd")
      .select("*", { count: 'exact', head: true })
      .not('manufacturer', 'is', null);
    
    const { count: withExpiryDate } = await supabase
      .from("materials_epd")
      .select("*", { count: 'exact', head: true })
      .not('expiry_date', 'is', null);
    
    const { count: totalCount } = await supabase
      .from("materials_epd")
      .select("*", { count: 'exact', head: true });
    
    return {
      withEpdUrl: withEpdUrl || 0,
      withManufacturer: withManufacturer || 0,
      withExpiryDate: withExpiryDate || 0,
      totalCount: totalCount || 0
    };
  };

  const getSourceBreakdown = async () => {
    // Fetch all data_source values and count them
    const { data } = await supabase
      .from("materials_epd")
      .select("data_source");
    
    if (!data) return {};
    
    const sources: Record<string, number> = {};
    data.forEach(row => {
      const source = row.data_source || 'Unknown';
      sources[source] = (sources[source] || 0) + 1;
    });
    
    return sources;
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

  // Calculate aggregates - last 24h only for Critical Errors card
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentErrors = errorLogs.filter(e => new Date(e.created_at) > twentyFourHoursAgo);
  const errorCounts = {
    critical: recentErrors.filter(e => e.severity === "critical").length,
    error: recentErrors.filter(e => e.severity === "error").length,
    warning: recentErrors.filter(e => e.severity === "warning").length,
  };

  const avgMetrics = uniqueMetricNames.reduce((acc, name) => {
    const metrics = performanceMetrics.filter(m => m.metric_name === name);
    acc[name] = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.metric_value, 0) / metrics.length 
      : 0;
    return acc;
  }, {} as Record<string, number>);
  
  // Clear error logs (admin only)
  const clearErrorLogs = async () => {
    if (!confirm('Are you sure you want to delete ALL error logs? This cannot be undone.')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('error_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (error) throw error;
      
      toast.success('Error logs cleared');
      await loadErrorLogs();
    } catch (err: any) {
      console.error('Clear error logs failed:', err);
      toast.error(err.message || 'Failed to clear error logs');
    }
  };

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
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <div className="flex-1 p-6 space-y-6 overflow-auto">
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
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
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
            <Link to="/admin/eco-compliance">
              <Button variant="outline" className="gap-2">
                <Leaf className="h-4 w-4" />
                ECO Platform Compliance
              </Button>
            </Link>
            <Link to="/admin/material-verification">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Material Verification Report
              </Button>
            </Link>
            <Link to="/admin/ice-import">
              <Button variant="outline" className="gap-2">
                <Database className="h-4 w-4" />
                ICE Database Import
              </Button>
            </Link>
            <a href="/SECURITY_CONTROLS_SUMMARY.md" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <Shield className="h-4 w-4" />
                Security Controls Summary
              </Button>
            </a>
            <SecurityAuditReportDownload />
          </div>
        </CardContent>
      </Card>

      {/* Security Summary Widget */}
      <SecuritySummaryWidget />

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
          <TabsTrigger value="epd-upload" className="gap-2">
            <Upload className="h-4 w-4" />
            EPD Upload
          </TabsTrigger>
          <TabsTrigger value="ab-testing" className="gap-2">
            <Target className="h-4 w-4" />
            A/B Tests
          </TabsTrigger>
          <TabsTrigger value="alerting" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alerting
          </TabsTrigger>
        </TabsList>

        {/* A/B Testing Tab */}
        <TabsContent value="ab-testing">
          <ABTestDashboard />
        </TabsContent>

        {/* Production Alerting Tab */}
        <TabsContent value="alerting">
          <ProductionAlertingPanel />
        </TabsContent>

        {/* EPD Upload Tab */}
        <TabsContent value="epd-upload">
          <BulkEPDUploader />
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation">
          <MaterialValidationReport />
        </TabsContent>

        {/* Data Import Tab */}
        <TabsContent value="data" className="space-y-4">
          {/* EMERGENCY: Quick Restore - Top Priority */}
          {epdMaterialsCount < 1000 && (
            <Card className="border-2 border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Materials Database Empty - Quick Restore Available
                </CardTitle>
                <CardDescription>
                  Restore ICE (511) + NGER (63) materials instantly. For NABERS (3,408), upload the XLSX file below.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button 
                  onClick={quickRestoreMaterials} 
                  disabled={quickRestoreLoading}
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  {quickRestoreLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Database className="h-4 w-4" />
                      Quick Restore (ICE + NGER)
                    </>
                  )}
                </Button>
                <Link to="/admin/ice-import">
                  <Button variant="outline" className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Go to ICE Import Page
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
          
          {/* Unified Materials Import - Primary */}
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Import from unified_materials (External DB)
              </CardTitle>
              <CardDescription>
                Import clean LCA materials database with full EN 15804 lifecycle stages from external Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current State */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Current EPD Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{epdMaterialsCount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">records in materials_epd</p>
                  </CardContent>
                </Card>
                
                {/* Last Import Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Last Import
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {lastImportInfo ? (
                      <>
                        <p className="text-lg font-medium">
                          {format(new Date(lastImportInfo.completedAt), "dd MMM yyyy, HH:mm")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lastImportInfo.recordsImported.toLocaleString()} records ({lastImportInfo.mode} mode)
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-sm">No import history</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Import Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup 
                      value={unifiedImportMode} 
                      onValueChange={(v) => setUnifiedImportMode(v as 'replace' | 'merge')}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="replace" id="replace" />
                        <Label htmlFor="replace" className="text-sm font-medium cursor-pointer">
                          Replace All
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="merge" id="merge" />
                        <Label htmlFor="merge" className="text-sm font-medium cursor-pointer">
                          Merge (Keep Existing)
                        </Label>
                      </div>
                    </RadioGroup>
                    {unifiedImportMode === 'replace' && (
                      <p className="text-xs text-amber-600 mt-2">
                        ⚠️ This will delete all existing materials before importing
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Import Button */}
              <div className="flex gap-4">
                <Button 
                  onClick={triggerUnifiedMaterialsImport} 
                  disabled={unifiedImportLoading}
                  className="gap-2"
                  size="lg"
                >
                  {unifiedImportLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Importing... (2-5 mins)
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Import from External DB
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={loadEpdMaterialsCount} disabled={unifiedImportLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Count
                </Button>
              </div>
              
              {/* Loading Progress */}
              {unifiedImportLoading && (
                <Card className="border-primary/30 bg-primary/5">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-4">
                      <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                      <div>
                        <p className="font-medium">Import in progress...</p>
                        <p className="text-sm text-muted-foreground">
                          {unifiedImportMode === 'replace' ? 'Deleting existing records and ' : ''}
                          Fetching and importing materials from external database
                        </p>
                      </div>
                    </div>
                    <Progress className="mt-4" value={undefined} />
                  </CardContent>
                </Card>
              )}
              
              {/* Import Result */}
              {unifiedImportResult && (
                <Card className={unifiedImportResult.success ? 'border-green-500/50' : 'border-destructive/50'}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {unifiedImportResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      Import Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {unifiedImportResult.success ? (
                      <>
                        {/* Count Summary */}
                        <div className="flex items-center gap-2 text-lg">
                          <span className="text-muted-foreground">Previous:</span>
                          <span className="font-bold">{unifiedImportResult.previousCount?.toLocaleString()}</span>
                          <ArrowRight className="h-4 w-4" />
                          <span className="text-muted-foreground">New:</span>
                          <span className="font-bold text-primary">{unifiedImportResult.newCount?.toLocaleString()}</span>
                        </div>
                        
                        {/* Detailed Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                          {unifiedImportMode === 'replace' && unifiedImportResult.deletedExisting !== undefined && (
                            <div className="p-3 rounded-lg bg-amber-500/10">
                              <p className="text-2xl font-bold text-amber-600">{unifiedImportResult.deletedExisting.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Deleted</p>
                            </div>
                          )}
                          <div className="p-3 rounded-lg bg-green-500/10">
                            <p className="text-2xl font-bold text-green-600">{unifiedImportResult.imported?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Imported</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-2xl font-bold">{unifiedImportResult.skippedDuplicates?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Duplicates</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted">
                            <p className="text-2xl font-bold">{unifiedImportResult.skippedInvalid?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Invalid</p>
                          </div>
                          <div className="p-3 rounded-lg bg-destructive/10">
                            <p className="text-2xl font-bold text-destructive">{unifiedImportResult.failed?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Failed</p>
                          </div>
                        </div>
                        
                        {/* Source Breakdown */}
                        {unifiedImportResult.sources && Object.keys(unifiedImportResult.sources).length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Source Breakdown:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {Object.entries(unifiedImportResult.sources).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                                <div key={source} className="p-2 rounded bg-muted text-center">
                                  <p className="font-bold">{count.toLocaleString()}</p>
                                  <p className="text-xs text-muted-foreground truncate" title={source}>{source}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Data Quality */}
                        {unifiedImportResult.dataQuality && unifiedImportResult.dataQuality.totalCount > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Data Quality Verification:</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs w-28">EPD URLs:</span>
                                <Progress 
                                  value={(unifiedImportResult.dataQuality.withEpdUrl / unifiedImportResult.dataQuality.totalCount) * 100} 
                                  className="flex-1 h-2"
                                />
                                <span className="text-xs font-medium w-12 text-right">
                                  {Math.round((unifiedImportResult.dataQuality.withEpdUrl / unifiedImportResult.dataQuality.totalCount) * 100)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs w-28">Manufacturer:</span>
                                <Progress 
                                  value={(unifiedImportResult.dataQuality.withManufacturer / unifiedImportResult.dataQuality.totalCount) * 100} 
                                  className="flex-1 h-2"
                                />
                                <span className="text-xs font-medium w-12 text-right">
                                  {Math.round((unifiedImportResult.dataQuality.withManufacturer / unifiedImportResult.dataQuality.totalCount) * 100)}%
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs w-28">Expiry Date:</span>
                                <Progress 
                                  value={(unifiedImportResult.dataQuality.withExpiryDate / unifiedImportResult.dataQuality.totalCount) * 100} 
                                  className="flex-1 h-2"
                                />
                                <span className="text-xs font-medium w-12 text-right">
                                  {Math.round((unifiedImportResult.dataQuality.withExpiryDate / unifiedImportResult.dataQuality.totalCount) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <p>{unifiedImportResult.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Info Notes */}
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-medium mb-2 text-primary">Import Details:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Imports from EXTERNAL_SUPABASE_URL (unified_materials table)</li>
                  <li>• Full EN 15804 lifecycle stages: A1-A3, A4, A5, B1-B5, C1-C4, D</li>
                  <li>• Processes in batches of 100 records for reliability</li>
                  <li>• Includes EPD URLs, manufacturer data, expiry dates</li>
                  <li>• Replace mode: Deletes all existing → imports fresh data</li>
                  <li>• Merge mode: Keeps existing → skips duplicates</li>
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
          
          {/* BlueScope EPD Import */}
          <BluescopeEPDImporter />
          
          {/* NGER 2025 Data Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                NGER 2025 Data Import
              </CardTitle>
              <CardDescription>
                Import NGER materials (120+) and operational emission factors (60+) from NGA 2024
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                <Button 
                  onClick={async () => {
                    setNgerImportLoading(true);
                    try {
                      const { data, error } = await supabase.functions.invoke("import-nger-data", {
                        body: { action: 'import-materials' }
                      });
                      if (error) throw error;
                      setNgerImportResult(data);
                      toast.success(`Imported ${data?.inserted || 0} NGER materials`);
                      await loadEpdMaterialsCount();
                    } catch (err: any) {
                      toast.error(err.message || "Import failed");
                    } finally {
                      setNgerImportLoading(false);
                    }
                  }}
                  disabled={ngerImportLoading}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {ngerImportLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Import NGER Materials
                </Button>
                <Button 
                  onClick={async () => {
                    setNgerImportLoading(true);
                    try {
                      const { data, error } = await supabase.functions.invoke("import-nger-data", {
                        body: { action: 'import-operational' }
                      });
                      if (error) throw error;
                      setNgerImportResult(data);
                      toast.success(`Imported ${data?.inserted || 0} operational factors`);
                    } catch (err: any) {
                      toast.error(err.message || "Import failed");
                    } finally {
                      setNgerImportLoading(false);
                    }
                  }}
                  disabled={ngerImportLoading}
                  variant="outline"
                  className="gap-2 border-emerald-600/50 text-emerald-600 hover:bg-emerald-600/10"
                >
                  {ngerImportLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Import Operational Factors
                </Button>
              </div>
              
              {ngerImportResult?.success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    ✓ Imported {ngerImportResult.inserted} {ngerImportResult.type || 'records'}
                  </p>
                </div>
              )}
              
              <div className="bg-emerald-600/5 p-4 rounded-lg border border-emerald-600/20">
                <h4 className="font-medium mb-2 text-emerald-600">NGER Data Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ 120+ building materials with Tier 1-4 data quality ratings</li>
                  <li>✓ 60+ operational factors (fuels, electricity, water, waste)</li>
                  <li>✓ State-level electricity grid factors</li>
                  <li>✓ NGA 2024 & NGER Determination compliant</li>
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* EPiC Database 2024 Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                EPiC Database 2024 Import (~350+ materials)
              </CardTitle>
              <CardDescription>
                Import Australian-specific lifecycle data from University of Melbourne's Environmental Performance in Construction database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Data Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium">EPiC Database 2024</p>
                    <p className="text-xs text-muted-foreground">Crawford, Stephan & Prideaux - University of Melbourne</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Data Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      <li>✓ Hybrid LCA methodology</li>
                      <li>✓ Australian-specific supply chains</li>
                      <li>✓ Concrete, Glass, Metals, Timber, Plastics</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-purple-600/30 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    
                    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                      toast.error('Please upload an Excel file (.xlsx or .xls)');
                      return;
                    }
                    
                    setEpicImportLoading(true);
                    setEpicImportResult(null);
                    
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
                      
                      toast.info('Processing EPiC Database XLSX file...');
                      
                      const { data, error } = await supabase.functions.invoke("import-epic-materials", {
                        body: { action: 'import', fileData }
                      });
                      
                      if (error) throw error;
                      
                      setEpicImportResult(data);
                      
                      if (data?.success) {
                        toast.success(`Imported ${data.inserted || 0} materials from EPiC Database`);
                      } else if (data?.error) {
                        toast.error(data.error);
                      }
                      
                      // Refresh count
                      await loadEpdMaterialsCount();
                    } catch (err: any) {
                      console.error("EPiC Import error:", err);
                      toast.error(err.message || "Import failed");
                      setEpicImportResult({ success: false, error: err.message });
                    } finally {
                      setEpicImportLoading(false);
                      // Reset file input
                      event.target.value = '';
                    }
                  }}
                  disabled={epicImportLoading}
                  className="hidden"
                  id="epic-file-upload"
                />
                <label 
                  htmlFor="epic-file-upload" 
                  className={`cursor-pointer ${epicImportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-2">
                    {epicImportLoading ? (
                      <>
                        <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
                        <p className="text-sm font-medium">Processing EPiC Database...</p>
                        <p className="text-xs text-muted-foreground">This may take a moment</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-purple-600" />
                        <p className="text-sm font-medium">Upload EPiC Database XLSX File</p>
                        <p className="text-xs text-muted-foreground">
                          epic-database-2024.xlsx (or use file from /demo folder)
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
                  onClick={async () => {
                    if (!confirm('Are you sure you want to delete all EPiC Database materials? This cannot be undone.')) {
                      return;
                    }
                    
                    setEpicImportLoading(true);
                    try {
                      const { data, error } = await supabase.functions.invoke("import-epic-materials", {
                        body: { action: 'clear' }
                      });
                      
                      if (error) throw error;
                      
                      if (data?.success) {
                        toast.success(`Cleared ${data.deleted} EPiC Database materials`);
                        setEpicImportResult(null);
                      } else if (data?.error) {
                        toast.error(data.error);
                      }
                      
                      await loadEpdMaterialsCount();
                    } catch (err: any) {
                      console.error("Clear EPiC error:", err);
                      toast.error(err.message || "Clear failed");
                    } finally {
                      setEpicImportLoading(false);
                    }
                  }}
                  disabled={epicImportLoading}
                  className="gap-2 border-purple-600/50 text-purple-600 hover:bg-purple-600/10"
                >
                  Clear EPiC Materials Only
                </Button>
              </div>
              
              {/* Import Result */}
              {epicImportResult && (
                <Card className={epicImportResult.success ? 'border-green-500/50' : 'border-destructive/50'}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {epicImportResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      EPiC Import Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {epicImportResult.success ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-green-600">{epicImportResult.inserted?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Imported</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-destructive">{epicImportResult.failed?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Failed</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-muted-foreground">{epicImportResult.skipped?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Skipped</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-600">{epicImportResult.duplicates?.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Duplicates</p>
                          </div>
                        </div>
                        {epicImportResult.categories && Object.keys(epicImportResult.categories).length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium mb-2">Categories:</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {Object.entries(epicImportResult.categories).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, count]) => (
                                <div key={cat} className="p-2 rounded bg-muted text-center">
                                  <p className="font-bold">{count}</p>
                                  <p className="text-xs text-muted-foreground truncate" title={cat}>{cat}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {epicImportResult.sample && epicImportResult.sample.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-medium mb-2">Sample Records:</p>
                            <div className="bg-muted rounded p-2 text-xs overflow-x-auto">
                              <pre>{JSON.stringify(epicImportResult.sample, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-destructive">{epicImportResult.error}</p>
                    )}
                  </CardContent>
                </Card>
              )}
              
              <div className="bg-purple-600/5 p-4 rounded-lg border border-purple-600/20">
                <h4 className="font-medium mb-2 text-purple-600">EPiC Database Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ 350+ Australian building material records</li>
                  <li>✓ Hybrid LCA methodology (comprehensive coverage)</li>
                  <li>✓ Australian manufacturing and supply chain data</li>
                  <li>✓ Peer-reviewed academic research</li>
                  <li>✓ Creative Commons licensed (CC BY-NC-ND)</li>
                  <li>✓ DOI links to source research papers</li>
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
                <div className="flex gap-2 flex-wrap">
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={clearErrorLogs}
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Clear All Logs
                  </Button>
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
    </div>
  );
}
