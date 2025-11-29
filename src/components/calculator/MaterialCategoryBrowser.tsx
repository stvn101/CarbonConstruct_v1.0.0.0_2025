import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, Layers, Box, Hammer, TreePine, Thermometer, Square, Grid3X3, 
  Droplets, Paintbrush, Shield, Leaf, Building, Wrench, Zap, CircleDot,
  type LucideIcon 
} from "lucide-react";

interface CategoryCount {
  category: string;
  count: number;
}

interface MaterialCategoryBrowserProps {
  categories: CategoryCount[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  totalMaterials: number;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Concrete": Box,
  "Concrete (in-situ)": Box,
  "Steel": Layers,
  "Asphalt": Square,
  "Masonry": Grid3X3,
  "Timber": TreePine,
  "Timber & engineered woods": TreePine,
  "Insulation": Thermometer,
  "Insulation only": Thermometer,
  "Flooring": Square,
  "Plasterboard": Hammer,
  "Glass": Shield,
  "Aggregates": CircleDot,
  "Cement": Building,
  "Waterproofing": Droplets,
  "Paint": Paintbrush,
  "Aluminium": Wrench,
  "Roofing": Building,
  "Cladding": Building,
  "Electrical": Zap,
  "Plumbing": Droplets,
  "Landscaping": Leaf,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Concrete": "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700",
  "Concrete (in-situ)": "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700",
  "Steel": "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700",
  "Asphalt": "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700",
  "Masonry": "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700",
  "Timber": "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700",
  "Timber & engineered woods": "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700",
  "Insulation": "bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700",
  "Insulation only": "bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700",
  "Flooring": "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
  "Plasterboard": "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
  "Glass": "bg-cyan-50 hover:bg-cyan-100 border-cyan-200 text-cyan-700",
  "Aggregates": "bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700",
  "Cement": "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700",
  "Waterproofing": "bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700",
  "Paint": "bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700",
  "Aluminium": "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700",
  "Roofing": "bg-red-50 hover:bg-red-100 border-red-200 text-red-700",
  "Cladding": "bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700",
  "Electrical": "bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700",
  "Plumbing": "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
  "Landscaping": "bg-green-50 hover:bg-green-100 border-green-200 text-green-700",
};

export function MaterialCategoryBrowser({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  totalMaterials 
}: MaterialCategoryBrowserProps) {
  // Show ALL categories, sorted by count
  const allCategories = categories;

  return (
    <div className="space-y-2 md:space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span className="text-xs md:text-sm font-medium text-muted-foreground">Browse by Category</span>
        <span className="text-xs text-muted-foreground">
          {allCategories.length} categories • {totalMaterials.toLocaleString()} materials
        </span>
      </div>
      
      <ScrollArea className="h-auto max-h-[160px] md:max-h-[200px]">
        <div className="flex flex-wrap gap-1.5 md:gap-2 pr-4">
          {allCategories.map(({ category, count }) => {
            const Icon = CATEGORY_ICONS[category] || Package;
            const colorClass = CATEGORY_COLORS[category] || "bg-muted hover:bg-muted/80 border-border text-foreground";
            const isSelected = selectedCategory === category;
            
            return (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => onSelectCategory(isSelected ? null : category)}
                className={`h-auto py-1 px-2 md:py-1.5 md:px-2.5 flex items-center gap-1 md:gap-1.5 transition-all text-xs ${
                  isSelected 
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
                    : colorClass
                }`}
              >
                <Icon className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                <span className="font-medium truncate max-w-[80px] md:max-w-[120px]">
                  {category}
                </span>
                <span className={`text-xs ${isSelected ? "text-primary-foreground/70" : "opacity-60"}`}>
                  ({count})
                </span>
              </Button>
            );
          })}
          
          {selectedCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectCategory(null)}
              className="h-auto py-1 px-2 md:py-1.5 md:px-2.5 border-destructive/50 text-destructive hover:bg-destructive/10 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
