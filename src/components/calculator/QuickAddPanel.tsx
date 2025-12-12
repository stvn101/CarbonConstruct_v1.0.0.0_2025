import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { X, Zap, RefreshCw, Check } from "lucide-react";
import { FavoriteMaterial } from "@/hooks/useFavoriteMaterials";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuickAddPanelProps {
  materials: FavoriteMaterial[];
  onAddMaterial: (material: FavoriteMaterial) => void;
  onHideMaterial: (materialId: string) => void;
  onSyncEPD?: () => Promise<{ synced: number; total: number }>;
}

export function QuickAddPanel({ materials, onAddMaterial, onHideMaterial, onSyncEPD }: QuickAddPanelProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    if (!onSyncEPD) return;
    
    setIsSyncing(true);
    setSyncComplete(false);
    
    try {
      const result = await onSyncEPD();
      setSyncComplete(true);
      
      toast({
        title: "EPD Data Synced",
        description: `Updated ${result.synced} of ${result.total} materials with latest EPD data`,
      });
      
      // Reset the check icon after 3 seconds
      setTimeout(() => setSyncComplete(false), 3000);
    } catch {
      toast({
        title: "Sync Failed",
        description: "Could not refresh EPD data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (materials.length === 0) return null;

  return (
    <div className="p-3 md:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-emerald-800">Quick Add</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-600">Your frequently used materials</span>
          {onSyncEPD && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="h-7 px-2 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                >
                  {syncComplete ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  )}
                  <span className="ml-1 text-xs hidden sm:inline">
                    {isSyncing ? 'Syncing...' : syncComplete ? 'Synced' : 'Sync EPD'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh EPD data for all recently used materials</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {materials.map(fav => (
          <Tooltip key={fav.materialId}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onAddMaterial(fav)}
                className="group relative inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-sm transition-all"
              >
                <div className="flex flex-col items-start">
                  <span className="text-foreground font-medium text-xs md:text-sm truncate max-w-[100px] md:max-w-[140px]">{fav.materialName}</span>
                  <span className="text-xs text-emerald-600 font-mono">
                    {fav.factor.toFixed(1)} /{fav.unit}
                  </span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onHideMaterial(fav.materialId);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onHideMaterial(fav.materialId);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 bg-white border border-muted rounded-full p-0.5 text-muted-foreground hover:text-destructive hover:border-destructive transition-all shadow-sm cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{fav.materialName}</p>
              <p className="text-xs text-muted-foreground">
                {fav.category} • Used {fav.usageCount}x
              </p>
              {fav.epdNumber && (
                <p className="text-xs text-emerald-600">EPD: {fav.epdNumber}</p>
              )}
              {fav.manufacturer && (
                <p className="text-xs text-muted-foreground">{fav.manufacturer}</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
