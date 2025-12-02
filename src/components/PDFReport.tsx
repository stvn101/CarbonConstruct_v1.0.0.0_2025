import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { ReportData } from './ReportData';
import { ReportTemplate } from '@/pages/Reports';
import { useComplianceCheck } from '@/hooks/useComplianceCheck';

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
    backgroundColor: '#ffffff',
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
    color: '#e8e8e8',
    textAlign: 'center',
    opacity: 0.6,
    fontWeight: 'bold',
    zIndex: -1,
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #2d5a27',
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
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  preparedBy: {
    fontSize: 10,
    color: '#666666',
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 10,
    borderBottom: '1px solid #cccccc',
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
    color: '#333333',
  },
  value: {
    fontSize: 11,
    color: '#666666',
    flex: 1,
  },
  emissionCard: {
    backgroundColor: '#f8fffe',
    border: '1px solid #e0e7e0',
    borderRadius: 4,
    padding: 15,
    marginBottom: 15,
  },
  emissionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d5a27',
    marginBottom: 8,
  },
  emissionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a1c',
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
    color: '#555555',
  },
  categoryValue: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: '1px solid #cccccc',
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  complianceSection: {
    backgroundColor: '#f0f8f0',
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
    color: '#2d5a27',
    fontWeight: 'bold',
  },
  complianceStatus: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  complianceValue: {
    fontSize: 11,
    color: '#333333',
  },
  keyMetricBox: {
    backgroundColor: '#f8fffe',
    border: '1px solid #e0e7e0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d5a27',
  },
  disclaimer: {
    marginTop: 15,
    paddingTop: 10,
    borderTop: '0.5px solid #e0e0e0',
    fontSize: 6,
    color: '#999999',
    lineHeight: 1.4,
  },
  disclaimerTitle: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#888888',
    marginBottom: 3,
  },
  // EN 15978 specific styles
  declarationBox: {
    backgroundColor: '#f0f5ff',
    border: '2px solid #3b82f6',
    borderRadius: 4,
    padding: 15,
    marginBottom: 20,
  },
  declarationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
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
    color: '#1e40af',
    fontWeight: 'bold',
  },
  declarationValue: {
    fontSize: 10,
    color: '#333333',
    flex: 1,
  },
  lifecycleTable: {
    border: '1px solid #cccccc',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e40af',
    padding: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableHeaderCellWide: {
    flex: 2,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e0e0e0',
    padding: 6,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottom: '1px solid #e0e0e0',
    padding: 6,
    backgroundColor: '#f8f9fa',
  },
  tableRowTotal: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#e8f5e9',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#333333',
    textAlign: 'center',
  },
  tableCellWide: {
    flex: 2,
    fontSize: 9,
    color: '#333333',
  },
  tableCellBold: {
    flex: 1,
    fontSize: 9,
    color: '#333333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stageHeader: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 6,
    borderBottom: '1px solid #90caf9',
  },
  stageHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  intensityBox: {
    backgroundColor: '#fff3e0',
    border: '1px solid #ff9800',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },
  intensityTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 8,
  },
  intensityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#bf360c',
    marginBottom: 4,
  },
  intensityUnit: {
    fontSize: 10,
    color: '#666666',
  },
  moduleDBox: {
    backgroundColor: '#e8f5e9',
    border: '1px solid #4caf50',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },
  moduleDTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  moduleDValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  moduleDNote: {
    fontSize: 8,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

interface PDFReportDocumentProps {
  data: ReportData;
  template: ReportTemplate;
  branding?: ReportBranding;
  showWatermark?: boolean;
}

const PDFReportDocument: React.FC<PDFReportDocumentProps> = ({ data, template, branding, showWatermark }) => {
  const formatNumber = (num: number) => (num || 0).toFixed(2);

  const renderExecutiveSummary = () => (
    <>
      {/* Executive Summary Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={{ fontSize: 12, color: '#666666', marginBottom: 15 }}>
          Total emissions for {data.project.name}: {formatNumber(data.emissions.total)} tCO₂e
        </Text>
        {data.project.description && (
          <Text style={{ fontSize: 10, color: '#888888', marginBottom: 15 }}>{data.project.description}</Text>
        )}
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
          <View style={styles.keyMetricBox}>
            <Text style={styles.metricLabel}>Scope 1</Text>
            <Text style={styles.metricValue}>{formatNumber(data.emissions.scope1)} tCO₂e</Text>
          </View>
          <View style={styles.keyMetricBox}>
            <Text style={styles.metricLabel}>Scope 2</Text>
            <Text style={styles.metricValue}>{formatNumber(data.emissions.scope2)} tCO₂e</Text>
          </View>
          <View style={styles.keyMetricBox}>
            <Text style={styles.metricLabel}>Scope 3</Text>
            <Text style={styles.metricValue}>{formatNumber(data.emissions.scope3)} tCO₂e</Text>
          </View>
        </View>
      </View>

      {/* Compliance Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Overview</Text>
        <View style={styles.complianceItem}>
          <Text style={styles.complianceLabel}>NCC Compliance:</Text>
          <Text style={styles.complianceStatus}>
            {data.compliance.nccCompliant ? '✓ Compliant' : '⚠ Partial'}
          </Text>
        </View>
        <View style={styles.complianceItem}>
          <Text style={styles.complianceLabel}>Green Star Eligible:</Text>
          <Text style={styles.complianceStatus}>
            {data.compliance.greenStarEligible ? '✓ Eligible' : '⚠ Review Required'}
          </Text>
        </View>
        <View style={styles.complianceItem}>
          <Text style={styles.complianceLabel}>NABERS Ready:</Text>
          <Text style={styles.complianceStatus}>
            {data.compliance.nabersReady ? '✓ Ready' : '⚠ Additional Data Required'}
          </Text>
        </View>
      </View>
    </>
  );

  const renderComplianceFocused = () => (
    <>
      {/* Compliance Report Introduction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Assessment</Text>
        <Text style={{ fontSize: 11, color: '#666666', marginBottom: 10 }}>
          Detailed compliance assessment for {data.project.name} against Australian standards
        </Text>
      </View>

      {/* NCC Compliance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NCC Compliance (National Construction Code)</Text>
        <View style={styles.complianceSection}>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Status:</Text>
            <Text style={styles.complianceStatus}>
              {data.compliance.nccCompliant ? '✓ COMPLIANT' : '✗ REVIEW REQUIRED'}
            </Text>
          </View>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Total Emissions:</Text>
            <Text style={styles.complianceValue}>{formatNumber(data.emissions.total)} tCO₂e</Text>
          </View>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Scope 1 (Direct):</Text>
            <Text style={styles.complianceValue}>{formatNumber(data.emissions.scope1)} tCO₂e</Text>
          </View>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Scope 2 (Energy):</Text>
            <Text style={styles.complianceValue}>{formatNumber(data.emissions.scope2)} tCO₂e</Text>
          </View>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Scope 3 (Indirect):</Text>
            <Text style={styles.complianceValue}>{formatNumber(data.emissions.scope3)} tCO₂e</Text>
          </View>
        </View>
      </View>

      {/* Green Star Assessment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GBCA Green Star Assessment</Text>
        <View style={styles.complianceSection}>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Eligibility:</Text>
            <Text style={styles.complianceStatus}>
              {data.compliance.greenStarEligible ? '✓ ELIGIBLE' : '✗ NOT ELIGIBLE'}
            </Text>
          </View>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Total Emissions:</Text>
            <Text style={styles.complianceValue}>{formatNumber(data.emissions.total)} tCO₂e</Text>
          </View>
          <Text style={{ fontSize: 10, color: '#666666', marginTop: 10 }}>
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
          <Text style={{ fontSize: 10, color: '#666666', marginTop: 10 }}>
            NABERS Energy rating requires comprehensive operational energy data. Scope 2 emissions are the 
            primary indicator of energy performance.
          </Text>
        </View>
      </View>

      {/* Emission Summary Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emission Summary</Text>
        <View style={{ border: '1px solid #cccccc', marginTop: 10 }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottom: '1px solid #cccccc', padding: 8 }}>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold' }}>Scope</Text>
            <Text style={{ width: 120, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>Emissions (tCO₂e)</Text>
          </View>
          <View style={{ flexDirection: 'row', borderBottom: '1px solid #cccccc', padding: 8 }}>
            <Text style={{ flex: 1, fontSize: 10 }}>Scope 1 (Direct)</Text>
            <Text style={{ width: 120, fontSize: 10, textAlign: 'right' }}>{formatNumber(data.emissions.scope1)}</Text>
          </View>
          <View style={{ flexDirection: 'row', borderBottom: '1px solid #cccccc', padding: 8 }}>
            <Text style={{ flex: 1, fontSize: 10 }}>Scope 2 (Energy)</Text>
            <Text style={{ width: 120, fontSize: 10, textAlign: 'right' }}>{formatNumber(data.emissions.scope2)}</Text>
          </View>
          <View style={{ flexDirection: 'row', borderBottom: '1px solid #cccccc', padding: 8 }}>
            <Text style={{ flex: 1, fontSize: 10 }}>Scope 3 (Indirect)</Text>
            <Text style={{ width: 120, fontSize: 10, textAlign: 'right' }}>{formatNumber(data.emissions.scope3)}</Text>
          </View>
          <View style={{ flexDirection: 'row', backgroundColor: '#f8fffe', padding: 8 }}>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold' }}>Total</Text>
            <Text style={{ width: 120, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{formatNumber(data.emissions.total)}</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderTechnicalReport = () => (
    <>
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
        {data.project.description && (
          <View style={styles.row}>
            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{data.project.description}</Text>
          </View>
        )}
      </View>

      {/* Executive Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <View style={styles.emissionCard}>
          <Text style={styles.emissionTitle}>Total Carbon Emissions</Text>
          <Text style={styles.emissionValue}>{formatNumber(data.emissions.total)} tCO₂e</Text>
        </View>
      </View>

      {/* Emissions Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emissions by Scope</Text>
        
        {/* Scope 1: Fuel Inputs */}
        <View style={styles.emissionCard}>
          <Text style={styles.emissionTitle}>Scope 1: Direct Emissions (Fuel)</Text>
          <Text style={styles.emissionValue}>{formatNumber(data.emissions.scope1)} tCO₂e</Text>
          {data.breakdown.fuelInputs && data.breakdown.fuelInputs.length > 0 ? (
            data.breakdown.fuelInputs.map((fuel, index) => (
              <View key={index} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{fuel.fuelType || 'Unknown'}</Text>
                <Text style={styles.categoryValue}>
                  {formatNumber(fuel.totalEmissions)} tCO₂e ({fuel.quantity || 0} {fuel.unit || 'L'})
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.categoryName}>No fuel data available</Text>
          )}
        </View>

        {/* Scope 2: Electricity */}
        <View style={styles.emissionCard}>
          <Text style={styles.emissionTitle}>Scope 2: Energy Indirect (Electricity)</Text>
          <Text style={styles.emissionValue}>{formatNumber(data.emissions.scope2)} tCO₂e</Text>
          {data.breakdown.electricityInputs && data.breakdown.electricityInputs.length > 0 ? (
            data.breakdown.electricityInputs.map((elec, index) => (
              <View key={index} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{elec.state || 'Unknown'}</Text>
                <Text style={styles.categoryValue}>
                  {formatNumber(elec.totalEmissions)} tCO₂e ({elec.quantity || 0} {elec.unit || 'kWh'})
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.categoryName}>No electricity data available</Text>
          )}
        </View>

        {/* Scope 3: Materials */}
        <View style={styles.emissionCard}>
          <Text style={styles.emissionTitle}>Scope 3: Materials (Embodied Carbon)</Text>
          <Text style={styles.emissionValue}>
            {data.breakdown.materials && data.breakdown.materials.length > 0 
              ? formatNumber(data.breakdown.materials.reduce((sum, m) => sum + (m.totalEmissions || 0), 0))
              : '0.00'
            } tCO₂e
          </Text>
          {data.breakdown.materials && data.breakdown.materials.length > 0 ? (
            data.breakdown.materials.map((material, index) => (
              <View key={index} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{material.name || 'Unknown'} ({material.category || 'N/A'})</Text>
                <Text style={styles.categoryValue}>
                  {formatNumber(material.totalEmissions)} tCO₂e ({material.quantity || 0} {material.unit || 'kg'})
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.categoryName}>No materials data available</Text>
          )}
        </View>

        {/* Scope 3: Transport */}
        <View style={styles.emissionCard}>
          <Text style={styles.emissionTitle}>Scope 3: Transport</Text>
          <Text style={styles.emissionValue}>
            {data.breakdown.transportInputs && data.breakdown.transportInputs.length > 0
              ? formatNumber(data.breakdown.transportInputs.reduce((sum, t) => sum + (t.totalEmissions || 0), 0))
              : '0.00'
            } tCO₂e
          </Text>
          {data.breakdown.transportInputs && data.breakdown.transportInputs.length > 0 ? (
            data.breakdown.transportInputs.map((transport, index) => (
              <View key={index} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{transport.mode || 'Unknown'}</Text>
                <Text style={styles.categoryValue}>
                  {formatNumber(transport.totalEmissions)} tCO₂e ({transport.distance || 0} km, {transport.weight || 0} kg)
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.categoryName}>No transport data available</Text>
          )}
        </View>
      </View>

      {/* Compliance Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Australian Compliance Status</Text>
        <View style={styles.complianceSection}>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>NCC Compliant:</Text>
            <Text style={styles.complianceStatus}>
              {data.compliance.nccCompliant ? '✓ Compliant' : '✗ Not Compliant'}
            </Text>
          </View>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>Green Star Eligible:</Text>
            <Text style={styles.complianceStatus}>
              {data.compliance.greenStarEligible ? '✓ Eligible' : '✗ Review Required'}
            </Text>
          </View>
          <View style={styles.complianceItem}>
            <Text style={styles.complianceLabel}>NABERS Ready:</Text>
            <Text style={styles.complianceStatus}>
              {data.compliance.nabersReady ? '✓ Ready' : '✗ Additional Data Required'}
            </Text>
          </View>
        </View>
      </View>

      {/* Methodology */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Methodology</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Standard:</Text>
          <Text style={styles.value}>{data.metadata.methodology}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Data Quality:</Text>
          <Text style={styles.value}>{data.metadata.dataQuality}</Text>
        </View>
      </View>
    </>
  );

  const renderEN15978Report = () => {
    const wl = data.wholeLife;
    const hasWholeLifeData = wl && (wl.total_whole_life > 0 || wl.a1a3_product > 0);
    
    return (
      <>
        {/* Declaration of Conformity */}
        <View style={styles.declarationBox}>
          <Text style={styles.declarationTitle}>DECLARATION OF CONFORMITY</Text>
          <Text style={{ fontSize: 10, color: '#1e40af', marginBottom: 10, textAlign: 'center' }}>
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
              <Text style={{ ...styles.tableCellBold, fontSize: 11, color: '#1b5e20' }}>
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
                <Text style={{ fontSize: 9, color: '#666666' }}>Recycling</Text>
                <Text style={styles.moduleDValue}>{formatNumber((wl?.d_recycling || 0) * 1000)} kgCO₂e</Text>
              </View>
              <View>
                <Text style={{ fontSize: 9, color: '#666666' }}>Reuse</Text>
                <Text style={styles.moduleDValue}>{formatNumber((wl?.d_reuse || 0) * 1000)} kgCO₂e</Text>
              </View>
              <View>
                <Text style={{ fontSize: 9, color: '#666666' }}>Energy Recovery</Text>
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
            <Text style={{ fontSize: 9, color: '#666666', marginTop: 4 }}>
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
          <View style={{ border: '1px solid #cccccc' }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottom: '1px solid #cccccc', padding: 8 }}>
              <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold' }}>Category</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>tCO₂e</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>kgCO₂e</Text>
            </View>
            <View style={{ flexDirection: 'row', borderBottom: '1px solid #e0e0e0', padding: 8 }}>
              <Text style={{ flex: 1, fontSize: 10 }}>Upfront Carbon (A1-A5)</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber(wl?.total_upfront || 0)}</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber((wl?.total_upfront || 0) * 1000)}</Text>
            </View>
            <View style={{ flexDirection: 'row', borderBottom: '1px solid #e0e0e0', padding: 8, backgroundColor: '#f8f9fa' }}>
              <Text style={{ flex: 1, fontSize: 10 }}>Embodied Carbon (A1-C4)</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber(wl?.total_embodied || 0)}</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber((wl?.total_embodied || 0) * 1000)}</Text>
            </View>
            <View style={{ flexDirection: 'row', borderBottom: '1px solid #e0e0e0', padding: 8 }}>
              <Text style={{ flex: 1, fontSize: 10 }}>Operational Carbon (B6-B7)</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber(wl?.total_operational || 0)}</Text>
              <Text style={{ width: 100, fontSize: 10, textAlign: 'right' }}>{formatNumber((wl?.total_operational || 0) * 1000)}</Text>
            </View>
            <View style={{ flexDirection: 'row', borderBottom: '1px solid #e0e0e0', padding: 8, backgroundColor: '#e8f5e9' }}>
              <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold' }}>Whole Life Carbon (A-C)</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{formatNumber(wl?.total_whole_life || 0)}</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right' }}>{formatNumber((wl?.total_whole_life || 0) * 1000)}</Text>
            </View>
            <View style={{ flexDirection: 'row', padding: 8, backgroundColor: '#e3f2fd' }}>
              <Text style={{ flex: 1, fontSize: 11, fontWeight: 'bold', color: '#1565c0' }}>Net with Benefits (A-D)</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right', color: '#1565c0' }}>{formatNumber(wl?.total_with_benefits || 0)}</Text>
              <Text style={{ width: 100, fontSize: 11, fontWeight: 'bold', textAlign: 'right', color: '#1565c0' }}>{formatNumber((wl?.total_with_benefits || 0) * 1000)}</Text>
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
          <View style={{ backgroundColor: '#fff3e0', padding: 15, borderRadius: 4, marginBottom: 20, border: '1px solid #ff9800' }}>
            <Text style={{ fontSize: 11, color: '#e65100', fontWeight: 'bold', marginBottom: 5 }}>⚠️ Incomplete Lifecycle Data</Text>
            <Text style={{ fontSize: 10, color: '#666666' }}>
              This report shows limited data. For a complete EN 15978 assessment, please complete the Use Phase (B1-B7), 
              End of Life (C1-C4), and Module D calculators in the Carbon Calculator.
            </Text>
          </View>
        )}
      </>
    );
  };

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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark for non-Pro users */}
        {showWatermark && (
          <Text style={styles.watermark}>Generated by CarbonConstruct</Text>
        )}
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.companyName}>{branding?.companyName || 'CarbonConstruct'}</Text>
              {branding?.preparedBy && (
                <Text style={styles.preparedBy}>Prepared by: {branding.preparedBy}</Text>
              )}
            </View>
            {branding?.logoUrl && (
              <Image src={branding.logoUrl} style={styles.logo} />
            )}
          </View>
          <Text style={styles.title}>{getReportTitle()}</Text>
          <Text style={styles.subtitle}>{data.project.name}</Text>
          <Text style={styles.subtitle}>Generated: {new Date(data.metadata.generatedAt).toLocaleDateString()}</Text>
        </View>

        {template === 'executive' && renderExecutiveSummary()}
        {template === 'compliance' && renderComplianceFocused()}
        {template === 'technical' && renderTechnicalReport()}
        {template === 'en15978' && renderEN15978Report()}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This report was generated using Australian NCC 2024 emission factors and methodologies.</Text>
          {branding?.contactEmail ? (
            <Text>For questions about this assessment, contact: {branding.contactEmail}</Text>
          ) : (
            <Text>For questions about this assessment, contact: support@carbonconstruct.com.au</Text>
          )}
          <Text style={{ marginTop: 5 }}>© {new Date().getFullYear()} {branding?.companyName || 'CarbonConstruct'}</Text>
        </View>

        {/* Legal Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>DISCLAIMER & TERMS OF USE</Text>
          <Text>
            This carbon assessment report is generated by CarbonConstruct Pty Ltd (ABN pending) using Australian emission factors 
            from NCC 2024, NABERS, and industry EPD sources. All calculations are estimates based on user-provided data and 
            standard emission factors. CarbonConstruct does not guarantee the accuracy, completeness, or reliability of results. 
            This report should not be used as the sole basis for regulatory compliance, financial decisions, or legal purposes 
            without independent verification by a qualified professional. Users are responsible for verifying data accuracy 
            and ensuring compliance with applicable regulations. By using this report, you agree to our full Terms of Service 
            and Privacy Policy available at carbonconstruct.com.au. CarbonConstruct accepts no liability for decisions made 
            based on this report. For certified compliance assessments, please consult an accredited carbon assessor. 
            © {new Date().getFullYear()} CarbonConstruct. All rights reserved.
          </Text>
        </View>
      </Page>
    </Document>
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
  filename = `carbon-report-${data.project.name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
  branding,
  showWatermark = false
}) => {
  return (
    <PDFDownloadLink
      document={<PDFReportDocument data={data} template={template} branding={branding} showWatermark={showWatermark} />}
      fileName={filename}
    >
      {({ loading }) => (
        <Button disabled={loading} className="w-full">
          <FileDown className="mr-2 h-4 w-4" />
          {loading ? 'Generating PDF...' : 'Download PDF Report'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};
