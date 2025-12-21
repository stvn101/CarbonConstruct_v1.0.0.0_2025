import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
   
  Activity, 
  Shield, 
  Clock,
  Mail,
  Settings,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  metadata: Record<string, unknown> | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

interface AlertThreshold {
  name: string;
  description: string;
  threshold: number;
  currentValue: number;
  status: 'ok' | 'warning' | 'critical';
  enabled: boolean;
}

interface SystemHealth {
  uptime: string;
  lastCheck: string;
  status: 'healthy' | 'degraded' | 'down';
  recentErrors: number;
  avgResponseTime: number;
}

export function ProductionAlertingPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [alertEmail, setAlertEmail] = useState('alerts@carbonconstruct.com.au');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([
    { 
      name: 'Error Rate (1h)', 
      description: 'Errors in the last hour',
      threshold: 10, 
      currentValue: 0, 
      status: 'ok',
      enabled: true 
    },
    { 
      name: 'Auth Failures (24h)', 
      description: 'Failed login attempts',
      threshold: 20, 
      currentValue: 0, 
      status: 'ok',
      enabled: true 
    },
    { 
      name: 'Rate Limit Violations (1h)', 
      description: 'Rate limit exceeded events',
      threshold: 50, 
      currentValue: 0, 
      status: 'ok',
      enabled: true 
    },
    { 
      name: 'Honeypot Triggers (24h)', 
      description: 'Bot detection events',
      threshold: 5, 
      currentValue: 0, 
      status: 'ok',
      enabled: true 
    },
    { 
      name: 'Response Time (avg ms)', 
      description: 'Average API response time',
      threshold: 2000, 
      currentValue: 0, 
      status: 'ok',
      enabled: true 
    },
    { 
      name: 'Active Alerts', 
      description: 'Unresolved security alerts',
      threshold: 3, 
      currentValue: 0, 
      status: 'ok',
      enabled: true 
    }
  ]);

  useEffect(() => {
    loadData();
    // Set up real-time subscription for new alerts
    const channel = supabase
      .channel('alerts-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts'
      }, (payload) => {
        const newAlert = payload.new as Alert;
        setAlerts(prev => [newAlert, ...prev]);
        toast.warning(`New Alert: ${newAlert.message}`, {
          description: `Severity: ${newAlert.severity}`
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadAlerts(),
      loadMetrics(),
      loadHealthStatus()
    ]);
    setLoading(false);
  };

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    setAlerts((data as Alert[]) || []);
  };

  const loadMetrics = async () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Load error count (1h)
    const { count: errorCount } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo);

    // Load auth failures (24h)
    const { count: authFailures } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .eq('error_type', 'security_auth_failure')
      .gte('created_at', twentyFourHoursAgo);

    // Load rate limit violations (1h)
    const { count: rateLimits } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .eq('error_type', 'security_rate_limit_exceeded')
      .gte('created_at', oneHourAgo);

    // Load honeypot triggers (24h)
    const { count: honeypots } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .eq('error_type', 'security_honeypot_triggered')
      .gte('created_at', twentyFourHoursAgo);

    // Load avg response time
    const { data: perfMetrics } = await supabase
      .from('performance_metrics')
      .select('metric_value')
      .eq('metric_name', 'api_latency')
      .gte('created_at', oneHourAgo)
      .limit(100);

    const avgResponseTime = perfMetrics?.length 
      ? Math.round(perfMetrics.reduce((a, b) => a + b.metric_value, 0) / perfMetrics.length)
      : 0;

    // Load active alerts count
    const { count: activeAlerts } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);

    // Update thresholds with current values and status
    setThresholds(prev => prev.map(t => {
      let currentValue = 0;
      switch (t.name) {
        case 'Error Rate (1h)': currentValue = errorCount || 0; break;
        case 'Auth Failures (24h)': currentValue = authFailures || 0; break;
        case 'Rate Limit Violations (1h)': currentValue = rateLimits || 0; break;
        case 'Honeypot Triggers (24h)': currentValue = honeypots || 0; break;
        case 'Response Time (avg ms)': currentValue = avgResponseTime; break;
        case 'Active Alerts': currentValue = activeAlerts || 0; break;
      }

      let status: 'ok' | 'warning' | 'critical' = 'ok';
      if (currentValue >= t.threshold) {
        status = 'critical';
      } else if (currentValue >= t.threshold * 0.7) {
        status = 'warning';
      }

      return { ...t, currentValue, status };
    }));
  };

  const loadHealthStatus = async () => {
    try {
      const { data } = await supabase.functions.invoke('health-check');
      if (data) {
        setSystemHealth({
          uptime: data.status === 'healthy' ? '99.9%' : 'Degraded',
          lastCheck: new Date().toISOString(),
          status: data.status === 'healthy' ? 'healthy' : 'degraded',
          recentErrors: data.metrics?.recent_errors_1h || 0,
          avgResponseTime: data.total_latency || 0
        });
      }
    } catch {
      setSystemHealth({
        uptime: 'Unknown',
        lastCheck: new Date().toISOString(),
        status: 'down',
        recentErrors: 0,
        avgResponseTime: 0
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from('alerts')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) {
      toast.error('Failed to resolve alert');
    } else {
      toast.success('Alert resolved');
      loadAlerts();
      loadMetrics();
    }
  };

  const createTestAlert = async () => {
    const { error } = await supabase
      .from('alerts')
      .insert({
        alert_type: 'test_alert',
        severity: 'info',
        message: 'Test alert from monitoring dashboard',
        metadata: { source: 'admin_dashboard', timestamp: new Date().toISOString() }
      });

    if (error) {
      toast.error('Failed to create test alert');
    } else {
      toast.success('Test alert created');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
      case 'healthy': return 'text-green-500 bg-green-500/10';
      case 'warning':
      case 'degraded': return 'text-amber-500 bg-amber-500/10';
      case 'critical':
      case 'down': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className={systemHealth?.status === 'healthy' ? 'border-green-500/30' : 'border-destructive/30'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className={`text-2xl font-bold capitalize ${systemHealth?.status === 'healthy' ? 'text-green-500' : 'text-destructive'}`}>
                  {systemHealth?.status || 'Unknown'}
                </p>
              </div>
              {systemHealth?.status === 'healthy' ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-destructive" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">{systemHealth?.uptime}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors (1h)</p>
                <p className="text-2xl font-bold">{systemHealth?.recentErrors}</p>
              </div>
              {(systemHealth?.recentErrors || 0) > 5 ? (
                <TrendingUp className="h-8 w-8 text-destructive" />
              ) : (
                <TrendingDown className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{systemHealth?.avgResponseTime}ms</p>
              </div>
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>
                Configure automated monitoring thresholds. Alerts trigger when values exceed limits.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {thresholds.map((threshold, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${getStatusColor(threshold.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{threshold.name}</span>
                  <Switch checked={threshold.enabled} />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold">{threshold.currentValue}</p>
                    <p className="text-xs text-muted-foreground">
                      Threshold: {threshold.threshold}
                    </p>
                  </div>
                  <Badge variant={threshold.status === 'ok' ? 'outline' : threshold.status === 'warning' ? 'secondary' : 'destructive'}>
                    {threshold.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="email-notifications" 
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1 max-w-md">
              <Input 
                type="email"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="Alert email address"
                disabled={!emailNotifications}
              />
            </div>
            <Button variant="outline" onClick={createTestAlert}>
              <Bell className="h-4 w-4 mr-2" />
              Send Test Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Alerts
            {alerts.filter(a => !a.resolved).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.filter(a => !a.resolved).length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.filter(a => !a.resolved).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p>No active alerts. System is operating normally.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.filter(a => !a.resolved).map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-destructive/10' :
                      alert.severity === 'high' ? 'bg-amber-500/10' : 'bg-muted'
                    }`}>
                      <Shield className={`h-5 w-5 ${
                        alert.severity === 'critical' ? 'text-destructive' :
                        alert.severity === 'high' ? 'text-amber-500' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityVariant(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="font-medium">{alert.alert_type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(alert.created_at), 'dd MMM yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Resolved Alerts */}
      {alerts.filter(a => a.resolved).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recently Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.filter(a => a.resolved).slice(0, 5).map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-center justify-between py-2 px-3 rounded bg-muted/30 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{alert.message}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Resolved {alert.resolved_at ? format(new Date(alert.resolved_at), 'dd MMM HH:mm') : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
