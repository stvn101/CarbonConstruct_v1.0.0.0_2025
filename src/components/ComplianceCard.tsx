import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface ComplianceRequirement {
  name: string;
  met: boolean;
  value?: number;
  threshold?: number;
  unit?: string;
}

interface ComplianceCardProps {
  framework: 'NCC' | 'GBCA' | 'NABERS';
  title: string;
  description: string;
  overallCompliance: 'compliant' | 'partial' | 'non-compliant';
  requirements: ComplianceRequirement[];
  score?: number;
  maxScore?: number;
}

export const ComplianceCard = ({
  framework,
  title,
  description,
  overallCompliance,
  requirements,
  score,
  maxScore,
}: ComplianceCardProps) => {
  const getComplianceColor = () => {
    switch (overallCompliance) {
      case 'compliant':
        return 'compliance-gbca';
      case 'partial':
        return 'warning';
      case 'non-compliant':
        return 'destructive';
    }
  };

  const getComplianceIcon = () => {
    switch (overallCompliance) {
      case 'compliant':
        return <CheckCircle2 className="h-5 w-5 text-compliance-gbca" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'non-compliant':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getFrameworkColor = () => {
    switch (framework) {
      case 'NCC':
        return 'compliance-ncc';
      case 'GBCA':
        return 'compliance-gbca';
      case 'NABERS':
        return 'compliance-nabers';
    }
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className={`bg-${getFrameworkColor()}/10 text-${getFrameworkColor()} border-${getFrameworkColor()}/20`}>
            {framework}
          </Badge>
          {getComplianceIcon()}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {score !== undefined && maxScore !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Score</span>
              <span className={`font-bold text-${getComplianceColor()}`}>
                {score} / {maxScore}
              </span>
            </div>
            <Progress value={(score / maxScore) * 100} className="h-2" />
          </div>
        )}

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Requirements</h4>
          {requirements.map((req, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              {req.met ? (
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{req.name}</div>
                {req.value !== undefined && req.threshold !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    {req.value.toFixed(1)} {req.unit} / {req.threshold} {req.unit} threshold
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
