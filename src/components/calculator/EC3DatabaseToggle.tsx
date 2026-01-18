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
  const isEc3Enabled = ec3Available && !disabled;

  const handleEc3Click = () => {
    if (isEc3Enabled) {
      onSourceChange('ec3');
    }
  };

  return (
    <div className="inline-flex items-center rounded-lg border bg-muted/30 p-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={source === 'local' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-3 gap-2 cursor-pointer hover:bg-accent"
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
          <span
            role="button"
            tabIndex={isEc3Enabled ? 0 : -1}
            onClick={handleEc3Click}
            onKeyDown={(e) => e.key === 'Enter' && handleEc3Click()}
            className={`inline-block ${isEc3Enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          >
            <Button
              variant={source === 'ec3' ? 'secondary' : 'ghost'}
              size="sm"
              className={`h-8 px-3 gap-2 pointer-events-none ${!ec3Available ? 'opacity-50' : ''}`}
              tabIndex={-1}
              aria-disabled={!isEc3Enabled}
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">EC3 Global</span>
            </Button>
          </span>
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
