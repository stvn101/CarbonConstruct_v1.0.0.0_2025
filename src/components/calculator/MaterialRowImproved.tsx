import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Leaf } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  sequestration?: number; // kgCO2 stored per unit (negative = carbon stored)
}

interface MaterialRowImprovedProps {
  material: Material;
  onChange: (m: Material) => void;
  onRemove: () => void;
}

export function MaterialRowImproved({ material, onChange, onRemove }: MaterialRowImprovedProps) {
  const grossEmissions = (material.quantity * material.factor) / 1000;
  const sequestration = material.sequestration 
    ? (material.quantity * material.sequestration) / 1000 
    : 0;
  const netEmissions = grossEmissions - sequestration;
  const hasSequestration = material.sequestration && material.sequestration > 0;

  return (
    <div className={`rounded-lg border p-3 md:p-4 mb-3 transition-all ${
      material.isCustom 
        ? 'bg-purple-50/50 border-purple-200' 
        : hasSequestration 
          ? 'bg-emerald-50/30 border-emerald-200'
          : 'bg-card hover:shadow-sm'
    }`}>
      {/* Header: Material name and source */}
      <div className="flex items-start justify-between mb-3 gap-2">
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full whitespace-nowrap">
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
            <label className="text-xs text-emerald-600 mb-1 block flex items-center gap-1">
              <Leaf className="h-3 w-3" /> Stored
            </label>
            <div className="h-9 md:h-10 flex items-center justify-center px-2 bg-emerald-100 rounded-md border border-emerald-200 font-bold text-emerald-700 text-sm">
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
              ? 'bg-blue-100 text-blue-700' 
              : grossEmissions > 0 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-muted text-muted-foreground'
          }`}>
            {netEmissions <= 0 && hasSequestration && '🌱 '}
            {netEmissions.toFixed(3)} t
          </div>
        </div>
      </div>

      {/* Carbon benefit summary for timber - hidden on mobile for space */}
      {hasSequestration && material.quantity > 0 && (
        <div className="hidden md:block mt-3 p-2 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-700">
          <strong>Carbon Benefit:</strong> Gross emissions {grossEmissions.toFixed(3)}t - {sequestration.toFixed(3)}t stored = <strong>{netEmissions.toFixed(3)}t net</strong>
          {netEmissions <= 0 && ' (Carbon negative! 🌲)'}
        </div>
      )}
    </div>
  );
}
