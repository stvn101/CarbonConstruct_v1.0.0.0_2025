import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, FileText, Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #16a34a',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 3,
  },
  badge: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '4 8',
    borderRadius: 4,
    fontSize: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: 4,
  },
  table: {
    width: '100%',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #d1d5db',
    padding: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    padding: 6,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
  },
  tableCellSmall: {
    width: 60,
    fontSize: 9,
  },
  tableCellMedium: {
    width: 80,
    fontSize: 9,
  },
  bold: {
    fontWeight: 'bold',
  },
  summaryBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #16a34a',
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  checkmark: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#6b7280',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pageNumber: {
    fontSize: 8,
    color: '#6b7280',
  },
  certificationBox: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: 4,
    padding: 12,
    marginTop: 15,
  },
  certificationText: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#92400e',
    lineHeight: 1.5,
  },
});

const auditDate = '27 November 2025';

const remediationActions = [
  { id: 'SEC-001', severity: 'Error', issue: 'Stripe IDs exposed via RLS', remediation: 'Created user_subscriptions_safe view', status: 'Fixed' },
  { id: 'SEC-002', severity: 'Error', issue: 'Rate limit records deletable by users', remediation: 'Removed DELETE policy from rate_limits', status: 'Fixed' },
  { id: 'SEC-003', severity: 'Error', issue: 'Usage metrics deletable by users', remediation: 'Removed DELETE policy from usage_metrics', status: 'Fixed' },
  { id: 'SEC-004', severity: 'Error', issue: 'Admin function missing role check', remediation: 'Added has_role() verification', status: 'Fixed' },
  { id: 'SEC-005', severity: 'Warn', issue: 'XSS in contact emails', remediation: 'Added HTML escaping', status: 'Fixed' },
  { id: 'SEC-006', severity: 'Warn', issue: 'Missing input validation', remediation: 'Added Zod schemas', status: 'Fixed' },
  { id: 'SEC-007', severity: 'Warn', issue: 'Resource endpoints unprotected', remediation: 'Added rate limiting to 5 endpoints', status: 'Fixed' },
  { id: 'SEC-008', severity: 'Warn', issue: 'RLS too permissive', remediation: 'Hardened RLS policies', status: 'Fixed' },
];

const databaseTables = [
  { table: 'projects', rls: 'Yes', policies: '4', pattern: 'User-scoped' },
  { table: 'unified_calculations', rls: 'Yes', policies: '4', pattern: 'User-scoped' },
  { table: 'user_subscriptions', rls: 'Yes', policies: '4', pattern: 'User-scoped' },
  { table: 'usage_metrics', rls: 'Yes', policies: '3', pattern: 'User-scoped' },
  { table: 'rate_limits', rls: 'Yes', policies: '4', pattern: 'User + Admin' },
  { table: 'scope1_emissions', rls: 'Yes', policies: '1', pattern: 'Project-scoped' },
  { table: 'scope2_emissions', rls: 'Yes', policies: '1', pattern: 'Project-scoped' },
  { table: 'scope3_emissions', rls: 'Yes', policies: '1', pattern: 'Project-scoped' },
  { table: 'reports', rls: 'Yes', policies: '1', pattern: 'Project-scoped' },
  { table: 'materials_epd', rls: 'Yes', policies: '2', pattern: 'Auth read' },
  { table: 'emission_factors', rls: 'Yes', policies: '2', pattern: 'Auth read' },
  { table: 'subscription_tiers', rls: 'Yes', policies: '1', pattern: 'Public read' },
  { table: 'user_roles', rls: 'Yes', policies: '2', pattern: 'Own + Admin' },
  { table: 'alerts', rls: 'Yes', policies: '3', pattern: 'Admin only' },
  { table: 'materials_import_jobs', rls: 'Yes', policies: '5', pattern: 'User + Admin' },
  { table: 'error_logs', rls: 'Yes', policies: '3', pattern: 'Service role' },
  { table: 'performance_metrics', rls: 'Yes', policies: '3', pattern: 'Service role' },
  { table: 'analytics_events', rls: 'Yes', policies: '3', pattern: 'Service role' },
];

