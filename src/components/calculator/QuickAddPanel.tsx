import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X, Zap } from "lucide-react";

interface FavoriteMaterial {
  materialId: string;
  materialName: string;
  category: string;
  unit: string;
  factor: number;
  source: string;
  usageCount: number;
  isPinned: boolean;
}

interface QuickAddPanelProps {
  materials: FavoriteMaterial[];
  onAddMaterial: (material: FavoriteMaterial) => void;
  onHideMaterial: (materialId: string) => void;
}

export function QuickAddPanel({ materials, onAddMaterial, onHideMaterial }: QuickAddPanelProps) {
  if (materials.length === 0) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-emerald-800">Quick Add</span>
        </div>
        <span className="text-xs text-emerald-600">Your frequently used materials</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {materials.map(fav => (
          <Tooltip key={fav.materialId}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onAddMaterial(fav)}
                className="group relative inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-emerald-300 rounded-xl hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col items-start">
                  <span className="text-foreground font-medium truncate max-w-[140px]">{fav.materialName}</span>
                  <span className="text-xs text-emerald-600 font-mono">
                    {fav.factor.toFixed(1)} kgCO₂/{fav.unit}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onHideMaterial(fav.materialId);
                  }}
                  className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 bg-white border border-muted rounded-full p-0.5 text-muted-foreground hover:text-destructive hover:border-destructive transition-all shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{fav.materialName}</p>
              <p className="text-xs text-muted-foreground">
                {fav.category} • Used {fav.usageCount}x
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
