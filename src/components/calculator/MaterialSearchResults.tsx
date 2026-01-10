import { ChainedScrollArea } from "@/components/ui/chained-scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Database, FlaskConical, RefreshCcw, Info, MapPin, AlertTriangle, Clock, Scale, Filter } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { UnitInfoTooltip } from "./UnitInfoTooltip";
import { WhyFactorsVaryDialog } from "./RegionalVariantTooltip";
import { DataSourceAttribution } from "@/components/DataSourceAttribution";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

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
  state?: string | null;
  manufacturer?: string | null;
  plant_location?: string | null;
  expiry_date?: string | null;
  publish_date?: string | null;
  material_category?: string;
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
  totalResultCount?: number;
  comparisonMode?: boolean;
  onToggleComparisonMode?: () => void;
  selectedForComparison?: string[];
  onToggleComparison?: (id: string) => void;
  hideExpiredEPDs?: boolean;
  onToggleHideExpired?: () => void;
}

// Helper to check EPD expiry status
function getExpiryStatus(expiryDate: string | null | undefined): { status: 'valid' | 'expiring' | 'expired'; daysUntil: number | null } {
  if (!expiryDate) return { status: 'valid', daysUntil: null };
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return { status: 'expired', daysUntil };
  if (daysUntil <= 90) return { status: 'expiring', daysUntil };
  return { status: 'valid', daysUntil };
}

function LCAMethodologyInfo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-800 dark:hover:text-emerald-200">
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
          
          <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="h-7 w-7 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
              <FlaskConical className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">Process LCA (A1-A3)</p>
              <p className="text-emerald-700 dark:text-emerald-400 text-xs mt-1">
                Covers <strong>cradle-to-gate</strong> direct manufacturing emissions only. 
                More conservative and commonly used for EPD compliance. 
                <strong className="block mt-1">Use this for most regulatory submissions.</strong>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="h-7 w-7 rounded bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <RefreshCcw className="h-4 w-4 text-amber-700 dark:text-amber-300" />
            </div>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300">Hybrid LCA (Total)</p>
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
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
  selectedCategory,
  totalResultCount,
  comparisonMode = false,
  onToggleComparisonMode,
  selectedForComparison = [],
  onToggleComparison,
  hideExpiredEPDs = false,
  onToggleHideExpired
}: MaterialSearchResultsProps) {
  if (groupedMaterials.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/30">
        <Database className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {searchTerm ? `No materials found for "${searchTerm}"` : "Select a category or search to browse materials"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Try searching for: concrete, steel, timber, plasterboard, insulation...
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {/* Results count and LCA Methodology Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-3 text-xs">
            {totalResultCount !== undefined && totalResultCount > 0 && (
              <span className="font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded">
                {totalResultCount.toLocaleString()} result{totalResultCount !== 1 ? 's' : ''}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <FlaskConical className="h-3 w-3" /> Process
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <RefreshCcw className="h-3 w-3" /> Hybrid
            </span>
            <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <MapPin className="h-3 w-3" /> Regional
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Hide Expired EPDs Toggle */}
            {onToggleHideExpired && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onToggleHideExpired}
                    className={`h-7 gap-1.5 text-xs ${hideExpiredEPDs 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' 
                      : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Valid Only
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{hideExpiredEPDs ? 'Showing Valid EPDs Only' : 'Show Valid EPDs Only'}</p>
                  <p className="text-xs text-muted-foreground">
                    {hideExpiredEPDs ? 'Click to show all materials including expired EPDs' : 'Hide materials with expired EPD certifications'}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            {/* Comparison Mode Toggle */}
            {onToggleComparisonMode && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onToggleComparisonMode}
                className={`h-7 gap-1.5 text-xs ${comparisonMode 
                  ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700' 
                  : 'border-gray-200 dark:border-gray-700'}`}
              >
                <Scale className="h-3.5 w-3.5" />
                Compare {selectedForComparison.length > 0 && `(${selectedForComparison.length})`}
              </Button>
            )}
            <WhyFactorsVaryDialog />
            <LCAMethodologyInfo />
          </div>
        </div>
        <ChainedScrollArea className="h-[300px] border rounded-lg bg-background" chainToWindow={true}>
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
                const expiryStatus = getExpiryStatus(item.expiry_date);
                const isSelected = selectedForComparison.includes(item.id);
                
                return (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg group transition-colors border overflow-hidden ${
                      isSelected 
                        ? 'border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-950/30' 
                        : expiryStatus.status === 'expired'
                        ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
                        : expiryStatus.status === 'expiring'
                        ? 'border-amber-200 dark:border-amber-800'
                        : 'border-transparent hover:border-emerald-200 dark:hover:border-emerald-800'
                    }`}
                  >
                    {/* Comparison checkbox */}
                    {comparisonMode && onToggleComparison && (
                      <div className="col-span-2 flex items-center gap-2 pb-1.5 border-b border-dashed border-gray-200 dark:border-gray-700 mb-1.5">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => onToggleComparison(item.id)}
                          className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                        />
                        <span className="text-xs text-muted-foreground">
                          {isSelected ? 'Selected for comparison' : 'Select to compare'}
                        </span>
                      </div>
                    )}
                    
                    {/* Material info - constrained, truncates */}
                    <div className="min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm text-foreground truncate block" title={item.material_name}>
                          {item.material_name}
                        </div>
                        {/* EPD Expiry Warning */}
                        {expiryStatus.status === 'expired' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="destructive" className="h-5 px-1.5 text-xs gap-0.5 flex-shrink-0">
                                <AlertTriangle className="h-3 w-3" />
                                Expired
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold text-red-600">EPD Expired</p>
                              <p className="text-xs">Expired {Math.abs(expiryStatus.daysUntil!)} days ago on {new Date(item.expiry_date!).toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground mt-1">Consider using a material with a valid EPD for compliance.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {expiryStatus.status === 'expiring' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className="h-5 px-1.5 text-xs gap-0.5 bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-100 flex-shrink-0">
                                <Clock className="h-3 w-3" />
                                {expiryStatus.daysUntil}d
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold text-amber-600">EPD Expiring Soon</p>
                              <p className="text-xs">Expires in {expiryStatus.daysUntil} days on {new Date(item.expiry_date!).toLocaleDateString()}</p>
                              <p className="text-xs text-muted-foreground mt-1">Plan to update to a renewed EPD before expiry.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                        <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                          📏 {item.unit}
                          <UnitInfoTooltip unit={item.unit} />
                        </span>
                        
                        {/* Data source badge - ICE materials */}
                        {item.data_source?.includes('ICE') && (
                          <DataSourceAttribution source="ICE" variant="badge" showLogo={false} className="h-5" />
                        )}
                        
                        {/* Regional indicator */}
                        {item.state && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded cursor-help">
                                <MapPin className="h-3 w-3" />
                                {item.state}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="font-semibold">Regional Variant</p>
                              <p className="text-xs text-muted-foreground">
                                This emission factor is specific to {item.state}
                                {item.manufacturer && ` (${item.manufacturer})`}.
                                Regional factors account for local grid carbon intensity.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {/* Process LCA factor (ef_a1a3) */}
                        {hasProcess && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium bg-emerald-50 dark:bg-emerald-950/50 px-1 py-0.5 rounded">
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
                              <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400 font-mono font-medium bg-amber-50 dark:bg-amber-950/50 px-1 py-0.5 rounded">
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
                                className="h-7 w-7 p-0 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/50"
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
                                className="h-7 w-7 p-0 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/50"
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
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/50' 
                                  : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/50'
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
        </ChainedScrollArea>
      </div>
    </TooltipProvider>
  );
}
