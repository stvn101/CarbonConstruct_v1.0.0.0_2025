import { useEffect, useRef } from "react";
import embed, { VisualizationSpec } from "vega-embed";

interface VegaChartProps {
  spec: VisualizationSpec;
  className?: string;
}

/**
 * VegaChart - A reusable chart wrapper with Eco-Glass Futurism theming
 * Uses transparent backgrounds and neon green accents for dark mode
 */
export default function VegaChart({ spec, className }: VegaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      embed(containerRef.current, spec, {
        mode: "vega-lite",
        actions: false,
        theme: "dark",
        renderer: "svg",
        config: {
          background: "transparent",
          view: { stroke: "transparent" },
          axis: {
            domainColor: "rgba(255, 255, 255, 0.2)",
            gridColor: "rgba(255, 255, 255, 0.1)",
            labelColor: "rgba(255, 255, 255, 0.7)",
            titleColor: "rgba(255, 255, 255, 0.9)",
            labelFont: "Inter, sans-serif",
            titleFont: "Space Grotesk, sans-serif",
          },
          legend: {
            labelColor: "rgba(255, 255, 255, 0.7)",
            titleColor: "rgba(255, 255, 255, 0.9)",
            labelFont: "Inter, sans-serif",
            titleFont: "Space Grotesk, sans-serif",
          },
          title: {
            color: "rgba(255, 255, 255, 0.9)",
            font: "Space Grotesk, sans-serif",
          },
        },
      }).catch(console.error);
    }
  }, [spec]);

  return <div ref={containerRef} className={className} />;
}
