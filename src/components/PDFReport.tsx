import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileDown, Loader2, Eye, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ReportData } from './ReportData';
import { ReportTemplate } from '@/pages/Reports';
import { EcoPlatformComplianceReport } from '@/lib/eco-platform-types';


export interface ReportBranding {
  companyName?: string;
  logoUrl?: string;
  contactEmail?: string;
  preparedBy?: string;
}

export interface PDFReportOptions {
  showWatermark?: boolean;
}

export interface EPDExpiryAlert {
  materialName: string;
  epdNumber?: string;
  manufacturer?: string;
  expiryDate: string;
  daysUntil: number;
  status: 'expired' | 'critical' | 'warning' | 'upcoming';
}

interface PDFReportContentProps {
  data: ReportData;
  template: ReportTemplate;
  branding?: ReportBranding;
  showWatermark?: boolean;
  contentId: string;
  ecoComplianceReport?: EcoPlatformComplianceReport | null;
  epdExpiryAlerts?: EPDExpiryAlert[];
  forPreview?: boolean;
}

// HTML-based report content component
const PDFReportContent: React.FC<PDFReportContentProps> = ({ 
  data, 
  template, 
  branding,
  showWatermark,
  contentId,
  ecoComplianceReport,
  epdExpiryAlerts = [],
  forPreview = false
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

  // Inline style constants for reliable html2canvas capture
  const pdfStyles = {
    section: { marginBottom: '24px' } as React.CSSProperties,
    sectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#2d5a27', borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '16px' } as React.CSSProperties,
    textMuted: { color: '#666', fontSize: '12px', marginBottom: '12px' } as React.CSSProperties,
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' } as React.CSSProperties,
    metricBox: { padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '4px', textAlign: 'center' as const, border: '1px solid #bbf7d0' } as React.CSSProperties,
    metricLabel: { display: 'block', fontSize: '11px', color: '#666', marginBottom: '4px' } as React.CSSProperties,
    metricValue: { display: 'block', fontSize: '18px', fontWeight: 'bold', color: '#2d5a27' } as React.CSSProperties,
    complianceBox: { padding: '16px', backgroundColor: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb' } as React.CSSProperties,
    complianceRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' } as React.CSSProperties,
    complianceLabel: { fontWeight: 'bold', fontSize: '12px' } as React.CSSProperties,
    complianceValue: { fontSize: '12px' } as React.CSSProperties,
    statusPass: { color: '#16a34a', fontWeight: 'bold' } as React.CSSProperties,
    statusWarn: { color: '#d97706', fontWeight: 'bold' } as React.CSSProperties,
    statusFail: { color: '#dc2626', fontWeight: 'bold' } as React.CSSProperties,
    infoGrid: { display: 'grid', gap: '8px' } as React.CSSProperties,
    infoRow: { display: 'flex', gap: '8px' } as React.CSSProperties,
    infoLabel: { fontWeight: 'bold', minWidth: '120px', fontSize: '11px' } as React.CSSProperties,
    infoValue: { fontSize: '11px' } as React.CSSProperties,
    emissionCard: { padding: '20px', backgroundColor: '#2d5a27', borderRadius: '8px', textAlign: 'center' as const, color: '#ffffff', marginBottom: '16px' } as React.CSSProperties,
    emissionTitle: { fontSize: '14px', marginBottom: '8px', color: '#ffffff' } as React.CSSProperties,
    emissionValue: { fontSize: '28px', fontWeight: 'bold', color: '#ffffff' } as React.CSSProperties,
    scopeCard: (bg: string, borderColor: string) => ({ padding: '16px', backgroundColor: bg, borderRadius: '4px', textAlign: 'center' as const, border: `1px solid ${borderColor}` }) as React.CSSProperties,
    scopeTitle: { fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' } as React.CSSProperties,
    scopeSubtitle: { fontSize: '10px', color: '#666', marginBottom: '8px' } as React.CSSProperties,
    scopeValue: { fontSize: '18px', fontWeight: 'bold' } as React.CSSProperties,
    table: { width: '100%', borderCollapse: 'collapse' as const, marginBottom: '16px', fontSize: '10px' } as React.CSSProperties,
    th: { padding: '8px', border: '1px solid #ccc', backgroundColor: '#f9fafb', fontWeight: 'bold', textAlign: 'left' as const } as React.CSSProperties,
    td: { padding: '8px', border: '1px solid #ccc' } as React.CSSProperties,
    declarationBox: { padding: '16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '24px' } as React.CSSProperties,
    declarationTitle: { fontSize: '16px', fontWeight: 'bold', color: '#1e40af', marginBottom: '12px' } as React.CSSProperties,
    declarationRow: { display: 'flex', gap: '8px', marginBottom: '6px' } as React.CSSProperties,
    declarationLabel: { fontWeight: 'bold', minWidth: '160px', fontSize: '11px' } as React.CSSProperties,
    declarationValue: { fontSize: '11px' } as React.CSSProperties,
    intensityBox: { padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '4px', textAlign: 'center' as const, border: '1px solid #bae6fd' } as React.CSSProperties,
    intensityTitle: { fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' } as React.CSSProperties,
    intensityValue: { fontSize: '18px', fontWeight: 'bold', color: '#0369a1' } as React.CSSProperties,
    intensityUnit: { fontSize: '10px', color: '#666' } as React.CSSProperties,
    warningBox: { padding: '12px', backgroundColor: '#fffbeb', borderRadius: '4px', border: '1px solid #fde68a' } as React.CSSProperties,
    stageHeader: { backgroundColor: '#1e40af', color: '#ffffff', fontWeight: 'bold', padding: '8px', fontSize: '11px' } as React.CSSProperties,
    subtotalRow: { backgroundColor: '#e0f2fe', fontWeight: 'bold' } as React.CSSProperties,
    totalRow: { backgroundColor: '#1e40af', color: '#ffffff', fontWeight: 'bold' } as React.CSSProperties,
  };

  const renderExecutiveSummary = () => (
    <>
      <div style={pdfStyles.section}>
        <h2 style={pdfStyles.sectionTitle}>Executive Summary</h2>
        <p style={pdfStyles.textMuted}>
          Total emissions for {data.project.name}: {formatNumber(data.emissions.total)} tCO₂e
        </p>
        {data.project.description && (
          <p style={{ ...pdfStyles.textMuted, fontSize: '11px' }}>{data.project.description}</p>
        )}
      </div>

      <div style={pdfStyles.section}>
        <h2 style={pdfStyles.sectionTitle}>Key Metrics</h2>
        <div style={pdfStyles.grid3}>
          <div style={pdfStyles.metricBox}>
            <span style={pdfStyles.metricLabel}>Scope 1</span>
            <span style={pdfStyles.metricValue}>{formatNumber(data.emissions.scope1)} tCO₂e</span>
          </div>
          <div style={pdfStyles.metricBox}>
            <span style={pdfStyles.metricLabel}>Scope 2</span>
            <span style={pdfStyles.metricValue}>{formatNumber(data.emissions.scope2)} tCO₂e</span>
          </div>
          <div style={pdfStyles.metricBox}>
            <span style={pdfStyles.metricLabel}>Scope 3</span>
            <span style={pdfStyles.metricValue}>{formatNumber(data.emissions.scope3)} tCO₂e</span>
          </div>
        </div>
      </div>

      <div style={pdfStyles.section}>
        <h2 style={pdfStyles.sectionTitle}>Compliance Overview</h2>
        <div style={pdfStyles.complianceBox}>
          <div style={pdfStyles.complianceRow}>
            <span style={pdfStyles.complianceLabel}>NCC Compliance:</span>
            <span style={data.compliance.nccCompliant ? pdfStyles.statusPass : pdfStyles.statusWarn}>
              {data.compliance.nccCompliant ? '✓ Compliant' : '⚠ Partial'}
            </span>
          </div>
          <div style={pdfStyles.complianceRow}>
            <span style={pdfStyles.complianceLabel}>Green Star Eligible:</span>
            <span style={data.compliance.greenStarEligible ? pdfStyles.statusPass : pdfStyles.statusWarn}>
              {data.compliance.greenStarEligible ? '✓ Eligible' : '⚠ Review Required'}
            </span>
          </div>
          <div style={{ ...pdfStyles.complianceRow, borderBottom: 'none' }}>
            <span style={pdfStyles.complianceLabel}>NABERS Ready:</span>
            <span style={data.compliance.nabersReady ? pdfStyles.statusPass : pdfStyles.statusWarn}>
              {data.compliance.nabersReady ? '✓ Ready' : '⚠ Additional Data Required'}
            </span>
          </div>
        </div>
      </div>
    </>
  );

  const renderComplianceFocused = () => (
    <>
      <div style={pdfStyles.section}>
        <h2 style={pdfStyles.sectionTitle}>Compliance Assessment</h2>
        <p style={pdfStyles.textMuted}>
          Detailed compliance assessment for {data.project.name} against Australian standards
        </p>
      </div>

      <div style={pdfStyles.section}>
        <h2 style={pdfStyles.sectionTitle}>NCC Compliance (National Construction Code)</h2>
        <div style={pdfStyles.complianceBox}>
          <div style={pdfStyles.complianceRow}>
            <span style={pdfStyles.complianceLabel}>Status:</span>
            <span style={data.compliance.nccCompliant ? pdfStyles.statusPass : pdfStyles.statusFail}>
              {data.compliance.nccCompliant ? '✓ COMPLIANT' : '✗ REVIEW REQUIRED'}
            </span>
          </div>
          <div style={pdfStyles.complianceRow}>
            <span style={pdfStyles.complianceLabel}>Total Emissions:</span>
            <span style={pdfStyles.complianceValue}>{formatNumber(data.emissions.total)} tCO₂e</span>
          </div>
          <div style={pdfStyles.complianceRow}>
            <span style={pdfStyles.complianceLabel}>Scope 1 (Direct):</span>
            <span style={pdfStyles.complianceValue}>{formatNumber(data.emissions.scope1)} tCO₂e</span>
          </div>
          <div style={pdfStyles.complianceRow}>
            <span style={pdfStyles.complianceLabel}>Scope 2 (Energy):</span>
            <span style={pdfStyles.complianceValue}>{formatNumber(data.emissions.scope2)} tCO₂e</span>
          </div>
          <div style={{ ...pdfStyles.complianceRow, borderBottom: 'none' }}>
            <span style={pdfStyles.complianceLabel}>Scope 3 (Indirect):</span>
            <span style={pdfStyles.complianceValue}>{formatNumber(data.emissions.scope3)} tCO₂e</span>
          </div>
        </div>
      </div>

      <div style={pdfStyles.section}>
        <h2 style={pdfStyles.sectionTitle}>GBCA Green Star Assessment</h2>
        <div style={pdfStyles.complianceBox}>
          <div style={pdfStyles.complianceRow}>
            <span style={pdfStyles.complianceLabel}>Eligibility:</span>
            <span style={data.compliance.greenStarEligible ? pdfStyles.statusPass : pdfStyles.statusFail}>
              {data.compliance.greenStarEligible ? '✓ ELIGIBLE' : '✗ NOT ELIGIBLE'}
            </span>
          </div>
          <div style={{ ...pdfStyles.complianceRow, borderBottom: 'none' }}>
            <span style={pdfStyles.complianceLabel}>Total Emissions:</span>
            <span style={pdfStyles.complianceValue}>{formatNumber(data.emissions.total)} tCO₂e</span>
          </div>
        </div>
      </div>

      <div style={pdfStyles.section}>
        <h2 style={pdfStyles.sectionTitle}>NABERS Energy Assessment</h2>
        <div style={pdfStyles.complianceBox}>
          <div style={pdfStyles.complianceRow}>
            <span style={pdfStyles.complianceLabel}>Readiness:</span>
            <span style={data.compliance.nabersReady ? pdfStyles.statusPass : pdfStyles.statusFail}>
              {data.compliance.nabersReady ? '✓ READY' : '✗ ADDITIONAL DATA REQUIRED'}
            </span>
          </div>
          <div style={{ ...pdfStyles.complianceRow, borderBottom: 'none' }}>
            <span style={pdfStyles.complianceLabel}>Scope 2 Emissions:</span>
            <span style={pdfStyles.complianceValue}>{formatNumber(data.emissions.scope2)} tCO₂e</span>
          </div>
        </div>
      </div>
    </>
  );

  const renderTechnicalReport = () => (
    <>
      <div style={pdfStyles.section}>
        <h2 style={pdfStyles.sectionTitle}>Project Information</h2>
        <div style={pdfStyles.infoGrid}>
          <div style={pdfStyles.infoRow}>
            <span style={pdfStyles.infoLabel}>Project Name:</span>
            <span style={pdfStyles.infoValue}>{data.project.name}</span>
          </div>
          {data.project.project_type && (
            <div style={pdfStyles.infoRow}>
              <span style={pdfStyles.infoLabel}>Project Type:</span>
              <span style={pdfStyles.infoValue}>{data.project.project_type}</span>
            </div>
          )}
          {data.project.location && (
            <div style={pdfStyles.infoRow}>
              <span style={pdfStyles.infoLabel}>Location:</span>
              <span style={pdfStyles.infoValue}>{data.project.location}</span>
            </div>
          )}
        </div>
      </div>

      <div style={pdfStyles.section}>
        <h2 style={pdfStyles.sectionTitle}>Emission Summary</h2>
        <div style={pdfStyles.emissionCard}>
          <h3 style={pdfStyles.emissionTitle}>Total Carbon Footprint</h3>
          <p style={pdfStyles.emissionValue}>{formatNumber(data.emissions.total)} tCO₂e</p>
        </div>
        
        <div style={{ ...pdfStyles.grid3, marginTop: '16px' }}>
          <div style={pdfStyles.scopeCard('#f0fdf4', '#bbf7d0')}>
            <h4 style={pdfStyles.scopeTitle}>Scope 1</h4>
            <p style={pdfStyles.scopeSubtitle}>Direct Emissions</p>
            <p style={{ ...pdfStyles.scopeValue, color: '#16a34a' }}>{formatNumber(data.emissions.scope1)} tCO₂e</p>
          </div>
          <div style={pdfStyles.scopeCard('#eff6ff', '#bfdbfe')}>
            <h4 style={pdfStyles.scopeTitle}>Scope 2</h4>
            <p style={pdfStyles.scopeSubtitle}>Electricity</p>
            <p style={{ ...pdfStyles.scopeValue, color: '#2563eb' }}>{formatNumber(data.emissions.scope2)} tCO₂e</p>
          </div>
          <div style={pdfStyles.scopeCard('#fef3c7', '#fde68a')}>
            <h4 style={pdfStyles.scopeTitle}>Scope 3</h4>
            <p style={pdfStyles.scopeSubtitle}>Materials & Transport</p>
            <p style={{ ...pdfStyles.scopeValue, color: '#d97706' }}>{formatNumber(data.emissions.scope3)} tCO₂e</p>
          </div>
        </div>
      </div>

      {/* Materials Breakdown */}
      {Array.isArray(data.breakdown.materials) && data.breakdown.materials.length > 0 && (
        <div style={pdfStyles.section}>
          <h2 style={pdfStyles.sectionTitle}>Materials Breakdown</h2>
          <table style={pdfStyles.table}>
            <thead>
              <tr>
                <th style={pdfStyles.th}>Material</th>
                <th style={pdfStyles.th}>Category</th>
                <th style={pdfStyles.th}>Quantity</th>
                <th style={pdfStyles.th}>Emissions (tCO₂e)</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdown.materials.map((m, i) => (
                <tr key={i}>
                  <td style={pdfStyles.td}>{m.name}</td>
                  <td style={pdfStyles.td}>{m.category}</td>
                  <td style={pdfStyles.td}>{m.quantity} {m.unit}</td>
                  <td style={pdfStyles.td}>{formatNumber(m.totalEmissions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const renderEN15978Report = () => {
    const wl = data.wholeLife;
    const hasWholeLife = !!wl;
    
    // Calculate totals from whole life data or fall back to emission scopes
    const a1a3 = hasWholeLife ? wl.a1a3_product : data.emissions.scope3 * 1000;
    const a4 = hasWholeLife ? wl.a4_transport : 0;
    const a5 = hasWholeLife ? wl.a5_construction : data.emissions.scope1 * 1000;
    const totalUpfront = hasWholeLife ? wl.total_upfront : (a1a3 + a4 + a5);
    
    // Use phase (B1-B7)
    const b1b5 = hasWholeLife ? (wl.b1_use + wl.b2_maintenance + wl.b3_repair + wl.b4_replacement + wl.b5_refurbishment) : 0;
    const b6 = hasWholeLife ? wl.b6_operational_energy : 0;
    const b7 = hasWholeLife ? wl.b7_operational_water : 0;
    
    // End of life (C1-C4)
    const c1c4 = hasWholeLife ? (wl.c1_deconstruction + wl.c2_transport + wl.c3_waste_processing + wl.c4_disposal) : 0;
    
    // Module D (credits)
    const moduleD = hasWholeLife ? (wl.d_recycling + wl.d_reuse + wl.d_energy_recovery) : 0;
    
    // Total whole life
    const totalWholeLife = hasWholeLife ? wl.total_whole_life : totalUpfront;
    const totalWithBenefits = hasWholeLife ? wl.total_with_benefits : totalUpfront;
    
    // Calculate percentages
    const calcPercent = (val: number) => totalWholeLife > 0 ? ((val / totalWholeLife) * 100).toFixed(1) : '0';
    
    return (
      <>
        <div style={pdfStyles.declarationBox}>
          <h2 style={pdfStyles.declarationTitle}>Declaration of Conformity</h2>
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={pdfStyles.declarationRow}>
              <span style={pdfStyles.declarationLabel}>Standard:</span>
              <span style={pdfStyles.declarationValue}>EN 15978:2011</span>
            </div>
            <div style={pdfStyles.declarationRow}>
              <span style={pdfStyles.declarationLabel}>Scope:</span>
              <span style={pdfStyles.declarationValue}>Whole Life Carbon Assessment</span>
            </div>
            <div style={pdfStyles.declarationRow}>
              <span style={pdfStyles.declarationLabel}>Building Type:</span>
              <span style={pdfStyles.declarationValue}>{data.project.project_type || 'Commercial'}</span>
            </div>
            <div style={pdfStyles.declarationRow}>
              <span style={pdfStyles.declarationLabel}>Reference Study Period:</span>
              <span style={pdfStyles.declarationValue}>60 years</span>
            </div>
            <div style={pdfStyles.declarationRow}>
              <span style={pdfStyles.declarationLabel}>Functional Unit:</span>
              <span style={pdfStyles.declarationValue}>1 m² GIA per year</span>
            </div>
          </div>
        </div>

        <div style={pdfStyles.section}>
          <h2 style={pdfStyles.sectionTitle}>Lifecycle Stage Summary</h2>
          <table style={pdfStyles.table}>
            <thead>
              <tr style={{ backgroundColor: '#1e40af', color: '#ffffff' }}>
                <th style={{ ...pdfStyles.th, backgroundColor: '#1e40af', color: '#ffffff' }}>Stage</th>
                <th style={{ ...pdfStyles.th, backgroundColor: '#1e40af', color: '#ffffff' }}>Description</th>
                <th style={{ ...pdfStyles.th, backgroundColor: '#1e40af', color: '#ffffff' }}>Emissions (kgCO₂e)</th>
                <th style={{ ...pdfStyles.th, backgroundColor: '#1e40af', color: '#ffffff' }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={{ ...pdfStyles.td, ...pdfStyles.stageHeader }}>Product Stage (A1-A3)</td>
              </tr>
              <tr>
                <td style={pdfStyles.td}>A1-A3</td>
                <td style={pdfStyles.td}>Raw materials, transport, manufacturing</td>
                <td style={pdfStyles.td}>{formatNumber(a1a3)}</td>
                <td style={pdfStyles.td}>{calcPercent(a1a3)}%</td>
              </tr>
              <tr>
                <td colSpan={4} style={{ ...pdfStyles.td, ...pdfStyles.stageHeader }}>Construction Stage (A4-A5)</td>
              </tr>
              <tr>
                <td style={pdfStyles.td}>A4</td>
                <td style={pdfStyles.td}>Transport to site</td>
                <td style={pdfStyles.td}>{formatNumber(a4)}</td>
                <td style={pdfStyles.td}>{calcPercent(a4)}%</td>
              </tr>
              <tr>
                <td style={pdfStyles.td}>A5</td>
                <td style={pdfStyles.td}>Construction installation</td>
                <td style={pdfStyles.td}>{formatNumber(a5)}</td>
                <td style={pdfStyles.td}>{calcPercent(a5)}%</td>
              </tr>
              <tr style={pdfStyles.subtotalRow}>
                <td colSpan={2} style={{ ...pdfStyles.td, fontWeight: 'bold' }}>Subtotal Upfront (A1-A5)</td>
                <td style={{ ...pdfStyles.td, fontWeight: 'bold' }}>{formatNumber(totalUpfront)}</td>
                <td style={{ ...pdfStyles.td, fontWeight: 'bold' }}>{calcPercent(totalUpfront)}%</td>
              </tr>
              
              {hasWholeLife && (
                <>
                  <tr>
                    <td colSpan={4} style={{ ...pdfStyles.td, ...pdfStyles.stageHeader }}>Use Stage (B1-B7)</td>
                  </tr>
                  <tr>
                    <td style={pdfStyles.td}>B1-B5</td>
                    <td style={pdfStyles.td}>Embodied (maintenance, replacement, refurbishment)</td>
                    <td style={pdfStyles.td}>{formatNumber(b1b5)}</td>
                    <td style={pdfStyles.td}>{calcPercent(b1b5)}%</td>
                  </tr>
                  <tr>
                    <td style={pdfStyles.td}>B6</td>
                    <td style={pdfStyles.td}>Operational energy</td>
                    <td style={pdfStyles.td}>{formatNumber(b6)}</td>
                    <td style={pdfStyles.td}>{calcPercent(b6)}%</td>
                  </tr>
                  <tr>
                    <td style={pdfStyles.td}>B7</td>
                    <td style={pdfStyles.td}>Operational water</td>
                    <td style={pdfStyles.td}>{formatNumber(b7)}</td>
                    <td style={pdfStyles.td}>{calcPercent(b7)}%</td>
                  </tr>
                  
                  <tr>
                    <td colSpan={4} style={{ ...pdfStyles.td, ...pdfStyles.stageHeader }}>End of Life Stage (C1-C4)</td>
                  </tr>
                  <tr>
                    <td style={pdfStyles.td}>C1-C4</td>
                    <td style={pdfStyles.td}>Deconstruction, transport, waste processing, disposal</td>
                    <td style={pdfStyles.td}>{formatNumber(c1c4)}</td>
                    <td style={pdfStyles.td}>{calcPercent(c1c4)}%</td>
                  </tr>
                  
                  <tr>
                    <td colSpan={4} style={{ ...pdfStyles.td, ...pdfStyles.stageHeader }}>Module D (Beyond Building Lifecycle)</td>
                  </tr>
                  <tr>
                    <td style={pdfStyles.td}>D</td>
                    <td style={pdfStyles.td}>Recycling, reuse, energy recovery credits</td>
                    <td style={{ ...pdfStyles.td, color: moduleD < 0 ? '#16a34a' : undefined }}>{formatNumber(moduleD)}</td>
                    <td style={pdfStyles.td}>-</td>
                  </tr>
                </>
              )}
              
              <tr style={pdfStyles.totalRow}>
                <td colSpan={2} style={{ ...pdfStyles.td, fontWeight: 'bold', backgroundColor: '#1e40af', color: '#ffffff' }}>TOTAL WHOLE LIFE (A-C)</td>
                <td style={{ ...pdfStyles.td, fontWeight: 'bold', backgroundColor: '#1e40af', color: '#ffffff' }}>{formatNumber(totalWholeLife)}</td>
                <td style={{ ...pdfStyles.td, fontWeight: 'bold', backgroundColor: '#1e40af', color: '#ffffff' }}>100%</td>
              </tr>
              {hasWholeLife && moduleD !== 0 && (
                <tr style={{ backgroundColor: '#f0fdf4' }}>
                  <td colSpan={2} style={{ ...pdfStyles.td, fontWeight: 'bold' }}>NET WITH BENEFITS (A-D)</td>
                  <td style={{ ...pdfStyles.td, fontWeight: 'bold' }}>{formatNumber(totalWithBenefits)}</td>
                  <td style={pdfStyles.td}>-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={pdfStyles.section}>
          <h2 style={pdfStyles.sectionTitle}>Carbon Intensity</h2>
          <div style={pdfStyles.grid3}>
            <div style={pdfStyles.intensityBox}>
              <h3 style={pdfStyles.intensityTitle}>Upfront Carbon (A1-A5)</h3>
              <p style={pdfStyles.intensityValue}>{formatNumber(totalUpfront)} kgCO₂e</p>
              {hasWholeLife && wl.intensity_upfront && (
                <p style={pdfStyles.intensityUnit}>{formatNumber(wl.intensity_upfront)} kgCO₂e/m²</p>
              )}
            </div>
            <div style={pdfStyles.intensityBox}>
              <h3 style={pdfStyles.intensityTitle}>Whole Life (A-C)</h3>
              <p style={pdfStyles.intensityValue}>{formatNumber(totalWholeLife)} kgCO₂e</p>
              {hasWholeLife && wl.intensity_whole_life && (
                <p style={pdfStyles.intensityUnit}>{formatNumber(wl.intensity_whole_life)} kgCO₂e/m²</p>
              )}
            </div>
            <div style={pdfStyles.intensityBox}>
              <h3 style={pdfStyles.intensityTitle}>Net with Benefits (A-D)</h3>
              <p style={pdfStyles.intensityValue}>{formatNumber(totalWithBenefits)} kgCO₂e</p>
              {hasWholeLife && wl.intensity_with_benefits && (
                <p style={pdfStyles.intensityUnit}>{formatNumber(wl.intensity_with_benefits)} kgCO₂e/m²</p>
              )}
            </div>
          </div>
        </div>
        
        {!hasWholeLife && (
          <div style={pdfStyles.warningBox}>
            <p style={{ fontSize: '11px' }}>
              ⚠️ This report shows only upfront carbon (A1-A5). Complete the Use Phase (B1-B7), 
              End of Life (C1-C4), and Module D calculators for a comprehensive whole life assessment.
            </p>
          </div>
        )}
      </>
    );
  };

  const renderEcoComplianceSection = () => {
    if (!ecoComplianceReport) return null;
    
    return (
      <div className="pdf-section" style={{ pageBreakBefore: 'always' }}>
        <h2 className="pdf-section-title" style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '16px' }}>
          ECO Platform Compliance Declaration
        </h2>
        <p style={{ fontSize: '11px', marginBottom: '16px', color: '#666' }}>
          LCA Calculation Rules V2.0 (December 2024) | Compliance Score: {ecoComplianceReport.complianceValidation.complianceScore}%
        </p>

        {/* Standards Compliance */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Standards Compliance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { name: 'EN 15804+A2', compliant: ecoComplianceReport.standardsCompliance.en15804A2 },
              { name: 'ECO Platform V2.0', compliant: ecoComplianceReport.standardsCompliance.ecoPlatformV2 },
              { name: 'ISO 14025', compliant: ecoComplianceReport.standardsCompliance.iso14025 },
              { name: 'ISO 21930', compliant: ecoComplianceReport.standardsCompliance.iso21930 },
            ].map((s) => (
              <div key={s.name} style={{ 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                backgroundColor: s.compliant ? '#f0fdf4' : '#fef2f2'
              }}>
                <span style={{ fontSize: '10px' }}>{s.compliant ? '✓' : '✗'} {s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Details Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', fontSize: '10px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', width: '35%', backgroundColor: '#f9fafb' }}>
                Electricity Modelling (§2.5)
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {ecoComplianceReport.energyTransparency.electricityModellingApproach} approach | 
                {ecoComplianceReport.energyTransparency.electricityPercentageOfA1A3.toFixed(1)}% of A1-A3
                {ecoComplianceReport.energyTransparency.electricityGwpKgCO2ePerKwh !== null && 
                  ` | GWP: ${ecoComplianceReport.energyTransparency.electricityGwpKgCO2ePerKwh.toFixed(3)} kgCO2e/kWh`}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                Characterisation Factors (§2.9)
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {ecoComplianceReport.characterisationFactors.version} ({ecoComplianceReport.characterisationFactors.source})
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                Allocation Method (§2.6)
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {ecoComplianceReport.allocationStatement.allocationMethodUsed}
                {ecoComplianceReport.allocationStatement.coProductsPresent && 
                  ` | Economic allocation for slag/fly ash: ${ecoComplianceReport.allocationStatement.economicAllocationForSlagFlyAsh ? '✓' : '✗'}`}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                Data Quality (§2.7)
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                Rating: <strong>{ecoComplianceReport.dataQuality.overallRating}</strong> | 
                Temporal: {ecoComplianceReport.dataQuality.temporalCoverage} | 
                Geographical: {ecoComplianceReport.dataQuality.geographicalCoverage}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                Biogenic Carbon (§2.11)
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {ecoComplianceReport.biogenicCarbon.totalBiogenicCarbonKgC.toFixed(2)} kg C
                {ecoComplianceReport.biogenicCarbon.biogenicCarbonKgCO2e !== null && 
                  ` (${ecoComplianceReport.biogenicCarbon.biogenicCarbonKgCO2e.toFixed(2)} kg CO2-e)`}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>
                Manufacturing Locations (§2.12)
              </td>
              <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                {ecoComplianceReport.manufacturingLocations.length > 0 
                  ? ecoComplianceReport.manufacturingLocations.map(l => `${l.city}, ${l.country}`).join('; ')
                  : 'Not specified'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Validation Summary */}
        <div style={{ 
          padding: '12px', 
          borderRadius: '4px',
          backgroundColor: ecoComplianceReport.complianceValidation.isFullyCompliant ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${ecoComplianceReport.complianceValidation.isFullyCompliant ? '#bbf7d0' : '#fecaca'}`
        }}>
          <p style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
            {ecoComplianceReport.complianceValidation.isFullyCompliant 
              ? '✓ Fully Compliant with ECO Platform LCA Calculation Rules V2.0'
              : `⚠ ${ecoComplianceReport.complianceValidation.nonCompliantItems.length} compliance issue(s) found`}
          </p>
          {ecoComplianceReport.complianceValidation.warnings.length > 0 && (
            <p style={{ fontSize: '10px', color: '#92400e' }}>
              {ecoComplianceReport.complianceValidation.warnings.length} warning(s)
            </p>
          )}
        </div>

        <p style={{ fontSize: '9px', color: '#666', marginTop: '12px' }}>
          This declaration is prepared in accordance with ECO Platform LCA Calculation Rules V2.0 
          (December 2024) and EN 15804:2012+A2:2019 standards.
        </p>
      </div>
    );
  };

  // EPD Expiry Alerts Section for PDF
  const renderEPDExpiryAlerts = () => {
    if (!epdExpiryAlerts || epdExpiryAlerts.length === 0) return null;

    const expiredCount = epdExpiryAlerts.filter(a => a.status === 'expired').length;
    const criticalCount = epdExpiryAlerts.filter(a => a.status === 'critical').length;
    const warningCount = epdExpiryAlerts.filter(a => a.status === 'warning').length;

    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'expired': return { backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' };
        case 'critical': return { backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' };
        case 'warning': return { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' };
        default: return { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' };
      }
    };

    const getStatusLabel = (status: string, daysUntil: number) => {
      switch (status) {
        case 'expired': return `Expired ${Math.abs(daysUntil)} days ago`;
        case 'critical': return `Expires in ${daysUntil} days`;
        case 'warning': return `Expires in ${daysUntil} days`;
        default: return `Expires in ${daysUntil} days`;
      }
    };

    return (
      <div className="pdf-section" style={{ pageBreakBefore: 'auto', marginTop: '24px' }}>
        <h2 className="pdf-section-title" style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '2px solid #b91c1c', paddingBottom: '8px', marginBottom: '16px', color: '#b91c1c' }}>
          ⚠️ EPD Certification Alerts
        </h2>
        
        {/* Summary */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {expiredCount > 0 && (
            <div style={{ padding: '8px 12px', backgroundColor: '#fef2f2', borderRadius: '4px', border: '1px solid #fecaca' }}>
              <span style={{ fontWeight: 'bold', color: '#b91c1c', fontSize: '14px' }}>{expiredCount}</span>
              <span style={{ color: '#b91c1c', fontSize: '11px', marginLeft: '4px' }}>Expired</span>
            </div>
          )}
          {criticalCount > 0 && (
            <div style={{ padding: '8px 12px', backgroundColor: '#fff7ed', borderRadius: '4px', border: '1px solid #fed7aa' }}>
              <span style={{ fontWeight: 'bold', color: '#c2410c', fontSize: '14px' }}>{criticalCount}</span>
              <span style={{ color: '#c2410c', fontSize: '11px', marginLeft: '4px' }}>Critical (≤30 days)</span>
            </div>
          )}
          {warningCount > 0 && (
            <div style={{ padding: '8px 12px', backgroundColor: '#fffbeb', borderRadius: '4px', border: '1px solid #fde68a' }}>
              <span style={{ fontWeight: 'bold', color: '#b45309', fontSize: '14px' }}>{warningCount}</span>
              <span style={{ color: '#b45309', fontSize: '11px', marginLeft: '4px' }}>Warning (≤90 days)</span>
            </div>
          )}
        </div>

        {/* Alerts Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Material</th>
              <th style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'left' }}>EPD Number</th>
              <th style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Manufacturer</th>
              <th style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'left' }}>Expiry Date</th>
              <th style={{ padding: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {epdExpiryAlerts.map((alert, idx) => {
              const statusStyle = getStatusStyle(alert.status);
              return (
                <tr key={idx}>
                  <td style={{ padding: '6px 8px', border: '1px solid #e5e7eb', fontWeight: '500' }}>{alert.materialName}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e5e7eb', fontFamily: 'monospace' }}>{alert.epdNumber || '-'}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e5e7eb' }}>{alert.manufacturer || '-'}</td>
                  <td style={{ padding: '6px 8px', border: '1px solid #e5e7eb' }}>{new Date(alert.expiryDate).toLocaleDateString()}</td>
                  <td style={{ 
                    padding: '6px 8px', 
                    border: '1px solid #e5e7eb', 
                    textAlign: 'center',
                    backgroundColor: statusStyle.backgroundColor,
                    color: statusStyle.color,
                    fontWeight: '600'
                  }}>
                    {getStatusLabel(alert.status, alert.daysUntil)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ fontSize: '9px', color: '#666', marginTop: '12px' }}>
          EPD certifications should be renewed before expiry to maintain compliance with EN 15804+A2 and Green Star requirements.
          Contact your material suppliers or the EPD program operator to obtain updated certifications.
        </p>
      </div>
    );
  };

  return (
    <div
      id={contentId}
      className="pdf-report-content"
      data-theme="light"
      style={{
        // Keep in viewport but invisible - html2canvas needs visible elements
        position: forPreview ? 'static' : 'fixed',
        left: forPreview ? 'auto' : '0',
        top: forPreview ? 'auto' : '0',
        width: forPreview ? '100%' : '210mm',
        opacity: forPreview ? 1 : 0,
        pointerEvents: forPreview ? 'auto' : 'none',
        zIndex: forPreview ? 'auto' : '-9999',
        backgroundColor: '#ffffff',
        padding: '40px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: '#333333',
        colorScheme: 'light'
      } as React.CSSProperties}
    >
      {/* Watermark - uses brand green for visibility in both light/dark modes */}
      {showWatermark && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%) rotate(-45deg)', 
          fontSize: '80px', 
          color: 'rgba(45, 90, 39, 0.08)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          fontWeight: 'bold',
          zIndex: 0
        }}>
          Generated by CarbonConstruct
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px', paddingBottom: '16px', borderBottom: '2px solid #2d5a27' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d5a27', margin: 0 }}>{branding?.companyName || 'CarbonConstruct'}</p>
            {branding?.preparedBy && (
              <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0 0' }}>Prepared by: {branding.preparedBy}</p>
            )}
          </div>
          {branding?.logoUrl && (
            <img
              src={branding.logoUrl}
              alt={`${branding?.companyName || 'CarbonConstruct'} logo`}
              style={{ maxHeight: '60px', maxWidth: '150px' }}
              crossOrigin="anonymous"
            />
          )}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a', margin: '0 0 8px 0' }}>{getReportTitle()}</h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>{data.project.name}</p>
        <p style={{ fontSize: '12px', color: '#888', margin: '4px 0' }}>Generated: {new Date(data.metadata.generatedAt).toLocaleDateString()}</p>
      </div>

      {/* Template Content */}
      {template === 'executive' && renderExecutiveSummary()}
      {template === 'compliance' && renderComplianceFocused()}
      {template === 'technical' && renderTechnicalReport()}
      {template === 'en15978' && renderEN15978Report()}

      {/* ECO Platform Compliance Section */}
      {ecoComplianceReport && renderEcoComplianceSection()}

      {/* EPD Expiry Alerts Section */}
      {epdExpiryAlerts && epdExpiryAlerts.length > 0 && renderEPDExpiryAlerts()}

      {/* Data Source Attribution - Inline styled for reliable PDF capture */}
      <div style={{ 
        marginTop: '24px', 
        paddingTop: '16px', 
        borderTop: '1px solid #e5e7eb',
        fontSize: '10px',
        color: '#666666'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="/logos/circular-ecology-logo.png" 
              alt="Circular Ecology" 
              style={{ height: '32px', width: 'auto' }}
              crossOrigin="anonymous"
            />
            <div>
              <p style={{ fontWeight: 'bold', color: '#333333', margin: 0 }}>
                Inventory of Carbon & Energy (V4.7)
              </p>
              <p style={{ margin: '2px 0 0 0' }}>© Circular Ecology</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0 }}>Embodied carbon data provided under license</p>
            <a 
              href="https://circularecology.com" 
              style={{ color: '#2d5a27', textDecoration: 'underline' }}
            >
              circularecology.com
            </a>
          </div>
        </div>
        
        {/* EC3 Attribution - shown when EC3 materials are included */}
        {Array.isArray(data.breakdown.materials) && 
         data.breakdown.materials.some(m => m.source?.toLowerCase().includes('ec3') || m.source?.toLowerCase().includes('buildingtransparency')) && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#eff6ff',
            borderRadius: '4px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" style={{ height: '24px', width: '24px', fill: '#2563eb' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <div>
                <p style={{ fontWeight: 'bold', color: '#1e40af', margin: 0 }}>
                  EC3® Global EPD Database
                </p>
                <p style={{ margin: '2px 0 0 0', color: '#3b82f6' }}>
                  Powered by Building Transparency | Licensed under CC BY 4.0
                </p>
              </div>
            </div>
            <a 
              href="https://buildingtransparency.org" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: '500' }}
            >
              buildingtransparency.org
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #ccc', textAlign: 'center', fontSize: '10px', color: '#666' }}>
        <p style={{ margin: '4px 0' }}>This report was generated using Australian NCC 2024 emission factors and methodologies.</p>
        <p style={{ margin: '4px 0' }}>For questions about this assessment, contact: {branding?.contactEmail || 'support@carbonconstruct.com.au'}</p>
        <p style={{ margin: '8px 0 0 0' }}>© {new Date().getFullYear()} {branding?.companyName || 'CarbonConstruct'}</p>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
        <p style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>DISCLAIMER & TERMS OF USE</p>
        <p style={{ fontSize: '8px', color: '#666', lineHeight: '1.4', margin: 0 }}>
          This carbon assessment report is generated by CarbonConstruct Pty Ltd (ABN 67 652 069 139) using Australian emission factors
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
  ecoComplianceReport?: EcoPlatformComplianceReport | null;
  epdExpiryAlerts?: EPDExpiryAlert[];
  onEmailSent?: () => void;
}

export const PDFReport: React.FC<PDFReportProps> = ({ 
  data,
  template = 'technical',
  filename,
  branding,
  showWatermark = false,
  ecoComplianceReport = null,
  epdExpiryAlerts = [],
  onEmailSent
}) => {
  const [loading, setLoading] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [renderingPhase, setRenderingPhase] = useState<'idle' | 'rendering' | 'capturing' | 'saving'>('idle');

  const contentId = 'pdf-report-content';
  const safeProjectName = (data.project.name || 'project')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
  const defaultFilename = `carbon-report-${safeProjectName || 'project'}.pdf`;

  const handleDownload = async () => {
    setLoading(true);
    setRenderingPhase('rendering');

    const element = document.getElementById(contentId);

    if (!element) {
      console.error(`PDF content element with id '${contentId}' not found`);
      toast.error('PDF content not found. Please try again.');
      setRenderingPhase('idle');
      setLoading(false);
      return;
    }

    try {
      // Load libraries async (no document.write!)
      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Temporarily make visible for capture
      element.style.opacity = '1';
      element.style.zIndex = '9999';

      // Wait for browser to paint
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      // Dimension validation
      if (element.offsetWidth === 0 || element.offsetHeight === 0) {
        console.error(`PDF element has zero dimensions`);
        toast.error('PDF content has no dimensions. Cannot generate PDF.');
        throw new Error('PDF element has zero dimensions');
      }

      // Wait for fonts
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      setRenderingPhase('capturing');

      // Capture element to canvas using html2canvas
      const canvas = await html2canvas.default(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
          // Fix dark mode
          clonedDoc.body.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.color = '#333333';
          clonedDoc.documentElement.style.colorScheme = 'light';
          clonedDoc.documentElement.classList.remove('dark');
          clonedDoc.body.classList.remove('dark');

          // Ensure visible
          clonedElement.style.opacity = '1';
          clonedElement.style.visibility = 'visible';
        },
      });

      setRenderingPhase('saving');

      // Convert canvas to PDF using jsPDF
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(filename || defaultFilename);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      // Restore invisible state
      if (element) {
        element.style.opacity = '0';
        element.style.zIndex = '-9999';
      }

      setLoading(false);
      setRenderingPhase('idle');
    }
  };

  const handleSendEmail = async () => {
    setEmailSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast.error('Please sign in to send email reports');
        return;
      }

      await supabase.functions.invoke('send-email', {
        body: {
          type: 'report_generated',
          to: user.email,
          data: {
            projectName: data.project.name || 'Project',
            totalEmissions: data.emissions.total.toFixed(2),
            scope1: data.emissions.scope1.toFixed(2),
            scope2: data.emissions.scope2.toFixed(2),
            scope3: data.emissions.scope3.toFixed(2),
            complianceStatus: data.compliance.nccCompliant ? 'NCC Compliant' : 'Non-Compliant',
            appUrl: 'https://carbonconstruct.com.au',
          },
        },
      });

      toast.success('Report summary sent to your email');
      onEmailSent?.();
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setEmailSending(false);
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
        ecoComplianceReport={ecoComplianceReport}
        epdExpiryAlerts={epdExpiryAlerts}
      />
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setIsPreviewOpen(true)} variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Button onClick={handleDownload} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {renderingPhase === 'rendering' && 'Rendering...'}
              {renderingPhase === 'capturing' && 'Capturing...'}
              {renderingPhase === 'saving' && 'Saving PDF...'}
              {renderingPhase === 'idle' && 'Generating...'}
            </>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
        <Button onClick={handleSendEmail} disabled={emailSending} variant="secondary" className="gap-2">
          {emailSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Email Report
            </>
          )}
        </Button>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Report Preview
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 min-h-0 border rounded-lg bg-white">
            <div className="p-4">
              <PDFReportContent 
                data={data} 
                template={template} 
                branding={branding} 
                showWatermark={showWatermark}
                contentId={`${contentId}-preview`}
                ecoComplianceReport={ecoComplianceReport}
                epdExpiryAlerts={epdExpiryAlerts}
                forPreview={true}
              />
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={() => { setIsPreviewOpen(false); handleDownload(); }} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
