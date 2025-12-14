import React, { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { ReportData } from './ReportData';
import { ReportTemplate } from '@/pages/Reports';

export interface ReportBranding {
  companyName?: string;
  logoUrl?: string;
  contactEmail?: string;
  preparedBy?: string;
}

export interface PDFReportOptions {
  showWatermark?: boolean;
}

interface PDFReportContentProps {
  data: ReportData;
  template: ReportTemplate;
  branding?: ReportBranding;
  showWatermark?: boolean;
  contentId: string;
}

// HTML-based report content component
const PDFReportContent: React.FC<PDFReportContentProps> = ({ 
  data, 
  template, 
  branding,
  showWatermark,
  contentId 
}) => {
  const formatNumber = (num: number) => (num || 0).toFixed(2);

  const getReportTitle = () => {
    switch (template) {
      case 'executive':
        return 'Executive Summary Report';
      case 'compliance':
        return 'Compliance Assessment Report';
      case 'en15978':
        return 'EN 15978 Whole Life Carbon Report';
      case 'technical':
      default:
        return 'Technical Carbon Assessment Report';
    }
  };

  const renderExecutiveSummary = () => (
    <>
      <div className="pdf-section">
        <h2 className="pdf-section-title">Executive Summary</h2>
        <p className="pdf-text-muted mb-4">
          Total emissions for {data.project.name}: {formatNumber(data.emissions.total)} tCO₂e
        </p>
        {data.project.description && (
          <p className="pdf-text-muted text-sm">{data.project.description}</p>
        )}
      </div>

      <div className="pdf-section">
        <h2 className="pdf-section-title">Key Metrics</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="pdf-metric-box">
            <span className="pdf-metric-label">Scope 1</span>
            <span className="pdf-metric-value">{formatNumber(data.emissions.scope1)} tCO₂e</span>
          </div>
          <div className="pdf-metric-box">
            <span className="pdf-metric-label">Scope 2</span>
            <span className="pdf-metric-value">{formatNumber(data.emissions.scope2)} tCO₂e</span>
          </div>
          <div className="pdf-metric-box">
            <span className="pdf-metric-label">Scope 3</span>
            <span className="pdf-metric-value">{formatNumber(data.emissions.scope3)} tCO₂e</span>
          </div>
        </div>
      </div>

      <div className="pdf-section">
        <h2 className="pdf-section-title">Compliance Overview</h2>
        <div className="pdf-compliance-box">
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">NCC Compliance:</span>
            <span className={data.compliance.nccCompliant ? 'pdf-status-pass' : 'pdf-status-warn'}>
              {data.compliance.nccCompliant ? '✓ Compliant' : '⚠ Partial'}
            </span>
          </div>
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">Green Star Eligible:</span>
            <span className={data.compliance.greenStarEligible ? 'pdf-status-pass' : 'pdf-status-warn'}>
              {data.compliance.greenStarEligible ? '✓ Eligible' : '⚠ Review Required'}
            </span>
          </div>
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">NABERS Ready:</span>
            <span className={data.compliance.nabersReady ? 'pdf-status-pass' : 'pdf-status-warn'}>
              {data.compliance.nabersReady ? '✓ Ready' : '⚠ Additional Data Required'}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  const renderComplianceFocused = () => (
    <>
      <div className="pdf-section">
        <h2 className="pdf-section-title">Compliance Assessment</h2>
        <p className="pdf-text-muted mb-4">
          Detailed compliance assessment for {data.project.name} against Australian standards
        </p>
      </div>

      <div className="pdf-section">
        <h2 className="pdf-section-title">NCC Compliance (National Construction Code)</h2>
        <div className="pdf-compliance-box">
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">Status:</span>
            <span className={data.compliance.nccCompliant ? 'pdf-status-pass' : 'pdf-status-fail'}>
              {data.compliance.nccCompliant ? '✓ COMPLIANT' : '✗ REVIEW REQUIRED'}
            </span>
          </div>
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">Total Emissions:</span>
            <span className="pdf-compliance-value">{formatNumber(data.emissions.total)} tCO₂e</span>
          </div>
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">Scope 1 (Direct):</span>
            <span className="pdf-compliance-value">{formatNumber(data.emissions.scope1)} tCO₂e</span>
          </div>
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">Scope 2 (Energy):</span>
            <span className="pdf-compliance-value">{formatNumber(data.emissions.scope2)} tCO₂e</span>
          </div>
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">Scope 3 (Indirect):</span>
            <span className="pdf-compliance-value">{formatNumber(data.emissions.scope3)} tCO₂e</span>
          </div>
        </div>
      </div>

      <div className="pdf-section">
        <h2 className="pdf-section-title">GBCA Green Star Assessment</h2>
        <div className="pdf-compliance-box">
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">Eligibility:</span>
            <span className={data.compliance.greenStarEligible ? 'pdf-status-pass' : 'pdf-status-fail'}>
              {data.compliance.greenStarEligible ? '✓ ELIGIBLE' : '✗ NOT ELIGIBLE'}
            </span>
          </div>
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">Total Emissions:</span>
            <span className="pdf-compliance-value">{formatNumber(data.emissions.total)} tCO₂e</span>
          </div>
        </div>
      </div>

      <div className="pdf-section">
        <h2 className="pdf-section-title">NABERS Energy Assessment</h2>
        <div className="pdf-compliance-box">
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">Readiness:</span>
            <span className={data.compliance.nabersReady ? 'pdf-status-pass' : 'pdf-status-fail'}>
              {data.compliance.nabersReady ? '✓ READY' : '✗ ADDITIONAL DATA REQUIRED'}
            </span>
          </div>
          <div className="pdf-compliance-row">
            <span className="pdf-compliance-label">Scope 2 Emissions:</span>
            <span className="pdf-compliance-value">{formatNumber(data.emissions.scope2)} tCO₂e</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderTechnicalReport = () => (
    <>
      <div className="pdf-section">
        <h2 className="pdf-section-title">Project Information</h2>
        <div className="pdf-info-grid">
          <div className="pdf-info-row">
            <span className="pdf-info-label">Project Name:</span>
            <span className="pdf-info-value">{data.project.name}</span>
          </div>
          {data.project.project_type && (
            <div className="pdf-info-row">
              <span className="pdf-info-label">Project Type:</span>
              <span className="pdf-info-value">{data.project.project_type}</span>
            </div>
          )}
          {data.project.location && (
            <div className="pdf-info-row">
              <span className="pdf-info-label">Location:</span>
              <span className="pdf-info-value">{data.project.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="pdf-section">
        <h2 className="pdf-section-title">Emission Summary</h2>
        <div className="pdf-emission-card">
          <h3 className="pdf-emission-title">Total Carbon Footprint</h3>
          <p className="pdf-emission-value">{formatNumber(data.emissions.total)} tCO₂e</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="pdf-scope-card pdf-scope-1">
            <h4 className="pdf-scope-title">Scope 1</h4>
            <p className="pdf-scope-subtitle">Direct Emissions</p>
            <p className="pdf-scope-value">{formatNumber(data.emissions.scope1)} tCO₂e</p>
          </div>
          <div className="pdf-scope-card pdf-scope-2">
            <h4 className="pdf-scope-title">Scope 2</h4>
            <p className="pdf-scope-subtitle">Electricity</p>
            <p className="pdf-scope-value">{formatNumber(data.emissions.scope2)} tCO₂e</p>
          </div>
          <div className="pdf-scope-card pdf-scope-3">
            <h4 className="pdf-scope-title">Scope 3</h4>
            <p className="pdf-scope-subtitle">Materials & Transport</p>
            <p className="pdf-scope-value">{formatNumber(data.emissions.scope3)} tCO₂e</p>
          </div>
        </div>
      </div>

      {/* Materials Breakdown */}
      {Array.isArray(data.breakdown.materials) && data.breakdown.materials.length > 0 && (
        <div className="pdf-section">
          <h2 className="pdf-section-title">Materials Breakdown</h2>
          <table className="pdf-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Emissions (tCO₂e)</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdown.materials.slice(0, 10).map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td>{m.category}</td>
                  <td>{m.quantity} {m.unit}</td>
                  <td>{formatNumber(m.totalEmissions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderEN15978Report = () => (
    <>
      <div className="pdf-declaration-box">
        <h2 className="pdf-declaration-title">Declaration of Conformity</h2>
        <div className="pdf-declaration-grid">
          <div className="pdf-declaration-row">
            <span className="pdf-declaration-label">Standard:</span>
            <span className="pdf-declaration-value">EN 15978:2011</span>
          </div>
          <div className="pdf-declaration-row">
            <span className="pdf-declaration-label">Scope:</span>
            <span className="pdf-declaration-value">Whole Life Carbon Assessment</span>
          </div>
          <div className="pdf-declaration-row">
            <span className="pdf-declaration-label">Building Type:</span>
            <span className="pdf-declaration-value">{data.project.project_type || 'Commercial'}</span>
          </div>
          <div className="pdf-declaration-row">
            <span className="pdf-declaration-label">Reference Study Period:</span>
            <span className="pdf-declaration-value">60 years</span>
          </div>
          <div className="pdf-declaration-row">
            <span className="pdf-declaration-label">Functional Unit:</span>
            <span className="pdf-declaration-value">1 m² GIA per year</span>
          </div>
        </div>
      </div>

      <div className="pdf-section">
        <h2 className="pdf-section-title">Lifecycle Stage Summary</h2>
        <table className="pdf-table pdf-lifecycle-table">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th>Stage</th>
              <th>Description</th>
              <th>Emissions (kgCO₂e/m²)</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="pdf-stage-header">
              <td colSpan={4}>Product Stage (A1-A3)</td>
            </tr>
            <tr>
              <td>A1-A3</td>
              <td>Raw materials, transport, manufacturing</td>
              <td>{formatNumber(data.emissions.scope3 * 1000)}</td>
              <td>{data.emissions.total > 0 ? ((data.emissions.scope3 / data.emissions.total) * 100).toFixed(1) : 0}%</td>
            </tr>
            <tr className="pdf-stage-header">
              <td colSpan={4}>Construction Stage (A4-A5)</td>
            </tr>
            <tr>
              <td>A4</td>
              <td>Transport to site</td>
              <td>{formatNumber((data.emissions.scope3 || 0) * 50)}</td>
              <td>-</td>
            </tr>
            <tr>
              <td>A5</td>
              <td>Construction installation</td>
              <td>{formatNumber((data.emissions.scope1 || 0) * 1000)}</td>
              <td>-</td>
            </tr>
            <tr className="pdf-total-row">
              <td colSpan={2}><strong>TOTAL (A1-A5)</strong></td>
              <td><strong>{formatNumber(data.emissions.total * 1000)}</strong></td>
              <td><strong>100%</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pdf-section">
        <h2 className="pdf-section-title">Carbon Intensity</h2>
        <div className="pdf-intensity-box">
          <h3 className="pdf-intensity-title">Upfront Carbon (A1-A5)</h3>
          <p className="pdf-intensity-value">
            {formatNumber(data.emissions.total * 1000)} kgCO₂e total
          </p>
          <p className="pdf-intensity-unit">whole building</p>
        </div>
      </div>
    </>
  );

  return (
    <div 
      id={contentId}
      className="pdf-report-content"
      style={{ 
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '210mm',
        backgroundColor: 'white',
        padding: '40px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: '#333'
      }}
    >
      {/* Watermark */}
      {showWatermark && (
        <div className="pdf-watermark">
          Generated by CarbonConstruct
        </div>
      )}

      {/* Header */}
      <div className="pdf-header">
        <div className="pdf-header-row">
          <div>
            <p className="pdf-company-name">{branding?.companyName || 'CarbonConstruct'}</p>
            {branding?.preparedBy && (
              <p className="pdf-prepared-by">Prepared by: {branding.preparedBy}</p>
            )}
          </div>
          {branding?.logoUrl && (
            <img src={branding.logoUrl} alt="Logo" className="pdf-logo" crossOrigin="anonymous" />
          )}
        </div>
        <h1 className="pdf-title">{getReportTitle()}</h1>
        <p className="pdf-subtitle">{data.project.name}</p>
        <p className="pdf-subtitle">Generated: {new Date(data.metadata.generatedAt).toLocaleDateString()}</p>
      </div>

      {/* Template Content */}
      {template === 'executive' && renderExecutiveSummary()}
      {template === 'compliance' && renderComplianceFocused()}
      {template === 'technical' && renderTechnicalReport()}
      {template === 'en15978' && renderEN15978Report()}

      {/* Footer */}
      <div className="pdf-footer">
        <p>This report was generated using Australian NCC 2024 emission factors and methodologies.</p>
        <p>For questions about this assessment, contact: {branding?.contactEmail || 'support@carbonconstruct.com.au'}</p>
        <p className="mt-2">© {new Date().getFullYear()} {branding?.companyName || 'CarbonConstruct'}</p>
      </div>

      {/* Disclaimer */}
      <div className="pdf-disclaimer">
        <p className="pdf-disclaimer-title">DISCLAIMER & TERMS OF USE</p>
        <p className="pdf-disclaimer-text">
          This carbon assessment report is generated by CarbonConstruct Pty Ltd (ABN pending) using Australian emission factors 
          from NCC 2024, NABERS, and industry EPD sources. All calculations are estimates based on user-provided data and 
          standard emission factors. CarbonConstruct does not guarantee the accuracy, completeness, or reliability of results. 
          This report should not be used as the sole basis for regulatory compliance, financial decisions, or legal purposes 
          without independent verification by a qualified professional. Users are responsible for verifying data accuracy 
          and ensuring compliance with applicable regulations. By using this report, you agree to our full Terms of Service 
          and Privacy Policy available at carbonconstruct.com.au. CarbonConstruct accepts no liability for decisions made 
          based on this report. For certified compliance assessments, please consult an accredited carbon assessor. 
          © {new Date().getFullYear()} CarbonConstruct. All rights reserved.
        </p>
      </div>
    </div>
  );
};

interface PDFReportProps {
  data: ReportData;
  template?: ReportTemplate;
  filename?: string;
  branding?: ReportBranding;
  showWatermark?: boolean;
}

export const PDFReport: React.FC<PDFReportProps> = ({ 
  data,
  template = 'technical',
  filename,
  branding,
  showWatermark = false
}) => {
  const [loading, setLoading] = useState(false);
  const contentId = useId().replace(/:/g, '-') + '-pdf-content';
  const defaultFilename = `carbon-report-${data.project.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;

  const handleDownload = async () => {
    setLoading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById(contentId);
      
      if (!element) {
        console.error('PDF content element not found');
        return;
      }

      await html2pdf()
        .set({
          margin: 10,
          filename: filename || defaultFilename,
          html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
          }
        })
        .from(element)
        .save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PDFReportContent 
        data={data} 
        template={template} 
        branding={branding} 
        showWatermark={showWatermark}
        contentId={contentId}
      />
      <Button onClick={handleDownload} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF Report
          </>
        )}
      </Button>
    </>
  );
};
