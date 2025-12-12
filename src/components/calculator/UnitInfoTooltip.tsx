import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface UnitInfoTooltipProps {
  unit: string;
  className?: string;
}

const unitExplanations: Record<string, { title: string; description: string; conversion?: string }> = {
  kg: {
    title: "Per Kilogram",
    description: "Emission factor is calculated per kilogram of material.",
    conversion: "For tonnes, multiply quantity by 1000."
  },
  tonne: {
    title: "Per Tonne",
    description: "Emission factor is calculated per metric tonne (1000 kg).",
    conversion: "For kg quantities, divide by 1000 first."
  },
  t: {
    title: "Per Tonne",
    description: "Emission factor is calculated per metric tonne (1000 kg).",
    conversion: "For kg quantities, divide by 1000 first."
  },
  "m³": {
    title: "Per Cubic Metre",
    description: "Emission factor is per volume. Used for bulk materials like concrete, aggregates, and liquids.",
    conversion: "Convert weight using material density if needed."
  },
  m3: {
    title: "Per Cubic Metre",
    description: "Emission factor is per volume. Used for bulk materials like concrete, aggregates, and liquids.",
    conversion: "Convert weight using material density if needed."
  },
  "m²": {
    title: "Per Square Metre",
    description: "Emission factor is per area coverage. Used for panels, sheets, flooring, and coatings.",
    conversion: "Measure the installed surface area."
  },
  m2: {
    title: "Per Square Metre",
    description: "Emission factor is per area coverage. Used for panels, sheets, flooring, and coatings.",
    conversion: "Measure the installed surface area."
  },
  m: {
    title: "Per Linear Metre",
    description: "Emission factor is per length. Used for pipes, cables, and linear elements.",
    conversion: "Measure the installed length."
  },
  unit: {
    title: "Per Unit/Item",
    description: "Emission factor is per individual item or component.",
    conversion: "Count the number of items installed."
  },
  each: {
    title: "Per Unit/Item",
    description: "Emission factor is per individual item or component.",
    conversion: "Count the number of items installed."
  },
  L: {
    title: "Per Litre",
    description: "Emission factor is per litre of liquid material.",
    conversion: "For m³, multiply by 1000."
  },
  kL: {
    title: "Per Kilolitre",
    description: "Emission factor is per 1000 litres.",
    conversion: "For litres, divide by 1000."
  }
};

export function UnitInfoTooltip({ unit, className }: UnitInfoTooltipProps) {
  const normalizedUnit = unit?.toLowerCase().trim() || "";
  const info = unitExplanations[unit] || unitExplanations[normalizedUnit] || {
    title: `Per ${unit}`,
    description: `Emission factor is calculated per ${unit} of material.`
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-1 cursor-help ${className}`}>
          <Info className="h-3 w-3 text-muted-foreground" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-semibold">{info.title}</p>
        <p className="text-xs text-muted-foreground">{info.description}</p>
        {info.conversion && (
          <p className="text-xs text-primary mt-1">💡 {info.conversion}</p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