// PDF Document Component
const SecurityAuditPDF = () => (
  <Document>
    {/* Page 1 - Summary */}
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>CarbonConstruct Security Audit Report</Text>
        <Text style={styles.subtitle}>Pre-Production Security Review</Text>
        <Text style={styles.subtitle}>Audit Date: {auditDate}</Text>
        <Text style={styles.badge}>AUDIT PASSED ✓</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audit Metadata</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.bold]}>Audit Type</Text>
            <Text style={styles.tableCell}>Pre-Production Security Review</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.bold]}>Platform</Text>
            <Text style={styles.tableCell}>CarbonConstruct v1.0</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.bold]}>Environment</Text>
            <Text style={styles.tableCell}>Production (carbonconstruct.com.au)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.bold]}>Auditor</Text>
            <Text style={styles.tableCell}>Automated Scanner + Manual Review</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>SECURITY AUDIT RESULTS</Text>
        <View style={styles.summaryRow}>
          <Text>Critical Vulnerabilities:</Text>
          <Text style={styles.checkmark}>0 ✓</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>High-Risk Issues:</Text>
          <Text style={styles.checkmark}>0 (all remediated) ✓</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Medium-Risk Issues:</Text>
          <Text>4 (acceptable design choices)</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Low-Risk / Informational:</Text>
          <Text>3 (documented)</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Supabase Linter:</Text>
          <Text style={styles.checkmark}>No issues ✓</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>RLS Coverage:</Text>
          <Text style={styles.checkmark}>100% (18/18 tables) ✓</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audit Scope</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.bold]}>Component</Text>
            <Text style={[styles.tableCell, styles.bold]}>Scope</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Database</Text>
            <Text style={styles.tableCell}>18 tables, RLS policies, functions, views</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Edge Functions</Text>
            <Text style={styles.tableCell}>16 serverless functions</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Authentication</Text>
            <Text style={styles.tableCell}>Email/password, Google OAuth, sessions</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Authorization</Text>
            <Text style={styles.tableCell}>Role-based access control (RBAC)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>API Security</Text>
            <Text style={styles.tableCell}>JWT validation, rate limiting, input validation</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>CarbonConstruct Security Audit Report</Text>
        <Text style={styles.pageNumber}>Page 1 of 3</Text>
      </View>
    </Page>

    {/* Page 2 - Remediation Actions */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Remediation Actions Completed</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellSmall, styles.bold]}>ID</Text>
            <Text style={[styles.tableCellSmall, styles.bold]}>Severity</Text>
            <Text style={[styles.tableCell, styles.bold]}>Issue</Text>
            <Text style={[styles.tableCell, styles.bold]}>Remediation</Text>
            <Text style={[styles.tableCellSmall, styles.bold]}>Status</Text>
          </View>
          {remediationActions.map((action, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCellSmall}>{action.id}</Text>
              <Text style={styles.tableCellSmall}>{action.severity}</Text>
              <Text style={styles.tableCell}>{action.issue}</Text>
              <Text style={styles.tableCell}>{action.remediation}</Text>
              <Text style={[styles.tableCellSmall, styles.checkmark]}>✓ {action.status}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Controls Verified</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.bold]}>Control Category</Text>
            <Text style={[styles.tableCell, styles.bold]}>Controls Implemented</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Authentication</Text>
            <Text style={styles.tableCell}>Supabase Auth, bcrypt, OAuth 2.0, JWT, auto-refresh</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Authorization</Text>
            <Text style={styles.tableCell}>RBAC, has_role() function, security definer</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Data Protection</Text>
            <Text style={styles.tableCell}>AES-256 at rest, TLS 1.3, Supabase Vault</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>API Security</Text>
            <Text style={styles.tableCell}>CORS, JWT validation, Stripe signatures</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Input Validation</Text>
            <Text style={styles.tableCell}>Zod schemas, HTML escaping, length limits</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Rate Limiting</Text>
            <Text style={styles.tableCell}>DB-backed limits, user/IP based, auto-cleanup</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>CarbonConstruct Security Audit Report</Text>
        <Text style={styles.pageNumber}>Page 2 of 3</Text>
      </View>
    </Page>

    {/* Page 3 - Database & Compliance */}
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database Security Verification (18 Tables)</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.bold]}>Table</Text>
            <Text style={[styles.tableCellSmall, styles.bold]}>RLS</Text>
            <Text style={[styles.tableCellSmall, styles.bold]}>Policies</Text>
            <Text style={[styles.tableCellMedium, styles.bold]}>Access Pattern</Text>
          </View>
          {databaseTables.map((table, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{table.table}</Text>
              <Text style={[styles.tableCellSmall, styles.checkmark]}>✓ {table.rls}</Text>
              <Text style={styles.tableCellSmall}>{table.policies}</Text>
              <Text style={styles.tableCellMedium}>{table.pattern}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance Attestation</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.bold]}>Standard</Text>
            <Text style={[styles.tableCellMedium, styles.bold]}>Status</Text>
            <Text style={[styles.tableCell, styles.bold]}>Notes</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Privacy Act 1988 (Cth)</Text>
            <Text style={[styles.tableCellMedium, styles.checkmark]}>✓ Compliant</Text>
            <Text style={styles.tableCell}>Data minimization, access controls</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>OWASP Top 10 2021</Text>
            <Text style={[styles.tableCellMedium, styles.checkmark]}>✓ Addressed</Text>
            <Text style={styles.tableCell}>Injection, auth, XSS, misconfig</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>NCC 2024 Section J</Text>
            <Text style={[styles.tableCellMedium, styles.checkmark]}>✓ Supported</Text>
            <Text style={styles.tableCell}>Australian emission standards</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>ISO 27001 Controls</Text>
            <Text style={styles.tableCellMedium}>⚡ Partial</Text>
            <Text style={styles.tableCell}>Access, crypto, operations</Text>
          </View>
        </View>
      </View>

      <View style={styles.certificationBox}>
        <Text style={styles.sectionTitle}>Certification Statement</Text>
        <Text style={styles.certificationText}>
          This document certifies that CarbonConstruct has undergone a comprehensive security audit 
          on {auditDate}. All critical and high-risk vulnerabilities have been remediated. 
          The platform implements defense-in-depth security controls appropriate for handling 
          Australian construction industry carbon emissions data.
        </Text>
        <Text style={[styles.certificationText, styles.bold, { marginTop: 8 }]}>
          The application is cleared for production deployment.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text>CarbonConstruct Security Audit Report | Contact: security@carbonconstruct.com.au</Text>
        <Text style={styles.pageNumber}>Page 3 of 3</Text>
      </View>
    </Page>
  </Document>
);

