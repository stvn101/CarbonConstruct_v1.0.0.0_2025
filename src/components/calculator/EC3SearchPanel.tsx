/**
 * EC3 Search Panel Component
 * 
 * Provides search functionality against the EC3 database.
 * Results are displayed with mandatory attribution and can be
 * selected to copy into the current calculation.
 * 
 * NOTE: Materials are NOT stored - they're fetched on-demand per licensing.
 */

import { useState, useCallback } from "react";
import { Search, Loader2, AlertCircle, Plus, Globe, Building2, Calendar, Scale, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EC3Attribution, EC3MaterialLink } from "./EC3Attribution";

/**
 * EC3 Material Categories per Blueprint specification
 * Using product_classes parameter format for EC3 API
 */
const EC3_CATEGORIES = [
  { id: 'all', label: 'All Categories', ec3Class: '' },
  { id: 'concrete', label: 'Concrete', ec3Class: 'Concrete' },
  { id: 'concrete-readymix', label: 'Concrete - ReadyMix', ec3Class: 'Concrete >> ReadyMix' },
  { id: 'concrete-precast', label: 'Concrete - Precast', ec3Class: 'Concrete >> Precast' },
  { id: 'steel', label: 'Steel', ec3Class: 'Steel' },
  { id: 'steel-structural', label: 'Steel - Structural', ec3Class: 'Steel >> StructuralSteel' },
  { id: 'steel-reinforcing', label: 'Steel - Reinforcing', ec3Class: 'Steel >> SteelRebar' },
  { id: 'timber', label: 'Timber', ec3Class: 'Timber' },
  { id: 'timber-softwood', label: 'Timber - Softwood', ec3Class: 'Timber >> SoftwoodLumber' },
  { id: 'timber-hardwood', label: 'Timber - Hardwood', ec3Class: 'Timber >> HardwoodLumber' },
  { id: 'insulation', label: 'Insulation', ec3Class: 'Insulation' },
  { id: 'aluminium', label: 'Aluminium', ec3Class: 'Aluminum' },
  { id: 'glass', label: 'Glass', ec3Class: 'Glass' },
  { id: 'masonry', label: 'Masonry', ec3Class: 'Masonry' },
  { id: 'masonry-brick', label: 'Masonry - Brick', ec3Class: 'Masonry >> ClayMasonryBrick' },
  { id: 'masonry-cmu', label: 'Masonry - CMU', ec3Class: 'Masonry >> CMU' },
  { id: 'roofing', label: 'Roofing', ec3Class: 'Roofing' },
  { id: 'cladding', label: 'Cladding', ec3Class: 'Cladding' },
  { id: 'flooring', label: 'Flooring', ec3Class: 'Flooring' },
];

// EC3 Types - defined locally to avoid module resolution issues
interface EC3Category {
  id: string;
  display_name: string;
}

interface EC3GeographicScope {
  country?: string;
  state?: string;
}

interface EC3EnvironmentalImpact {
  gwp_per_declared_unit: number;
  declared_unit: string;
  gwp_a1a2a3?: number;
  gwp_a4?: number;
  gwp_a5?: number;
  gwp_c?: number;
  gwp_d?: number;
}

interface EC3Material {
  id: string;
  name: string;
  product_name?: string;
  category?: EC3Category;
  manufacturer?: string;
  manufacturer_name?: string;
  epd_number?: string;
  epd_url?: string;
  date_of_issue?: string;
  date_of_expiry?: string;
  gwp: number;
  declared_unit: string;
  impacts?: EC3EnvironmentalImpact;
  geographic_scope?: EC3GeographicScope;
  ec3_url?: string;
}

