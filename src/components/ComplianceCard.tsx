import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, XCircle, Star, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComplianceRequirement {
  name: string;
  met: boolean;
  value?: number;
  threshold?: number;
  unit?: string;
  stage?: string;
  recommendation?: string;
}

export type ComplianceFramework = 'NCC' | 'GBCA' | 'NABERS' | 'EN15978' | 'CLIMATE_ACTIVE' | 'IS_RATING';

interface ComplianceCardProps {
  framework: ComplianceFramework;
  title: string;
  description: string;
  overallCompliance: 'compliant' | 'partial' | 'non-compliant';
  requirements: ComplianceRequirement[];
  score?: number;
  maxScore?: number;
  rating?: number;
  maxRating?: number;
  level?: string;
  showRecommendations?: boolean;
  compact?: boolean;
}

const FRAMEWORK_COLORS: Record<ComplianceFramework, string> = {
  NCC: 'compliance-ncc',
  GBCA: 'compliance-gbca',
  NABERS: 'compliance-nabers',
  EN15978: 'compliance-en15978',
  CLIMATE_ACTIVE: 'compliance-climateActive',
  IS_RATING: 'compliance-isRating',
};

const FRAMEWORK_LABELS: Record<ComplianceFramework, string> = {
  NCC: 'NCC 2024',
  GBCA: 'Green Star',
  NABERS: 'NABERS',
  EN15978: 'EN 15978',
  CLIMATE_ACTIVE: 'Climate Active',
  IS_RATING: 'IS Rating',
};

export const ComplianceCard = ({
  framework,
  title,
  description,
  overallCompliance,
  requirements,
  score,
  maxScore,
  rating,
  maxRating,
  level,
  showRecommendations = false,
  compact = false,
}: ComplianceCardProps) => {
  const frameworkColor = FRAMEWORK_COLORS[framework];

  const getComplianceColor = () => {
    switch (overallCompliance) {
      case 'compliant':
        return 'text-success';
      case 'partial':
        return 'text-warning';
      case 'non-compliant':
        return 'text-destructive';
    }
  };

  const getComplianceBgColor = () => {
    switch (overallCompliance) {
      case 'compliant':
        return 'bg-success/10 border-success/20';
      case 'partial':
        return 'bg-warning/10 border-warning/20';
      case 'non-compliant':
        return 'bg-destructive/10 border-destructive/20';
    }
  };

  const getComplianceIcon = () => {
    switch (overallCompliance) {
      case 'compliant':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'non-compliant':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusLabel = () => {
    switch (overallCompliance) {
      case 'compliant':
        return 'Compliant';
      case 'partial':
        return 'Partial';
      case 'non-compliant':
        return 'Non-Compliant';
    }
  };

  // Render star rating for NABERS
  const renderStarRating = () => {
    if (rating === undefined || maxRating === undefined) return null;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
            )}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}/{maxRating} Stars</span>
      </div>
    );
  };

  // Render level badge for IS Rating
  const renderLevelBadge = () => {
    if (!level) return null;
    
    const levelColors: Record<string, string> = {
      'Leading': 'bg-success/20 text-success border-success/30',
      'Excellent': 'bg-primary/20 text-primary border-primary/30',
      'Commended': 'bg-warning/20 text-warning border-warning/30',
      'Certified': 'bg-secondary/20 text-secondary border-secondary/30',
      'Not Rated': 'bg-muted text-muted-foreground border-muted',
    };
    
    return (
      <Badge className={cn('font-semibold', levelColors[level] || levelColors['Not Rated'])}>
        {level}
      </Badge>
    );
  };

  const unmetRequirements = requirements.filter(r => !r.met && r.recommendation);

  return (
    <Card className={cn('border-2 transition-all', getComplianceBgColor())}>
      <CardHeader className={compact ? 'pb-2' : undefined}>
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline" 
            className={cn(
              'font-semibold border',
              `bg-${frameworkColor}/10 text-${frameworkColor} border-${frameworkColor}/30`
            )}
            style={{
              backgroundColor: `hsl(var(--${frameworkColor.replace('compliance-', '')}${frameworkColor.includes('-') ? '' : '-blue'}) / 0.1)`,
              color: `hsl(var(--${frameworkColor.replace('compliance-', '')}${frameworkColor.includes('-') ? '' : '-blue'}))`,
              borderColor: `hsl(var(--${frameworkColor.replace('compliance-', '')}${frameworkColor.includes('-') ? '' : '-blue'}) / 0.3)`,
            }}
          >
            {FRAMEWORK_LABELS[framework]}
          </Badge>
          <div className="flex items-center gap-2">
            {level && renderLevelBadge()}
            {getComplianceIcon()}
          </div>
        </div>
        <CardTitle className={compact ? 'text-lg' : 'text-xl'}>{title}</CardTitle>
        {!compact && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn('space-y-4', compact && 'pt-0')}>
        {/* Star Rating for NABERS */}
        {framework === 'NABERS' && renderStarRating()}

        {/* Score Progress */}
        {score !== undefined && maxScore !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Score</span>
              <span className={cn('font-bold', getComplianceColor())}>
                {score} / {maxScore}
              </span>
            </div>
            <Progress 
              value={(score / maxScore) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge className={cn(
            overallCompliance === 'compliant' && 'bg-success text-white',
            overallCompliance === 'partial' && 'bg-warning text-white',
            overallCompliance === 'non-compliant' && 'bg-destructive text-white'
          )}>
            {getStatusLabel()}
          </Badge>
        </div>

        {/* Requirements List */}
        {!compact && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Requirements</h4>
            {requirements.map((req, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-card rounded-lg border">
                {req.met ? (
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{req.name}</span>
                    {req.stage && (
                      <Badge variant="outline" className="text-xs">
                        {req.stage}
                      </Badge>
                    )}
                  </div>
                  {req.value !== undefined && req.threshold !== undefined && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className={req.met ? 'text-success' : 'text-destructive'}>
                        {req.value.toLocaleString()} {req.unit}
                      </span>
                      {' / '}
                      <span>{req.threshold.toLocaleString()} {req.unit} threshold</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations for non-compliant items */}
        {showRecommendations && unmetRequirements.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-semibold text-warning">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {unmetRequirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-warning">•</span>
                  <span>{req.recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
