import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { ReportData } from './ReportData';

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
    marginBottom: 5,
  },
  complianceLabel: {
    width: 120,
    fontSize: 11,
    color: '#2d5a27',
    fontWeight: 'bold',
  },
  complianceStatus: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: 'bold',
  },
});

const PDFReportDocument: React.FC<{ data: ReportData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Carbon Assessment Report</Text>
        <Text style={styles.subtitle}>{data.project.name}</Text>
        <Text style={styles.subtitle}>Generated: {new Date(data.metadata.generatedAt).toLocaleDateString()}</Text>
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
          <Text style={styles.emissionValue}>{data.emissions.total.toFixed(2)} tCO₂e</Text>
        </View>
      </View>

      {/* Emissions Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emissions by Scope</Text>
        
        {/* Scope 1: Fuel Inputs */}
        <View style={styles.emissionCard}>
          <Text style={styles.emissionTitle}>Scope 1: Direct Emissions (Fuel)</Text>
          <Text style={styles.emissionValue}>{data.emissions.scope1.toFixed(2)} tCO₂e</Text>
          {data.breakdown.fuelInputs.map((fuel, index) => (
            <View key={index} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{fuel.fuelType}</Text>
              <Text style={styles.categoryValue}>
                {fuel.totalEmissions.toFixed(2)} tCO₂e ({fuel.quantity} {fuel.unit})
              </Text>
            </View>
          ))}
        </View>

        {/* Scope 2: Electricity */}
        <View style={styles.emissionCard}>
          <Text style={styles.emissionTitle}>Scope 2: Energy Indirect (Electricity)</Text>
          <Text style={styles.emissionValue}>{data.emissions.scope2.toFixed(2)} tCO₂e</Text>
          {data.breakdown.electricityInputs.map((elec, index) => (
            <View key={index} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{elec.state}</Text>
              <Text style={styles.categoryValue}>
                {elec.totalEmissions.toFixed(2)} tCO₂e ({elec.quantity} {elec.unit})
              </Text>
            </View>
          ))}
        </View>

        {/* Scope 3: Materials */}
        <View style={styles.emissionCard}>
          <Text style={styles.emissionTitle}>Scope 3: Materials (Embodied Carbon)</Text>
          <Text style={styles.emissionValue}>{data.breakdown.materials.reduce((sum, m) => sum + m.totalEmissions, 0).toFixed(2)} tCO₂e</Text>
          {data.breakdown.materials.map((material, index) => (
            <View key={index} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{material.name} ({material.category})</Text>
              <Text style={styles.categoryValue}>
                {material.totalEmissions.toFixed(2)} tCO₂e ({material.quantity} {material.unit})
              </Text>
            </View>
          ))}
        </View>

        {/* Scope 3: Transport */}
        <View style={styles.emissionCard}>
          <Text style={styles.emissionTitle}>Scope 3: Transport</Text>
          <Text style={styles.emissionValue}>{data.breakdown.transportInputs.reduce((sum, t) => sum + t.totalEmissions, 0).toFixed(2)} tCO₂e</Text>
          {data.breakdown.transportInputs.map((transport, index) => (
            <View key={index} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{transport.mode}</Text>
              <Text style={styles.categoryValue}>
                {transport.totalEmissions.toFixed(2)} tCO₂e ({transport.distance} km, {transport.weight} kg)
              </Text>
            </View>
          ))}
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text>This report was generated using Australian NCC 2024 emission factors and methodologies.</Text>
        <Text>For questions about this assessment, please contact your carbon consultant.</Text>
      </View>
    </Page>
  </Document>
);

interface PDFReportProps {
  data: ReportData;
  filename?: string;
}

export const PDFReport: React.FC<PDFReportProps> = ({ 
  data, 
  filename = `carbon-report-${data.project.name.replace(/\s+/g, '-').toLowerCase()}.pdf` 
}) => {
  return (
    <PDFDownloadLink
      document={<PDFReportDocument data={data} />}
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