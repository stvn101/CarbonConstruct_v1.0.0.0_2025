/**
 * EC3 Troubleshooting Popover Component
 * 
 * Provides quick troubleshooting tips for common EC3 search issues.
 */

import { HelpCircle, AlertTriangle, CheckCircle2, Search, Globe, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const troubleshootingTips = [
  {
    icon: Type,
    title: "Check spelling",
    description: "Material names must be spelled correctly. Try 'Concrete' not 'Concret' or 'Concreet'.",
    severity: "common"
  },
  {
    icon: Search,
    title: "Use generic terms",
    description: "Start with broad terms like 'Steel', 'Timber', or 'Insulation' rather than specific product names.",
    severity: "common"
  },
  {
    icon: Globe,
    title: "Category selection",
    description: "Select 'All Categories' if unsure, or pick a specific category to narrow results.",
    severity: "tip"
  },
  {
    icon: AlertTriangle,
    title: "Rate limits",
    description: "If you see a rate limit error, wait a few minutes before searching again.",
    severity: "warning"
  },
  {
    icon: CheckCircle2,
    title: "Try variations",
    description: "Use 'Wood' instead of 'Timber', or 'Aluminum' instead of 'Aluminium' (US vs AU spelling).",
    severity: "tip"
  }
];

export function EC3TroubleshootingPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="EC3 search troubleshooting tips"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            <h4 className="font-semibold text-sm">EC3 Search Tips</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Having trouble finding materials? Here are common solutions:
          </p>
          <div className="space-y-2">
            {troubleshootingTips.map((tip, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-2 p-2 rounded-md text-xs ${
                  tip.severity === 'warning' 
                    ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800' 
                    : tip.severity === 'common'
                    ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'
                    : 'bg-muted/50 border border-border'
                }`}
              >
                <tip.icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${
                  tip.severity === 'warning' ? 'text-amber-600' : 
                  tip.severity === 'common' ? 'text-blue-600' : 'text-muted-foreground'
                }`} />
                <div>
                  <p className="font-medium">{tip.title}</p>
                  <p className="text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>Data sourced from <a href="https://buildingtransparency.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Building Transparency</a></p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