// Export Button Component
export const SecurityAuditReportDownload = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    if (!recipientEmail || !recipientName) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-audit-report', {
        body: {
          recipientEmail,
          recipientName,
          auditDate,
        },
      });

      if (error) throw error;

      toast.success(`Audit report sent to ${recipientEmail}`);
      setShowEmailForm(false);
      setRecipientEmail('');
      setRecipientName('');
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-card border rounded-lg">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h3 className="font-semibold text-lg">Security Audit Report</h3>
          <p className="text-sm text-muted-foreground">
            Pre-Production Security Review - {auditDate}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-medium">
          AUDIT PASSED
        </span>
        <span className="text-muted-foreground">0 Critical | 0 High | 4 Medium | 3 Info</span>
      </div>

      <div className="flex gap-2">
        <PDFDownloadLink
          document={<SecurityAuditPDF />}
          fileName={`CarbonConstruct-Security-Audit-${new Date().toISOString().split('T')[0]}.pdf`}
          className="flex-1"
        >
          {({ loading }) => (
            <Button disabled={loading} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {loading ? 'Generating...' : 'Download PDF'}
            </Button>
          )}
        </PDFDownloadLink>
        
        <Button 
          variant="outline" 
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="flex-1"
        >
          <Mail className="mr-2 h-4 w-4" />
          Email Report
        </Button>
      </div>

      {showEmailForm && (
        <div className="space-y-3 p-4 bg-muted/50 rounded-lg border">
          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name</Label>
            <Input
              id="recipientName"
              placeholder="John Smith"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipientEmail">Recipient Email</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="john@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleSendEmail} 
            disabled={isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Audit Report
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SecurityAuditReportDownload;
