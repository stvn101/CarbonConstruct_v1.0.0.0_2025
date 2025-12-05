import { memo } from 'react';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, TrendingDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const CalculationHistory = memo(() => {
  const { history, loading } = useCalculationHistory(5);

  if (loading) {
    return (
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Clock className="h-4 w-4 md:h-5 md:w-5" />
            Recent Calculations
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Loading history...</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <Clock className="h-4 w-4 md:h-5 md:w-5" />
            Recent Calculations
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">Your calculation history</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
          <div className="text-center py-6 text-muted-foreground">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No calculations yet</p>
            <p className="text-xs">Start using the calculator to see your history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Recent Calculations
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">Your latest carbon assessments</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0 space-y-3">
        {history.map((calc, index) => (
          <div
            key={calc.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm md:text-base">
                  {calc.totalEmissions.toFixed(1)} tCO₂e
                </span>
                {calc.isDraft && (
                  <Badge variant="outline" className="text-xs">Draft</Badge>
                )}
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="text-scope1">S1: {calc.scope1.toFixed(1)}</span>
                <span className="text-scope2">S2: {calc.scope2.toFixed(1)}</span>
                <span className="text-scope3">S3: {calc.scope3.toFixed(1)}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(calc.updatedAt, { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

CalculationHistory.displayName = 'CalculationHistory';
