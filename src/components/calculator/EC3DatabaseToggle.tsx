/**
 * EC3 Database Toggle Component
 * 
 * Allows users to switch between local CarbonConstruct database 
 * and the EC3 global EPD database for material searches.
 */

import { Database, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type MaterialDatabaseSource = 'local' | 'ec3';

interface EC3DatabaseToggleProps {
  source: MaterialDatabaseSource;
  onSourceChange: (source: MaterialDatabaseSource) => void;
  disabled?: boolean;
  ec3Available?: boolean;
}

export function EC3DatabaseToggle({ 
  source, 
  onSourceChange, 
  disabled = false,
  ec3Available = true 
}: EC3DatabaseToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border bg-muted/30 p-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={source === 'local' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-3 gap-2 cursor-pointer"
            onClick={() => onSourceChange('local')}
            disabled={disabled}
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Local DB</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Search CarbonConstruct's curated Australian EPD database</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={source === 'ec3' ? 'secondary' : 'ghost'}
            size="sm"
            className={`h-8 px-3 gap-2 cursor-pointer ${!ec3Available ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => onSourceChange('ec3')}
            disabled={disabled || !ec3Available}
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">EC3 Global</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {ec3Available ? (
            <p>Search the global EC3 EPD database from Building Transparency</p>
          ) : (
            <p>EC3 integration requires API key configuration</p>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
