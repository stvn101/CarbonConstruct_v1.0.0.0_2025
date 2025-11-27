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
import { AlertTriangle, Activity, BarChart3, RefreshCw, Search, Shield, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

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
    ]);
    setLoading(false);
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
        </TabsList>

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
        </Tabs>
      </div>
    );
  }
