import { Button } from "@/components/ui/button";
import { Package, Layers, Box, Hammer, TreePine, Thermometer, Square, Grid3X3 } from "lucide-react";

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

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Concrete (in-situ)": Box,
  "Steel": Layers,
  "Asphalt": Square,
  "Masonry": Grid3X3,
  "Timber & engineered woods": TreePine,
  "Insulation only": Thermometer,
  "Flooring": Square,
  "Plasterboard": Hammer,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Concrete (in-situ)": "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700",
  "Steel": "bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700",
  "Asphalt": "bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700",
  "Masonry": "bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700",
  "Timber & engineered woods": "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700",
  "Insulation only": "bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700",
  "Flooring": "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700",
  "Plasterboard": "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700",
};

export function MaterialCategoryBrowser({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  totalMaterials 
}: MaterialCategoryBrowserProps) {
  // Show top 8 categories
  const topCategories = categories.slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Browse by Category</span>
        <span className="text-xs text-muted-foreground">{totalMaterials.toLocaleString()} materials</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {topCategories.map(({ category, count }) => {
          const Icon = CATEGORY_ICONS[category] || Package;
          const colorClass = CATEGORY_COLORS[category] || "bg-muted hover:bg-muted/80 border-border text-foreground";
          const isSelected = selectedCategory === category;
          
          return (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => onSelectCategory(isSelected ? null : category)}
              className={`h-auto py-2 px-3 flex items-center gap-2 transition-all ${
                isSelected 
                  ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
                  : colorClass
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium truncate max-w-[100px]">
                {category.replace(" (in-situ)", "").replace(" & engineered woods", "")}
              </span>
              <span className={`text-xs ${isSelected ? "text-primary-foreground/70" : "opacity-60"}`}>
                {count}
              </span>
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectCategory(null)}
          className={`h-auto py-2 px-3 ${!selectedCategory ? "border-primary text-primary" : ""}`}
        >
          View All
        </Button>
      </div>
    </div>
  );
}
