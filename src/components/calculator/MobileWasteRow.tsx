import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WasteInput {
  quantity: string;
  unit: 'kg' | 'tonne';
}

interface MobileWasteRowProps {
  label: string;
  factor: number;
  input: WasteInput;
  onChange: (input: WasteInput) => void;
  total: number;
}

// Mobile-optimized waste row
export function MobileWasteRow({ label, factor, input, onChange, total }: MobileWasteRowProps) {
  return (
    <div className="py-2.5 md:py-3 border-b last:border-0 hover:bg-muted/50 px-2 rounded">
      {/* Mobile: stacked, Desktop: grid */}
      <div className="flex flex-col gap-2 md:grid md:grid-cols-12 md:gap-4 md:items-center">
        {/* Label */}
        <div className="md:col-span-4 font-medium text-sm">{label}</div>
        
        {/* Input row */}
        <div className="flex items-center gap-2 md:col-span-3">
          <Input 
            type="number"
            min="0"
            step="any"
            className="h-9 text-sm text-foreground flex-1"
            placeholder="0"
            value={input.quantity || ''} 
            onChange={(e) => onChange({ ...input, quantity: e.target.value })}
          />
          <Select
            value={input.unit}
            onValueChange={(v) => onChange({ ...input, unit: v as 'kg' | 'tonne' })}
          >
            <SelectTrigger className="w-20 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="tonne">tonne</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Factor and result on same line for mobile */}
        <div className="flex items-center justify-between md:contents">
          <span className="text-xs text-muted-foreground font-mono md:col-span-3 md:text-right">
            × {factor} kgCO₂/kg
          </span>
          <span className={`font-bold text-sm md:col-span-2 md:text-right ${total < 0 ? 'text-blue-600' : 'text-emerald-600'}`}>
            {(total / 1000).toFixed(3)} t
          </span>
        </div>
      </div>
    </div>
  );
}
