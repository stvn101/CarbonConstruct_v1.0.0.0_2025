import { memo } from "react";
import { Input } from "@/components/ui/input";

interface MobileFactorRowProps {
  label: string;
  unit: string;
  value: string | number;
  onChange: (v: string) => void;
  factor: number;
  total: number;
}

// Mobile-optimized factor row for energy, commute, etc.
export const MobileFactorRow = memo(({ label, unit, value, onChange, factor, total }: MobileFactorRowProps) => {
  return (
    <div className="py-2.5 md:py-3 border-b last:border-0 hover:bg-muted/50 px-2 rounded">
      {/* Mobile: stacked layout, Desktop: grid */}
      <div className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center gap-2">
        {/* Label - full width on mobile */}
        <div className="md:col-span-5 font-medium text-sm">{label}</div>
        
        {/* Input row on mobile */}
        <div className="flex items-center gap-2 md:col-span-3">
          <div className="relative flex-1">
            <Input 
              type="number"
              min="0"
              step="any"
              className="h-9 pr-12 text-sm text-foreground"
              placeholder="0"
              value={value || ''} 
              onChange={(e) => onChange(e.target.value)}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{unit}</span>
          </div>
          
          {/* Factor and total inline on mobile */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">× {factor}</span>
            <span className="font-bold text-emerald-600 text-sm whitespace-nowrap">{(total / 1000).toFixed(3)} t</span>
          </div>
        </div>
        
        {/* Desktop-only factor and total columns */}
        <div className="hidden md:block md:col-span-2 text-xs text-muted-foreground text-right font-mono">× {factor}</div>
        <div className="hidden md:block md:col-span-2 text-right font-bold text-emerald-600 text-sm">{(total / 1000).toFixed(3)} t</div>
      </div>
    </div>
  );
});
