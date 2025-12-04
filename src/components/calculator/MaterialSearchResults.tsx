import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Database, FlaskConical, RefreshCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

// Simplified interface that works with local database
interface MaterialItem {
  id: string;
  material_name: string;
  unit: string;
  embodied_carbon_total: number | null;  // ef_total (hybrid)
  embodied_carbon_a1a3: number | null;   // ef_a1a3 (process)
  data_source?: string | null;
}

interface GroupedMaterials {
  category: string;
  items: MaterialItem[];
}

export type FactorType = 'process' | 'hybrid';

interface MaterialSearchResultsProps {
  groupedMaterials: GroupedMaterials[];
  onAddMaterial: (materialId: string, factorType?: FactorType) => void;
  searchTerm: string;
  selectedCategory: string | null;
}

export function MaterialSearchResults({ 
  groupedMaterials, 
  onAddMaterial, 
  searchTerm,
  selectedCategory 
}: MaterialSearchResultsProps) {
  if (groupedMaterials.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/30">
        <Database className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {searchTerm ? `No materials found for "${searchTerm}"` : "Select a category or search to browse materials"}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-72 border rounded-lg bg-background">
        <div className="p-2 space-y-1">
          {groupedMaterials.map(({ category, items }) => (
            <div key={category}>
              {!selectedCategory && (
                <div className="sticky top-0 px-3 py-2 text-xs font-bold text-muted-foreground uppercase bg-muted/80 backdrop-blur rounded mb-1">
                  📦 {category} — {items.length} materials
                </div>
              )}
              {selectedCategory && (
                <div className="px-3 py-2 text-sm font-medium text-foreground border-b mb-2">
                  Showing {items.length} {category} materials
                </div>
              )}
              {items.map(item => {
                const hasProcess = item.embodied_carbon_a1a3 != null && item.embodied_carbon_a1a3 > 0;
                const hasHybrid = item.embodied_carbon_total != null && item.embodied_carbon_total > 0;
                const hasBoth = hasProcess && hasHybrid;
                
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 rounded-lg group transition-colors border border-transparent hover:border-emerald-200"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-medium text-sm text-foreground truncate">
                        {item.material_name}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                        <span className="inline-flex items-center text-xs text-muted-foreground">
                          📏 {item.unit}
                        </span>
                        
                        {/* Process LCA factor (ef_a1a3) */}
                        {hasProcess && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-mono font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                                <FlaskConical className="h-3 w-3" />
                                {item.embodied_carbon_a1a3?.toFixed(1)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-semibold">Process LCA (A1-A3)</p>
                              <p className="text-xs text-muted-foreground">Cradle-to-gate direct manufacturing emissions only. More conservative estimate.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {/* Hybrid LCA factor (ef_total) */}
                        {hasHybrid && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-mono font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                                <RefreshCcw className="h-3 w-3" />
                                {item.embodied_carbon_total?.toFixed(1)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-semibold">Hybrid LCA (Total)</p>
                              <p className="text-xs text-muted-foreground">Process + Input-Output hybrid. Includes supply chain emissions. More comprehensive.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        <span className="text-xs text-muted-foreground">
                          kgCO₂/{item.unit}
                        </span>
                        
                        {item.data_source && (
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                            🏷️ {item.data_source}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Add buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {hasBoth ? (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddMaterial(item.id, 'process');
                                }}
                              >
                                <FlaskConical className="h-3.5 w-3.5 mr-1" />
                                <Plus className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add with Process LCA factor</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 bg-amber-100 text-amber-700 hover:bg-amber-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddMaterial(item.id, 'hybrid');
                                }}
                              >
                                <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                                <Plus className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add with Hybrid LCA factor</TooltipContent>
                          </Tooltip>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className={`h-7 px-2 ${
                            hasProcess 
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddMaterial(item.id, hasProcess ? 'process' : 'hybrid');
                          }}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
