/**
 * EPD Workflow Dashboard Widget
 * Displays workflow statistics and quick actions for the Calculator page
 */

import { 
  RefreshCw, 
  ArrowRight, 
  Settings,
  BarChart3,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useEPDRenewalWorkflows, WorkflowStatus } from '@/hooks/useEPDRenewalWorkflows';
import { Link } from 'react-router-dom';

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

const STATUS_CONFIG: Record<WorkflowStatus, StatusConfig> = {
  pending: { label: 'Pending', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-900' },
  contacted: { label: 'Contacted', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900' },
  requested: { label: 'Requested', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900' },
  received: { label: 'Received', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900' },
  verified: { label: 'Verified', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900' },
  completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-200 dark:bg-green-800' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
};

export function EPDWorkflowDashboardWidget() {
  const { workflows, stats, isLoading, advanceStatus, isSaving } = useEPDRenewalWorkflows();

  // Get most recent active workflows
  const activeWorkflows = workflows
    .filter(w => !['completed', 'cancelled'].includes(w.status))
    .slice(0, 3);

  // Calculate progress percentage
  const progressPercent = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading workflows...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stats.total === 0) {
    return (
      <Card className="border-dashed bg-muted/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">No EPD Renewal Workflows</p>
                <p className="text-xs text-muted-foreground">
                  Create workflows from the EPD Renewal Reminders section
                </p>
              </div>
            </div>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <Settings className="h-3 w-3" />
                Settings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">EPD Renewal Status</CardTitle>
            </div>
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                View All
                <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <CardDescription className="text-xs">
            Track and manage your EPD renewal workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-md bg-slate-100 dark:bg-slate-900">
                  <div className="text-lg font-bold">{stats.active}</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>Active workflows in progress</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-md bg-amber-100 dark:bg-amber-900">
                  <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{stats.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>Awaiting initial contact</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-md bg-blue-100 dark:bg-blue-900">
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{stats.inProgress}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>Contacted, requested, or awaiting verification</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-md bg-green-100 dark:bg-green-900">
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">{stats.completed}</div>
                  <div className="text-xs text-muted-foreground">Done</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>Successfully completed renewals</TooltipContent>
            </Tooltip>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Overall Progress</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Active Workflows */}
          {activeWorkflows.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Recent Activity</div>
              {activeWorkflows.map((workflow) => {
                const config = STATUS_CONFIG[workflow.status];
                return (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-[10px] h-5 ${config.bgColor} ${config.color}`}
                        >
                          {config.label}
                        </Badge>
                        <span className="text-sm font-medium truncate">
                          {workflow.material_name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {workflow.manufacturer || workflow.epd_number || 'No details'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {workflow.status !== 'completed' && workflow.status !== 'cancelled' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => advanceStatus(workflow.id)}
                              disabled={isSaving}
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Advance to next status</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Link to="/settings" className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                <FileText className="h-3 w-3" />
                Manage Workflows
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Settings className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
