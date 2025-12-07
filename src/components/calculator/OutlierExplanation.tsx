import { AlertTriangle, CheckCircle, Factory, Zap, Recycle, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface OutlierExplanationProps {
  materialName: string;
  value: number;
  unit: string;
  expectedRange: string;
  outlierReason: string;
  dataSource?: string | null;
  manufacturer?: string | null;
  state?: string | null;
  epdNumber?: string | null;
  isValid?: boolean;
}

/**
 * Outlier Explanation Modal - Framework Part 5.2
 * 
 * Explains why a material is outside typical ranges:
 * - Coal-intensive smelter grid (China/India)
 * - Higher primary content
 * - Verified in EPD
 * 
 * Provides alternatives and guidance.
 */
export function OutlierExplanation({
  materialName,
  value,
  unit,
  expectedRange,
  outlierReason,
  dataSource,
  manufacturer,
  state,
  epdNumber,
  isValid = false
}: OutlierExplanationProps) {
  // Determine if this is a documented/acceptable outlier
  const isDocumented = !!epdNumber || (dataSource && dataSource.includes('EPD'));
  
  // Parse common outlier reasons
  const isCoalGrid = outlierReason.toLowerCase().includes('coal') || 
                     state?.toLowerCase().includes('china') || 
                     state?.toLowerCase().includes('india');
  const isRecycled = outlierReason.toLowerCase().includes('recycled');
  const isHighCarbon = outlierReason.includes('above');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-auto p-0 text-xs text-amber-600 hover:text-amber-700"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Why this differs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            This material is outside typical ranges
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Material Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium text-sm">{materialName}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-bold text-amber-600">
                {value.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">kgCO₂e/{unit}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Expected range: {expectedRange} kgCO₂e/{unit}
            </p>
          </div>
          
          {/* Reason Explanation */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Why?</p>
            
            {isCoalGrid && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="h-8 w-8 rounded bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">Coal-intensive smelter grid</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Manufacturing in China or India uses coal-powered electricity, significantly 
                    increasing the embodied carbon compared to hydro-powered regions.
                  </p>
                </div>
              </div>
            )}
            
            {isRecycled && (
              <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="h-8 w-8 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Recycle className="h-4 w-4 text-emerald-700" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800">High recycled content</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Materials with high recycled content have lower embodied carbon 
                    because they avoid virgin material extraction and processing.
                  </p>
                </div>
              </div>
            )}
            
            {manufacturer && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Factory className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Manufacturer-specific</p>
                  <p className="text-xs text-blue-700 mt-1">
                    This value is from {manufacturer}'s specific production process, 
                    which may differ from industry averages.
                  </p>
                </div>
              </div>
            )}
            
            {!isCoalGrid && !isRecycled && !manufacturer && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Under review</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {outlierReason}. This material is flagged for verification.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Verification Status */}
          {isDocumented && (
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">
                Verified in EPD: {epdNumber}
              </span>
            </div>
          )}
          
          {/* This is ACCURATE notice */}
          {isValid && (
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm font-semibold text-emerald-800 mb-1">
                This is ACCURATE and LEGITIMATE
              </p>
              <p className="text-xs text-emerald-700">
                The value is outside typical ranges due to documented regional or manufacturing 
                factors. Use this when sourcing from this specific supplier or region.
              </p>
            </div>
          )}
          
          {/* When to use */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">When to use:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              {isCoalGrid && <li>If sourcing from China/India suppliers</li>}
              <li>For global supply chain analysis</li>
              <li>If carbon intensity is critical to decisions</li>
            </ul>
          </div>
          
          {/* Alternatives */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-semibold text-foreground mb-2">
              <ArrowRight className="h-4 w-4 inline mr-1" />
              Looking for alternatives?
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              {isHighCarbon && <li>Look for European hydro-powered options</li>}
              <li>Consider recycled content alternatives</li>
              <li>Check Australian suppliers (if available)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
