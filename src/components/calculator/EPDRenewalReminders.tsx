/**
 * EPD Renewal Reminders Panel
 * Displays expiring and expired EPD certifications in the project
 */

import { AlertTriangle, Clock, X, ChevronDown, ChevronUp, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";

interface ExpiryWarning {
  id: string;
  materialName: string;
  epdNumber?: string;
  manufacturer?: string;
  expiryDate: string;
  daysUntil: number;
  status: 'expired' | 'critical' | 'warning' | 'upcoming';
}

interface EPDRenewalRemindersProps {
  expiryWarnings: ExpiryWarning[];
  summary: {
    total: number;
    expired: number;
    critical: number;
    warning: number;
    upcoming: number;
    hasIssues: boolean;
    hasWarnings: boolean;
  };
  onDismiss?: (id: string) => void;
  onClearDismissed?: () => void;
}

export function EPDRenewalReminders({ 
  expiryWarnings, 
  summary, 
  onDismiss,
  onClearDismissed 
}: EPDRenewalRemindersProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (expiryWarnings.length === 0) return null;

  const getStatusColor = (status: 'expired' | 'critical' | 'warning' | 'upcoming') => {
    switch (status) {
      case 'expired': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-700';
      case 'critical': return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-700';
      case 'warning': return 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-700';
    }
  };

  const getStatusIcon = (status: 'expired' | 'critical' | 'warning' | 'upcoming') => {
    switch (status) {
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <Clock className="h-4 w-4" />;
      case 'upcoming': return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: 'expired' | 'critical' | 'warning' | 'upcoming', daysUntil: number) => {
    switch (status) {
      case 'expired': return `Expired ${Math.abs(daysUntil)} days ago`;
      case 'critical': return `Expires in ${daysUntil} days`;
      case 'warning': return `Expires in ${daysUntil} days`;
      case 'upcoming': return `Expires in ${daysUntil} days`;
    }
  };

  return (
    <TooltipProvider>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className={`rounded-lg border p-3 ${
          summary.hasIssues 
            ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20' 
            : summary.hasWarnings 
            ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
            : 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'
        }`}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <div className="flex items-center gap-2">
                <Bell className={`h-4 w-4 ${summary.hasIssues ? 'text-red-600' : summary.hasWarnings ? 'text-amber-600' : 'text-blue-600'}`} />
                <span className="font-medium text-sm">
                  EPD Renewal Reminders
                </span>
                <div className="flex gap-1.5">
                  {summary.expired > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                      {summary.expired} expired
                    </Badge>
                  )}
                  {summary.critical > 0 && (
                    <Badge className="h-5 px-1.5 text-xs bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-100">
                      {summary.critical} critical
                    </Badge>
                  )}
                  {summary.warning > 0 && (
                    <Badge className="h-5 px-1.5 text-xs bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-100">
                      {summary.warning} soon
                    </Badge>
                  )}
                </div>
              </div>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-3 pt-3 border-t border-dashed">
              <ScrollArea className="max-h-48">
                <div className="space-y-2">
                  {expiryWarnings.map((warning) => (
                    <div 
                      key={warning.id}
                      className={`flex items-center justify-between p-2 rounded-md border ${getStatusColor(warning.status)}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getStatusIcon(warning.status)}
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate" title={warning.materialName}>
                            {warning.materialName}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs opacity-80">
                            <span>{getStatusLabel(warning.status, warning.daysUntil)}</span>
                            {warning.epdNumber && (
                              <span className="font-mono">EPD: {warning.epdNumber}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {onDismiss && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 flex-shrink-0 hover:bg-white/50 dark:hover:bg-black/20"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDismiss(warning.id);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Dismiss reminder</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-3 pt-2 border-t border-dashed flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  {summary.total} material{summary.total !== 1 ? 's' : ''} with EPD expiry tracking
                </span>
                {onClearDismissed && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs gap-1"
                    onClick={onClearDismissed}
                  >
                    <BellOff className="h-3 w-3" />
                    Reset dismissed
                  </Button>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </TooltipProvider>
  );
}
