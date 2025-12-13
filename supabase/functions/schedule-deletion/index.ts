import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@4.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SCHEDULE-DELETION] ${step}${detailsStr}`);
};

const escapeHtml = (text: string): string => {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char]);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      throw new Error("Email service not configured");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    
    if (!userEmail) {
      throw new Error("User email not available");
    }

    logStep("User authenticated", { userId: userId.substring(0, 8) + '...' });

    // Generate deletion token and schedule deletion for 24 hours from now
    const deletionToken = crypto.randomUUID();
    const deletionScheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Check if user_preferences exists
    const { data: existing } = await supabaseAdmin
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { error: updateError } = await supabaseAdmin
        .from('user_preferences')
        .update({
          account_status: 'pending_deletion',
          status_changed_at: new Date().toISOString(),
          deletion_scheduled_at: deletionScheduledAt.toISOString(),
          deletion_token: deletionToken
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('user_preferences')
        .insert({
          user_id: userId,
          account_status: 'pending_deletion',
          status_changed_at: new Date().toISOString(),
          deletion_scheduled_at: deletionScheduledAt.toISOString(),
          deletion_token: deletionToken
        });

      if (insertError) throw insertError;
    }

    logStep("Deletion scheduled", { scheduledAt: deletionScheduledAt.toISOString() });

    // Send confirmation email
    const resend = new Resend(resendKey);
    const origin = req.headers.get("origin") || "https://carbonconstruct.com.au";
    const cancelUrl = `${origin}/settings?cancel_deletion=${deletionToken}`;

    const { error: emailError } = await resend.emails.send({
      from: "CarbonConstruct <noreply@carbonconstruct.com.au>",
      to: [userEmail],
      subject: "Account Deletion Scheduled - Action Required",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1a1a1a; margin-bottom: 24px;">Account Deletion Scheduled</h1>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
              Your CarbonConstruct account deletion has been scheduled. Your account and all associated data will be permanently deleted in <strong>24 hours</strong>.
            </p>
            <p style="color: #4a4a4a; font-size: 16px; line-height: 1.6;">
              <strong>Scheduled deletion time:</strong><br>
              ${escapeHtml(deletionScheduledAt.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }))} (AEST)
            </p>
            <div style="background-color: #fef3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 16px; margin: 24px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Changed your mind?</strong> You can cancel the deletion anytime within the next 24 hours.
              </p>
            </div>
            <a href="${escapeHtml(cancelUrl)}" style="display: inline-block; background-color: #22c55e; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; margin-top: 16px;">
              Cancel Deletion
            </a>
            <p style="color: #888; font-size: 14px; margin-top: 32px; border-top: 1px solid #eee; padding-top: 24px;">
              If you didn't request this deletion, please cancel immediately and secure your account by changing your password.
            </p>
            <p style="color: #888; font-size: 12px; margin-top: 16px;">
              CarbonConstruct | Carbon Accounting for Australian Construction
            </p>
          </div>
        </body>
        </html>
      `
    });

    if (emailError) {
      logStep("Email error", { error: emailError });
      // Don't throw - deletion is still scheduled
    } else {
      logStep("Confirmation email sent");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account deletion scheduled. Check your email to confirm or cancel.",
        deletion_scheduled_at: deletionScheduledAt.toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
