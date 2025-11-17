import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { useProject } from '@/contexts/ProjectContext';
import { FileText, FolderKanban, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { UpgradeModal } from './UpgradeModal';

export const UsageDisplay = () => {
  const { currentTier, usageMetrics } = useSubscription();
  const { projects } = useProject();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  if (!currentTier) return null;

  const projectCount = projects?.length || 0;
  const limits = currentTier.limits as any;
  const projectLimit = limits?.projects || 2;
  const projectPercentage = projectLimit === -1 ? 0 : (projectCount / projectLimit) * 100;

  // Get reports usage from metrics
  const reportsMetric = usageMetrics?.find(m => m.metric_type === 'reports_per_month');
  const reportsCount = reportsMetric?.count || 0;
  const reportsLimit = limits?.reports_per_month || 2;
  const reportsPercentage = reportsLimit === -1 ? 0 : (reportsCount / reportsLimit) * 100;

  const isFreeTier = currentTier.name === 'Free';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Usage & Limits</span>
            {isFreeTier && (
              <Button size="sm" onClick={() => setUpgradeModalOpen(true)}>
                Upgrade to Pro
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Current plan: <strong>{currentTier.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Projects Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Projects</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {projectCount} / {projectLimit === -1 ? '∞' : projectLimit}
              </span>
            </div>
            {projectLimit !== -1 && (
              <Progress value={projectPercentage} className="h-2" />
            )}
            {projectLimit === -1 && (
              <div className="text-xs text-muted-foreground">Unlimited</div>
            )}
          </div>

          {/* Reports Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Reports this month</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {reportsCount} / {reportsLimit === -1 ? '∞' : reportsLimit}
              </span>
            </div>
            {reportsLimit !== -1 && (
              <Progress value={reportsPercentage} className="h-2" />
            )}
            {reportsLimit === -1 && (
              <div className="text-xs text-muted-foreground">Unlimited</div>
            )}
          </div>

          {/* LCA Access */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">LCA Calculations</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {limits?.lca_calculations ? 'Enabled' : 'Locked'}
              </span>
            </div>
            {!limits?.lca_calculations && (
              <div className="text-xs text-muted-foreground">
                Upgrade to access advanced lifecycle assessments
              </div>
            )}
          </div>

          {isFreeTier && projectPercentage >= 80 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                You're running low on projects. Upgrade to Pro for unlimited access.
              </p>
              <Button 
                variant="default" 
                size="sm" 
                className="w-full"
                onClick={() => setUpgradeModalOpen(true)}
              >
                Upgrade Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <UpgradeModal 
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
      />
    </>
  );
};
