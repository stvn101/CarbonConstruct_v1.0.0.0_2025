import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Database, FlaskConical, RefreshCcw, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

function LCAMethodologyInfo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
          <Info className="h-3.5 w-3.5" />
          Which LCA factor should I choose?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choosing an LCA Methodology</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            When adding materials, you'll see one or two buttons to choose between LCA methodologies:
          </p>
          
          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="h-7 w-7 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <FlaskConical className="h-4 w-4 text-emerald-700" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800">Process LCA (A1-A3)</p>
              <p className="text-emerald-700 text-xs mt-1">
                Covers <strong>cradle-to-gate</strong> direct manufacturing emissions only. 
                More conservative and commonly used for EPD compliance. 
                <strong className="block mt-1">Use this for most regulatory submissions.</strong>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="h-7 w-7 rounded bg-amber-100 flex items-center justify-center flex-shrink-0">
              <RefreshCcw className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">Hybrid LCA (Total)</p>
              <p className="text-amber-700 text-xs mt-1">
                Combines process data with <strong>input-output analysis</strong> for supply chain emissions. 
                More comprehensive but higher values.
                <strong className="block mt-1">Use for full lifecycle assessments.</strong>
              </p>
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">💡 Tip</p>
            <p>
              If only one button appears, that material only has one methodology available. 
              Be consistent—use the same methodology across your entire project for accurate comparisons.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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
      <div className="space-y-2">
        {/* LCA Methodology Info */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <FlaskConical className="h-3 w-3" /> Process
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600">
              <RefreshCcw className="h-3 w-3" /> Hybrid
            </span>
          </div>
          <LCAMethodologyInfo />
        </div>
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
                    className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 hover:bg-emerald-50 rounded-lg group transition-colors border border-transparent hover:border-emerald-200 overflow-hidden"
                  >
                    {/* Material info - constrained, truncates */}
                    <div className="min-w-0 overflow-hidden">
                      <div className="font-medium text-sm text-foreground truncate block" title={item.material_name}>
                        {item.material_name}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                        <span className="inline-flex items-center text-xs text-muted-foreground">
                          📏 {item.unit}
                        </span>
                        
                        {/* Process LCA factor (ef_a1a3) */}
                        {hasProcess && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-mono font-medium bg-emerald-50 px-1 py-0.5 rounded">
                                <FlaskConical className="h-3 w-3" />
                                {item.embodied_carbon_a1a3?.toFixed(1)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-semibold">Process LCA (A1-A3)</p>
                              <p className="text-xs text-muted-foreground">Cradle-to-gate direct manufacturing emissions only.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {/* Hybrid LCA factor (ef_total) */}
                        {hasHybrid && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 font-mono font-medium bg-amber-50 px-1 py-0.5 rounded">
                                <RefreshCcw className="h-3 w-3" />
                                {item.embodied_carbon_total?.toFixed(1)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-semibold">Hybrid LCA (Total)</p>
                              <p className="text-xs text-muted-foreground">Process + Input-Output hybrid. More comprehensive.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    
                    {/* Add buttons - ALWAYS VISIBLE, fixed width */}
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                      {hasBoth ? (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddMaterial(item.id, 'process');
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add with Process LCA ({item.embodied_carbon_a1a3?.toFixed(1)})</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 bg-amber-100 text-amber-700 hover:bg-amber-200"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddMaterial(item.id, 'hybrid');
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Add with Hybrid LCA ({item.embodied_carbon_total?.toFixed(1)})</TooltipContent>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`h-7 w-7 p-0 ${
                                hasProcess 
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddMaterial(item.id, hasProcess ? 'process' : 'hybrid');
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Add ({hasProcess ? item.embodied_carbon_a1a3?.toFixed(1) : item.embodied_carbon_total?.toFixed(1)} kgCO₂/{item.unit})
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}
