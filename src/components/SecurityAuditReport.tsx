import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Button } from '@/components/ui/button';
import { Download, FileText, Mail, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  { table: 'lca_materials', rls: 'Yes', policies: '2', pattern: 'Auth read' },
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
  const reportRef = useRef<HTMLDivElement>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    try {
      const opt = {
        margin: 10,
        filename: `CarbonConstruct-Security-Audit-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(reportRef.current).save();
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

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
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
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
        <Button onClick={handleDownload} disabled={isGenerating} className="flex-1">
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
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

      {/* Hidden PDF content */}
      <div className="absolute left-[-9999px]">
        <div 
          ref={reportRef}
          className="bg-white text-black p-10"
          style={{ width: '210mm', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '10px' }}
        >
          {/* Page 1 - Summary */}
          <div className="mb-5 border-b-2 border-[#16a34a] pb-4">
            <h1 className="text-2xl font-bold text-[#166534] mb-1">CarbonConstruct Security Audit Report</h1>
            <p className="text-xs text-gray-600 mb-0.5">Pre-Production Security Review</p>
            <p className="text-xs text-gray-600 mb-2">Audit Date: {auditDate}</p>
            <span className="bg-[#16a34a] text-white px-2 py-1 rounded text-xs">AUDIT PASSED ✓</span>
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#166534] border-b border-gray-300 pb-1 mb-2">Audit Metadata</h2>
            <table className="w-full text-xs">
              <tbody>
                <tr><td className="font-bold py-1 w-32">Audit Type</td><td>Pre-Production Security Review</td></tr>
                <tr><td className="font-bold py-1">Platform</td><td>CarbonConstruct v1.0</td></tr>
                <tr><td className="font-bold py-1">Environment</td><td>Production (carbonconstruct.com.au)</td></tr>
                <tr><td className="font-bold py-1">Auditor</td><td>Automated Scanner + Manual Review</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-[#f0fdf4] border border-[#16a34a] rounded p-3 mb-4">
            <h3 className="text-xs font-bold text-[#166534] mb-2 text-center">SECURITY AUDIT RESULTS</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between"><span>Critical Vulnerabilities:</span><span className="text-[#16a34a] font-bold">0 ✓</span></div>
              <div className="flex justify-between"><span>High-Risk Issues:</span><span className="text-[#16a34a] font-bold">0 (all remediated) ✓</span></div>
              <div className="flex justify-between"><span>Medium-Risk Issues:</span><span>4 (acceptable design choices)</span></div>
              <div className="flex justify-between"><span>Low-Risk / Informational:</span><span>3 (documented)</span></div>
              <div className="flex justify-between"><span>Supabase Linter:</span><span className="text-[#16a34a] font-bold">No issues ✓</span></div>
              <div className="flex justify-between"><span>RLS Coverage:</span><span className="text-[#16a34a] font-bold">100% (18/18 tables) ✓</span></div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#166534] border-b border-gray-300 pb-1 mb-2">Remediation Actions Completed</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-1 text-left">ID</th>
                  <th className="border border-gray-300 p-1 text-left">Severity</th>
                  <th className="border border-gray-300 p-1 text-left">Issue</th>
                  <th className="border border-gray-300 p-1 text-left">Remediation</th>
                  <th className="border border-gray-300 p-1 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {remediationActions.map((action, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-1">{action.id}</td>
                    <td className="border border-gray-300 p-1">{action.severity}</td>
                    <td className="border border-gray-300 p-1">{action.issue}</td>
                    <td className="border border-gray-300 p-1">{action.remediation}</td>
                    <td className="border border-gray-300 p-1 text-[#16a34a] font-bold">✓ {action.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#166534] border-b border-gray-300 pb-1 mb-2">Database Security Verification (18 Tables)</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-1 text-left">Table</th>
                  <th className="border border-gray-300 p-1 text-left">RLS</th>
                  <th className="border border-gray-300 p-1 text-left">Policies</th>
                  <th className="border border-gray-300 p-1 text-left">Access Pattern</th>
                </tr>
              </thead>
              <tbody>
                {databaseTables.map((table, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 p-1">{table.table}</td>
                    <td className="border border-gray-300 p-1 text-[#16a34a] font-bold">✓ {table.rls}</td>
                    <td className="border border-gray-300 p-1">{table.policies}</td>
                    <td className="border border-gray-300 p-1">{table.pattern}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#fef3c7] border border-[#f59e0b] rounded p-3 mt-4">
            <h3 className="text-xs font-bold text-[#92400e] mb-2">Certification Statement</h3>
            <p className="text-xs italic text-[#92400e] leading-relaxed">
              This document certifies that CarbonConstruct has undergone a comprehensive security audit 
              on {auditDate}. All critical and high-risk vulnerabilities have been remediated. 
              The platform implements defense-in-depth security controls appropriate for handling 
              Australian construction industry carbon emissions data.
            </p>
            <p className="text-xs font-bold text-[#92400e] mt-2">
              The application is cleared for production deployment.
            </p>
          </div>

          <div className="mt-6 pt-3 border-t border-gray-300 text-xs text-gray-500 flex justify-between">
            <span>CarbonConstruct Security Audit Report | Contact: security@carbonconstruct.com.au</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAuditReportDownload;
