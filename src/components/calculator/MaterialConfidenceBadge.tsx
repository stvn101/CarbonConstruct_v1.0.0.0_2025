import { CheckCircle, AlertCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ConfidenceColor = 'green' | 'yellow' | 'orange' | 'red';

interface MaterialConfidenceBadgeProps {
  color: ConfidenceColor;
  label: string;
  epdNumber?: string | null;
  dataSource?: string | null;
  validUntil?: string | null;
  outlierReason?: string;
  className?: string;
  /** Data quality rating with uncertainty percentage */
  dataQuality?: {
    label: string;
    uncertaintyPercent: number;
    description: string;
  };
}

const confidenceConfig: Record<ConfidenceColor, {
  icon: typeof CheckCircle;
  bgClass: string;
  textClass: string;
  borderClass: string;
  description: string;
  useCase: string;
}> = {
  green: {
    icon: CheckCircle,
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    description: 'EPD Australasia registered, NABERS cross-referenced, product-specific manufacturer data.',
    useCase: 'Best for: Compliance, detailed LCA work'
  },
  yellow: {
    icon: AlertCircle,
    bgClass: 'bg-yellow-50',
    textClass: 'text-yellow-700',
    borderClass: 'border-yellow-200',
    description: 'EPD registered but regional/manufacturing variation. Context documented.',
    useCase: 'Good for: Regional comparison, rough estimates'
  },
  orange: {
    icon: AlertTriangle,
    bgClass: 'bg-orange-50',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-200',
    description: 'ICM Database 2019 or similar industry standard. Not product-specific but reliable for hybrid LCA.',
    useCase: 'Acceptable for: Preliminary estimates, material families'
  },
  red: {
    icon: HelpCircle,
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    description: 'Outlier value without clear explanation. Flagged for manual investigation.',
    useCase: 'Avoid until: Team verifies source and justification'
  }
};

/**
 * Material Confidence Badge - Framework Part 5.1
 * 
 * Displays confidence level with detailed tooltip:
 * 🟢 GREEN - Verified EPD
 * 🟡 YELLOW - Documented Variant
 * 🟠 ORANGE - Industry Average
 * 🔴 RED - Needs Review
 */
export function MaterialConfidenceBadge({
  color,
  label,
  epdNumber,
  dataSource,
  validUntil,
  outlierReason,
  className,
  dataQuality
}: MaterialConfidenceBadgeProps) {
  const config = confidenceConfig[color];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium border cursor-help",
            config.bgClass,
            config.textClass,
            config.borderClass,
            className
          )}
        >
          <Icon className="h-3 w-3" />
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold",
              config.bgClass,
              config.textClass
            )}>
              <Icon className="h-3 w-3" />
              {label}
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground">{config.description}</p>
          
          {epdNumber && (
            <p className="text-xs">
              <span className="font-medium">EPD:</span> {epdNumber}
            </p>
          )}
          
          {dataSource && (
            <p className="text-xs">
              <span className="font-medium">Source:</span> {dataSource}
            </p>
          )}
          
          {validUntil && (
            <p className="text-xs">
              <span className="font-medium">Valid Until:</span> {validUntil}
            </p>
          )}
          
          {outlierReason && color === 'red' && (
            <p className="text-xs text-red-600">
              <span className="font-medium">⚠️ Issue:</span> {outlierReason}
            </p>
          )}
          
          {dataQuality && (
            <div className="border-t pt-2 mt-2">
              <p className="text-xs font-medium">
                Data Quality: {dataQuality.label}
              </p>
              <p className="text-xs text-muted-foreground">
                Uncertainty: ±{dataQuality.uncertaintyPercent}%
              </p>
            </div>
          )}
          
          <p className="text-xs font-medium text-primary mt-2">{config.useCase}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
