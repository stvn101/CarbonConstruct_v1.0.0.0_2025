import { Button } from '@/components/ui/button';
import { Download, FileText, Mail, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

const auditDate = '1 January 2026';

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

// Export Button Component
export const SecurityAuditReportDownload = () => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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
    } catch (error: unknown) {
      console.error('Error sending email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('security-audit-pdf-content');
      if (!element) return;

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `CarbonConstruct-Security-Audit-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-card border rounded-lg">
      {/* Hidden PDF Content */}
      <div id="security-audit-pdf-content" className="hidden pdf-report" style={{ position: 'absolute', left: '-9999px' }}>
        <div style={{ padding: '40px', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '10px', color: '#333' }}>
          {/* Page 1 - Summary */}
          <div style={{ marginBottom: '20px', borderBottom: '2px solid #16a34a', paddingBottom: '15px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534', marginBottom: '5px' }}>CarbonConstruct Security Audit Report</h1>
            <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '3px' }}>Pre-Production Security Review</p>
            <p style={{ fontSize: '12px', color: '#4b5563', marginBottom: '3px' }}>Audit Date: {auditDate}</p>
            <span style={{ display: 'inline-block', backgroundColor: '#16a34a', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', marginTop: '8px' }}>AUDIT PASSED ✓</span>
          </div>

          {/* Audit Metadata */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>Audit Metadata</h2>
            <table style={{ width: '100%', marginBottom: '10px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb', padding: '6px 0' }}>
                  <td style={{ fontWeight: 'bold', padding: '6px' }}>Audit Type</td>
                  <td style={{ padding: '6px' }}>Pre-Production Security Review</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb', padding: '6px 0' }}>
                  <td style={{ fontWeight: 'bold', padding: '6px' }}>Platform</td>
                  <td style={{ padding: '6px' }}>CarbonConstruct v1.0</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb', padding: '6px 0' }}>
                  <td style={{ fontWeight: 'bold', padding: '6px' }}>Environment</td>
                  <td style={{ padding: '6px' }}>Production (carbonconstruct.com.au)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb', padding: '6px 0' }}>
                  <td style={{ fontWeight: 'bold', padding: '6px' }}>Auditor</td>
                  <td style={{ padding: '6px' }}>Automated Scanner + Manual Review</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Security Audit Results */}
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #16a34a', borderRadius: '4px', padding: '12px', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#166534', marginBottom: '8px', textAlign: 'center' }}>SECURITY AUDIT RESULTS</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Critical Vulnerabilities:</span>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>0 ✓</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>High-Risk Issues:</span>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>0 (all remediated) ✓</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Medium-Risk Issues:</span>
              <span>4 (acceptable design choices)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Low-Risk / Informational:</span>
              <span>3 (documented)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Supabase Linter:</span>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>No issues ✓</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>RLS Coverage:</span>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>100% (18/18 tables) ✓</span>
            </div>
          </div>

          {/* Remediation Actions */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>Remediation Actions Completed</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
                  <th style={{ padding: '6px', textAlign: 'left', width: '60px' }}>ID</th>
                  <th style={{ padding: '6px', textAlign: 'left', width: '60px' }}>Severity</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Issue</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Remediation</th>
                  <th style={{ padding: '6px', textAlign: 'left', width: '60px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {remediationActions.map((action, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '6px' }}>{action.id}</td>
                    <td style={{ padding: '6px' }}>{action.severity}</td>
                    <td style={{ padding: '6px' }}>{action.issue}</td>
                    <td style={{ padding: '6px' }}>{action.remediation}</td>
                    <td style={{ padding: '6px', color: '#16a34a', fontWeight: 'bold' }}>✓ {action.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Security Controls */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>Security Controls Verified</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Control Category</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Controls Implemented</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>Authentication</td>
                  <td style={{ padding: '6px' }}>Supabase Auth, bcrypt, OAuth 2.0, JWT, auto-refresh</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>Authorization</td>
                  <td style={{ padding: '6px' }}>RBAC, has_role() function, security definer</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>Data Protection</td>
                  <td style={{ padding: '6px' }}>AES-256 at rest, TLS 1.3, Supabase Vault</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>API Security</td>
                  <td style={{ padding: '6px' }}>CORS, JWT validation, Stripe signatures</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>Input Validation</td>
                  <td style={{ padding: '6px' }}>Zod schemas, HTML escaping, length limits</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>Rate Limiting</td>
                  <td style={{ padding: '6px' }}>DB-backed limits, user/IP based, auto-cleanup</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Database Security */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>Database Security Verification (18 Tables)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Table</th>
                  <th style={{ padding: '6px', textAlign: 'left', width: '60px' }}>RLS</th>
                  <th style={{ padding: '6px', textAlign: 'left', width: '60px' }}>Policies</th>
                  <th style={{ padding: '6px', textAlign: 'left', width: '80px' }}>Access Pattern</th>
                </tr>
              </thead>
              <tbody>
                {databaseTables.map((table, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '6px' }}>{table.table}</td>
                    <td style={{ padding: '6px', color: '#16a34a', fontWeight: 'bold' }}>✓ {table.rls}</td>
                    <td style={{ padding: '6px' }}>{table.policies}</td>
                    <td style={{ padding: '6px' }}>{table.pattern}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Compliance Attestation */}
          <div style={{ marginBottom: '15px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>Compliance Attestation</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Standard</th>
                  <th style={{ padding: '6px', textAlign: 'left', width: '80px' }}>Status</th>
                  <th style={{ padding: '6px', textAlign: 'left' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>Privacy Act 1988 (Cth)</td>
                  <td style={{ padding: '6px', color: '#16a34a', fontWeight: 'bold' }}>✓ Compliant</td>
                  <td style={{ padding: '6px' }}>Data minimization, access controls</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>OWASP Top 10 2021</td>
                  <td style={{ padding: '6px', color: '#16a34a', fontWeight: 'bold' }}>✓ Addressed</td>
                  <td style={{ padding: '6px' }}>Injection, auth, XSS, misconfig</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>NCC 2024 Section J</td>
                  <td style={{ padding: '6px', color: '#16a34a', fontWeight: 'bold' }}>✓ Supported</td>
                  <td style={{ padding: '6px' }}>Australian emission standards</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px' }}>ISO 27001 Controls</td>
                  <td style={{ padding: '6px' }}>⚡ Partial</td>
                  <td style={{ padding: '6px' }}>Access, crypto, operations</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Certification Statement */}
          <div style={{ backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '4px', padding: '12px', marginTop: '15px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>Certification Statement</h3>
            <p style={{ fontSize: '9px', fontStyle: 'italic', color: '#92400e', lineHeight: '1.5' }}>
              This document certifies that CarbonConstruct has undergone a comprehensive security audit 
              on {auditDate}. All critical and high-risk vulnerabilities have been remediated. 
              The platform implements defense-in-depth security controls appropriate for handling 
              Australian construction industry carbon emissions data.
            </p>
            <p style={{ fontSize: '9px', fontWeight: 'bold', fontStyle: 'italic', color: '#92400e', marginTop: '8px' }}>
              The application is cleared for production deployment.
            </p>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #e5e7eb', fontSize: '8px', color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
            <span>CarbonConstruct Security Audit Report | Contact: security@carbonconstruct.com.au</span>
          </div>
        </div>
      </div>

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
        <Button 
          onClick={generatePDF} 
          disabled={isGenerating} 
          className="flex-1"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </Button>
        
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
