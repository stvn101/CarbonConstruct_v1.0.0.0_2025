import { ExternalLink, MapPin, Calendar, Factory, FileCheck, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MaterialConfidenceBadge, ConfidenceColor } from "./MaterialConfidenceBadge";

interface MaterialCardTooltipProps {
  materialName: string;
  carbonFactor: number;
  unit: string;
  dataSource?: string | null;
  epdNumber?: string | null;
  manufacturer?: string | null;
  state?: string | null;
  plantLocation?: string | null;
  validUntil?: string | null;
  lastUpdated?: string | null;
  epdUrl?: string | null;
  confidenceColor: ConfidenceColor;
  confidenceLabel: string;
  outlierReason?: string;
  // Lifecycle breakdown (if available)
  ef_a1a3?: number | null;
  ef_a4?: number | null;
  ef_a5?: number | null;
}

/**
 * Material Card Tooltip - Framework Part 5.2
 * 
 * Full material information modal with:
 * - Material name, manufacturer, location
 * - Confidence level
 * - Carbon factor with unit explanation
 * - EPD reference and validity
 * - Lifecycle breakdown (A1-A3, A4, A5)
 * - Regional variant context
 * - "View Source" link to EPD document
 */
export function MaterialCardTooltip({
  materialName,
  carbonFactor,
  unit,
  dataSource,
  epdNumber,
  manufacturer,
  state,
  plantLocation,
  validUntil,
  lastUpdated,
  epdUrl,
  confidenceColor,
  confidenceLabel,
  outlierReason,
  ef_a1a3,
  ef_a4,
  ef_a5
}: MaterialCardTooltipProps) {
  const hasLifecycleBreakdown = ef_a1a3 || ef_a4 || ef_a5;
  
  // Calculate lifecycle percentages
  const total = carbonFactor || 1;
  const a1a3Pct = ef_a1a3 ? Math.round((ef_a1a3 / total) * 100) : 0;
  const a4Pct = ef_a4 ? Math.round((ef_a4 / total) * 100) : 0;
  const a5Pct = ef_a5 ? Math.round((ef_a5 / total) * 100) : 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
        >
          <Info className="h-3 w-3 mr-1" />
          View Source
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{materialName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Confidence Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Confidence:</span>
            <MaterialConfidenceBadge
              color={confidenceColor}
              label={confidenceLabel}
              epdNumber={epdNumber}
              dataSource={dataSource}
              validUntil={validUntil}
              outlierReason={outlierReason}
            />
          </div>
          
          {/* Carbon Factor */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">Carbon Factor:</span>
              <span className="text-xl font-bold text-primary">
                {carbonFactor.toFixed(2)} <span className="text-sm font-normal">kgCO₂e/{unit}</span>
              </span>
            </div>
          </div>
          
          {/* EPD Reference */}
          {epdNumber && (
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <FileCheck className="h-4 w-4" />
                EPD Reference:
              </span>
              <span className="text-sm font-medium">{epdNumber}</span>
            </div>
          )}
          
          {/* Data Source */}
          {dataSource && (
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Data Source:</span>
              <Badge variant="outline" className="text-xs">{dataSource}</Badge>
            </div>
          )}
          
          {/* Manufacturer & Location */}
          {(manufacturer || plantLocation || state) && (
            <div className="flex items-start justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Factory className="h-4 w-4" />
                Manufacturer:
              </span>
              <div className="text-right text-sm">
                {manufacturer && <div className="font-medium">{manufacturer}</div>}
                {(plantLocation || state) && (
                  <div className="text-muted-foreground flex items-center gap-1 justify-end">
                    <MapPin className="h-3 w-3" />
                    {plantLocation || state}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Valid Until */}
          {validUntil && (
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Valid Until:
              </span>
              <span className="text-sm">{validUntil}</span>
            </div>
          )}
          
          {/* Last Updated */}
          {lastUpdated && (
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Last Updated:</span>
              <span className="text-sm">{new Date(lastUpdated).toLocaleDateString()}</span>
            </div>
          )}
          
          {/* Lifecycle Breakdown */}
          {hasLifecycleBreakdown && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-800 mb-2">Lifecycle Module Breakdown</p>
              <div className="space-y-1">
                {ef_a1a3 !== null && ef_a1a3 !== undefined && (
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-700">A1-A3 (Product):</span>
                    <span className="font-mono">{ef_a1a3.toFixed(2)} ({a1a3Pct}%)</span>
                  </div>
                )}
                {ef_a4 !== null && ef_a4 !== undefined && ef_a4 > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-700">A4 (Transport):</span>
                    <span className="font-mono">{ef_a4.toFixed(2)} ({a4Pct}%)</span>
                  </div>
                )}
                {ef_a5 !== null && ef_a5 !== undefined && ef_a5 > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-700">A5 (Construction):</span>
                    <span className="font-mono">{ef_a5.toFixed(2)} ({a5Pct}%)</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Outlier Warning */}
          {outlierReason && confidenceColor === 'red' && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-800">This material is outside typical ranges</p>
                  <p className="text-xs text-red-700 mt-1">{outlierReason}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Why this value explanation */}
          <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Why this value?</p>
            <ul className="space-y-0.5 list-disc list-inside">
              {state && <li>Manufactured in {state}</li>}
              {manufacturer && <li>Specific to {manufacturer} production</li>}
              <li>Transport not included (Scope A1-A3 only)</li>
              {dataSource?.includes('ICM') && <li>Industry average - not product-specific</li>}
            </ul>
          </div>
          
          {/* View EPD Link */}
          {epdUrl && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.open(epdUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View EPD Document
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
