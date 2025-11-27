import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

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
}

interface MaterialRowImprovedProps {
  material: Material;
  onChange: (m: Material) => void;
  onRemove: () => void;
}

export function MaterialRowImproved({ material, onChange, onRemove }: MaterialRowImprovedProps) {
  const emissions = (material.quantity * material.factor) / 1000;

  return (
    <div className={`rounded-lg border p-4 mb-3 transition-all ${
      material.isCustom 
        ? 'bg-purple-50/50 border-purple-200' 
        : 'bg-card hover:shadow-sm'
    }`}>
      {/* Header: Material name and source */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {material.isCustom ? (
            <Input 
              className="h-8 text-sm font-medium text-foreground bg-background border-purple-300 focus:border-purple-500"
              placeholder="Material Name"
              value={material.name}
              onChange={(e) => onChange({ ...material, name: e.target.value })}
            />
          ) : (
            <>
              <div className="font-medium text-foreground">{material.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">🏷️ {material.source}</div>
            </>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Data row: Quantity | Factor | Emissions */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {/* Quantity Input */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Quantity</label>
          <div className="relative">
            <Input 
              type="number" 
              min="0"
              step="any"
              className="h-10 pr-12 text-foreground font-medium"
              placeholder="0"
              value={material.quantity || ''} 
              onChange={(e) => onChange({ ...material, quantity: parseFloat(e.target.value) || 0 })}
            />
            {material.isCustom ? (
              <Input 
                className="absolute right-1 top-1 bottom-1 w-12 text-xs text-foreground h-8 border-l text-center"
                placeholder="unit"
                value={material.unit}
                onChange={(e) => onChange({ ...material, unit: e.target.value })}
              />
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                {material.unit}
              </span>
            )}
          </div>
        </div>

        {/* Factor */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Factor</label>
          {material.isCustom ? (
            <div className="relative">
              <Input 
                type="number" 
                step="0.01"
                className="h-10 text-foreground"
                placeholder="kgCO₂"
                value={material.factor || ''} 
                onChange={(e) => onChange({ ...material, factor: parseFloat(e.target.value) || 0 })}
              />
            </div>
          ) : (
            <div className="h-10 flex items-center px-3 bg-muted/50 rounded-md border text-sm font-mono text-muted-foreground">
              × {material.factor.toFixed(1)} kgCO₂/{material.unit}
            </div>
          )}
        </div>

        {/* Emissions Result */}
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Emissions</label>
          <div className={`h-10 flex items-center justify-center px-3 rounded-md font-bold text-lg ${
            emissions > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
          }`}>
            {emissions.toFixed(3)} t
          </div>
        </div>
      </div>
    </div>
  );
}
