import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  FileText,
  TrendingUp,
  Building2,
  Leaf
} from 'lucide-react';
import type { EcoPlatformComplianceReport } from '@/lib/eco-platform-types';

interface ProjectComplianceData {
  id: string;
  name: string;
  location: string | null;
  eco_compliance_enabled: boolean;
  eco_compliance_report: EcoPlatformComplianceReport | null;
  updated_at: string;
}

const EcoComplianceDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectComplianceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const fetchProjectsCompliance = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, location, eco_compliance_enabled, eco_compliance_report, updated_at')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      const processedData: ProjectComplianceData[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        location: p.location,
        eco_compliance_enabled: p.eco_compliance_enabled ?? false,
        eco_compliance_report: p.eco_compliance_report as EcoPlatformComplianceReport | null,
        updated_at: p.updated_at
      }));
      
      setProjects(processedData);
    } catch (err) {
      console.error('Error fetching project compliance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsCompliance();
  }, [user]);

  const refreshAllCompliance = async () => {
    setRefreshing(true);
    
    for (const project of projects.filter(p => p.eco_compliance_enabled)) {
      try {
        await supabase.functions.invoke('validate-eco-compliance', {
          body: { projectId: project.id, saveReport: true }
        });
      } catch (err) {
        console.error(`Error validating project ${project.id}:`, err);
      }
    }
    
    await fetchProjectsCompliance();
    setRefreshing(false);
  };

  // Calculate dashboard metrics
  const enabledProjects = projects.filter(p => p.eco_compliance_enabled);
  const compliantProjects = enabledProjects.filter(p => 
    p.eco_compliance_report?.complianceValidation.isFullyCompliant
  );
  const issuesCount = enabledProjects.reduce((sum, p) => {
    const issues = p.eco_compliance_report?.complianceValidation.nonCompliantItems || [];
    return sum + issues.length;
  }, 0);
  const averageScore = enabledProjects.length > 0
    ? enabledProjects.reduce((sum, p) => sum + (p.eco_compliance_report?.complianceValidation.complianceScore || 0), 0) / enabledProjects.length
    : 0;

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getComplianceBadge = (report: EcoPlatformComplianceReport | null) => {
    if (!report) return <Badge variant="outline">Not Validated</Badge>;
    
    if (report.complianceValidation.isFullyCompliant) {
      return <Badge className="bg-emerald-100 text-emerald-800">Fully Compliant</Badge>;
    }
    
    const score = report.complianceValidation.complianceScore;
    if (score >= 70) {
      return <Badge className="bg-amber-100 text-amber-800">Partially Compliant</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view the ECO Platform compliance dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            ECO Platform Compliance Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            EN 15804+A2 compliance monitoring across all projects
          </p>
        </div>
        <Button 
          onClick={refreshAllCompliance} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Validating...' : 'Refresh All'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {enabledProjects.length} with ECO compliance enabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fully Compliant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {compliantProjects.length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {enabledProjects.length} enabled projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getComplianceColor(averageScore)}`}>
              {averageScore.toFixed(0)}%
            </div>
            <Progress value={averageScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Issues to Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${issuesCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {issuesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              across all projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Project Compliance Status
          </CardTitle>
          <CardDescription>
            Click on a project to view detailed compliance information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No projects found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div 
                  key={project.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedProject === project.id ? 'border-primary bg-muted/50' : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {project.eco_compliance_enabled ? (
                        project.eco_compliance_report?.complianceValidation.isFullyCompliant ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )
                      ) : (
                        <XCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <h3 className="font-semibold">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.location || 'No location set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {project.eco_compliance_enabled && project.eco_compliance_report && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getComplianceColor(project.eco_compliance_report.complianceValidation.complianceScore)}`}>
                            {project.eco_compliance_report.complianceValidation.complianceScore.toFixed(0)}%
                          </div>
                          <p className="text-xs text-muted-foreground">compliance</p>
                        </div>
                      )}
                      {getComplianceBadge(project.eco_compliance_enabled ? project.eco_compliance_report : null)}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedProject === project.id && project.eco_compliance_report && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Standards Compliance */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Leaf className="h-4 w-4" />
                          Standards Compliance
                        </h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>EN 15804+A2</span>
                            {project.eco_compliance_report.standardsCompliance.en15804A2 ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Characterisation Factors</span>
                            {project.eco_compliance_report.characterisationFactors?.version ? (
                              <Badge variant="outline" className="text-xs">
                                {project.eco_compliance_report.characterisationFactors.version}
                              </Badge>
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Issues */}
                      {project.eco_compliance_report.complianceValidation.nonCompliantItems.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            Issues Requiring Attention
                          </h4>
                          <ul className="space-y-1 text-sm">
                            {project.eco_compliance_report.complianceValidation.nonCompliantItems.map((issue: string, idx: number) => (
                              <li key={idx} className="text-muted-foreground flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Quick Stats */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="bg-muted/50 rounded p-3">
                          <div className="text-xs text-muted-foreground">Electricity GWP</div>
                          <div className="font-semibold">
                            {project.eco_compliance_report.energyTransparency?.electricityGwpKgCO2ePerKwh
                              ? `${project.eco_compliance_report.energyTransparency.electricityGwpKgCO2ePerKwh.toFixed(3)} kg CO₂/kWh`
                              : 'Not declared'
                            }
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded p-3">
                          <div className="text-xs text-muted-foreground">Data Quality</div>
                          <div className="font-semibold capitalize">
                            {project.eco_compliance_report.dataQuality?.overallRating || 'Not assessed'}
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded p-3">
                          <div className="text-xs text-muted-foreground">Last Validated</div>
                          <div className="font-semibold">
                            {new Date(project.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/calculator?project=${project.id}`;
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          View in Calculator
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/reports?project=${project.id}`;
                          }}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Standards Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ECO Platform LCA Compliance Standards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">EN 15804+A2 Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Characterisation factors: JRC-EF 3.0 or 3.1</li>
                <li>• Electricity modelling with grid factors</li>
                <li>• Manufacturing site location declaration</li>
                <li>• Data quality assessment (DQR)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Australian Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• National Greenhouse Accounts grid factors</li>
                <li>• State-specific electricity emissions</li>
                <li>• Biogenic carbon reporting</li>
                <li>• Module D calculation transparency</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EcoComplianceDashboard;
