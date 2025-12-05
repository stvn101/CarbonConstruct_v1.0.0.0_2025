import { useState, memo, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Leaf, ChevronRight, Info, ExternalLink, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Material {
  id: string;
  category: string;
  typeId: string;
  name: string;
  unit: string;
  factor: number;
  source: string;
  quantity: number;
  isCustom: boolean;
  sequestration?: number;
  // EPD Traceability
  epdNumber?: string;
  epdUrl?: string;
  manufacturer?: string;
  plantLocation?: string;
  dataQualityTier?: string;
  year?: number;
  publishDate?: string;
  expiryDate?: string;
  // Lifecycle breakdown
  ef_a1a3?: number;
  ef_a4?: number;
  ef_a5?: number;
  ef_b1b5?: number;
  ef_c1c4?: number;
  ef_d?: number;
}

interface MaterialRowImprovedProps {
  material: Material;
  onChange: (m: Material) => void;
  onRemove: () => void;
}

export const MaterialRowImproved = memo(({ material, onChange, onRemove }: MaterialRowImprovedProps) => {
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const emissions = useMemo(() => {
    const grossEmissions = (material.quantity * material.factor) / 1000;
    const sequestration = material.sequestration
      ? (material.quantity * material.sequestration) / 1000
      : 0;
    const netEmissions = grossEmissions - sequestration;

    // Calculate lifecycle stage emissions
    const a1a3Emissions = material.ef_a1a3 ? (material.quantity * material.ef_a1a3) / 1000 : 0;
    const a4Emissions = material.ef_a4 ? (material.quantity * material.ef_a4) / 1000 : 0;
    const a5Emissions = material.ef_a5 ? (material.quantity * material.ef_a5) / 1000 : 0;
    const totalLifecycle = a1a3Emissions + a4Emissions + a5Emissions;

    return {
      grossEmissions,
      sequestration,
      netEmissions,
      a1a3Emissions,
      a4Emissions,
      a5Emissions,
      totalLifecycle,
      a1a3Percent: totalLifecycle > 0 ? Math.round((a1a3Emissions / totalLifecycle) * 100) : 0,
      a4Percent: totalLifecycle > 0 ? Math.round((a4Emissions / totalLifecycle) * 100) : 0,
      a5Percent: totalLifecycle > 0 ? Math.round((a5Emissions / totalLifecycle) * 100) : 0,
    };
  }, [material.quantity, material.factor, material.sequestration, material.ef_a1a3, material.ef_a4, material.ef_a5]);

  const hasSequestration = material.sequestration && material.sequestration > 0;
  const hasLifecycleData = material.ef_a1a3 && material.ef_a1a3 > 0;
  const hasEpdData = material.epdNumber || material.manufacturer;

  const { grossEmissions, sequestration, netEmissions, a1a3Emissions, a4Emissions, a5Emissions, a1a3Percent, a4Percent, a5Percent } = emissions;

  return (
    <div className={`rounded-lg border p-3 md:p-4 mb-3 transition-all ${
      material.isCustom 
        ? 'bg-purple-50/50 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800' 
        : hasSequestration 
          ? 'bg-emerald-50/30 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800'
          : 'bg-card hover:shadow-sm'
    }`}>
      {/* Header: Material name and source */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex-1 min-w-0">
          {material.isCustom ? (
            <Input 
              className="h-8 text-sm font-medium text-foreground bg-background border-purple-300 focus:border-purple-500"
              placeholder="Material Name"
              value={material.name}
              onChange={(e) => onChange({ ...material, name: e.target.value })}
            />
          ) : (
            <>
              <div className="font-medium text-foreground text-sm md:text-base flex flex-wrap items-center gap-2">
                <span className="break-words">{material.name}</span>
                {hasSequestration && (
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs rounded-full whitespace-nowrap">
                        <Leaf className="h-3 w-3" />
                        Carbon Store
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">This timber material stores {material.sequestration?.toFixed(1)} kgCO₂/{material.unit}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">🏷️ {material.source}</div>
              
              {/* EPD Reference Line */}
              {hasEpdData && (
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  <span>
                    EPD: {material.epdNumber || 'N/A'}
                    {material.manufacturer && ` (${material.manufacturer})`}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Data row: Mobile = stacked 2x2, Desktop = inline */}
      <div className={`grid gap-3 ${hasSequestration ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-3'}`}>
        {/* Quantity Input */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
          <div className="relative">
            <Input 
              type="number" 
              min="0"
              step="any"
              className="h-9 md:h-10 pr-12 text-foreground font-medium text-sm"
              placeholder="0"
              value={material.quantity || ''} 
              onChange={(e) => onChange({ ...material, quantity: parseFloat(e.target.value) || 0 })}
            />
            {material.isCustom ? (
              <Input 
                className="absolute right-1 top-1 bottom-1 w-10 md:w-12 text-xs text-foreground h-7 border-l text-center"
                placeholder="unit"
                value={material.unit}
                onChange={(e) => onChange({ ...material, unit: e.target.value })}
              />
            ) : (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs md:text-sm text-muted-foreground font-medium">
                {material.unit}
              </span>
            )}
          </div>
        </div>

        {/* Factor */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Factor</label>
          {material.isCustom ? (
            <div className="relative">
              <Input 
                type="number" 
                step="0.01"
                className="h-9 md:h-10 text-foreground text-sm"
                placeholder="kgCO₂"
                value={material.factor || ''} 
                onChange={(e) => onChange({ ...material, factor: parseFloat(e.target.value) || 0 })}
              />
            </div>
          ) : (
            <div className="h-9 md:h-10 flex items-center px-2 md:px-3 bg-muted/50 rounded-md border text-xs md:text-sm font-mono text-muted-foreground">
              × {material.factor.toFixed(1)}
            </div>
          )}
        </div>

        {/* Sequestration (only for timber) */}
        {hasSequestration && (
          <div>
            <label className="text-xs text-emerald-600 dark:text-emerald-400 mb-1 block flex items-center gap-1">
              <Leaf className="h-3 w-3" /> Stored
            </label>
            <div className="h-9 md:h-10 flex items-center justify-center px-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-md border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-700 dark:text-emerald-400 text-sm">
              -{sequestration.toFixed(3)} t
            </div>
          </div>
        )}

        {/* Net Emissions Result */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            {hasSequestration ? 'Net' : 'Emissions'}
          </label>
          <div className={`h-9 md:h-10 flex items-center justify-center px-2 rounded-md font-bold text-sm md:text-base ${
            netEmissions <= 0 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' 
              : grossEmissions > 0 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' 
                : 'bg-muted text-muted-foreground'
          }`}>
            {netEmissions <= 0 && hasSequestration && '🌱 '}
            {netEmissions.toFixed(3)} t
          </div>
        </div>
      </div>

      {/* Lifecycle Breakdown - Collapsible */}
      {!material.isCustom && hasLifecycleData && material.quantity > 0 && (
        <Collapsible open={breakdownOpen} onOpenChange={setBreakdownOpen} className="mt-3">
          <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronRight className={`h-3 w-3 transition-transform ${breakdownOpen ? 'rotate-90' : ''}`} />
            <span>View lifecycle breakdown</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 pl-4 text-xs text-muted-foreground space-y-1 border-l-2 border-muted">
            <div className="flex justify-between">
              <span>• A1-A3 (Product Stage)</span>
              <span className="font-mono">{a1a3Emissions.toFixed(3)} t ({a1a3Percent}%)</span>
            </div>
            {material.ef_a4 && material.ef_a4 > 0 && (
              <div className="flex justify-between">
                <span>• A4 (Transport)</span>
                <span className="font-mono">{a4Emissions.toFixed(3)} t ({a4Percent}%)</span>
              </div>
            )}
            {material.ef_a5 && material.ef_a5 > 0 && (
              <div className="flex justify-between">
                <span>• A5 (Construction)</span>
                <span className="font-mono">{a5Emissions.toFixed(3)} t ({a5Percent}%)</span>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Carbon benefit summary for timber - hidden on mobile for space */}
      {hasSequestration && material.quantity > 0 && (
        <div className="hidden md:block mt-3 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400">
          <strong>Carbon Benefit:</strong> Gross emissions {grossEmissions.toFixed(3)}t - {sequestration.toFixed(3)}t stored = <strong>{netEmissions.toFixed(3)}t net</strong>
          {netEmissions <= 0 && ' (Carbon negative! 🌲)'}
        </div>
      )}

      {/* View Source - Dialog for EPD details */}
      {!material.isCustom && (
        <div className="mt-3 flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                <Info className="h-3 w-3" />
                <span>View Source</span>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  EPD Data Source
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground">{material.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{material.category}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">EPD Reference</p>
                    <p className="font-medium">{material.epdNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data Source</p>
                    <p className="font-medium">{material.source}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Manufacturer</p>
                    <p className="font-medium">{material.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Plant Location</p>
                    <p className="font-medium">{material.plantLocation || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Publication Year</p>
                    <p className="font-medium">{material.year || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Data Quality</p>
                    <p className="font-medium">{material.dataQualityTier || 'Standard'}</p>
                  </div>
                </div>

                {/* Lifecycle factors table */}
                {hasLifecycleData && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-3 py-2 text-xs font-medium">
                      Lifecycle Stage Factors (kgCO₂e/{material.unit})
                    </div>
                    <div className="divide-y text-xs">
                      <div className="flex justify-between px-3 py-2">
                        <span>A1-A3 Product</span>
                        <span className="font-mono">{material.ef_a1a3?.toFixed(2) || '-'}</span>
                      </div>
                      <div className="flex justify-between px-3 py-2">
                        <span>A4 Transport</span>
                        <span className="font-mono">{material.ef_a4?.toFixed(2) || '-'}</span>
                      </div>
                      <div className="flex justify-between px-3 py-2">
                        <span>A5 Construction</span>
                        <span className="font-mono">{material.ef_a5?.toFixed(2) || '-'}</span>
                      </div>
                      <div className="flex justify-between px-3 py-2 bg-muted/30 font-medium">
                        <span>Total (A1-A5)</span>
                        <span className="font-mono">{material.factor?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {material.epdUrl && (
                  <a 
                    href={material.epdUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View EPD Document
                  </a>
                )}

                <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg mt-4">
                  <p className="font-medium mb-1">Methodology Note</p>
                  <p>
                    Emissions calculated using EN 15804 methodology. Global Warming Potential (GWP) 
                    values represent CO₂ equivalent based on IPCC characterisation factors.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
});
