/**
 * ACA Monthly Emissions Report Component
 * 
 * Follows the Australian Constructors Association Subcontractor Emissions 
 * Reporting Guide format (September 2025 standard)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Download, FileText, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useACAReportData, ACAReportData } from '@/hooks/useACAReportData';
import { useProject } from '@/contexts/ProjectContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// PDF Styles matching ACA format
const pdfStyles = {
  container: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '11px',
    color: '#333333',
    backgroundColor: '#ffffff',
    padding: '24px',
    maxWidth: '210mm',
  } as React.CSSProperties,
  header: {
    marginBottom: '24px',
    borderBottom: '2px solid #2980b9',
    paddingBottom: '16px',
  } as React.CSSProperties,
  companyName: {
    fontSize: '16pt',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '8px',
  } as React.CSSProperties,
  projectName: {
    fontSize: '14pt',
    color: '#34495e',
    marginBottom: '4px',
  } as React.CSSProperties,
  reportingPeriod: {
    fontSize: '11pt',
    color: '#7f8c8d',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '14pt',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: '24px',
    marginBottom: '12px',
    borderBottom: '1px solid #bdc3c7',
    paddingBottom: '4px',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: '16px',
  } as React.CSSProperties,
  tableHeader: {
    backgroundColor: '#2980b9',
    color: '#ffffff',
    fontWeight: 'bold',
    padding: '10px 8px',
    textAlign: 'left' as const,
    border: '1px solid #2980b9',
    fontSize: '10pt',
  } as React.CSSProperties,
  tableCell: {
    padding: '8px',
    border: '1px solid #bdc3c7',
    fontSize: '10pt',
  } as React.CSSProperties,
  tableCellRight: {
    padding: '8px',
    border: '1px solid #bdc3c7',
    textAlign: 'right' as const,
    fontSize: '10pt',
  } as React.CSSProperties,
  emptyMessage: {
    padding: '16px',
    textAlign: 'center' as const,
    color: '#7f8c8d',
    fontStyle: 'italic',
    backgroundColor: '#f9f9f9',
    border: '1px solid #bdc3c7',
  } as React.CSSProperties,
  totalBox: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#2c3e50',
    color: '#ffffff',
    fontSize: '14pt',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    borderRadius: '4px',
  } as React.CSSProperties,
  footer: {
    marginTop: '24px',
    paddingTop: '12px',
    borderTop: '1px solid #bdc3c7',
    fontSize: '9pt',
    color: '#7f8c8d',
    textAlign: 'center' as const,
  } as React.CSSProperties,
};

interface ACAReportContentProps {
  data: ACAReportData;
  contentId: string;
}

const ACAReportContent: React.FC<ACAReportContentProps> = ({ data, contentId }) => {
  const formatQuantity = (value: number, unit: string): string => {
    return `${value.toLocaleString('en-AU', { maximumFractionDigits: 2 })} ${unit}`;
  };

  const formatEmissions = (value: number): string => {
    return value.toFixed(2);
  };

  const formatDate = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'dd MMMM yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div id={contentId} style={pdfStyles.container}>
      {/* Header */}
      <div style={pdfStyles.header}>
        <div style={pdfStyles.companyName}>{data.companyName}</div>
        <div style={pdfStyles.projectName}>Project: {data.projectName}</div>
        <div style={pdfStyles.reportingPeriod}>
          Reporting Period: {formatDate(data.reportingPeriod.startDate)} to {formatDate(data.reportingPeriod.endDate)}
        </div>
      </div>

      {/* Section 1: Energy Consumed */}
      <div style={pdfStyles.sectionTitle}>SECTION 1 - ENERGY CONSUMED</div>
      {data.energy.length > 0 ? (
        <table style={pdfStyles.table}>
          <thead>
            <tr>
              <th style={pdfStyles.tableHeader}>Fuel Type</th>
              <th style={pdfStyles.tableHeader}>Quantity</th>
              <th style={{ ...pdfStyles.tableHeader, textAlign: 'right' }}>Emissions (tCO₂-e)</th>
              <th style={pdfStyles.tableHeader}>Source</th>
            </tr>
          </thead>
          <tbody>
            {data.energy.map((row, idx) => (
              <tr key={idx}>
                <td style={pdfStyles.tableCell}>{row.fuelType}</td>
                <td style={pdfStyles.tableCell}>{formatQuantity(row.quantity, row.unit)}</td>
                <td style={pdfStyles.tableCellRight}>{formatEmissions(row.emissions)}</td>
                <td style={pdfStyles.tableCell}>{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={pdfStyles.emptyMessage}>No energy data recorded for this period</div>
      )}

      {/* Section 2: Materials Supplied */}
      <div style={pdfStyles.sectionTitle}>SECTION 2 - MATERIALS SUPPLIED</div>
      {data.materials.length > 0 ? (
        <table style={pdfStyles.table}>
          <thead>
            <tr>
              <th style={pdfStyles.tableHeader}>Material</th>
              <th style={pdfStyles.tableHeader}>Quantity</th>
              <th style={{ ...pdfStyles.tableHeader, textAlign: 'right' }}>Emissions (tCO₂-e)</th>
              <th style={pdfStyles.tableHeader}>Source</th>
            </tr>
          </thead>
          <tbody>
            {data.materials.map((row, idx) => (
              <tr key={idx}>
                <td style={pdfStyles.tableCell}>{row.material}</td>
                <td style={pdfStyles.tableCell}>{formatQuantity(row.quantity, row.unit)}</td>
                <td style={pdfStyles.tableCellRight}>{formatEmissions(row.emissions)}</td>
                <td style={pdfStyles.tableCell}>{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={pdfStyles.emptyMessage}>No materials data recorded for this period</div>
      )}

      {/* Section 3: Plant Deployed */}
      <div style={pdfStyles.sectionTitle}>SECTION 3 - PLANT DEPLOYED</div>
      {data.equipmentTrackingConfigured && data.plant.length > 0 ? (
        <table style={pdfStyles.table}>
          <thead>
            <tr>
              <th style={pdfStyles.tableHeader}>Equipment</th>
              <th style={pdfStyles.tableHeader}>Fuel Type</th>
              <th style={pdfStyles.tableHeader}>Capacity</th>
              <th style={pdfStyles.tableHeader}>MY</th>
              <th style={pdfStyles.tableHeader}>Spec</th>
            </tr>
          </thead>
          <tbody>
            {data.plant.map((row, idx) => (
              <tr key={idx}>
                <td style={pdfStyles.tableCell}>{row.equipment}</td>
                <td style={pdfStyles.tableCell}>{row.fuelType}</td>
                <td style={pdfStyles.tableCell}>{row.capacity}</td>
                <td style={pdfStyles.tableCell}>{row.modelYear}</td>
                <td style={pdfStyles.tableCell}>{row.spec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={pdfStyles.emptyMessage}>
          {data.equipmentTrackingConfigured 
            ? 'No plant equipment recorded for this period' 
            : 'Equipment tracking not yet configured'}
        </div>
      )}

      {/* Total Emissions */}
      <div style={pdfStyles.totalBox}>
        TOTAL EMISSIONS THIS PERIOD: {data.totalEmissions.toFixed(2)} tCO₂-e
      </div>

      {/* Footer */}
      <div style={pdfStyles.footer}>
        Generated: {format(new Date(data.generatedAt), 'dd MMMM yyyy HH:mm')} | 
        ACA Subcontractor Emissions Reporting Guide (September 2025 standard)
      </div>
    </div>
  );
};

export const ACAMonthlyReport: React.FC = () => {
  const { currentProject } = useProject();
  const { loading, error, data, fetchData } = useACAReportData();
  const html2pdfRef = useRef<any>(null);
  const [generating, setGenerating] = useState(false);
  
  // Default to current month
  const now = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(now), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(now), 'yyyy-MM-dd'));

  // Lazy load html2pdf
  useEffect(() => {
    let cancelled = false;
    import('@/lib/secure-html-to-pdf')
      .then((m) => {
        if (!cancelled) html2pdfRef.current = m.default;
      })
      .catch(() => {
        // Ignore - will lazy load on click
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFetchData = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    await fetchData(startDate, endDate);
  };

  const toSafeFilename = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');

  const handleGeneratePDF = async () => {
    if (!data) {
      toast.error('Please fetch report data first');
      return;
    }

    setGenerating(true);

    try {
      const html2pdf = html2pdfRef.current ?? (await import('@/lib/secure-html-to-pdf')).default;
      html2pdfRef.current = html2pdf;

      const element = document.getElementById('aca-report-content');
      if (!element) {
        throw new Error('Report content not found');
      }

      // Generate filename
      const projectSlug = toSafeFilename(data.projectName || 'project');
      const monthYear = format(new Date(startDate), 'yyyy-MM');
      const filename = `ACA-Report-${projectSlug}-${monthYear}.pdf`;

      // Position for capture
      element.style.position = 'fixed';
      element.style.left = '0';
      element.style.top = '0';
      element.style.zIndex = '9999';
      element.style.pointerEvents = 'none';
      element.style.opacity = '1';

      // Wait for layout
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      // Wait for fonts
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // Generate PDF
      await html2pdf()
        .set({
          margin: 10,
          filename,
          pagebreak: { mode: ['css', 'legacy'] },
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            letterRendering: true,
            backgroundColor: '#ffffff',
            logging: false,
            scrollX: 0,
            scrollY: 0,
            onclone: (clonedDoc: Document) => {
              clonedDoc.body.style.backgroundColor = '#ffffff';
              clonedDoc.body.style.color = '#333333';
              clonedDoc.documentElement.style.colorScheme = 'light';
              clonedDoc.documentElement.classList.remove('dark');
              clonedDoc.body.classList.remove('dark');
            },
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save();

      toast.success('ACA Report generated successfully');
    } catch (err) {
      console.error('Error generating ACA PDF:', err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      // Restore original styles
      const element = document.getElementById('aca-report-content');
      if (element) {
        element.style.position = '';
        element.style.left = '';
        element.style.top = '';
        element.style.zIndex = '';
        element.style.pointerEvents = '';
        element.style.opacity = '';
      }
      setGenerating(false);
    }
  };

  if (!currentProject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ACA Monthly Report
          </CardTitle>
          <CardDescription>
            Please select a project to generate an ACA report
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="glass-glow-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          ACA Monthly Emissions Report
        </CardTitle>
        <CardDescription>
          Australian Constructors Association Subcontractor Emissions Reporting Guide (September 2025)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleFetchData}
            disabled={loading || !startDate || !endDate}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Preview Data
              </>
            )}
          </Button>
          <Button
            onClick={handleGeneratePDF}
            disabled={generating || !data}
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Error loading data</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </div>
        )}

        {/* Data Preview Summary */}
        {data && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-medium">Report Preview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Energy Items:</span>
                <span className="ml-2 font-medium">{data.energy.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Material Items:</span>
                <span className="ml-2 font-medium">{data.materials.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Plant Items:</span>
                <span className="ml-2 font-medium">{data.plant.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Emissions:</span>
                <span className="ml-2 font-medium">{data.totalEmissions.toFixed(2)} tCO₂-e</span>
              </div>
            </div>
          </div>
        )}

        {/* Hidden PDF Content */}
        {data && (
          <div 
            style={{ 
              position: 'absolute', 
              left: '-9999px', 
              top: '-9999px',
              opacity: 0,
              pointerEvents: 'none',
            }}
          >
            <ACAReportContent data={data} contentId="aca-report-content" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ACAMonthlyReport;
