import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { analytics } from '@/lib/analytics';
import { 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  RefreshCw,
  Download 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AnalyticsDashboard() {
  const [data, setData] = useState(analytics.exportData());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setData(analytics.exportData());
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const refreshData = () => {
    setData(analytics.exportData());
  };

  const exportData = () => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const errorsBySeverity = [
    { name: 'Critical', value: data.summary.errors.critical, color: 'hsl(var(--destructive))' },
    { name: 'High', value: data.summary.errors.high, color: 'hsl(0, 84%, 50%)' },
    { name: 'Medium', value: data.summary.errors.medium, color: 'hsl(30, 84%, 50%)' },
    { name: 'Low', value: data.summary.errors.low, color: 'hsl(60, 84%, 50%)' },
  ].filter(item => item.value > 0);

  const topEvents = Object.entries(
    data.events.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .map(([event, count]) => ({ event, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const performanceMetricsByType = Object.entries(
    data.performance.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>)
  )
    .map(([name, values]) => ({
      name,
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Real-time monitoring of app performance and usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.events.length}</div>
            <p className="text-xs text-muted-foreground">
              User interactions tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.performance?.avg 
                ? `${Math.round(data.summary.performance.avg)}ms`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.performance?.count || 0} measurements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.errors.total}</div>
            <div className="flex gap-1 mt-1">
              {data.summary.errors.critical > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {data.summary.errors.critical} Critical
                </Badge>
              )}
              {data.summary.errors.high > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {data.summary.errors.high} High
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.events.length + data.performance.length + data.errors.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Metrics collected
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Average response times for different operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {performanceMetricsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceMetricsByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No performance data yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {performanceMetricsByType.map((metric) => (
                  <div key={metric.name} className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm">{metric.name}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Avg: {metric.avg}ms
                      </span>
                      <span className="text-muted-foreground">
                        Min: {metric.min}ms
                      </span>
                      <span className="text-muted-foreground">
                        Max: {metric.max}ms
                      </span>
                      <Badge variant="outline">{metric.count}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Errors by Severity</CardTitle>
              <CardDescription>
                Distribution of error types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {errorsBySeverity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errorsBySeverity}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {errorsBySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No errors recorded (that's good!)
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.errors.slice(-10).reverse().map((error, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{error.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          error.severity === 'critical' || error.severity === 'high'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {error.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
                {data.errors.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No errors recorded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Events</CardTitle>
              <CardDescription>
                Most frequent user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topEvents.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topEvents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="event" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No events tracked yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.events.slice(-10).reverse().map((event, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{event.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {event.properties && (
                        <Badge variant="outline" className="text-xs">
                          {Object.keys(event.properties).length} props
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {data.events.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No events tracked yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
