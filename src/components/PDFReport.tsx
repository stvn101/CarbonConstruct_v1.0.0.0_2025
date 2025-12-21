import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileDown, Loader2, Eye, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ReportData } from './ReportData';
import { ReportTemplate } from '@/pages/Reports';
import { EcoPlatformComplianceReport } from '@/lib/eco-platform-types';
import { ICEAttributionFooter } from './DataSourceAttribution';

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
              {data.breakdown.materials.map((m, i) => (
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
                <th>Emissions (kgCO₂e)</th>
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
                <td>{formatNumber(a1a3)}</td>
                <td>{calcPercent(a1a3)}%</td>
              </tr>
              <tr className="pdf-stage-header">
                <td colSpan={4}>Construction Stage (A4-A5)</td>
              </tr>
              <tr>
                <td>A4</td>
                <td>Transport to site</td>
                <td>{formatNumber(a4)}</td>
                <td>{calcPercent(a4)}%</td>
              </tr>
              <tr>
                <td>A5</td>
                <td>Construction installation</td>
                <td>{formatNumber(a5)}</td>
                <td>{calcPercent(a5)}%</td>
              </tr>
              <tr className="pdf-subtotal-row">
                <td colSpan={2}><strong>Subtotal Upfront (A1-A5)</strong></td>
                <td><strong>{formatNumber(totalUpfront)}</strong></td>
                <td><strong>{calcPercent(totalUpfront)}%</strong></td>
              </tr>
              
              {hasWholeLife && (
                <>
                  <tr className="pdf-stage-header">
                    <td colSpan={4}>Use Stage (B1-B7)</td>
                  </tr>
                  <tr>
                    <td>B1-B5</td>
                    <td>Embodied (maintenance, replacement, refurbishment)</td>
                    <td>{formatNumber(b1b5)}</td>
                    <td>{calcPercent(b1b5)}%</td>
                  </tr>
                  <tr>
                    <td>B6</td>
                    <td>Operational energy</td>
                    <td>{formatNumber(b6)}</td>
                    <td>{calcPercent(b6)}%</td>
                  </tr>
                  <tr>
                    <td>B7</td>
                    <td>Operational water</td>
                    <td>{formatNumber(b7)}</td>
                    <td>{calcPercent(b7)}%</td>
                  </tr>
                  
                  <tr className="pdf-stage-header">
                    <td colSpan={4}>End of Life Stage (C1-C4)</td>
                  </tr>
                  <tr>
                    <td>C1-C4</td>
                    <td>Deconstruction, transport, waste processing, disposal</td>
                    <td>{formatNumber(c1c4)}</td>
                    <td>{calcPercent(c1c4)}%</td>
                  </tr>
                  
                  <tr className="pdf-stage-header">
                    <td colSpan={4}>Module D (Beyond Building Lifecycle)</td>
                  </tr>
                  <tr>
                    <td>D</td>
                    <td>Recycling, reuse, energy recovery credits</td>
                    <td style={{ color: moduleD < 0 ? '#16a34a' : undefined }}>{formatNumber(moduleD)}</td>
                    <td>-</td>
                  </tr>
                </>
              )}
              
              <tr className="pdf-total-row">
                <td colSpan={2}><strong>TOTAL WHOLE LIFE (A-C)</strong></td>
                <td><strong>{formatNumber(totalWholeLife)}</strong></td>
                <td><strong>100%</strong></td>
              </tr>
              {hasWholeLife && moduleD !== 0 && (
                <tr className="pdf-total-row" style={{ backgroundColor: '#f0fdf4' }}>
                  <td colSpan={2}><strong>NET WITH BENEFITS (A-D)</strong></td>
                  <td><strong>{formatNumber(totalWithBenefits)}</strong></td>
                  <td>-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pdf-section">
          <h2 className="pdf-section-title">Carbon Intensity</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="pdf-intensity-box">
              <h3 className="pdf-intensity-title">Upfront Carbon (A1-A5)</h3>
              <p className="pdf-intensity-value">{formatNumber(totalUpfront)} kgCO₂e</p>
              {hasWholeLife && wl.intensity_upfront && (
                <p className="pdf-intensity-unit">{formatNumber(wl.intensity_upfront)} kgCO₂e/m²</p>
              )}
            </div>
            <div className="pdf-intensity-box">
              <h3 className="pdf-intensity-title">Whole Life (A-C)</h3>
              <p className="pdf-intensity-value">{formatNumber(totalWholeLife)} kgCO₂e</p>
              {hasWholeLife && wl.intensity_whole_life && (
                <p className="pdf-intensity-unit">{formatNumber(wl.intensity_whole_life)} kgCO₂e/m²</p>
              )}
            </div>
            <div className="pdf-intensity-box">
              <h3 className="pdf-intensity-title">Net with Benefits (A-D)</h3>
              <p className="pdf-intensity-value">{formatNumber(totalWithBenefits)} kgCO₂e</p>
              {hasWholeLife && wl.intensity_with_benefits && (
                <p className="pdf-intensity-unit">{formatNumber(wl.intensity_with_benefits)} kgCO₂e/m²</p>
              )}
            </div>
          </div>
        </div>
        
        {!hasWholeLife && (
          <div className="pdf-warning-box">
            <p className="text-sm">
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
        position: forPreview ? 'static' : 'fixed',
        left: forPreview ? 'auto' : 0,
        top: forPreview ? 'auto' : 0,
        width: forPreview ? '100%' : '210mm',
        height: forPreview ? 'auto' : 'auto',
        opacity: forPreview ? 1 : 0,
        pointerEvents: forPreview ? 'auto' : 'none',
        zIndex: forPreview ? 'auto' : -9999,
        background: '#ffffff',
        backgroundColor: '#ffffff',
        padding: '40px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        color: '#333333',
        colorScheme: 'light'
      } as React.CSSProperties}
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
            <img
              src={branding.logoUrl}
              alt={`${branding?.companyName || 'CarbonConstruct'} logo`}
              className="pdf-logo"
              crossOrigin="anonymous"
            />
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

      {/* ECO Platform Compliance Section */}
      {ecoComplianceReport && renderEcoComplianceSection()}

      {/* EPD Expiry Alerts Section */}
      {epdExpiryAlerts && epdExpiryAlerts.length > 0 && renderEPDExpiryAlerts()}

      {/* Data Source Attribution */}
      <div className="pdf-attribution" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <ICEAttributionFooter className="print:block" />
      </div>

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
  const html2pdfRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    import('html2pdf.js')
      .then((m) => {
        if (!cancelled) html2pdfRef.current = m.default;
      })
      .catch(() => {
        // ignore - will lazy load on click
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
      console.error('PDF content element not found');
      toast.error('PDF content not found. Please try again.');
      setRenderingPhase('idle');
      setLoading(false);
      return;
    }

    // Store original styles to restore after capture
    const originalStyles = {
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      opacity: element.style.opacity,
      zIndex: element.style.zIndex,
      pointerEvents: element.style.pointerEvents,
      width: element.style.width,
    };

    try {
      const html2pdf = html2pdfRef.current ?? (await import('html2pdf.js')).default;
      html2pdfRef.current = html2pdf;

      // CRITICAL: Make element visible BEFORE capture (off-screen but renderable)
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.opacity = '1';
      element.style.zIndex = '1';
      element.style.pointerEvents = 'none';
      element.style.width = '210mm';

      // Wait for browser to repaint with visible element
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => resolve(), 150);
          });
        });
      });

      // Wait for all fonts to load before capture
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      setRenderingPhase('capturing');

      // Additional stabilization wait
      await new Promise<void>((resolve) => setTimeout(resolve, 200));

      setRenderingPhase('saving');

      const pdfOptions = {
        margin: 10,
        filename: filename || defaultFilename,
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
          // onclone callback forces explicit inline styles on all elements
          onclone: (_clonedDoc: Document, clonedElement: HTMLElement) => {
            // Force the root element to have explicit styles
            clonedElement.style.cssText = `
              position: static !important;
              left: auto !important;
              top: auto !important;
              opacity: 1 !important;
              visibility: visible !important;
              pointer-events: auto !important;
              z-index: auto !important;
              background-color: #ffffff !important;
              color: #333333 !important;
              padding: 40px !important;
              width: 210mm !important;
              max-width: 210mm !important;
              font-family: Helvetica, Arial, sans-serif !important;
              line-height: 1.4 !important;
            `;

            // Force all descendant elements to have explicit computed styles
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              try {
                const computed = window.getComputedStyle(htmlEl);
                
                // Force critical layout and color properties inline
                htmlEl.style.backgroundColor = computed.backgroundColor || 'transparent';
                htmlEl.style.color = computed.color || '#333333';
                htmlEl.style.fontSize = computed.fontSize || '12px';
                htmlEl.style.fontWeight = computed.fontWeight || 'normal';
                htmlEl.style.fontFamily = computed.fontFamily || 'Helvetica, Arial, sans-serif';
                htmlEl.style.lineHeight = computed.lineHeight || '1.4';
                
                // Force layout properties for flex/grid
                const display = computed.display;
                if (display === 'flex' || display === 'inline-flex') {
                  htmlEl.style.display = display;
                  htmlEl.style.flexDirection = computed.flexDirection;
                  htmlEl.style.justifyContent = computed.justifyContent;
                  htmlEl.style.alignItems = computed.alignItems;
                  htmlEl.style.gap = computed.gap;
                }
                if (display === 'grid' || display === 'inline-grid') {
                  htmlEl.style.display = display;
                  htmlEl.style.gridTemplateColumns = computed.gridTemplateColumns;
                  htmlEl.style.gap = computed.gap;
                }
                
                // Force box model properties
                htmlEl.style.padding = computed.padding;
                htmlEl.style.margin = computed.margin;
                htmlEl.style.border = computed.border;
                htmlEl.style.borderRadius = computed.borderRadius;
                
                // Force text alignment
                htmlEl.style.textAlign = computed.textAlign;
                
              } catch (e) {
                // Ignore errors for elements that don't support getComputedStyle
              }
            });

            // Ensure tables have explicit styling
            const tables = clonedElement.querySelectorAll('table');
            tables.forEach((table) => {
              (table as HTMLElement).style.width = '100%';
              (table as HTMLElement).style.borderCollapse = 'collapse';
              (table as HTMLElement).style.backgroundColor = '#ffffff';
            });

            const cells = clonedElement.querySelectorAll('th, td');
            cells.forEach((cell) => {
              const htmlCell = cell as HTMLElement;
              htmlCell.style.border = '1px solid #ddd';
              htmlCell.style.padding = '8px';
              htmlCell.style.textAlign = 'left';
              htmlCell.style.backgroundColor = htmlCell.style.backgroundColor || '#ffffff';
            });

            const headers = clonedElement.querySelectorAll('th');
            headers.forEach((header) => {
              (header as HTMLElement).style.backgroundColor = '#f5f5f5';
              (header as HTMLElement).style.fontWeight = 'bold';
            });
          },
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
      };

      // Use the explicit workflow for better reliability
      await html2pdf()
        .set(pdfOptions)
        .from(element)
        .toContainer()
        .toCanvas()
        .toPdf()
        .save();

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      // CRITICAL: Restore original hidden state
      element.style.position = originalStyles.position;
      element.style.left = originalStyles.left;
      element.style.top = originalStyles.top;
      element.style.opacity = originalStyles.opacity;
      element.style.zIndex = originalStyles.zIndex;
      element.style.pointerEvents = originalStyles.pointerEvents;
      element.style.width = originalStyles.width;
      
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
