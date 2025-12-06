import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rate-limiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HTML escape function to prevent XSS
const escapeHtml = (str: string): string => {
  if (!str) return '';
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
};

// Input validation schemas
const EmailDataSchema = z.object({
  appUrl: z.string().url().max(500).optional(),
  tierName: z.string().max(50).optional(),
  features: z.array(z.string().max(200)).max(20).optional(),
  renewalDate: z.string().max(50).optional(),
  endDate: z.string().max(50).optional(),
  daysLeft: z.number().int().min(0).max(365).optional(),
  projectName: z.string().max(200).optional(),
  totalEmissions: z.string().max(50).optional(),
  scope1: z.string().max(50).optional(),
  scope2: z.string().max(50).optional(),
  scope3: z.string().max(50).optional(),
  complianceStatus: z.string().max(100).optional(),
}).passthrough();

const EmailRequestSchema = z.object({
  type: z.enum(['welcome', 'subscription_updated', 'subscription_cancelled', 'trial_ending', 'report_generated']),
  to: z.string().email().max(255),
  data: EmailDataSchema.optional(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);

    // Authenticate the request
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check rate limit (10 emails per hour per user)
    const rateLimitResult = await checkRateLimit(supabase, user.id, 'send-email', {
      windowMinutes: 60,
      maxRequests: 10
    });

    if (!rateLimitResult.allowed) {
      console.log(`[send-email] Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.',
          resetAt: rateLimitResult.resetAt.toISOString()
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validationResult = EmailRequestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error('[send-email] Validation failed:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input data',
          details: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { type, to, data = {} } = validationResult.data;

    // Escape user-controllable data for HTML safety
    const safeData = {
      appUrl: escapeHtml(data.appUrl || ''),
      tierName: escapeHtml(data.tierName || ''),
      features: data.features?.map((f: string) => escapeHtml(f)) || [],
      renewalDate: escapeHtml(data.renewalDate || ''),
      endDate: escapeHtml(data.endDate || ''),
      daysLeft: data.daysLeft ?? 0,
      projectName: escapeHtml(data.projectName || ''),
      totalEmissions: escapeHtml(data.totalEmissions || ''),
      scope1: escapeHtml(data.scope1 || ''),
      scope2: escapeHtml(data.scope2 || ''),
      scope3: escapeHtml(data.scope3 || ''),
      complianceStatus: escapeHtml(data.complianceStatus || ''),
    };

    let subject = "";
    let html = "";

    switch (type) {
      case 'welcome':
        subject = "Welcome to CarbonConstruct!";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Welcome to CarbonConstruct!</h1>
            <p>Thank you for joining CarbonConstruct, Australia's leading carbon emissions calculator for the construction industry.</p>
            <p>Get started by:</p>
            <ul>
              <li>Creating your first project</li>
              <li>Calculating emissions across all three scopes</li>
              <li>Generating compliance reports</li>
            </ul>
            <p>Need help? Check our <a href="${safeData.appUrl}/help">Help & Resources</a> section or reply to this email.</p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>The CarbonConstruct Team</p>
          </div>
        `;
        break;

      case 'subscription_updated':
        subject = "Your CarbonConstruct Subscription Has Been Updated";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Subscription Updated</h1>
            <p>Your CarbonConstruct subscription has been successfully updated to <strong>${safeData.tierName}</strong>.</p>
            <p>You now have access to:</p>
            <ul>
              ${safeData.features.map((f: string) => `<li>${f}</li>`).join('')}
            </ul>
            <p>Your subscription will renew on <strong>${safeData.renewalDate}</strong>.</p>
            <p><a href="${safeData.appUrl}/settings" style="display: inline-block; padding: 10px 20px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px;">Manage Subscription</a></p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>The CarbonConstruct Team</p>
          </div>
        `;
        break;

      case 'subscription_cancelled':
        subject = "Your CarbonConstruct Subscription Has Been Cancelled";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Subscription Cancelled</h1>
            <p>Your CarbonConstruct subscription has been cancelled and will end on <strong>${safeData.endDate}</strong>.</p>
            <p>Until then, you'll continue to have access to all Pro features.</p>
            <p>After cancellation, you'll be moved to the Free tier with:</p>
            <ul>
              <li>Up to 3 active projects</li>
              <li>Basic emissions calculations</li>
              <li>Standard reports</li>
            </ul>
            <p>Changed your mind? <a href="${safeData.appUrl}/pricing">Reactivate your subscription</a> anytime.</p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>The CarbonConstruct Team</p>
          </div>
        `;
        break;

      case 'trial_ending':
        subject = "Your CarbonConstruct Trial Ends Soon";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Your Trial Ends in ${safeData.daysLeft} Days</h1>
            <p>Your 14-day Pro trial will end on <strong>${safeData.endDate}</strong>.</p>
            <p>Continue enjoying unlimited access to:</p>
            <ul>
              <li>Unlimited projects and calculations</li>
              <li>Advanced LCA analysis</li>
              <li>Custom compliance reports</li>
              <li>AI-powered recommendations</li>
              <li>Priority support</li>
            </ul>
            <p><a href="${safeData.appUrl}/pricing" style="display: inline-block; padding: 10px 20px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px;">Upgrade to Pro</a></p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>The CarbonConstruct Team</p>
          </div>
        `;
        break;

      case 'report_generated':
        subject = `Your CarbonConstruct Report for ${safeData.projectName} is Ready`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">Report Generated Successfully</h1>
            <p>Your emissions report for <strong>${safeData.projectName}</strong> has been generated.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0;">Report Summary</h3>
              <p><strong>Total Emissions:</strong> ${safeData.totalEmissions} tCO₂-e</p>
              <p><strong>Scope 1:</strong> ${safeData.scope1} tCO₂-e</p>
              <p><strong>Scope 2:</strong> ${safeData.scope2} tCO₂-e</p>
              <p><strong>Scope 3:</strong> ${safeData.scope3} tCO₂-e</p>
              <p><strong>Compliance Status:</strong> ${safeData.complianceStatus}</p>
            </div>
            <p><a href="${safeData.appUrl}/reports" style="display: inline-block; padding: 10px 20px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px;">View Full Report</a></p>
            <p style="margin-top: 30px; color: #666;">Best regards,<br>The CarbonConstruct Team</p>
          </div>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const { error: emailError } = await resend.emails.send({
      from: "CarbonConstruct <noreply@carbonconstruct.com.au>",
      to: [to],
      subject,
      html,
    });

    if (emailError) {
      console.error("Error sending email");
      throw emailError;
    }

    console.log(`Email sent successfully: ${type}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to send email. Please try again.' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
