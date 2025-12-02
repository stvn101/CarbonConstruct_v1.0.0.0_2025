import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PDFReport, ReportBranding } from '@/components/PDFReport';
import { useReportData, validateReportData, calculateDataCompleteness } from '@/components/ReportData';
import { useProject } from '@/contexts/ProjectContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useSubscription } from '@/hooks/useSubscription';
import { useComplianceCheck } from '@/hooks/useComplianceCheck';
import { useEmissionTotals } from '@/hooks/useEmissionTotals';
import { loadStoredWholeLifeTotals } from '@/hooks/useWholeLifeCarbonCalculations';
import { UpgradeModal } from '@/components/UpgradeModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ReportErrorBoundary } from '@/components/ReportErrorBoundary';
import { ComplianceCard } from '@/components/ComplianceCard';
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
  Mail,
  Leaf,
  Globe,
  HardHat,
  Lightbulb,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export type ReportTemplate = 'executive' | 'technical' | 'compliance' | 'en15978';

// Default CarbonConstruct branding for non-Pro yearly users
const DEFAULT_BRANDING: ReportBranding = {
  companyName: 'CarbonConstruct',
  preparedBy: 'CarbonConstruct Platform',
  contactEmail: 'support@carbonconstruct.com.au',
};

const Reports = () => {
  const { currentProject } = useProject();
  const reportData = useReportData();
  const { totals } = useEmissionTotals();
  const { canPerformAction, trackUsage, currentUsage } = useUsageTracking();
  const { currentTier, userSubscription } = useSubscription();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>('technical');
  
  // Load whole life totals from localStorage
  const wholeLifeTotals = useMemo(() => {
    return loadStoredWholeLifeTotals();
  }, []);
  
  // Get compliance results
  const complianceResults = useComplianceCheck(
    totals || { scope1: 0, scope2: 0, scope3: 0, total: 0 },
    wholeLifeTotals
  );
  
  // Check if user is Pro tier with yearly subscription (price_annual = 790)
  const isProYearly = currentTier?.name === 'Pro' && 
    userSubscription?.current_period_end && 
    // Yearly subscriptions have period > 30 days
    (new Date(userSubscription.current_period_end).getTime() - new Date().getTime()) > 30 * 24 * 60 * 60 * 1000;
  
  // Business/Enterprise also get custom branding
  const canCustomBrand = isProYearly || currentTier?.name === 'Business' || currentTier?.name === 'Enterprise';
  
  const [branding, setBranding] = useState<ReportBranding>(() => {
    if (!canCustomBrand) return DEFAULT_BRANDING;
    try {
      const stored = localStorage.getItem('reportBranding');
      return stored ? JSON.parse(stored) : DEFAULT_BRANDING;
    } catch {
      return DEFAULT_BRANDING;
    }
  });
  
  // Effective branding - use default if not allowed to customize
  const effectiveBranding = canCustomBrand ? branding : DEFAULT_BRANDING;
  
  // Get project type for showing IS Rating
  const isInfrastructure = complianceResults.isRating.isInfrastructure;

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
          <PDFReport data={reportData} template={selectedTemplate} branding={effectiveBranding} showWatermark={!canCustomBrand} />
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
              <SelectItem value="en15978">
                <div className="flex flex-col items-start">
                  <span className="font-medium flex items-center gap-2">
                    EN 15978 Whole Life Carbon
                    <Badge variant="outline" className="text-xs">Standard</Badge>
                  </span>
                  <span className="text-sm text-muted-foreground">Full A-D lifecycle stages for compliance</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {/* EN 15978 Template Info */}
          {selectedTemplate === 'en15978' && (
            <div className="mt-4 p-4 bg-compliance-en15978/10 border border-compliance-en15978/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-compliance-en15978 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">EN 15978:2011 Compliant Report</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    This report follows the European Standard for assessment of environmental performance of buildings.
                    It includes all lifecycle stages (A1-A5, B1-B7, C1-C4, D) with a 60-year reference study period.
                  </p>
                  {!wholeLifeTotals && (
                    <p className="text-xs text-destructive mt-2">
                      ⚠️ Complete the Use Phase, End of Life, and Module D calculators for a comprehensive report.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Company Branding - Only for Pro Yearly, Business, Enterprise */}
      {canCustomBrand ? (
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
      ) : (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Branding
              <Badge variant="secondary" className="ml-2">
                <Crown className="h-3 w-3 mr-1" />
                Pro Yearly
              </Badge>
            </CardTitle>
            <CardDescription>
              Reports will display CarbonConstruct branding. Upgrade to Pro (yearly) to add your own company branding.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle Stages</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
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
                    <div className="text-xs text-muted-foreground mt-1">tonnes of CO₂ equivalent</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-scope-1">
                        {(reportData.emissions.scope1 || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 1</div>
                      <div className="text-xs text-muted-foreground">tCO₂e</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-scope-2">
                        {(reportData.emissions.scope2 || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 2</div>
                      <div className="text-xs text-muted-foreground">tCO₂e</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-scope-3">
                        {(reportData.emissions.scope3 || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 3</div>
                      <div className="text-xs text-muted-foreground">tCO₂e</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground pt-2 border-t">All values displayed in tonnes CO₂ equivalent (tCO₂e)</p>
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
                        label={({ name, value }) => `${name}: ${(value || 0).toFixed(1)} t`}
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

        {/* NEW: Lifecycle Stages Tab (EN 15978) */}
        <TabsContent value="lifecycle" className="space-y-6">
          <ReportErrorBoundary fallbackTitle="Lifecycle Stages Error">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  EN 15978 Whole Life Carbon Assessment
                </CardTitle>
                <CardDescription>
                  Complete lifecycle carbon breakdown from cradle to grave with Module D benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lifecycle Stage Summary Cards */}
                <div className="grid gap-4 md:grid-cols-5">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-blue-700">A1-A5 Upfront</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-800">
                        {reportData.emissions.scope3.toFixed(2)}
                      </div>
                      <p className="text-xs text-blue-600">tCO₂e</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-amber-700">B1-B7 Use Phase</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-800">0.00</div>
                      <p className="text-xs text-amber-600">tCO₂e (add in calculator)</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-red-700">C1-C4 End of Life</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-800">0.00</div>
                      <p className="text-xs text-red-600">tCO₂e (add in calculator)</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-emerald-700">Module D Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-800">0.00</div>
                      <p className="text-xs text-emerald-600">tCO₂e (add in calculator)</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-100 border-slate-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-slate-700">Whole Life Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-800">
                        {reportData.emissions.total.toFixed(2)}
                      </div>
                      <p className="text-xs text-slate-600">tCO₂e (A-D)</p>
                    </CardContent>
                  </Card>
                </div>

                {/* EN 15978 Standard Info */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">EN 15978 Lifecycle Stages</h4>
                  <div className="grid gap-2 md:grid-cols-2 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">A1-A3:</span> Raw material supply, transport, manufacturing
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">A4-A5:</span> Transport to site, construction installation
                    </div>
                    <div>
                      <span className="font-medium text-amber-700">B1-B5:</span> Use, maintenance, repair, replacement, refurbishment
                    </div>
                    <div>
                      <span className="font-medium text-amber-700">B6-B7:</span> Operational energy and water use
                    </div>
                    <div>
                      <span className="font-medium text-red-700">C1-C4:</span> Deconstruction, transport, processing, disposal
                    </div>
                    <div>
                      <span className="font-medium text-emerald-700">Module D:</span> Benefits beyond the building lifecycle
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Use the calculator's EN 15978 Lifecycle Stage sections to add Use Phase (B1-B7), 
                  End of Life (C1-C4), and Module D data for a complete whole life carbon assessment.
                </p>
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
                Detailed breakdown of emissions across all categories (values in tCO₂e - tonnes CO₂ equivalent)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...materialsData, ...fuelData, ...electricityData, ...transportData]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis label={{ value: 'tCO₂e', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)} tCO₂e`} />
                    <Bar dataKey="emissions" fill="hsl(var(--primary))" name="Emissions (tCO₂e)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          </ReportErrorBoundary>

          {/* Materials Breakdown */}
          <ReportErrorBoundary fallbackTitle="Materials Breakdown Error">
            <p className="text-xs text-muted-foreground text-center mb-4">All emission values displayed in tonnes CO₂ equivalent (tCO₂e)</p>
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
                          {transport.distance > 0 && `${transport.distance?.toLocaleString()} km`}
                          {transport.weight > 0 && `${transport.weight?.toLocaleString()} t`}
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
          {/* Compliance Summary Header */}
          <ReportErrorBoundary fallbackTitle="Compliance Summary Error">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Australian Compliance Dashboard
                </CardTitle>
                <CardDescription>
                  Comprehensive assessment against Australian building and environmental standards.
                  {isInfrastructure && (
                    <Badge variant="outline" className="ml-2">
                      <HardHat className="h-3 w-3 mr-1" />
                      Infrastructure Project
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="font-medium">Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <span className="font-medium">Partial</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="font-medium">Non-Compliant</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ReportErrorBoundary>

          {/* Compliance Cards Grid */}
          <ReportErrorBoundary fallbackTitle="Compliance Status Error">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* NCC 2024 */}
              <ComplianceCard
                framework="NCC"
                title="NCC Section J"
                description="National Construction Code 2024 embodied carbon requirements"
                overallCompliance={complianceResults.ncc.status}
                requirements={complianceResults.ncc.requirements}
                compact
              />

              {/* GBCA Green Star */}
              <ComplianceCard
                framework="GBCA"
                title="Green Star"
                description="GBCA Green Star Buildings v1.1 carbon credits"
                overallCompliance={complianceResults.gbca.status}
                requirements={complianceResults.gbca.requirements}
                score={complianceResults.gbca.score}
                maxScore={complianceResults.gbca.maxScore}
                compact
              />

              {/* NABERS */}
              <ComplianceCard
                framework="NABERS"
                title="NABERS Energy"
                description="National Australian Built Environment Rating System"
                overallCompliance={complianceResults.nabers.status}
                requirements={complianceResults.nabers.requirements}
                rating={complianceResults.nabers.rating}
                maxRating={complianceResults.nabers.maxRating}
                compact
              />

              {/* EN 15978 */}
              <ComplianceCard
                framework="EN15978"
                title="EN 15978"
                description="Building lifecycle assessment methodology"
                overallCompliance={complianceResults.en15978.status}
                requirements={complianceResults.en15978.requirements}
                compact
              />

              {/* Climate Active */}
              <ComplianceCard
                framework="CLIMATE_ACTIVE"
                title="Climate Active"
                description="Australian Government carbon neutral certification"
                overallCompliance={complianceResults.climateActive.status}
                requirements={complianceResults.climateActive.requirements}
                compact
              />

              {/* IS Rating (Infrastructure only) */}
              {isInfrastructure && (
                <ComplianceCard
                  framework="IS_RATING"
                  title="IS Rating"
                  description="Infrastructure Sustainability Council rating"
                  overallCompliance={complianceResults.isRating.status}
                  requirements={complianceResults.isRating.requirements}
                  score={complianceResults.isRating.score}
                  maxScore={complianceResults.isRating.maxScore}
                  level={complianceResults.isRating.level}
                  compact
                />
              )}
            </div>
          </ReportErrorBoundary>

          {/* Detailed Compliance Breakdown */}
          <ReportErrorBoundary fallbackTitle="Compliance Details Error" inline>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detailed Requirements
                </CardTitle>
                <CardDescription>
                  Expand each framework to view detailed requirements and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {/* NCC Details */}
                  <AccordionItem value="ncc">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-compliance-ncc" />
                        <span>NCC 2024 Section J Requirements</span>
                        <Badge variant={complianceResults.ncc.status === 'compliant' ? 'default' : 'secondary'}>
                          {complianceResults.ncc.requirements.filter(r => r.met).length}/{complianceResults.ncc.requirements.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {complianceResults.ncc.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            {req.met ? (
                              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{req.name}</p>
                              {req.value !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  Current: {req.value} {req.unit} | Threshold: {req.threshold} {req.unit}
                                </p>
                              )}
                              {!req.met && req.recommendation && (
                                <p className="text-xs text-warning mt-1 flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  {req.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* GBCA Details */}
                  <AccordionItem value="gbca">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-compliance-gbca" />
                        <span>Green Star Credit Requirements</span>
                        <Badge variant={complianceResults.gbca.status === 'compliant' ? 'default' : 'secondary'}>
                          {complianceResults.gbca.score}%
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {complianceResults.gbca.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            {req.met ? (
                              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{req.name}</p>
                              {req.stage && (
                                <Badge variant="outline" className="text-xs mt-1">{req.stage}</Badge>
                              )}
                              {!req.met && req.recommendation && (
                                <p className="text-xs text-warning mt-1 flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  {req.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* EN 15978 Details */}
                  <AccordionItem value="en15978">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-compliance-en15978" />
                        <span>EN 15978 Lifecycle Stages</span>
                        <Badge variant={complianceResults.en15978.status === 'compliant' ? 'default' : 'secondary'}>
                          {complianceResults.en15978.requirements.filter(r => r.met).length}/{complianceResults.en15978.requirements.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {/* Stage Summary */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <div className={`p-2 rounded text-center ${complianceResults.en15978.stages.a1a5.compliant ? 'bg-success/20' : 'bg-destructive/20'}`}>
                            <p className="text-xs font-medium">A1-A5</p>
                            <p className="text-sm font-bold">{complianceResults.en15978.stages.a1a5.value}</p>
                          </div>
                          <div className={`p-2 rounded text-center ${complianceResults.en15978.stages.b1b7.compliant ? 'bg-success/20' : 'bg-destructive/20'}`}>
                            <p className="text-xs font-medium">B1-B7</p>
                            <p className="text-sm font-bold">{complianceResults.en15978.stages.b1b7.value}</p>
                          </div>
                          <div className={`p-2 rounded text-center ${complianceResults.en15978.stages.c1c4.compliant ? 'bg-success/20' : 'bg-destructive/20'}`}>
                            <p className="text-xs font-medium">C1-C4</p>
                            <p className="text-sm font-bold">{complianceResults.en15978.stages.c1c4.value}</p>
                          </div>
                          <div className={`p-2 rounded text-center ${complianceResults.en15978.stages.wholeLife.compliant ? 'bg-success/20' : 'bg-destructive/20'}`}>
                            <p className="text-xs font-medium">Total</p>
                            <p className="text-sm font-bold">{complianceResults.en15978.stages.wholeLife.value}</p>
                          </div>
                        </div>
                        {complianceResults.en15978.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            {req.met ? (
                              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{req.name}</p>
                              {req.value !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  {req.value} / {req.threshold} {req.unit}
                                </p>
                              )}
                              {!req.met && req.recommendation && (
                                <p className="text-xs text-warning mt-1 flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  {req.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Climate Active Details */}
                  <AccordionItem value="climate-active">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Leaf className="h-5 w-5 text-compliance-climateActive" />
                        <span>Climate Active Carbon Neutral</span>
                        <Badge variant={complianceResults.climateActive.status === 'compliant' ? 'default' : 'secondary'}>
                          {complianceResults.climateActive.pathwayStatus}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {complianceResults.climateActive.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            {req.met ? (
                              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{req.name}</p>
                              {req.value !== undefined && (
                                <p className="text-xs text-muted-foreground">
                                  {req.value.toLocaleString()} {req.unit}
                                </p>
                              )}
                              {!req.met && req.recommendation && (
                                <p className="text-xs text-warning mt-1 flex items-center gap-1">
                                  <Lightbulb className="h-3 w-3" />
                                  {req.recommendation}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* IS Rating Details (Infrastructure only) */}
                  {isInfrastructure && (
                    <AccordionItem value="is-rating">
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                          <HardHat className="h-5 w-5 text-compliance-isRating" />
                          <span>IS Rating Infrastructure</span>
                          <Badge variant={complianceResults.isRating.status === 'compliant' ? 'default' : 'secondary'}>
                            {complianceResults.isRating.level}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">IS Rating Score</span>
                              <span className="text-lg font-bold">{complianceResults.isRating.score}/100</span>
                            </div>
                            <Progress value={complianceResults.isRating.score} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-2">
                              <span>Certified (25)</span>
                              <span>Commended (50)</span>
                              <span>Excellent (75)</span>
                              <span>Leading (85)</span>
                            </div>
                          </div>
                          {complianceResults.isRating.requirements.map((req, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                              {req.met ? (
                                <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium">{req.name}</p>
                                {req.stage && (
                                  <Badge variant="outline" className="text-xs mt-1">{req.stage}</Badge>
                                )}
                                {!req.met && req.recommendation && (
                                  <p className="text-xs text-warning mt-1 flex items-center gap-1">
                                    <Lightbulb className="h-3 w-3" />
                                    {req.recommendation}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
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

      {/* Legal Disclaimer */}
      <Card className="border-muted bg-muted/30">
        <CardContent className="pt-4">
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            <span className="font-semibold">Disclaimer & Terms:</span> This carbon assessment report is generated by CarbonConstruct Pty Ltd using Australian emission factors from NCC 2024, NABERS, and industry EPD sources. All calculations are estimates based on user-provided data and standard emission factors. CarbonConstruct does not guarantee the accuracy, completeness, or reliability of results. This report should not be used as the sole basis for regulatory compliance, financial decisions, or legal purposes without independent verification by a qualified professional. Users are responsible for verifying data accuracy and ensuring compliance with applicable regulations. By using this report, you agree to our full{" "}
            <a href="/terms" className="underline hover:text-foreground">Terms of Service</a> and{" "}
            <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>. CarbonConstruct accepts no liability for decisions made based on this report. For certified compliance assessments, please consult an accredited carbon assessor. © {new Date().getFullYear()} CarbonConstruct. All rights reserved.
          </p>
        </CardContent>
      </Card>

      </div>
    </ErrorBoundary>
  );
};

export default Reports;