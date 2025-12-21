import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PDFReport, ReportBranding } from '@/components/PDFReport';
import { useReportData } from '@/components/ReportData';
import { FileBarChart } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface CalculatorReportSectionProps {
  currentProject: {
    id: string;
    name: string;
    project_type?: string;
    location?: string | null;
    description?: string | null;
  } | null;
}

// Default branding for reports
const DEFAULT_BRANDING: ReportBranding = {
  companyName: 'CarbonConstruct',
  preparedBy: 'CarbonConstruct Platform',
  contactEmail: 'support@carbonconstruct.com.au',
  logoUrl: '/logo-optimized.webp',
};

export function CalculatorReportSection({ currentProject }: CalculatorReportSectionProps) {
  const reportData = useReportData();
  
  // Don't render if no project or no report data
  if (!currentProject || !reportData) {
    return null;
  }

  return (
    <Card variant="glass" className="mt-8 glass-glow-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileBarChart className="h-5 w-5 text-primary" />
          Generate Report
        </CardTitle>
        <CardDescription>
          Generate a detailed technical report of your carbon assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            <p>Download your calculation data as a professional PDF report.</p>
            <p className="mt-1">Includes materials breakdown, emissions summary, and compliance status.</p>
          </div>
          <ErrorBoundary>
            <PDFReport 
              data={reportData} 
              template="technical"
              branding={DEFAULT_BRANDING} 
              showWatermark={true}
            />
          </ErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
}
