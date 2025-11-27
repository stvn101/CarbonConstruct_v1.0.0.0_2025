import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Database } from "lucide-react";

// Simplified interface that works with local database
interface MaterialItem {
  id: string;
  material_name: string;
  unit: string;
  embodied_carbon_total: number | null;
  data_source?: string | null;
}

interface GroupedMaterials {
  category: string;
  items: MaterialItem[];
}

interface MaterialSearchResultsProps {
  groupedMaterials: GroupedMaterials[];
  onAddMaterial: (materialId: string) => void;
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
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-emerald-50 rounded-lg group transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
                onClick={() => onAddMaterial(item.id)}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="font-medium text-sm text-foreground truncate">
                    {item.material_name}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="inline-flex items-center text-xs text-muted-foreground">
                      📏 {item.unit}
                    </span>
                    <span className="text-xs text-emerald-600 font-mono font-medium">
                      {item.embodied_carbon_total?.toFixed(1)} kgCO₂/{item.unit}
                    </span>
                    {item.data_source && (
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        🏷️ {item.data_source}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 h-8 px-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddMaterial(item.id);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
