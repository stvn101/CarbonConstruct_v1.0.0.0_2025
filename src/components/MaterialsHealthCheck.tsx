import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertTriangle, CheckCircle, XCircle, RefreshCw, 
  Calendar, Database, FileWarning, Shield, Loader2
} from "lucide-react";
import { toast } from "sonner";

interface HealthMetrics {
  total: number;
  expiredEpds: number;
  expiringWithin30Days: number;
  expiringWithin90Days: number;
  missingEfTotal: number;
  missingUnit: number;
  missingCategory: number;
  missingDataSource: number;
  lowQualityTier: number;
  duplicateNames: number;
}

interface HealthIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
}

export function MaterialsHealthCheck() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setIsLoading(true);
    try {
      // Run all health checks in parallel
      const [
        totalResult,
        expiredResult,
        expiring30Result,
        expiring90Result,
        missingEfResult,
        missingUnitResult,
        missingCategoryResult,
        missingSourceResult,
        lowQualityResult,
        duplicatesResult
      ] = await Promise.all([
        // Total count
        supabase.from('materials_epd').select('id', { count: 'exact', head: true }),
        
        // Expired EPDs
        supabase.from('materials_epd')
          .select('id', { count: 'exact', head: true })
          .not('expiry_date', 'is', null)
          .lt('expiry_date', new Date().toISOString().split('T')[0]),
        
        // Expiring within 30 days
        supabase.from('materials_epd')
          .select('id', { count: 'exact', head: true })
          .not('expiry_date', 'is', null)
          .gte('expiry_date', new Date().toISOString().split('T')[0])
          .lte('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        
        // Expiring within 90 days
        supabase.from('materials_epd')
          .select('id', { count: 'exact', head: true })
          .not('expiry_date', 'is', null)
          .gte('expiry_date', new Date().toISOString().split('T')[0])
          .lte('expiry_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        
        // Missing ef_total
        supabase.from('materials_epd')
          .select('id', { count: 'exact', head: true })
          .or('ef_total.is.null,ef_total.eq.0'),
        
        // Missing unit
        supabase.from('materials_epd')
          .select('id', { count: 'exact', head: true })
          .or('unit.is.null,unit.eq.'),
        
        // Missing category
        supabase.from('materials_epd')
          .select('id', { count: 'exact', head: true })
          .or('material_category.is.null,material_category.eq.'),
        
        // Missing data source
        supabase.from('materials_epd')
          .select('id', { count: 'exact', head: true })
          .or('data_source.is.null,data_source.eq.'),
        
        // Low quality tier (tier_4 or untiered)
        supabase.from('materials_epd')
          .select('id', { count: 'exact', head: true })
          .in('data_quality_tier', ['tier_4', 'untiered']),
        
        // Check for potential duplicates (same name)
        supabase.from('materials_epd')
          .select('material_name')
      ]);

      // Calculate duplicates
      let duplicateCount = 0;
      if (duplicatesResult.data) {
        const nameCounts: Record<string, number> = {};
        duplicatesResult.data.forEach(m => {
          const name = m.material_name?.toLowerCase().trim();
          if (name) nameCounts[name] = (nameCounts[name] || 0) + 1;
        });
        duplicateCount = Object.values(nameCounts).filter(c => c > 1).reduce((sum, c) => sum + c, 0);
      }

      setMetrics({
        total: totalResult.count || 0,
        expiredEpds: expiredResult.count || 0,
        expiringWithin30Days: expiring30Result.count || 0,
        expiringWithin90Days: expiring90Result.count || 0,
        missingEfTotal: missingEfResult.count || 0,
        missingUnit: missingUnitResult.count || 0,
        missingCategory: missingCategoryResult.count || 0,
        missingDataSource: missingSourceResult.count || 0,
        lowQualityTier: lowQualityResult.count || 0,
        duplicateNames: duplicateCount
      });

      setLastChecked(new Date());
      toast.success('Health check completed');
    } catch (error) {
      console.error('Health check error:', error);
      toast.error('Failed to run health check');
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthScore = (): number => {
    if (!metrics) return 0;
    const criticalIssues = metrics.missingEfTotal + metrics.missingUnit + metrics.missingDataSource;
    const warnings = metrics.expiredEpds + metrics.lowQualityTier;
    const score = Math.max(0, 100 - (criticalIssues * 5) - (warnings * 1));
    return Math.round(score);
  };

  const getHealthIssues = (): HealthIssue[] => {
    if (!metrics) return [];
    
    const issues: HealthIssue[] = [];

    if (metrics.missingEfTotal > 0) {
      issues.push({
        id: 'missing-ef',
        severity: 'critical',
        title: 'Missing Emission Factors',
        description: 'Materials without emission factor values cannot be used in calculations',
        count: metrics.missingEfTotal,
        icon: <XCircle className="h-4 w-4 text-destructive" />
      });
    }

    if (metrics.missingUnit > 0) {
      issues.push({
        id: 'missing-unit',
        severity: 'critical',
        title: 'Missing Units',
        description: 'Materials without units will cause calculation errors',
        count: metrics.missingUnit,
        icon: <XCircle className="h-4 w-4 text-destructive" />
      });
    }

    if (metrics.expiredEpds > 0) {
      issues.push({
        id: 'expired-epds',
        severity: 'warning',
        title: 'Expired EPDs',
        description: 'EPDs past their validity date may not be accepted for compliance',
        count: metrics.expiredEpds,
        icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
      });
    }

    if (metrics.expiringWithin30Days > 0) {
      issues.push({
        id: 'expiring-soon',
        severity: 'warning',
        title: 'EPDs Expiring Within 30 Days',
        description: 'These EPDs need renewal soon to maintain validity',
        count: metrics.expiringWithin30Days,
        icon: <Calendar className="h-4 w-4 text-amber-500" />
      });
    }

    if (metrics.lowQualityTier > 0) {
      issues.push({
        id: 'low-quality',
        severity: 'info',
        title: 'Low Quality Tier Data',
        description: 'Consider finding higher quality data sources for accuracy',
        count: metrics.lowQualityTier,
        icon: <FileWarning className="h-4 w-4 text-blue-500" />
      });
    }

    if (metrics.duplicateNames > 0) {
      issues.push({
        id: 'duplicates',
        severity: 'info',
        title: 'Potential Duplicates',
        description: 'Materials with identical names may need consolidation',
        count: metrics.duplicateNames,
        icon: <Database className="h-4 w-4 text-blue-500" />
      });
    }

    return issues;
  };

  const healthScore = getHealthScore();
  const issues = getHealthIssues();
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Database Health Check
            </CardTitle>
            <CardDescription>
              Data quality and completeness analysis
              {lastChecked && (
                <span className="ml-2 text-xs">
                  • Last checked: {lastChecked.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={runHealthCheck} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Health Score */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Health Score</span>
              <span className="text-2xl font-bold">
                {healthScore}%
              </span>
            </div>
            <Progress 
              value={healthScore} 
              className={`h-3 ${
                healthScore >= 90 ? '[&>div]:bg-emerald-500' :
                healthScore >= 70 ? '[&>div]:bg-amber-500' :
                '[&>div]:bg-destructive'
              }`}
            />
          </div>
          <div className="flex gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                {warningCount} Warnings
              </Badge>
            )}
            {issues.length === 0 && (
              <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle className="h-3 w-3" />
                All Clear
              </Badge>
            )}
          </div>
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Issues Found</h4>
            <div className="space-y-2">
              {issues.map(issue => (
                <div 
                  key={issue.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    issue.severity === 'critical' ? 'bg-destructive/5 border-destructive/20' :
                    issue.severity === 'warning' ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800' :
                    'bg-muted/50 border-border'
                  }`}
                >
                  {issue.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{issue.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {issue.count.toLocaleString()} affected
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {issue.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold">{metrics.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total Materials</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-emerald-600">
                {(metrics.total - metrics.expiredEpds).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Valid EPDs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-600">
                {metrics.expiringWithin90Days}
              </div>
              <div className="text-xs text-muted-foreground">Expiring (90d)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-destructive">
                {metrics.expiredEpds}
              </div>
              <div className="text-xs text-muted-foreground">Expired</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
