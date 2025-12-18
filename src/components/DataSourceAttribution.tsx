import { ExternalLink, Database, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type DataSourceType = "ICE" | "EPD" | "NABERS" | "NGER" | "BlueScope";

interface DataSourceConfig {
  name: string;
  fullName: string;
  version?: string;
  url: string;
  logoUrl?: string;
  description: string;
  expiryDate?: string;
  maxUsers?: number;
}

const DATA_SOURCES: Record<DataSourceType, DataSourceConfig> = {
  ICE: {
    name: "ICE",
    fullName: "Inventory of Carbon & Energy",
    version: "V4.1 - Oct 2025",
    url: "https://circularecology.com/ice-database.html",
    logoUrl: "/logos/circular-ecology-logo.svg",
    description: "ICE Database by Circular Ecology - the leading UK embodied carbon database",
    expiryDate: "30 June 2026",
    maxUsers: 10000,
  },
  EPD: {
    name: "EPD",
    fullName: "Environmental Product Declarations",
    url: "https://www.ecoplatform.org/",
    description: "Verified manufacturer EPD data from ECO Platform members",
  },
  NABERS: {
    name: "NABERS",
    fullName: "National Australian Built Environment Rating System",
    url: "https://www.nabers.gov.au/",
    description: "Australian building energy rating data",
  },
  NGER: {
    name: "NGER",
    fullName: "National Greenhouse and Energy Reporting",
    url: "https://www.cleanenergyregulator.gov.au/NGER",
    description: "Australian federal emission factors for reporting",
  },
  BlueScope: {
    name: "BlueScope",
    fullName: "BlueScope Steel EPD Data",
    url: "https://www.bluescope.com/",
    description: "Verified EPD data from BlueScope Steel",
  },
};

interface DataSourceAttributionProps {
  source: DataSourceType;
  variant?: "inline" | "badge" | "full" | "compact";
  showLogo?: boolean;
  showLink?: boolean;
  className?: string;
}

/**
 * DataSourceAttribution component for displaying ICE/Circular Ecology and other data source credits.
 * Must be displayed on-screen wherever data from these sources is used, per license requirements.
 */
export function DataSourceAttribution({
  source,
  variant = "badge",
  showLogo = true,
  showLink = true,
  className,
}: DataSourceAttributionProps) {
  const config = DATA_SOURCES[source];

  if (variant === "inline") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
              {showLogo && config.logoUrl && (
                <img 
                  src={config.logoUrl} 
                  alt={`${config.fullName} logo`}
                  className="h-4 w-auto"
                />
              )}
              <span>Data: {config.name}</span>
              {config.version && <span className="text-[10px] opacity-70">({config.version})</span>}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm">{config.description}</p>
            {showLink && (
              <a 
                href={config.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-1 text-xs text-primary hover:underline flex items-center gap-1"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "badge") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-normal gap-1 cursor-help",
                source === "ICE" && "border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20",
                source === "EPD" && "border-blue-500/30 text-blue-600 bg-blue-50 dark:bg-blue-950/20",
                source === "NABERS" && "border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-950/20",
                source === "NGER" && "border-purple-500/30 text-purple-600 bg-purple-50 dark:bg-purple-950/20",
                source === "BlueScope" && "border-sky-500/30 text-sky-600 bg-sky-50 dark:bg-sky-950/20",
                className
              )}
            >
              <Database className="h-3 w-3" />
              {config.name}
              {config.version && <span className="text-[10px] opacity-70">{config.version}</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="font-medium">{config.fullName}</p>
            <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
            {showLink && (
              <a 
                href={config.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 text-xs text-primary hover:underline flex items-center gap-1"
              >
                Learn more <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
        {showLogo && config.logoUrl && (
          <img 
            src={config.logoUrl} 
            alt={`${config.fullName} logo`}
            className="h-5 w-auto"
          />
        )}
        <span>
          Data from <span className="font-medium">{config.fullName}</span>
          {config.version && ` (${config.version})`}
        </span>
        {showLink && (
          <a 
            href={config.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
            aria-label={`Visit ${config.fullName} website`}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    );
  }

  // Full variant - comprehensive attribution block
  return (
    <div className={cn(
      "rounded-lg border bg-muted/30 p-4 space-y-3",
      className
    )}>
      <div className="flex items-start gap-3">
        {showLogo && config.logoUrl && (
          <img 
            src={config.logoUrl} 
            alt={`${config.fullName} logo`}
            className="h-10 w-auto flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-foreground">{config.fullName}</h4>
            {config.version && (
              <Badge variant="secondary" className="text-xs">
                {config.version}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
        </div>
      </div>
      
      {source === "ICE" && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background/50 rounded p-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
          <p>
            ICE Database usage licensed until {config.expiryDate}. Maximum {config.maxUsers?.toLocaleString()} end-users.
            CarbonConstruct holds registration for non-educational use.
          </p>
        </div>
      )}
      
      {showLink && (
        <a 
          href={config.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Visit {config.name} website <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

interface MultiSourceAttributionProps {
  sources: DataSourceType[];
  className?: string;
}

/**
 * Display attribution for multiple data sources at once.
 * Useful for pages that aggregate data from different databases.
 */
export function MultiSourceAttribution({ sources, className }: MultiSourceAttributionProps) {
  if (sources.length === 0) return null;
  
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-xs text-muted-foreground">Data sources:</span>
      {sources.map((source) => (
        <DataSourceAttribution 
          key={source} 
          source={source} 
          variant="badge" 
          showLogo={false}
        />
      ))}
    </div>
  );
}

interface ICEAttributionFooterProps {
  className?: string;
}

/**
 * Dedicated ICE attribution footer for report pages and PDF exports.
 * Meets license requirement for on-screen attribution with logo.
 */
export function ICEAttributionFooter({ className }: ICEAttributionFooterProps) {
  const iceConfig = DATA_SOURCES.ICE;
  
  return (
    <div className={cn(
      "border-t pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground",
      className
    )}>
      <div className="flex items-center gap-3">
        <img 
          src={iceConfig.logoUrl} 
          alt="Circular Ecology logo"
          className="h-8 w-auto"
        />
        <div>
          <p className="font-medium text-foreground">
            {iceConfig.fullName} ({iceConfig.version})
          </p>
          <p>© Circular Ecology</p>
        </div>
      </div>
      <div className="text-center sm:text-right">
        <p>Embodied carbon data provided under license</p>
        <a 
          href={iceConfig.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          circularecology.com <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
