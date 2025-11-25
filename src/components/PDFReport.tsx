import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { ReportData } from './ReportData';
import { ReportTemplate } from '@/pages/Reports';
import { useComplianceCheck } from '@/hooks/useComplianceCheck';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #2d5a27',
    paddingBottom: 20,
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
});

interface PDFReportDocumentProps {
  data: ReportData;
  template: ReportTemplate;
}

const PDFReportDocument: React.FC<PDFReportDocumentProps> = ({ data, template }) => {
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

  const getReportTitle = () => {
    switch (template) {
      case 'executive':
        return 'Executive Summary Report';
      case 'compliance':
        return 'Compliance Assessment Report';
      case 'technical':
      default:
        return 'Technical Carbon Assessment Report';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getReportTitle()}</Text>
          <Text style={styles.subtitle}>{data.project.name}</Text>
          <Text style={styles.subtitle}>Generated: {new Date(data.metadata.generatedAt).toLocaleDateString()}</Text>
        </View>

        {template === 'executive' && renderExecutiveSummary()}
        {template === 'compliance' && renderComplianceFocused()}
        {template === 'technical' && renderTechnicalReport()}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This report was generated using Australian NCC 2024 emission factors and methodologies.</Text>
          <Text>For questions about this assessment, please contact your carbon consultant.</Text>
        </View>
      </Page>
    </Document>
  );
};

interface PDFReportProps {
  data: ReportData;
  template?: ReportTemplate;
  filename?: string;
}

export const PDFReport: React.FC<PDFReportProps> = ({ 
  data,
  template = 'technical',
  filename = `carbon-report-${data.project.name.replace(/\s+/g, '-').toLowerCase()}.pdf` 
}) => {
  return (
    <PDFDownloadLink
      document={<PDFReportDocument data={data} template={template} />}
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
