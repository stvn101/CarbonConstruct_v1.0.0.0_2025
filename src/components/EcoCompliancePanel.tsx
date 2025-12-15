/**
 * ECO Platform Compliance Validation Panel
 * Displays real-time compliance status against ECO Platform LCA Calculation Rules V2.0
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  Leaf,
  Factory,
  Recycle,
  Database,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { EcoPlatformComplianceReport } from '@/lib/eco-platform-types';

interface ComplianceRequirement {
  id: string;
  name: string;
  section: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'not-applicable';
  details?: string;
  icon: React.ReactNode;
}

interface EcoCompliancePanelProps {
  complianceReport: EcoPlatformComplianceReport | null;
  isLoading?: boolean;
}

export function EcoCompliancePanel({ 
  complianceReport,
  isLoading = false
}: EcoCompliancePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5" />
            ECO Platform Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!complianceReport) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5" />
            ECO Platform Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable ECO Platform compliance mode to validate against LCA Calculation Rules V2.0
          </p>
        </CardContent>
      </Card>
    );
  }

  const requirements: ComplianceRequirement[] = [
    {
      id: 'electricity',
      name: 'Electricity Modelling',
      section: '2.5.1',
      description: 'Sub-national grid factors and GWP declaration',
      status: complianceReport.energyTransparency.electricityPercentageOfA1A3 <= 30 || 
              complianceReport.energyTransparency.electricityGwpKgCO2ePerKwh !== null 
              ? 'pass' : 'fail',
      details: `${complianceReport.energyTransparency.electricityModellingApproach} approach, ${complianceReport.energyTransparency.electricityPercentageOfA1A3.toFixed(1)}% of A1-A3`,
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'mass-balance',
      name: 'Mass Balance Prohibition',
      section: '2.4',
      description: 'No mass balance or book-and-claim methods',
      status: !complianceReport.complianceValidation.nonCompliantItems.some(
        item => item.toLowerCase().includes('mass balance')
      ) ? 'pass' : 'fail',
      icon: <AlertCircle className="w-4 h-4" />
    },
    {
      id: 'co-products',
      name: 'Co-Product Allocation',
      section: '2.6.1',
      description: 'Economic allocation for slag, fly ash, silica fume',
      status: complianceReport.allocationStatement.economicAllocationForSlagFlyAsh ? 'pass' : 
              complianceReport.allocationStatement.coProductsPresent ? 'fail' : 'not-applicable',
      icon: <Factory className="w-4 h-4" />
    },
    {
      id: 'biogenic',
      name: 'Biogenic Carbon',
      section: '2.11',
      description: 'Declared in kg C (and kg CO2-e if >5%)',
      status: complianceReport.biogenicCarbon.totalBiogenicCarbonKgC >= 0 ? 'pass' : 'warning',
      details: `${complianceReport.biogenicCarbon.totalBiogenicCarbonKgC.toFixed(2)} kg C total`,
      icon: <Leaf className="w-4 h-4" />
    },
    {
      id: 'characterisation',
      name: 'Characterisation Factors',
      section: '2.9',
      description: 'JRC EF 3.0 or 3.1 only',
      status: ['JRC-EF-3.0', 'JRC-EF-3.1'].includes(complianceReport.characterisationFactors.version) 
              ? 'pass' : 'fail',
      details: complianceReport.characterisationFactors.version,
      icon: <Database className="w-4 h-4" />
    },
    {
      id: 'ecoinvent',
      name: 'Ecoinvent Methodology',
      section: '2.8',
      description: 'Cut-off by classification [100:0] only',
      status: !complianceReport.complianceValidation.nonCompliantItems.some(
        item => item.toLowerCase().includes('ecoinvent')
      ) ? 'pass' : 'fail',
      icon: <Database className="w-4 h-4" />
    },
    {
      id: 'module-d',
      name: 'Module D',
      section: '2.13',
      description: 'No multi-recycling effects',
      status: !complianceReport.complianceValidation.nonCompliantItems.some(
        item => item.toLowerCase().includes('multi-recycling')
      ) ? 'pass' : 'fail',
      icon: <Recycle className="w-4 h-4" />
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing Location',
      section: '2.12',
      description: 'Country and city level',
      status: complianceReport.manufacturingLocations.length > 0 ? 'pass' : 'warning',
      details: `${complianceReport.manufacturingLocations.length} site(s) documented`,
      icon: <Globe className="w-4 h-4" />
    },
    {
      id: 'data-quality',
      name: 'Data Quality',
      section: '2.7',
      description: 'EN 15941 requirements',
      status: ['A', 'B', 'C'].includes(complianceReport.dataQuality.overallRating) ? 'pass' : 'warning',
      details: `Rating: ${complianceReport.dataQuality.overallRating}`,
      icon: <CheckCircle className="w-4 h-4" />
    }
  ];

  const passCount = requirements.filter(r => r.status === 'pass').length;
  const failCount = requirements.filter(r => r.status === 'fail').length;
  const warningCount = requirements.filter(r => r.status === 'warning').length;
  const applicableCount = requirements.filter(r => r.status !== 'not-applicable').length;

  const getStatusIcon = (status: ComplianceRequirement['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'fail':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'not-applicable':
        return <div className="w-4 h-4 rounded-full bg-muted" />;
    }
  };

  const getStatusBadge = (status: ComplianceRequirement['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive" className="text-xs">Fail</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">Warning</Badge>;
      case 'not-applicable':
        return <Badge variant="outline" className="text-muted-foreground text-xs">N/A</Badge>;
    }
  };

  return (
    <Card className="bg-background border-border shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-5 h-5" />
            ECO Platform Compliance
          </CardTitle>
          <Badge 
            variant={complianceReport.complianceValidation.isFullyCompliant ? 'default' : 'destructive'}
            className={cn(
              complianceReport.complianceValidation.isFullyCompliant && 'bg-emerald-500 hover:bg-emerald-600'
            )}
          >
            {complianceReport.complianceValidation.complianceScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        {complianceReport.complianceValidation.isFullyCompliant ? (
          <Alert className="bg-emerald-500/10 border-emerald-500/20">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <AlertTitle className="text-emerald-700 dark:text-emerald-400">Fully Compliant</AlertTitle>
            <AlertDescription className="text-emerald-600 dark:text-emerald-300">
              All calculations meet ECO Platform LCA Calculation Rules V2.0
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertTitle>Compliance Issues Found</AlertTitle>
            <AlertDescription>
              {failCount} requirement(s) not met, {warningCount} warning(s)
            </AlertDescription>
          </Alert>
        )}

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Compliance Progress</span>
            <span className="font-medium">{passCount}/{applicableCount} requirements</span>
          </div>
          <Progress 
            value={(passCount / applicableCount) * 100} 
            className="h-2"
          />
        </div>

        {/* Expandable requirements list */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>View all requirements</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-2 pt-2 border-t border-border">
            {requirements.map((req) => (
              <div 
                key={req.id}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg",
                  req.status === 'fail' && "bg-destructive/5",
                  req.status === 'warning' && "bg-amber-500/5",
                  req.status === 'pass' && "bg-emerald-500/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground">{req.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{req.name}</span>
                      <span className="text-xs text-muted-foreground">§{req.section}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{req.description}</p>
                    {req.details && (
                      <p className="text-xs text-foreground/70 mt-0.5">{req.details}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(req.status)}
                  {getStatusIcon(req.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Non-compliant items */}
        {complianceReport.complianceValidation.nonCompliantItems.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-sm font-medium text-destructive">Issues to Resolve:</h4>
            <ul className="space-y-1">
              {complianceReport.complianceValidation.nonCompliantItems.map((item, i) => (
                <li key={i} className="text-xs text-destructive/80 flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {complianceReport.complianceValidation.warnings.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-sm font-medium text-amber-600">Warnings:</h4>
            <ul className="space-y-1">
              {complianceReport.complianceValidation.warnings.map((warning, i) => (
                <li key={i} className="text-xs text-amber-600/80 flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Standards declaration */}
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          <p className="font-medium mb-1">Standards Compliance:</p>
          <div className="flex flex-wrap gap-1">
            {complianceReport.standardsCompliance.en15804A2 && (
              <Badge variant="outline" className="text-xs">EN 15804+A2</Badge>
            )}
            {complianceReport.standardsCompliance.ecoPlatformV2 && (
              <Badge variant="outline" className="text-xs">ECO Platform V2.0</Badge>
            )}
            {complianceReport.standardsCompliance.iso14025 && (
              <Badge variant="outline" className="text-xs">ISO 14025</Badge>
            )}
            {complianceReport.standardsCompliance.iso21930 && (
              <Badge variant="outline" className="text-xs">ISO 21930</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
