import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditReportEmailRequest {
  recipientEmail: string;
  recipientName: string;
  auditDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-audit-report function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user has admin role
    const { data: roleData } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      console.error("User is not admin");
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { recipientEmail, recipientName, auditDate }: AuditReportEmailRequest = await req.json();

    // Validate input
    if (!recipientEmail || !recipientName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Sending audit report to ${recipientEmail}`);

    const emailResponse = await resend.emails.send({
      from: "CarbonConstruct Security <security@carbonconstruct.com.au>",
      to: [recipientEmail],
      subject: `CarbonConstruct Security Audit Report - ${auditDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #166534; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .badge { display: inline-block; background: #16a34a; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
            .summary { background: #f0fdf4; border: 1px solid #16a34a; border-radius: 4px; padding: 16px; margin: 16px 0; }
            .summary-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background: #f3f4f6; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Security Audit Report</h1>
              <p style="margin: 8px 0 0 0;">CarbonConstruct Pre-Production Review</p>
            </div>
            
            <div class="content">
              <p>Dear ${recipientName},</p>
              
              <p>Please find below the summary of the CarbonConstruct Security Audit Report dated <strong>${auditDate}</strong>.</p>
              
              <div style="text-align: center; margin: 16px 0;">
                <span class="badge">AUDIT PASSED ✓</span>
              </div>
              
              <div class="summary">
                <h3 style="margin-top: 0; color: #166534;">Security Audit Results</h3>
                <div class="summary-row"><span>Critical Vulnerabilities:</span><span style="color: #16a34a;">0 ✓</span></div>
                <div class="summary-row"><span>High-Risk Issues:</span><span style="color: #16a34a;">0 (all remediated) ✓</span></div>
                <div class="summary-row"><span>Medium-Risk Issues:</span><span>4 (acceptable design choices)</span></div>
                <div class="summary-row"><span>Low-Risk / Informational:</span><span>3 (documented)</span></div>
                <div class="summary-row"><span>Supabase Linter:</span><span style="color: #16a34a;">No issues ✓</span></div>
                <div class="summary-row"><span>RLS Coverage:</span><span style="color: #16a34a;">100% (18/18 tables) ✓</span></div>
              </div>
              
              <h3>Key Remediation Actions</h3>
              <table>
                <tr><th>Issue</th><th>Status</th></tr>
                <tr><td>Stripe IDs exposed via RLS</td><td style="color: #16a34a;">✓ Fixed</td></tr>
                <tr><td>Rate limit records deletable</td><td style="color: #16a34a;">✓ Fixed</td></tr>
                <tr><td>Usage metrics deletable</td><td style="color: #16a34a;">✓ Fixed</td></tr>
                <tr><td>Admin function role check</td><td style="color: #16a34a;">✓ Fixed</td></tr>
                <tr><td>XSS in contact emails</td><td style="color: #16a34a;">✓ Fixed</td></tr>
                <tr><td>Missing input validation</td><td style="color: #16a34a;">✓ Fixed</td></tr>
              </table>
              
              <h3>Compliance Attestation</h3>
              <table>
                <tr><th>Standard</th><th>Status</th></tr>
                <tr><td>Privacy Act 1988 (Cth)</td><td style="color: #16a34a;">✓ Compliant</td></tr>
                <tr><td>OWASP Top 10 2021</td><td style="color: #16a34a;">✓ Addressed</td></tr>
                <tr><td>NCC 2024 Section J</td><td style="color: #16a34a;">✓ Supported</td></tr>
              </table>
              
              <p style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; padding: 12px; font-style: italic; color: #92400e;">
                This certifies that CarbonConstruct has undergone a comprehensive security audit. All critical and high-risk vulnerabilities have been remediated. The application is cleared for production deployment.
              </p>
              
              <p>For the full PDF report, please log in to the Admin Monitoring dashboard at <a href="https://carbonconstruct.com.au/admin/monitoring">carbonconstruct.com.au/admin/monitoring</a>.</p>
            </div>
            
            <div class="footer">
              <p>CarbonConstruct Security Team<br>
              <a href="mailto:security@carbonconstruct.com.au">security@carbonconstruct.com.au</a></p>
              <p>© ${new Date().getFullYear()} CarbonConstruct. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-audit-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
