import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, ShieldAlert, ShieldCheck, RefreshCw, CheckCircle2, Bug, Zap, FlaskConical } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface SecurityEvent {
  id: string;
  error_type: string;
  error_message: string;
  severity: string;
  page_url: string | null;
  created_at: string;
  user_id: string | null;
  metadata: Record<string, unknown> | null;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  metadata: Record<string, unknown> | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export function SecurityDashboard() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    setLoading(true);
    await Promise.all([loadSecurityEvents(), loadAlerts()]);
    setLoading(false);
  };

  const loadSecurityEvents = async () => {
    const { data, error } = await supabase
      .from("error_logs")
      .select("*")
      .like("error_type", "security_%")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setSecurityEvents(data as SecurityEvent[]);
    }
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .like("alert_type", "security_%")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setAlerts(data as SecurityAlert[]);
    }
  };

  const resolveAlert = async (alertId: string) => {
    const { error } = await supabase
      .from("alerts")
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", alertId);

    if (error) {
      toast.error("Failed to resolve alert");
    } else {
      toast.success("Alert resolved");
      loadAlerts();
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      security_auth_failure: "Auth Failure",
      security_rate_limit_exceeded: "Rate Limit",
      security_invalid_token: "Invalid Token",
      security_suspicious_activity: "Suspicious Activity",
      security_honeypot_triggered: "Honeypot Trap",
    };
    return labels[type] || type.replace("security_", "").replace(/_/g, " ");
  };

  const triggerTestEvent = async (eventType: 'honeypot' | 'rate_limit') => {
    try {
      if (eventType === 'honeypot') {
        // Trigger honeypot by sending a request with the honeypot field
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-error`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            honeypot_field: 'test_bot_value',
            error_type: 'test',
            error_message: 'Test honeypot trigger'
          })
        });
        toast.success('Honeypot test event triggered');
      } else {
        // Trigger multiple rapid requests to simulate rate limit
        const promises = [];
        for (let i = 0; i < 12; i++) {
          promises.push(
            fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-error`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                error_type: 'test',
                error_message: `Rate limit test ${i}`
              })
            })
          );
        }
        await Promise.all(promises);
        toast.success('Rate limit test triggered (12 rapid requests)');
      }
      
      // Reload data after a short delay
      setTimeout(loadSecurityData, 2000);
    } catch (error) {
      toast.error('Failed to trigger test event');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-600">Warning</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getEventTypeBadge = (type: string) => {
    if (type === 'security_honeypot_triggered') {
      return <Badge className="bg-purple-500/20 text-purple-600 border-purple-300">Bot Detected</Badge>;
    }
    return null;
  };

  // Calculate stats
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
  const last24hEvents = securityEvents.filter(e => 
    new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;
  const authFailures = securityEvents.filter(e => e.error_type === "security_auth_failure").length;
  const rateLimitViolations = securityEvents.filter(e => e.error_type === "security_rate_limit_exceeded").length;
  const honeypotTriggers = securityEvents.filter(e => e.error_type === "security_honeypot_triggered").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{unresolvedAlerts}</p>
            <p className="text-xs text-muted-foreground">Unresolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              Events (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{last24hEvents}</p>
            <p className="text-xs text-muted-foreground">Security events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Auth Failures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{authFailures}</p>
            <p className="text-xs text-muted-foreground">Total logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              Rate Limits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{rateLimitViolations}</p>
            <p className="text-xs text-muted-foreground">Violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bug className="h-4 w-4 text-purple-500" />
              Honeypot Traps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{honeypotTriggers}</p>
            <p className="text-xs text-muted-foreground">Bot detections</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-amber-500" />
            Test Security Alerts
          </CardTitle>
          <CardDescription>Trigger test events to verify email notifications are working</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              onClick={() => triggerTestEvent('honeypot')}
              className="gap-2"
            >
              <Bug className="h-4 w-4" />
              Trigger Honeypot Test
            </Button>
            <Button 
              variant="outline" 
              onClick={() => triggerTestEvent('rate_limit')}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              Trigger Rate Limit Test
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Note: Email alerts are sent when thresholds are exceeded (5+ honeypot triggers/hour, 20+ rate limit violations/hour).
          </p>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Security Alerts
              </CardTitle>
              <CardDescription>Active security alerts requiring attention</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadSecurityData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No security alerts</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id} className={alert.resolved ? "opacity-50" : ""}>
                    <TableCell>
                      {alert.resolved ? (
                        <Badge variant="outline" className="bg-green-500/20 text-green-600">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {getEventTypeLabel(alert.alert_type)}
                    </TableCell>
                    <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                    <TableCell className="max-w-md truncate">{alert.message}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(alert.created_at), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>
                      {!alert.resolved && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                          className="gap-1"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>Authentication failures, rate limits, and suspicious activity</CardDescription>
        </CardHeader>
        <CardContent>
          {securityEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No security events logged</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityEvents.slice(0, 20).map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getEventTypeLabel(event.error_type)}
                        {getEventTypeBadge(event.error_type)}
                      </div>
                    </TableCell>
                    <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {event.error_message}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {event.page_url || "-"}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {(event.metadata as Record<string, string>)?.ip_address || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(event.created_at), "MMM d, HH:mm:ss")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
