import { MapPin, Info, Factory, Zap, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RegionalVariantTooltipProps {
  state?: string | null;
  manufacturer?: string | null;
  plantLocation?: string | null;
}

export function RegionalVariantTooltip({ state, manufacturer, plantLocation }: RegionalVariantTooltipProps) {
  const hasRegionalData = state || manufacturer || plantLocation;

  if (!hasRegionalData) return null;

  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
      <MapPin className="h-3 w-3" />
      {state || "Regional"}
    </span>
  );
}

export function WhyFactorsVaryDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
          <Info className="h-3 w-3 mr-1" />
          Why do emission factors vary?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Understanding Regional Emission Factor Variations</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            The same material can have different emission factors depending on where and how it's manufactured. 
            Here's why:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Factory className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Manufacturing Plant Location</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Australian plants have different efficiency levels. A cement plant in QLD may have different emissions 
                  than one in VIC due to equipment age and process efficiency.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="h-8 w-8 rounded bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Zap className="h-4 w-4 text-amber-700" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Energy Grid Carbon Intensity</p>
                <p className="text-xs text-muted-foreground mt-1">
                  SA and TAS have cleaner grids (more renewables) than VIC or NSW. 
                  Products made with cleaner electricity have lower Scope 2 emissions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="h-8 w-8 rounded bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Recycle className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Recycled Content & Raw Materials</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Steel with 90% recycled content has ~60% lower emissions than virgin steel. 
                  Source materials (local vs imported) also affect transport emissions.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
            <p className="font-medium text-foreground mb-1 flex items-center">
              <Zap className="h-4 w-4 text-primary mr-2" aria-hidden="true" />
              Best Practice
            </p>
            <p className="text-xs text-muted-foreground">
              When available, select the material variant that matches your actual supplier's location 
              for the most accurate carbon assessment. Look for manufacturer-specific EPDs.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
