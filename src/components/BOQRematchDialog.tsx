import { useState, useCallback, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EPDMaterial {
  id: string;
  material_name: string;
  material_category: string;
  unit: string;
  ef_total: number;
  data_source: string;
  manufacturer?: string | null;
}

interface BOQRematchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materialName: string;
  category: string;
  onSelect: (epd: EPDMaterial) => void;
}

export function BOQRematchDialog({
  open,
  onOpenChange,
  materialName,
  category,
  onSelect
}: BOQRematchDialogProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(materialName);
  const [results, setResults] = useState<EPDMaterial[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('materials_epd')
        .select('id, material_name, material_category, unit, ef_total, data_source, manufacturer')
        .or(`material_name.ilike.%${searchTerm}%,material_category.ilike.%${searchTerm}%`)
        .limit(50);

      if (error) throw error;

      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Could not search the materials database",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, toast]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleSelect = useCallback((epd: EPDMaterial) => {
    onSelect(epd);
    onOpenChange(false);
    toast({
      title: "Material matched",
      description: `Matched to: ${epd.material_name}`,
    });
  }, [onSelect, onOpenChange, toast]);

  // Group results by category for easier navigation
  const groupedResults = useMemo(() => {
    const groups: Record<string, EPDMaterial[]> = {};
    results.forEach(r => {
      if (!groups[r.material_category]) {
        groups[r.material_category] = [];
      }
      groups[r.material_category].push(r);
    });
    return groups;
  }, [results]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Match Material to EPD Database</DialogTitle>
          <DialogDescription>
            Search for &quot;{materialName}&quot; in the EPD database to find a better match
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
                autoFocus
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </div>

          {/* Suggested category */}
          {category && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Original category:</span>
              <Badge variant="outline">{category}</Badge>
            </div>
          )}

          {/* Results */}
          <ScrollArea className="h-[400px] border rounded-lg">
            {!hasSearched ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Click Search to find matching materials
              </div>
            ) : isSearching ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : results.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No materials found. Try different search terms.
              </div>
            ) : (
              <div className="p-2 space-y-4">
                {Object.entries(groupedResults).map(([cat, items]) => (
                  <div key={cat}>
                    <div className="text-sm font-medium text-muted-foreground px-2 py-1 sticky top-0 bg-background">
                      {cat} ({items.length})
                    </div>
                    <div className="space-y-1">
                      {items.map((epd) => (
                        <button
                          key={epd.id}
                          onClick={() => handleSelect(epd)}
                          className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{epd.material_name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap mt-1">
                                <span>{epd.unit}</span>
                                {epd.manufacturer && (
                                  <>
                                    <span>•</span>
                                    <span>{epd.manufacturer}</span>
                                  </>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  {epd.data_source}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="font-mono text-sm font-medium">
                                {epd.ef_total.toFixed(2)}
                              </div>
                              <div className="text-xs text-muted-foreground">kgCO₂e</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
