import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = 'https://carbonconstruct.com.au';

interface CampaignEmailRequest {
  audience: string;
  variant: 'A' | 'B';
  recipientEmail: string;
  recipientName?: string;
  campaignId: string;
  scheduleId?: string;
}

interface EmailTemplate {
  subject: string;
  preheader: string;
  headline: string;
  ctaText: string;
  ctaUrl: string;
  testimonialPosition: 'before-cta' | 'after-benefits' | 'none';
}

// Simplified template data for edge function
const templateData: Record<string, { headline: string; ctaUrl: string }> = {
  builders: { headline: 'Carbon Compliance Without the Complexity', ctaUrl: `${BASE_URL}/lp/builders` },
  architects: { headline: 'Make Carbon Part of Your Design Language', ctaUrl: `${BASE_URL}/lp/architects` },
  developers: { headline: 'Carbon Performance That Investors Notice', ctaUrl: `${BASE_URL}/lp/developers` },
  engineers: { headline: 'Engineering Decisions with Carbon Intelligence', ctaUrl: `${BASE_URL}/lp/engineers` },
  'site-supervisors': { headline: 'Verify Carbon Compliance On-Site', ctaUrl: `${BASE_URL}/lp/site-supervisors` },
  'cost-planners': { headline: 'Carbon Estimates with QS-Level Rigour', ctaUrl: `${BASE_URL}/lp/cost-planners` },
  'environmental-officers': { headline: 'Carbon Reporting You Can Stand Behind', ctaUrl: `${BASE_URL}/lp/environmental-officers` },
  'sustainability-managers': { headline: 'From Carbon Data to Carbon Action', ctaUrl: `${BASE_URL}/lp/sustainability-managers` },
  'project-managers': { headline: 'Carbon is Now a Project Deliverable', ctaUrl: `${BASE_URL}/lp/project-managers` },
  subcontractors: { headline: 'Carbon Compliance Gives You an Edge', ctaUrl: `${BASE_URL}/lp/subcontractors` },
  estimators: { headline: 'Estimate Carbon Like You Estimate Cost', ctaUrl: `${BASE_URL}/lp/estimators` },
  procurement: { headline: 'Procurement That Delivers on Sustainability', ctaUrl: `${BASE_URL}/lp/procurement` },
  'supply-chain': { headline: 'Turn Your EPDs into Sales Tools', ctaUrl: `${BASE_URL}/lp/supply-chain` },
  consultants: { headline: 'Deliver More LCAs Without More Staff', ctaUrl: `${BASE_URL}/lp/consultants` },
  government: { headline: 'Public Procurement That Delivers on Climate', ctaUrl: `${BASE_URL}/lp/government` },
  investors: { headline: 'Climate Risk You Can\'t Afford to Ignore', ctaUrl: `${BASE_URL}/lp/investors` },
};

function generateTrackingUrl(baseUrl: string, campaignId: string, audience: string, variant: string, analyticsId: string): string {
  const trackingParams = new URLSearchParams({
    utm_source: 'email',
    utm_medium: 'campaign',
    utm_campaign: campaignId,
    utm_content: `${audience}_variant_${variant}`,
    cc_analytics: analyticsId,
  });
  return `${baseUrl}?${trackingParams.toString()}`;
}

