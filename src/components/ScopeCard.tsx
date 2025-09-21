import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ScopeCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  scopeNumber: 1 | 2 | 3;
  emissions?: number;
  unit?: string;
  actionUrl: string;
}

export function ScopeCard({ 
  title, 
  description, 
  icon: Icon, 
  scopeNumber, 
  emissions,
  unit = "tCO₂e",
  actionUrl 
}: ScopeCardProps) {
  const scopeColorMap = {
    1: "text-scope-1",
    2: "text-scope-2", 
    3: "text-scope-3"
  };

  const scopeBgMap = {
    1: "bg-scope-1/10 border-scope-1/20",
    2: "bg-scope-2/10 border-scope-2/20",
    3: "bg-scope-3/10 border-scope-3/20"
  };

  return (
    <Card className={`transition-all hover:shadow-lg border ${scopeBgMap[scopeNumber]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${scopeBgMap[scopeNumber]}`}>
              <Icon className={`h-5 w-5 ${scopeColorMap[scopeNumber]}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">{description}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {emissions !== undefined ? (
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${scopeColorMap[scopeNumber]}`}>
                {emissions.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <span className="text-muted-foreground text-sm">No data collected yet</span>
          </div>
        )}
        
        <Button 
          className="w-full" 
          variant={emissions !== undefined ? "outline" : "default"}
          onClick={() => window.location.href = actionUrl}
        >
          {emissions !== undefined ? "View Details" : "Start Calculation"}
        </Button>
      </CardContent>
    </Card>
  );
}