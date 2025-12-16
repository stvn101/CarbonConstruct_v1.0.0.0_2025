import { memo, useMemo } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface BOQProcessingStatusProps {
  progress: number;
  status: string;
  error?: string | null;
}

export const BOQProcessingStatus = memo(({
  progress,
  status,
  error
}: BOQProcessingStatusProps) => {
  const isComplete = progress === 100 && !error;
  const hasError = !!error;

  const processingSteps = useMemo(() => [
    { step: 'Uploading file', threshold: 30 },
    { step: 'Parsing document structure', threshold: 60 },
    { step: 'Extracting materials data', threshold: 80 },
    { step: 'Matching to EPD database', threshold: 100 },
  ], []);

  return (
    <Card className={cn(
      'border-2 transition-colors',
      hasError && 'border-destructive',
      isComplete && 'border-green-500'
    )}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {hasError ? (
            <XCircle className="h-8 w-8 text-destructive animate-in fade-in" aria-hidden="true" />
          ) : isComplete ? (
            <CheckCircle2 className="h-8 w-8 text-green-500 animate-in fade-in" aria-hidden="true" />
          ) : (
            <Loader2 className="h-8 w-8 text-primary animate-spin" aria-hidden="true" />
          )}
          <div>
            <CardTitle>
              {hasError ? 'Processing Failed' : isComplete ? 'Processing Complete' : 'Processing BOQ File'}
            </CardTitle>
            <CardDescription>
              {hasError ? error : status}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {!hasError && (
        <CardContent>
          <div className="space-y-3">
            <Progress
              value={progress}
              className="h-3"
              aria-label={`Processing progress: ${progress}%`}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{status}</span>
              <span className="font-medium">{progress}%</span>
            </div>

            {/* Processing Steps */}
            <div className="mt-6 space-y-2" role="list" aria-label="Processing steps">
              {processingSteps.map((item, index) => {
                const previousThreshold = index > 0 ? processingSteps[index - 1].threshold : 0;
                return (
                  <ProcessingStep
                    key={item.step}
                    step={item.step}
                    completed={progress >= item.threshold}
                    active={progress >= previousThreshold && progress < item.threshold}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
});

BOQProcessingStatus.displayName = 'BOQProcessingStatus';

interface ProcessingStepProps {
  step: string;
  completed: boolean;
  active: boolean;
}

const ProcessingStep = memo(({ step, completed, active }: ProcessingStepProps) => (
  <div className="flex items-center gap-3" role="listitem">
    <div
      className={cn(
        'h-2 w-2 rounded-full transition-colors',
        completed && 'bg-green-500',
        active && !completed && 'bg-primary animate-pulse',
        !active && !completed && 'bg-muted-foreground/30'
      )}
      aria-hidden="true"
    />
    <span className={cn(
      'text-sm transition-colors',
      completed && 'text-green-600 font-medium',
      active && !completed && 'text-foreground font-medium',
      !active && !completed && 'text-muted-foreground'
    )}>
      {step}
    </span>
    {completed && (
      <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" aria-label="Completed" />
    )}
  </div>
));

ProcessingStep.displayName = 'ProcessingStep';
