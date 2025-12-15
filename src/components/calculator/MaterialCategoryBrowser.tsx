
import { Button } from "@/components/ui/button";
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
  "Concrete": "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200",
  "Concrete (in-situ)": "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200",
  "Steel": "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200",
  "Asphalt": "bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200",
  "Masonry": "bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
  "Timber": "bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
  "Timber & engineered woods": "bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
  "Insulation": "bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/50 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300",
  "Insulation only": "bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/50 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300",
  "Flooring": "bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  "Plasterboard": "bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
  "Glass": "bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300",
  "Aggregates": "bg-yellow-50 dark:bg-yellow-950/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300",
  "Cement": "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200",
  "Waterproofing": "bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300",
  "Paint": "bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
  "Aluminium": "bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300",
  "Roofing": "bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300",
  "Cladding": "bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300",
  "Electrical": "bg-yellow-50 dark:bg-yellow-950/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300",
  "Plumbing": "bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
  "Landscaping": "bg-green-50 dark:bg-green-950/50 hover:bg-green-100 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
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
      
      <div className="max-h-[280px] md:max-h-[240px] overflow-y-auto">
        <div className="flex flex-wrap gap-1.5 md:gap-2 pr-4 pb-2">
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
      </div>
    </div>
  );
}