interface EC3SearchResponse {
  results: EC3Material[];
  total_count: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export interface EC3ConvertedMaterial {
  id: string;
  name: string;
  category: string;
  unit: string;
  factor: number;
  source: 'EC3';
  isCustom: false;
  quantity: number;
  ec3_id: string;
  ec3_url?: string;
  epdNumber?: string;
  epdUrl?: string;
  manufacturer?: string;
  publishDate?: string;
  expiryDate?: string;
  ef_a1a3?: number;
  ef_a4?: number;
  ef_a5?: number;
  ef_c1c4?: number;
  ef_d?: number;
}

function convertEC3Material(ec3Material: EC3Material): EC3ConvertedMaterial {
  return {
    id: `ec3_${ec3Material.id}_${Date.now()}`,
    name: ec3Material.product_name || ec3Material.name,
    category: ec3Material.category?.display_name || 'Uncategorized',
    unit: ec3Material.declared_unit || 'kg',
    factor: ec3Material.gwp || 0,
    source: 'EC3',
    isCustom: false,
    quantity: 0,
    ec3_id: ec3Material.id,
    ec3_url: ec3Material.ec3_url,
    epdNumber: ec3Material.epd_number,
    epdUrl: ec3Material.epd_url,
    manufacturer: ec3Material.manufacturer_name || ec3Material.manufacturer,
    publishDate: ec3Material.date_of_issue,
    expiryDate: ec3Material.date_of_expiry,
    ef_a1a3: ec3Material.impacts?.gwp_a1a2a3,
    ef_a4: ec3Material.impacts?.gwp_a4,
    ef_a5: ec3Material.impacts?.gwp_a5,
    ef_c1c4: ec3Material.impacts?.gwp_c,
    ef_d: ec3Material.impacts?.gwp_d,
  };
}

interface EC3SearchPanelProps {
  onAddMaterial: (material: EC3ConvertedMaterial) => void;
  disabled?: boolean;
}

export function EC3SearchPanel({ onAddMaterial, disabled = false }: EC3SearchPanelProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [results, setResults] = useState<EC3Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const handleSearch = useCallback(async () => {
    // Allow category-only search or text search
    const hasCategory = selectedCategory && selectedCategory !== 'all';
    if (!query.trim() && !hasCategory) {
      toast({ 
        title: "Search required", 
        description: "Please enter a search term or select a category",
        variant: "destructive" 
      });
      return;
    }

    if (query.trim() && query.trim().length < 2) {
      toast({ 
        title: "Search query too short", 
        description: "Please enter at least 2 characters",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Build request body with optional category
      const requestBody: Record<string, unknown> = {
        page_size: 25,
      };

      if (query.trim()) {
        requestBody.query = query.trim();
      }

      // Add category filter if selected (not 'all')
      if (selectedCategory && selectedCategory !== 'all') {
        const categoryConfig = EC3_CATEGORIES.find(c => c.id === selectedCategory);
        if (categoryConfig?.ec3Class) {
          requestBody.category = categoryConfig.ec3Class;
        }
      }

      const { data, error: fnError } = await supabase.functions.invoke('search-ec3-materials', {
        body: requestBody
      });

      if (fnError) {
        // Try to extract detailed error from function response
        const errorMessage = fnError.message || 'Failed to search EC3';
        throw new Error(errorMessage);
      }

      if (data?.error) {
        // Handle specific EC3 API errors with detailed rate limit info
        if (data.status_code === 429 || data.error.includes('rate limit') || data.error.includes('Rate limit')) {
          const resetTime = data.rate_limit_reset 
            ? new Date(data.rate_limit_reset).toLocaleTimeString()
            : 'soon';
          setError(`EC3 rate limit exceeded. Try again at ${resetTime}.`);
        } else if (data.error.includes('API key') || data.status_code === 401) {
          setError('EC3 API key not configured. Please add your EC3 API key in settings.');
        } else if (data.status_code === 403 && data.upgrade_required) {
          setError('EC3 Global Database requires a Pro subscription. Upgrade to access 90,000+ EPDs.');
        } else {
          setError(data.error);
        }
        setResults([]);
        setTotalCount(0);
        return;
      }

      const response = data as EC3SearchResponse;
      setResults(response.results || []);
      setTotalCount(response.total_count || 0);

      if (response.results?.length === 0) {
        toast({ 
          title: "No results found", 
          description: "Try a different search term or category" 
        });
      }
    } catch (err) {
      console.error('EC3 search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [query, selectedCategory, toast]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSearch();
    }
  };

  const handleAddMaterial = (ec3Material: EC3Material) => {
    const converted = convertEC3Material(ec3Material);
    onAddMaterial(converted);
    toast({
      title: "Material added",
      description: `${converted.name} added from EC3. Set quantity to calculate emissions.`,
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    try {
      return new Date(expiryDate) < new Date();
    } catch {
      return false;
    }
  };

  /**
   * Safely format GWP values - handles strings, numbers, null/undefined
   * EC3 API sometimes returns GWP as strings instead of numbers
   */
  const formatGwp = (gwp: unknown): string => {
    if (gwp === null || gwp === undefined) return '—';
    const numValue = typeof gwp === 'number' ? gwp : parseFloat(String(gwp));
    return isNaN(numValue) ? '—' : numValue.toFixed(2);
  };

  return (
    <div className="space-y-4">
      {/* Search Input with Category Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Category Dropdown */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={disabled || loading}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {EC3_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search EC3 materials (e.g., 32 MPa, low carbon)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || loading}
            className="pl-9"
          />
        </div>
        
        <Button 
          onClick={handleSearch} 
          disabled={disabled || loading || (!query.trim() && (!selectedCategory || selectedCategory === 'all'))}
          className="min-w-[100px] cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {/* EC3 Attribution - always visible when panel is open */}
      <div className="flex items-center justify-between">
        <EC3Attribution variant="badge" />
        {searched && totalCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {totalCount.toLocaleString()} materials found
          </span>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Search Error</p>
            <p className="text-xs opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {searched && !error && (
        <ScrollArea className="h-[400px] border rounded-lg">
          {results.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">No materials found</p>
              <p className="text-xs">Try different keywords or select a category</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {results.map((material) => (
                <Card 
                  key={material.id} 
                  className={`p-3 hover:bg-muted/50 transition-colors ${
                    isExpired(material.date_of_expiry) ? 'opacity-60 border-amber-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Material Name & Category */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {material.product_name || material.name}
                        </h4>
                        {material.category?.display_name && (
                          <Badge variant="secondary" className="text-xs">
                            {material.category.display_name}
                          </Badge>
                        )}
                        {isExpired(material.date_of_expiry) && (
                          <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                            Expired
                          </Badge>
                        )}
                      </div>

                      {/* Manufacturer */}
                      {(material.manufacturer_name || material.manufacturer) && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">
                            {material.manufacturer_name || material.manufacturer}
                          </span>
                        </div>
                      )}

                      {/* Geographic Scope */}
                      {material.geographic_scope?.country && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <Globe className="h-3 w-3" />
                          <span>
                            {material.geographic_scope.state 
                              ? `${material.geographic_scope.state}, ${material.geographic_scope.country}`
                              : material.geographic_scope.country
                            }
                          </span>
                        </div>
                      )}

                      {/* EPD Number & Dates */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {material.epd_number && (
                          <span className="font-mono">{material.epd_number}</span>
                        )}
                        {material.date_of_expiry && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Expires: {formatDate(material.date_of_expiry)}</span>
                          </div>
                        )}
                      </div>

                      {/* EC3 Link */}
                      {material.ec3_url && (
                        <EC3MaterialLink 
                          ec3Id={material.id} 
                          ec3Url={material.ec3_url} 
                          className="mt-1"
                        />
                      )}
                    </div>

                    {/* GWP Value & Add Button */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Scale className="h-3.5 w-3.5" />
                          <span>{formatGwp(material.gwp)}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          kgCO₂e/{material.declared_unit || 'unit'}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddMaterial(material)}
                        className="h-8 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-lg bg-muted/20">
          <Globe className="h-12 w-12 mb-3 opacity-30" />
          <p className="font-medium">Search the EC3 Global EPD Database</p>
          <p className="text-xs max-w-md mt-1">
            Access thousands of Environmental Product Declarations from manufacturers worldwide.
            Materials are fetched in real-time and not stored locally.
          </p>
        </div>
      )}

      {/* Footer Attribution - always visible per licensing requirements */}
      <EC3Attribution variant="footer" className="mt-4" />

      {/* Attribution Footer */}
      <EC3Attribution variant="footer" />
    </div>
  );
}
