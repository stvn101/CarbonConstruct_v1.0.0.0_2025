/**
 * ECO Platform Compliance Toggle Component
 * Enables/disables ECO Platform LCA Calculation Rules V2.0 compliance mode
 */

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Shield, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface EcoComplianceToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  compact?: boolean;
}

export function EcoComplianceToggle({ 
  enabled, 
  onToggle,
  compact = false
}: EcoComplianceToggleProps) {
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Switch 
                checked={enabled} 
                onCheckedChange={onToggle}
                id="eco-compliance-compact"
              />
              <Label htmlFor="eco-compliance-compact" className="text-sm cursor-pointer">
                ECO Platform
              </Label>
              {enabled && (
                <CheckCircle className="w-3 h-3 text-emerald-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">
              Enforce ECO Platform LCA Calculation Rules V2.0 (EN 15804+A2) for 
              internationally recognized carbon assessments.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-card">
      <Shield className="w-5 h-5 text-primary flex-shrink-0" />
      <Switch 
        checked={enabled} 
        onCheckedChange={onToggle}
        id="eco-compliance"
      />
      <div className="flex-1 min-w-0">
        <Label htmlFor="eco-compliance" className="font-medium cursor-pointer">
          ECO Platform Compliance Mode
        </Label>
        <p className="text-sm text-muted-foreground">
          Enforce ECO Platform LCA Calculation Rules V2.0 (EN 15804+A2)
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {enabled ? (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Disabled
          </Badge>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <div className="space-y-2">
                <p className="font-medium">ECO Platform V2.0 Requirements:</p>
                <ul className="text-xs space-y-1">
                  <li>• JRC EF 3.0/3.1 characterisation factors only</li>
                  <li>• Economic allocation for slag, fly ash, silica fume</li>
                  <li>• Mass balance methods prohibited</li>
                  <li>• Sub-national electricity grid factors</li>
                  <li>• Biogenic carbon declared in kg C</li>
                  <li>• Manufacturing location at country/city level</li>
                  <li>• No multi-recycling in Module D</li>
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
