import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PDFReport, ReportBranding } from '@/components/PDFReport';
import { useReportData, validateReportData, calculateDataCompleteness } from '@/components/ReportData';
import { useProject } from '@/contexts/ProjectContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { UpgradeModal } from '@/components/UpgradeModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReportErrorBoundary } from '@/components/ReportErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileBarChart, 
  Download, 
  CheckCircle,
  AlertCircle, 
  TrendingUp,
  Factory,
  Zap,
  Truck,
  Building2,
  Star,
  Award,
  Crown,
  FileText,
  Building,
  User,
  Mail
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export type ReportTemplate = 'executive' | 'technical' | 'compliance';

const Reports = () => {
  const { currentProject } = useProject();
  const reportData = useReportData();
  const { canPerformAction, trackUsage, currentUsage } = useUsageTracking();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>('technical');
  const [branding, setBranding] = useState<ReportBranding>(() => {
    try {
      const stored = localStorage.getItem('reportBranding');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Save branding to localStorage when it changes
  const updateBranding = (field: keyof ReportBranding, value: string) => {
    const updated = { ...branding, [field]: value };
    setBranding(updated);
    localStorage.setItem('reportBranding', JSON.stringify(updated));
  };

  const handleDownloadReport = async () => {
    const limitCheck = canPerformAction('reports_per_month');
    
    if (!limitCheck.allowed) {
      setUpgradeModalOpen(true);
      return;
    }

    // Track the usage
    trackUsage({ metricType: 'reports_per_month' });
    
    // Generate and download the PDF
    const element = document.getElementById('pdf-report-content');
    if (element) {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf()
        .set({
          margin: 10,
          filename: `${currentProject?.name || 'project'}-carbon-report.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();

      // Send report generated email
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email && reportData) {
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'report_generated',
              to: user.email,
              data: {
                projectName: currentProject?.name || 'Project',
                totalEmissions: reportData.emissions.total.toFixed(2),
                scope1: reportData.emissions.scope1.toFixed(2),
                scope2: reportData.emissions.scope2.toFixed(2),
                scope3: reportData.emissions.scope3.toFixed(2),
                complianceStatus: reportData.compliance.nccCompliant ? 'NCC Compliant' : 'Non-Compliant',
                appUrl: window.location.origin
              }
            }
          });
        }
      } catch (emailError) {
        console.error('Failed to send report email:', emailError);
        // Don't block report download if email fails
      }
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>No Project Selected</CardTitle>
            <CardDescription>
              Please select a project to generate reports
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading emission data...</p>
        </div>
      </div>
    );
  }

  // Validate report data before rendering
  const validation = validateReportData(reportData);
  const completeness = calculateDataCompleteness(reportData);

  if (!validation.isValid) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-2xl border-destructive/50">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle>Unable to Generate Report</CardTitle>
            <CardDescription className="text-left mt-4">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">The following issues need to be resolved:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="text-destructive">{error}</li>
                  ))}
                </ul>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.href = '/calculator'}
              className="mt-4"
            >
              Go to Calculator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scopeData = [
    { name: 'Scope 1', value: reportData.emissions.scope1 || 0, color: 'hsl(var(--scope-1))' },
    { name: 'Scope 2', value: reportData.emissions.scope2 || 0, color: 'hsl(var(--scope-2))' },
    { name: 'Scope 3', value: reportData.emissions.scope3 || 0, color: 'hsl(var(--scope-3))' },
  ];

  const materialsData = Array.isArray(reportData.breakdown.materials) 
    ? reportData.breakdown.materials.map(m => ({
        name: m.name,
        emissions: m.totalEmissions,
        category: m.category
      }))
    : [];

  const fuelData = Array.isArray(reportData.breakdown.fuelInputs)
    ? reportData.breakdown.fuelInputs.map(f => ({
        name: f.fuelType,
        emissions: f.totalEmissions,
        quantity: f.quantity,
        unit: f.unit
      }))
    : [];

  const electricityData = Array.isArray(reportData.breakdown.electricityInputs)
    ? reportData.breakdown.electricityInputs.map(e => ({
        name: e.state,
        emissions: e.totalEmissions,
        quantity: e.quantity,
        unit: e.unit
      }))
    : [];

  const transportData = Array.isArray(reportData.breakdown.transportInputs)
    ? reportData.breakdown.transportInputs.map(t => ({
        name: t.mode,
        emissions: t.totalEmissions,
        distance: t.distance,
        weight: t.weight
      }))
    : [];

  const complianceProgress = [
    { 
      name: 'NCC Compliance', 
      status: reportData.compliance.nccCompliant, 
      progress: reportData.compliance.nccCompliant ? 100 : 75,
      icon: Building2 
    },
    { 
      name: 'Green Star Eligibility', 
      status: reportData.compliance.greenStarEligible, 
      progress: reportData.compliance.greenStarEligible ? 100 : 60,
      icon: Star 
    },
    { 
      name: 'NABERS Readiness', 
      status: reportData.compliance.nabersReady, 
      progress: reportData.compliance.nabersReady ? 100 : 45,
      icon: Award 
    },
  ];

  return (
    <ErrorBoundary>
      <UpgradeModal 
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        limitType="reports_per_month"
      />
      
      <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Carbon Assessment Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis for {currentProject.name}
          </p>
        </div>
        <ErrorBoundary>
          <PDFReport data={reportData} template={selectedTemplate} branding={branding} />
        </ErrorBoundary>
      </div>

      {/* Report Template Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Template
          </CardTitle>
          <CardDescription>
            Choose the report format that best suits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value as ReportTemplate)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="executive">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Executive Summary</span>
                  <span className="text-sm text-muted-foreground">High-level overview with key metrics</span>
                </div>
              </SelectItem>
              <SelectItem value="technical">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Detailed Technical</span>
                  <span className="text-sm text-muted-foreground">Comprehensive data and breakdowns</span>
                </div>
              </SelectItem>
              <SelectItem value="compliance">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Compliance-Focused</span>
                  <span className="text-sm text-muted-foreground">NCC, GBCA, and NABERS compliance details</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Company Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Branding
          </CardTitle>
          <CardDescription>
            Add your company details to appear on the PDF report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Name
              </Label>
              <Input
                id="companyName"
                placeholder="Your Company Pty Ltd"
                value={branding.companyName || ''}
                onChange={(e) => updateBranding('companyName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preparedBy" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Prepared By
              </Label>
              <Input
                id="preparedBy"
                placeholder="John Smith"
                value={branding.preparedBy || ''}
                onChange={(e) => updateBranding('preparedBy', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@company.com"
                value={branding.contactEmail || ''}
                onChange={(e) => updateBranding('contactEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="flex items-center gap-2">
                <FileBarChart className="h-4 w-4" />
                Logo URL (optional)
              </Label>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                value={branding.logoUrl || ''}
                onChange={(e) => updateBranding('logoUrl', e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            These details will be saved and appear on all future PDF reports.
          </p>
        </CardContent>
      </Card>

      {/* Data Completeness Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Data Completeness
          </CardTitle>
          <CardDescription>
            {completeness}% of recommended data fields are filled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={completeness} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {completeness === 100 ? (
              'All recommended fields are complete. Your report will be comprehensive.'
            ) : completeness >= 75 ? (
              'Most fields are complete. Consider adding the remaining data for a more detailed report.'
            ) : completeness >= 50 ? (
              'Some fields are missing. Add more data for better report quality.'
            ) : (
              'Many fields are incomplete. Please add more calculation data for a meaningful report.'
            )}
          </p>
        </CardContent>
      </Card>

      {/* Data Quality Warnings */}
      {validation.warnings.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              Data Quality Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-muted-foreground">{warning}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <ErrorBoundary>
        <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="export">Export Options</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary */}
          <ReportErrorBoundary fallbackTitle="Executive Summary Error">
            <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {(reportData.emissions.total || 0).toFixed(1)}
                    </div>
                    <div className="text-lg text-muted-foreground">tCO₂e Total Emissions</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-scope-1">
                        {(reportData.emissions.scope1 || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 1</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-scope-2">
                        {(reportData.emissions.scope2 || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 2</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-scope-3">
                        {(reportData.emissions.scope3 || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 3</div>
                    </div>
                  </div>
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scopeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${(value || 0).toFixed(1)}`}
                      >
                        {scopeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toFixed(2)} tCO₂e`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
          </ReportErrorBoundary>

          {/* Project Details */}
          <ReportErrorBoundary fallbackTitle="Project Details Error" inline>
            <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Type:</span>
                  <span className="font-medium">{reportData.project.project_type}</span>
                </div>
                {reportData.project.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{reportData.project.location}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assessment Date:</span>
                  <span className="font-medium">{new Date(reportData.metadata.generatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Methodology:</span>
                  <span className="font-medium">NCC 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Quality:</span>
                  <Badge variant="secondary">Mixed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          </ReportErrorBoundary>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          {/* Category Breakdown Chart */}
          <ReportErrorBoundary fallbackTitle="Breakdown Chart Error">
            <Card>
            <CardHeader>
              <CardTitle>Emissions by Category</CardTitle>
              <CardDescription>
                Detailed breakdown of emissions across all categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...materialsData, ...fuelData, ...electricityData, ...transportData]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)} tCO₂e`} />
                    <Bar dataKey="emissions" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          </ReportErrorBoundary>

          {/* Materials Breakdown */}
          <ReportErrorBoundary fallbackTitle="Materials Breakdown Error">
            <div className="grid gap-6 md:grid-cols-2">
            {/* Materials Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-scope-3" />
                  Materials (Embodied Carbon)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {materialsData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No materials data available</p>
                ) : (
                  materialsData.map((material, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{material.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{(material.emissions || 0).toFixed(2)} tCO₂e</div>
                        <div className="text-xs text-muted-foreground">{material.category}</div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Fuel Inputs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5 text-scope-1" />
                  Fuel Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fuelData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No fuel data available</p>
                ) : (
                  fuelData.map((fuel, index) => (
                    <div key={index} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                      <div>
                        <span className="text-sm font-medium">{fuel.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {fuel.quantity?.toLocaleString()} {fuel.unit}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-scope-1">{(fuel.emissions || 0).toFixed(2)} tCO₂e</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Electricity Inputs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-scope-2" />
                  Electricity Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {electricityData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No electricity data available</p>
                ) : (
                  electricityData.map((elec, index) => (
                    <div key={index} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                      <div>
                        <span className="text-sm font-medium">{elec.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {elec.quantity?.toLocaleString()} {elec.unit}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-scope-2">{(elec.emissions || 0).toFixed(2)} tCO₂e</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Transport Inputs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-scope-3" />
                  Transport
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {transportData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No transport data available</p>
                ) : (
                  transportData.map((transport, index) => (
                    <div key={index} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                      <div>
                        <span className="text-sm font-medium">{transport.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {transport.distance?.toLocaleString()} km • {transport.weight?.toLocaleString()} t
                        </span>
                      </div>
                      <div className="text-sm font-medium text-scope-3">{(transport.emissions || 0).toFixed(2)} tCO₂e</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
          </ReportErrorBoundary>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Status */}
          <ReportErrorBoundary fallbackTitle="Compliance Status Error">
            <div className="grid gap-6 md:grid-cols-3">
            {complianceProgress.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      {item.status ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-warning" />
                      )}
                      <Badge variant={item.status ? "default" : "secondary"}>
                        {item.status ? "Compliant" : "Review Required"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          </ReportErrorBoundary>

          {/* Compliance Details */}
          <ReportErrorBoundary fallbackTitle="Compliance Details Error" inline>
            <Card>
            <CardHeader>
              <CardTitle>Australian Standards Compliance</CardTitle>
              <CardDescription>
                Assessment against key Australian environmental and building standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">National Construction Code (NCC)</h4>
                  <p className="text-sm text-muted-foreground">
                    Carbon emissions calculated according to NCC 2024 methodologies for embodied carbon assessment.
                  </p>
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> 
                    <Badge variant={reportData.compliance.nccCompliant ? "default" : "secondary"} className="ml-2">
                      {reportData.compliance.nccCompliant ? "Compliant" : "Pending Review"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Green Star Rating</h4>
                  <p className="text-sm text-muted-foreground">
                    Assessment meets GBCA Green Star requirements for carbon emission reporting and LCA methodology.
                  </p>
                  <div className="text-sm">
                    <span className="font-medium">Eligibility:</span>
                    <Badge variant={reportData.compliance.greenStarEligible ? "default" : "secondary"} className="ml-2">
                      {reportData.compliance.greenStarEligible ? "Eligible" : "Review Required"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">NABERS Integration</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Energy data captured for potential NABERS rating submissions including embodied carbon considerations.
                </p>
                <div className="text-sm">
                  <span className="font-medium">Readiness:</span>
                  <Badge variant={reportData.compliance.nabersReady ? "default" : "secondary"} className="ml-2">
                    {reportData.compliance.nabersReady ? "Ready for Submission" : "Additional Data Required"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          </ReportErrorBoundary>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ReportErrorBoundary fallbackTitle="Export Options Error">
            <div className="grid gap-6 md:grid-cols-2">
            {/* PDF Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5" />
                  PDF Report
                </CardTitle>
                <CardDescription>
                  Comprehensive assessment report for compliance submissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Includes executive summary, detailed breakdowns, compliance status, and methodology documentation.
                </div>
                
                <Button 
                  className="w-full"
                  onClick={handleDownloadReport}
                  disabled={!canPerformAction('reports_per_month').allowed}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Report
                  {!canPerformAction('reports_per_month').allowed && (
                    <Crown className="ml-2 h-4 w-4" />
                  )}
                </Button>
                
                {currentUsage && (
                  <div className="text-xs text-muted-foreground text-center">
                    {currentUsage.reports_per_month || 0} reports generated this month
                  </div>
                )}
                
                {!canPerformAction('reports_per_month').allowed && (
                  <div className="p-3 bg-muted rounded-lg text-sm">
                    {canPerformAction('reports_per_month').reason}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Raw Data Export
                </CardTitle>
                <CardDescription>
                  Export calculation data for further analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Export detailed emission factors, calculations, and source data in CSV format.
                </div>
                <Button variant="outline" className="w-full" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV Data (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Export Information */}
          <Card>
            <CardHeader>
              <CardTitle>Export Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Report Contents</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Project information and assessment scope</li>
                    <li>Total emissions by scope with detailed breakdowns</li>
                    <li>Methodology documentation and data sources</li>
                    <li>Australian compliance status (NCC, Green Star, NABERS)</li>
                    <li>Data quality assessment and uncertainty analysis</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data Standards</h4>
                  <p className="text-sm text-muted-foreground">
                    All calculations follow Australian NCC 2024 methodologies and use latest emission factors 
                    from government databases. Reports are suitable for regulatory submissions and third-party verification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          </ReportErrorBoundary>
        </TabsContent>
      </Tabs>
      </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default Reports;