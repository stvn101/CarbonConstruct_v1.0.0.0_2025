import React, { useState, useId } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { ReportData } from './ReportData';
import { ReportTemplate } from '@/pages/Reports';
import { PDF_COLORS } from '@/constants/pdfColors';

export interface ReportBranding {
  companyName?: string;
  logoUrl?: string;
  contactEmail?: string;
  preparedBy?: string;
}

export interface PDFReportOptions {
  showWatermark?: boolean;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: PDF_COLORS.white,
    padding: 40,
    fontFamily: 'Helvetica',
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: '45%',
    left: '10%',
    right: '10%',
    transform: 'rotate(-35deg)',
    fontSize: 48,
    color: PDF_COLORS.watermark,
    textAlign: 'center',
    opacity: 0.6,
    fontWeight: 'bold',
    zIndex: -1,
  },
  header: {
    marginBottom: 30,
    borderBottom: `2px solid ${PDF_COLORS.primaryGreen}`,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 12,
    color: PDF_COLORS.textMedium,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  preparedBy: {
    fontSize: 10,
    color: PDF_COLORS.textGray,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: PDF_COLORS.primaryGreen,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: PDF_COLORS.textGray,
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PDF_COLORS.primaryGreen,
    marginBottom: 10,
    borderBottom: `1px solid ${PDF_COLORS.borderDark}`,
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 140,
    fontSize: 11,
    fontWeight: 'bold',
    color: PDF_COLORS.textMedium,
  },
  value: {
    fontSize: 11,
    color: PDF_COLORS.textGray,
    flex: 1,
  },
  emissionCard: {
    backgroundColor: PDF_COLORS.primaryGreenVeryLight,
    border: `1px solid ${PDF_COLORS.borderLight}`,
    borderRadius: 4,
    padding: 15,
    marginBottom: 15,
  },
  emissionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PDF_COLORS.primaryGreen,
    marginBottom: 8,
  },
  emissionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PDF_COLORS.primaryGreenDark,
    marginBottom: 5,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 10,
  },
  categoryName: {
    width: 150,
    fontSize: 10,
    color: PDF_COLORS.textGray,
  },
  categoryValue: {
    fontSize: 10,
    color: PDF_COLORS.textMedium,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: `1px solid ${PDF_COLORS.borderDark}`,
    fontSize: 10,
    color: PDF_COLORS.textGray,
    textAlign: 'center',
  },
  complianceSection: {
    backgroundColor: PDF_COLORS.successBackgroundAlt,
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
  },
  complianceItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  complianceLabel: {
    width: 150,
    fontSize: 11,
    color: PDF_COLORS.primaryGreen,
    fontWeight: 'bold',
  },
  complianceStatus: {
    fontSize: 11,
    color: PDF_COLORS.success,
    fontWeight: 'bold',
  },
  complianceValue: {
    fontSize: 11,
    color: PDF_COLORS.textMedium,
  },
  keyMetricBox: {
    backgroundColor: PDF_COLORS.primaryGreenVeryLight,
    border: `1px solid ${PDF_COLORS.borderLight}`,
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 10,
    color: PDF_COLORS.textGray,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PDF_COLORS.primaryGreen,
  },
  disclaimer: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: `0.5px solid ${PDF_COLORS.borderGray}`,
    fontSize: 6,
    color: PDF_COLORS.textMuted,
    lineHeight: 1.4,
  },
  disclaimerTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: PDF_COLORS.textLightGray,
    marginBottom: 3,
  },
  // EN 15978 specific styles
  declarationBox: {
    backgroundColor: PDF_COLORS.infoBackgroundAlt,
    border: `2px solid ${PDF_COLORS.info}`,
    borderRadius: 4,
    padding: 15,
    marginBottom: 20,
  },
  declarationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: PDF_COLORS.infoVeryDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  declarationItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  declarationLabel: {
    width: 160,
    fontSize: 10,
    color: PDF_COLORS.infoVeryDark,
    fontWeight: 'bold',
  },
  declarationValue: {
    fontSize: 10,
    color: PDF_COLORS.textMedium,
    flex: 1,
  },
  lifecycleTable: {
    border: `1px solid ${PDF_COLORS.borderDark}`,
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.infoVeryDark,
    padding: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: PDF_COLORS.white,
    textAlign: 'center',
  },
  tableHeaderCellWide: {
    flex: 2,
    fontSize: 9,
    fontWeight: 'bold',
    color: PDF_COLORS.white,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `1px solid ${PDF_COLORS.borderGray}`,
    padding: 6,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: `1px solid ${PDF_COLORS.borderGray}`,
    padding: 6,
    backgroundColor: PDF_COLORS.backgroundLightGray,
  },
  tableRowTotal: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: PDF_COLORS.tableRowHighlight,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: PDF_COLORS.textMedium,
    textAlign: 'center',
  },
  tableCellWide: {
    flex: 2,
    fontSize: 9,
    color: PDF_COLORS.textMedium,
  },
  tableCellBold: {
    flex: 1,
    fontSize: 9,
    color: PDF_COLORS.textMedium,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stageHeader: {
    flexDirection: 'row',
    backgroundColor: PDF_COLORS.tableRowInfo,
    padding: 6,
    borderBottom: `1px solid ${PDF_COLORS.infoVeryLight}`,
  },
  stageHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PDF_COLORS.alertInfo.text,
  },
  intensityBox: {
    backgroundColor: PDF_COLORS.warningBackgroundAlt,
    border: `1px solid ${PDF_COLORS.warningAlt}`,
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },
  intensityTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PDF_COLORS.alertWarning.text,
    marginBottom: 8,
  },
  intensityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: PDF_COLORS.alertWarning.textDark,
    marginBottom: 4,
  },
  intensityUnit: {
    fontSize: 10,
    color: PDF_COLORS.textGray,
  },
  moduleDBox: {
    backgroundColor: PDF_COLORS.alertSuccess.background,
    border: `1px solid ${PDF_COLORS.alertSuccess.border}`,
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },
  moduleDTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: PDF_COLORS.alertSuccess.text,
    marginBottom: 8,
  },
  moduleDValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PDF_COLORS.alertSuccess.textDark,
  },
  moduleDNote: {
    fontSize: 8,
    color: PDF_COLORS.textGray,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

interface PDFReportDocumentProps {
  data: ReportData;
  template: ReportTemplate;
  branding?: ReportBranding;
  showWatermark?: boolean;
  contentId: string;
  ecoComplianceReport?: EcoPlatformComplianceReport | null;
}

// HTML-based report content component
const PDFReportContent: React.FC<PDFReportContentProps> = ({ 
  data, 
  template, 
  branding,
  showWatermark,
  contentId,
  ecoComplianceReport
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
      {/* Executive Summary Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={{ fontSize: 12, color: PDF_COLORS.textGray, marginBottom: 15 }}>
          Total emissions for {data.project.name}: {formatNumber(data.emissions.total)} tCO₂e
        </p>
        {data.project.description && (
          <Text style={{ fontSize: 10, color: PDF_COLORS.textLightGray, marginBottom: 15 }}>{data.project.description}</Text>
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
      {/* Compliance Report Introduction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Assessment</Text>
        <Text style={{ fontSize: 11, color: PDF_COLORS.textGray, marginBottom: 10 }}>
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
            </Text>
          </View>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Total Emissions:</Text>
            <Text style={styles.complianceValue}>{formatNumber(data.emissions.total)} tCO₂e</Text>
          </View>
          <Text style={{ fontSize: 10, color: PDF_COLORS.textGray, marginTop: 10 }}>
            Green Star eligibility is based on comprehensive environmental performance including emissions intensity, 
            materials selection, and operational efficiency.
          </Text>
        </View>
      </View>

      {/* NABERS Assessment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NABERS Energy Assessment</Text>
        <View style={styles.complianceSection}>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Readiness:</Text>
            <Text style={styles.complianceStatus}>
              {data.compliance.nabersReady ? '✓ READY' : '✗ ADDITIONAL DATA REQUIRED'}
            </Text>
          </View>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Scope 2 Emissions:</Text>
            <Text style={styles.complianceValue}>{formatNumber(data.emissions.scope2)} tCO₂e</Text>
          </View>
          <Text style={{ fontSize: 10, color: PDF_COLORS.textGray, marginTop: 10 }}>
            NABERS Energy rating requires comprehensive operational energy data. Scope 2 emissions are the 
            primary indicator of energy performance.
          </Text>
        </View>
      </View>

      {/* Emission Summary Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emission Summary</Text>
        <View style={{ border: `1px solid ${PDF_COLORS.borderDark}`, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', backgroundColor: PDF_COLORS.backgroundDarkGray, borderBottom: `1px solid ${PDF_COLORS.borderDark}`, padding: 8 }}>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold' }}>Scope</Text>
            <Text style={{ width: 120, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>Emissions (tCO₂e)</Text>
          </View>
          <View style={{ flexDirection: 'row', borderBottom: `1px solid ${PDF_COLORS.borderDark}`, padding: 8 }}>
            <Text style={{ flex: 1, fontSize: 10 }}>Scope 1 (Direct)</Text>
            <Text style={{ width: 120, fontSize: 10, textAlign: 'right' }}>{formatNumber(data.emissions.scope1)}</Text>
          </View>
          <View style={{ flexDirection: 'row', borderBottom: `1px solid ${PDF_COLORS.borderDark}`, padding: 8 }}>
            <Text style={{ flex: 1, fontSize: 10 }}>Scope 2 (Energy)</Text>
            <Text style={{ width: 120, fontSize: 10, textAlign: 'right' }}>{formatNumber(data.emissions.scope2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', borderBottom: `1px solid ${PDF_COLORS.borderDark}`, padding: 8 }}>
            <Text style={{ flex: 1, fontSize: 10 }}>Scope 3 (Indirect)</Text>
            <Text style={{ width: 120, fontSize: 10, textAlign: 'right' }}>{formatNumber(data.emissions.scope3)}</Text>
          </View>
          <View style={{ flexDirection: 'row', backgroundColor: PDF_COLORS.primaryGreenVeryLight, padding: 8 }}>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold' }}>Total</Text>
            <Text style={{ width: 120, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{formatNumber(data.emissions.total)}</Text>
          </View>
        </View>
      </View>
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
        {/* Declaration of Conformity */}
        <View style={styles.declarationBox}>
          <Text style={styles.declarationTitle}>DECLARATION OF CONFORMITY</Text>
          <Text style={{ fontSize: 10, color: PDF_COLORS.infoVeryDark, marginBottom: 10, textAlign: 'center' }}>
            EN 15978:2011 Whole Life Carbon Assessment
          </Text>
          <View style={styles.declarationItem}>
            <Text style={styles.declarationLabel}>Assessment Standard:</Text>
            <Text style={styles.declarationValue}>EN 15978:2011</Text>
          </View>
          <View style={styles.declarationItem}>
            <Text style={styles.declarationLabel}>Reference Study Period:</Text>
            <Text style={styles.declarationValue}>60 years</Text>
          </View>
          <View style={styles.declarationItem}>
            <Text style={styles.declarationLabel}>Functional Unit:</Text>
            <Text style={styles.declarationValue}>per m² Gross Floor Area (GFA)</Text>
          </View>
          <View style={styles.declarationItem}>
            <Text style={styles.declarationLabel}>System Boundary:</Text>
            <Text style={styles.declarationValue}>Cradle to Grave + Module D</Text>
          </View>
          <View style={styles.declarationItem}>
            <Text style={styles.declarationLabel}>GWP Metric:</Text>
            <Text style={styles.declarationValue}>kgCO₂e (100-year GWP)</Text>
          </View>
        </View>

        {/* Project Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Project Name:</Text>
            <Text style={styles.value}>{data.project.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Project Type:</Text>
            <Text style={styles.value}>{data.project.project_type}</Text>
          </View>
          {data.project.location && (
            <View style={styles.row}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{data.project.location}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Assessment Date:</Text>
            <Text style={styles.value}>{new Date(data.metadata.generatedAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Lifecycle Stage Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifecycle Stage Emissions (kgCO₂e)</Text>
          
          <View style={styles.lifecycleTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCellWide}>Lifecycle Stage</Text>
              <Text style={styles.tableHeaderCell}>Module</Text>
              <Text style={styles.tableHeaderCell}>kgCO₂e</Text>
            </View>

            {/* A1-A5: Product & Construction Stage */}
            <View style={styles.stageHeader}>
              <Text style={styles.stageHeaderText}>PRODUCT & CONSTRUCTION STAGE (A1-A5)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellWide}>Raw material supply + Manufacturing</Text>
              <Text style={styles.tableCell}>A1-A3</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.a1a3_product || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRowAlt}>
              <Text style={styles.tableCellWide}>Transport to site</Text>
              <Text style={styles.tableCell}>A4</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.a4_transport || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellWide}>Construction/installation</Text>
              <Text style={styles.tableCell}>A5</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.a5_construction || 0) * 1000)}</Text>
            </View>

            {/* B1-B7: Use Stage */}
            <View style={styles.stageHeader}>
              <Text style={styles.stageHeaderText}>USE STAGE (B1-B7)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellWide}>Use</Text>
              <Text style={styles.tableCell}>B1</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.b1_use || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRowAlt}>
              <Text style={styles.tableCellWide}>Maintenance</Text>
              <Text style={styles.tableCell}>B2</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.b2_maintenance || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellWide}>Repair</Text>
              <Text style={styles.tableCell}>B3</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.b3_repair || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRowAlt}>
              <Text style={styles.tableCellWide}>Replacement</Text>
              <Text style={styles.tableCell}>B4</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.b4_replacement || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellWide}>Refurbishment</Text>
              <Text style={styles.tableCell}>B5</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.b5_refurbishment || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRowAlt}>
              <Text style={styles.tableCellWide}>Operational energy use</Text>
              <Text style={styles.tableCell}>B6</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.b6_operational_energy || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellWide}>Operational water use</Text>
              <Text style={styles.tableCell}>B7</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.b7_operational_water || 0) * 1000)}</Text>
            </View>

            {/* C1-C4: End of Life Stage */}
            <View style={styles.stageHeader}>
              <Text style={styles.stageHeaderText}>END OF LIFE STAGE (C1-C4)</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellWide}>Deconstruction/demolition</Text>
              <Text style={styles.tableCell}>C1</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.c1_deconstruction || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRowAlt}>
              <Text style={styles.tableCellWide}>Transport to disposal</Text>
              <Text style={styles.tableCell}>C2</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.c2_transport || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellWide}>Waste processing</Text>
              <Text style={styles.tableCell}>C3</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.c3_waste_processing || 0) * 1000)}</Text>
            </View>
            <View style={styles.tableRowAlt}>
              <Text style={styles.tableCellWide}>Disposal</Text>
              <Text style={styles.tableCell}>C4</Text>
              <Text style={styles.tableCellBold}>{formatNumber((wl?.c4_disposal || 0) * 1000)}</Text>
            </View>

            {/* Totals */}
            <View style={styles.tableRowTotal}>
              <Text style={{ ...styles.tableCellWide, fontWeight: 'bold' }}>WHOLE LIFE CARBON (A-C)</Text>
              <Text style={styles.tableCell}></Text>
              <Text style={{ ...styles.tableCellBold, fontSize: 11, color: PDF_COLORS.alertSuccess.textDark }}>
                {formatNumber((wl?.total_whole_life || 0) * 1000)}
              </Text>
            </View>
          </View>
        </View>

        {/* Module D - Reported Separately per EN 15978 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Module D: Benefits and Loads Beyond System Boundary</Text>
          <View style={styles.moduleDBox}>
            <Text style={styles.moduleDTitle}>Circular Economy Credits</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <View>
                <Text style={{ fontSize: 9, color: PDF_COLORS.textGray }}>Recycling</Text>
                <Text style={styles.moduleDValue}>{formatNumber((wl?.d_recycling || 0) * 1000)} kgCO₂e</Text>
              </View>
              <View>
                <Text style={{ fontSize: 9, color: PDF_COLORS.textGray }}>Reuse</Text>
                <Text style={styles.moduleDValue}>{formatNumber((wl?.d_reuse || 0) * 1000)} kgCO₂e</Text>
              </View>
              <View>
                <Text style={{ fontSize: 9, color: PDF_COLORS.textGray }}>Energy Recovery</Text>
                <Text style={styles.moduleDValue}>{formatNumber((wl?.d_energy_recovery || 0) * 1000)} kgCO₂e</Text>
              </View>
            </View>
            <Text style={styles.moduleDNote}>
              Note: Module D is reported separately per EN 15978 requirements. Negative values indicate carbon benefits.
            </Text>
          </View>
          
          {/* Net Carbon with Benefits */}
          <View style={styles.emissionCard}>
            <Text style={styles.emissionTitle}>Net Carbon (A-D) with Benefits</Text>
            <Text style={styles.emissionValue}>{formatNumber((wl?.total_with_benefits || 0) * 1000)} kgCO₂e</Text>
            <Text style={{ fontSize: 9, color: PDF_COLORS.textGray, marginTop: 4 }}>
              ({formatNumber(wl?.total_with_benefits || 0)} tCO₂e)
            </Text>
          </View>
        </View>

        {/* Carbon Intensity Metrics */}
        {wl?.intensity_whole_life && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Carbon Intensity Metrics</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={styles.intensityBox}>
                <Text style={styles.intensityTitle}>Upfront Carbon Intensity</Text>
                <Text style={styles.intensityValue}>{formatNumber((wl?.intensity_upfront || 0) * 1000)}</Text>
                <Text style={styles.intensityUnit}>kgCO₂e/m² GFA</Text>
              </View>
              <View style={styles.intensityBox}>
                <Text style={styles.intensityTitle}>Whole Life Intensity</Text>
                <Text style={styles.intensityValue}>{formatNumber((wl?.intensity_whole_life || 0) * 1000)}</Text>
                <Text style={styles.intensityUnit}>kgCO₂e/m² GFA</Text>
              </View>
            </View>
          </View>
        )}

        {/* Aggregated Totals Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Totals</Text>
          <View style={{ border: `1px solid ${PDF_COLORS.borderDark}` }}>
            <View style={{ flexDirection: 'row', backgroundColor: PDF_COLORS.backgroundDarkGray, borderBottom: `1px solid ${PDF_COLORS.borderDark}`, padding: 8 }}>
              <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold' }}>Category</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>tCO₂e</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>kgCO₂e</Text>
            </View>
            <View style={{ flexDirection: 'row', borderBottom: `1px solid ${PDF_COLORS.borderGray}`, padding: 8 }}>
              <Text style={{ flex: 1, fontSize: 10 }}>Upfront Carbon (A1-A5)</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber(wl?.total_upfront || 0)}</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber((wl?.total_upfront || 0) * 1000)}</Text>
            </View>
            <View style={{ flexDirection: 'row', borderBottom: `1px solid ${PDF_COLORS.borderGray}`, padding: 8, backgroundColor: PDF_COLORS.backgroundLightGray }}>
              <Text style={{ flex: 1, fontSize: 10 }}>Embodied Carbon (A1-C4)</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber(wl?.total_embodied || 0)}</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber((wl?.total_embodied || 0) * 1000)}</Text>
            </View>
            <View style={{ flexDirection: 'row', borderBottom: `1px solid ${PDF_COLORS.borderGray}`, padding: 8 }}>
              <Text style={{ flex: 1, fontSize: 10 }}>Operational Carbon (B6-B7)</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber(wl?.total_operational || 0)}</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber((wl?.total_operational || 0) * 1000)}</Text>
            </View>
            <View style={{ flexDirection: 'row', borderBottom: `1px solid ${PDF_COLORS.borderGray}`, padding: 8, backgroundColor: PDF_COLORS.tableRowHighlight }}>
              <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold' }}>Whole Life Carbon (A-C)</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{formatNumber(wl?.total_whole_life || 0)}</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{formatNumber((wl?.total_whole_life || 0) * 1000)}</Text>
            </View>
            <View style={{ flexDirection: 'row', padding: 8, backgroundColor: PDF_COLORS.tableRowInfo }}>
              <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold', color: PDF_COLORS.alertInfo.text }}>Net with Benefits (A-D)</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right', color: PDF_COLORS.alertInfo.text }}>{formatNumber(wl?.total_with_benefits || 0)}</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right', color: PDF_COLORS.alertInfo.text }}>{formatNumber((wl?.total_with_benefits || 0) * 1000)}</Text>
            </View>
          </View>
        </View>

        {/* Methodology & Data Sources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Methodology & Data Sources</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Assessment Standard:</Text>
            <Text style={styles.value}>EN 15978:2011</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Australian Alignment:</Text>
            <Text style={styles.value}>NCC 2024, Climate Active Standard</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Emission Factors:</Text>
            <Text style={styles.value}>Australian EPD data, AusLCI, ICE Database</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Data Quality:</Text>
            <Text style={styles.value}>{data.metadata.dataQuality}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Biogenic Carbon:</Text>
            <Text style={styles.value}>Reported separately where applicable</Text>
          </View>
        </View>

        {!hasWholeLifeData && (
          <View style={{ backgroundColor: PDF_COLORS.warningBackgroundAlt, padding: 15, borderRadius: 4, marginBottom: 20, border: `1px solid ${PDF_COLORS.warningAlt}` }}>
            <Text style={{ fontSize: 11, color: PDF_COLORS.alertWarning.text, fontWeight: 'bold', marginBottom: 5 }}>⚠️ Incomplete Lifecycle Data</Text>
            <Text style={{ fontSize: 10, color: PDF_COLORS.textGray }}>
              This report shows limited data. For a complete EN 15978 assessment, please complete the Use Phase (B1-B7), 
              End of Life (C1-C4), and Module D calculators in the Carbon Calculator.
            </Text>
          </View>
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

      {/* ECO Platform Compliance Section */}
      {ecoComplianceReport && renderEcoComplianceSection()}

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
}

export const PDFReport: React.FC<PDFReportProps> = ({ 
  data,
  template = 'technical',
  filename,
  branding,
  showWatermark = false,
  ecoComplianceReport = null
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
        ecoComplianceReport={ecoComplianceReport}
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
