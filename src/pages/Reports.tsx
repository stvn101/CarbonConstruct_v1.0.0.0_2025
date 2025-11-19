import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PDFReport } from '@/components/PDFReport';
import { useReportData } from '@/components/ReportData';
import { useProject } from '@/contexts/ProjectContext';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { UpgradeModal } from '@/components/UpgradeModal';
import { EmptyState } from '@/components/EmptyState';
import { DashboardSkeleton } from '@/components/LoadingSkeleton';
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
  Calculator,
  FolderOpen
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Reports = () => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const reportData = useReportData();
  const { canPerformAction, trackUsage, currentUsage } = useUsageTracking();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const handleDownloadReport = async () => {
    const limitCheck = canPerformAction('reports_per_month');
    
    if (!limitCheck.allowed) {
      setUpgradeModalOpen(true);
      return;
    }

    // Track the usage
    trackUsage({ metricType: 'reports_per_month' });
    
    // Measure PDF generation performance
    const { measurePdfGeneration, trackEvent } = await import('@/lib/analytics');
    
    trackEvent('report_download_started', {
      project: currentProject?.name,
    });
    
    // Generate and download the PDF
    const element = document.getElementById('pdf-report-content');
    if (element) {
      await measurePdfGeneration(async () => {
        const html2pdf = (await import('html2pdf.js')).default;
        await html2pdf()
          .set({
            margin: 10,
            filename: `${currentProject?.name || 'project'}-carbon-report.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          })
          .from(element)
          .save();
      });
      
      trackEvent('report_download_completed', {
        project: currentProject?.name,
      });
    }
  };

  if (!currentProject) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="No Project Selected"
        description="Please select a project from the sidebar to generate reports and view emission data."
        actionLabel="Go to Dashboard"
        onAction={() => navigate('/')}
      />
    );
  }

  if (!reportData) {
    return <DashboardSkeleton />;
  }

  // Check if there's any actual data
  const hasData = reportData.emissions.total > 0;

  if (!hasData) {
    return (
      <EmptyState
        icon={Calculator}
        title="No Emission Data Yet"
        description="Start by using the unified calculator to input your project's materials, fuel usage, electricity, and transport data."
        actionLabel="Open Calculator"
        onAction={() => navigate('/calculator')}
        secondaryActionLabel="Learn More"
        onSecondaryAction={() => navigate('/help')}
      />
    );
  }

  const scopeData = [
    { name: 'Scope 1', value: reportData.emissions.scope1, color: 'hsl(var(--scope-1))' },
    { name: 'Scope 2', value: reportData.emissions.scope2, color: 'hsl(var(--scope-2))' },
    { name: 'Scope 3', value: reportData.emissions.scope3, color: 'hsl(var(--scope-3))' },
  ];

  const materialsData = reportData.breakdown.materials.map(m => ({
    name: m.name,
    emissions: m.totalEmissions,
    category: m.category
  }));

  const fuelData = reportData.breakdown.fuelInputs.map(f => ({
    name: f.fuelType,
    emissions: f.totalEmissions
  }));

  const electricityData = reportData.breakdown.electricityInputs.map(e => ({
    name: e.state,
    emissions: e.totalEmissions
  }));

  const transportData = reportData.breakdown.transportInputs.map(t => ({
    name: t.mode,
    emissions: t.totalEmissions
  }));

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
    <>
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
        <PDFReport data={reportData} />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Detailed Breakdown</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="export">Export Options</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary */}
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
                      {reportData.emissions.total.toFixed(1)}
                    </div>
                    <div className="text-lg text-muted-foreground">tCO₂e Total Emissions</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-scope-1">
                        {reportData.emissions.scope1.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 1</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-scope-2">
                        {reportData.emissions.scope2.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Scope 2</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-scope-3">
                        {reportData.emissions.scope3.toFixed(1)}
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
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
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

          {/* Project Details */}
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
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          {/* Category Breakdown Chart */}
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

          {/* Materials Breakdown */}
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
                        <div className="text-sm font-medium">{material.emissions.toFixed(2)} tCO₂e</div>
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
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{fuel.name}</span>
                      <div className="text-sm font-medium">{fuel.emissions.toFixed(2)} tCO₂e</div>
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
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{elec.name}</span>
                      <div className="text-sm font-medium">{elec.emissions.toFixed(2)} tCO₂e</div>
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
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{transport.name}</span>
                      <div className="text-sm font-medium">{transport.emissions.toFixed(2)} tCO₂e</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Status */}
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

          {/* Compliance Details */}
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
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
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
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
};

export default Reports;