function generateEmailHTML(template: EmailTemplate, recipientName?: string, analyticsId?: string): string {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi there,';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  
  <!-- Tracking pixel -->
  ${analyticsId ? `<img src="${BASE_URL}/api/track-open?id=${analyticsId}" width="1" height="1" style="display:none;" alt="" />` : ''}
  
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 32px;">
    <img src="${BASE_URL}/logo-96.webp" alt="CarbonConstruct" style="height: 48px; width: auto;" />
  </div>

  <div style="background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Greeting -->
    <p style="color: #333; font-size: 16px; margin-bottom: 16px;">${greeting}</p>

    <!-- Headline -->
    <h1 style="color: #111; font-size: 24px; font-weight: 700; margin-bottom: 20px; line-height: 1.3;">
      ${template.headline}
    </h1>

    <!-- Preheader text as intro -->
    <p style="color: #666; font-size: 16px; margin-bottom: 24px;">
      ${template.preheader}
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin: 32px 0;">
      <a href="${template.ctaUrl}" 
         style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.25);">
        ${template.ctaText} →
      </a>
    </div>

    <!-- Secondary CTA -->
    <p style="text-align: center; color: #666; font-size: 14px;">
      Questions? Reply to this email or <a href="${BASE_URL}/help" style="color: #22c55e;">visit our help center</a>
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 32px; padding-top: 24px; color: #666; font-size: 12px;">
    <p style="margin: 0 0 8px 0;">CarbonConstruct | Australian Construction Carbon Calculator</p>
    <p style="margin: 0;">
      <a href="${BASE_URL}/privacy" style="color: #666;">Privacy</a> · 
      <a href="${BASE_URL}/terms" style="color: #666;">Terms</a> · 
      <a href="${BASE_URL}/help" style="color: #666;">Contact</a>
    </p>
    <p style="margin: 12px 0 0 0; color: #999;">
      You're receiving this because you signed up for CarbonConstruct.
      <a href="${BASE_URL}/settings" style="color: #999;">Unsubscribe</a>
    </p>
  </div>

</body>
</html>
  `.trim();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[SEND-CAMPAIGN] Starting campaign email send...");

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[SEND-CAMPAIGN] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const body: CampaignEmailRequest = await req.json();
    const { audience, variant, recipientEmail, recipientName, campaignId, scheduleId } = body;

    console.log(`[SEND-CAMPAIGN] Sending to ${recipientEmail} for ${audience} variant ${variant}`);

    // Get template data
    const baseTemplate = templateData[audience];
    if (!baseTemplate) {
      return new Response(
        JSON.stringify({ error: `Unknown audience: ${audience}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate analytics ID for tracking
    const analyticsId = crypto.randomUUID();

    // Build email template based on variant
    // In production, you'd fetch the full variant data from the templates
    const template: EmailTemplate = {
      subject: variant === 'A' 
        ? `Carbon compliance made simple for ${audience}` 
        : `🚀 Transform your ${audience} workflow with carbon insights`,
      preheader: variant === 'A'
        ? 'Join hundreds of Australian construction professionals'
        : 'See why leading firms trust CarbonConstruct',
      headline: baseTemplate.headline,
      ctaText: variant === 'A' ? 'Get Started Free' : 'Start Your Free Trial',
      ctaUrl: generateTrackingUrl(baseTemplate.ctaUrl, campaignId, audience, variant, analyticsId),
      testimonialPosition: variant === 'A' ? 'after-benefits' : 'before-cta',
    };

    // Generate email HTML
    const emailHtml = generateEmailHTML(template, recipientName, analyticsId);

    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "CarbonConstruct <notifications@resend.dev>",
      to: [recipientEmail],
      subject: template.subject,
      html: emailHtml,
    });

    if (emailError) {
      console.error("[SEND-CAMPAIGN] Email send error:", emailError);
      
      // Log failed send to analytics
      await supabase.from("email_campaign_analytics").insert({
        campaign_id: campaignId,
        audience,
        variant,
        recipient_email: recipientEmail,
        metadata: { error: emailError.message, schedule_id: scheduleId },
      });

      return new Response(
        JSON.stringify({ error: emailError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log successful send to analytics
    const { error: analyticsError } = await supabase.from("email_campaign_analytics").insert({
      campaign_id: campaignId,
      audience,
      variant,
      recipient_email: recipientEmail,
      metadata: { 
        resend_id: emailData?.id,
        schedule_id: scheduleId,
        analytics_id: analyticsId,
      },
    });

    if (analyticsError) {
      console.warn("[SEND-CAMPAIGN] Analytics logging error:", analyticsError);
    }

    // Update schedule if applicable
    if (scheduleId) {
      await supabase
        .from("email_campaign_schedules")
        .update({ 
          sent_count: supabase.rpc('increment', { x: 1 }),
          status: 'sent',
          updated_at: new Date().toISOString(),
        })
        .eq("id", scheduleId);
    }

    console.log(`[SEND-CAMPAIGN] Successfully sent to ${recipientEmail}, Resend ID: ${emailData?.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailData?.id,
        analyticsId,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[SEND-CAMPAIGN] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
