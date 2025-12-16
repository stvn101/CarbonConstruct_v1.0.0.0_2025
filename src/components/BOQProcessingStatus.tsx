import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, FileText, Sparkles, Database } from "lucide-react";

type ProcessingStage = "uploading" | "parsing" | "matching" | "complete";

interface BOQProcessingStatusProps {
  stage: ProcessingStage;
  progress: number;
  fileName?: string;
  materialsFound?: number;
  materialsMatched?: number;
}

export function BOQProcessingStatus({
  stage,
  progress,
  fileName,
  materialsFound = 0,
  materialsMatched = 0,
}: BOQProcessingStatusProps) {
  const stages = [
    {
      id: "uploading",
      label: "Uploading File",
      icon: FileText,
      description: "Transferring your BOQ file to secure storage",
    },
    {
      id: "parsing",
      label: "Parsing BOQ",
      icon: Sparkles,
      description: "Extracting materials using AI",
    },
    {
      id: "matching",
      label: "Matching EPDs",
      icon: Database,
      description: "Finding environmental product declarations",
    },
    {
      id: "complete",
      label: "Complete",
      icon: CheckCircle2,
      description: "Ready for review",
    },
  ];

  const currentStageIndex = stages.findIndex((s) => s.id === stage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Processing BOQ File
        </CardTitle>
        <CardDescription>
          {fileName && `Processing: ${fileName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {stages.map((stageItem, index) => {
            const Icon = stageItem.icon;
            const isActive = index === currentStageIndex;
            const isComplete = index < currentStageIndex;
            const isFuture = index > currentStageIndex;

            return (
              <div
                key={stageItem.id}
                className={`flex items-start gap-3 ${isFuture ? "opacity-50" : ""}`}
              >
                <div
                  className={`rounded-full p-2 ${
                    isComplete
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`}
                  />
                </div>
                <div className="flex-1 pt-1">
                  <p className="font-medium text-sm">{stageItem.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {stageItem.description}
                  </p>
                </div>
                {isComplete && (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-1" />
                )}
                {isActive && (
                  <Loader2 className="h-5 w-5 text-primary animate-spin mt-1" />
                )}
              </div>
            );
          })}
        </div>

        {(materialsFound > 0 || materialsMatched > 0) && (
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Materials Found</span>
              <span className="font-medium">{materialsFound}</span>
            </div>
            {materialsMatched > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">EPDs Matched</span>
                <span className="font-medium">{materialsMatched}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
