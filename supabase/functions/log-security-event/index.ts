import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  event_type: 'auth_failure' | 'rate_limit_exceeded' | 'invalid_token' | 'suspicious_activity';
  user_id?: string;
  ip_address?: string;
  endpoint?: string;
  details?: string;
  metadata?: Record<string, unknown>;
}

// Thresholds for alerting
const ALERT_THRESHOLDS = {
  auth_failures_per_hour: 10,
  rate_limit_violations_per_hour: 20,
  suspicious_activity_per_hour: 5,
};

// Admin email for security alerts
const ADMIN_EMAIL = 'contact@carbonconstruct.net';

// Send security alert email
async function sendSecurityAlertEmail(alert: { type: string; message: string; count: number }): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error('[log-security-event] RESEND_API_KEY not configured, skipping email notification');
    return;
  }

  const resend = new Resend(resendApiKey);
  
  const severityColor = alert.count >= 20 ? '#dc2626' : alert.count >= 10 ? '#f59e0b' : '#eab308';
  const severityLabel = alert.count >= 20 ? 'CRITICAL' : alert.count >= 10 ? 'HIGH' : 'WARNING';

  try {
    await resend.emails.send({
      from: 'CarbonConstruct Security <onboarding@resend.dev>',
      to: [ADMIN_EMAIL],
      subject: `🚨 [${severityLabel}] Security Alert: ${alert.type.replace(/_/g, ' ').toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: ${severityColor}; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ Security Alert</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">${severityLabel} Priority</p>
            </div>
            <div style="padding: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0;">Alert Type: ${alert.type.replace(/_/g, ' ').toUpperCase()}</h2>
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">${alert.message}</p>
              
              <div style="background: #f9fafb; border-radius: 6px; padding: 16px; margin: 20px 0;">
                <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase;">Event Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Event Count:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${alert.count} events</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time Period:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">Last hour</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Detected At:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: 600; text-align: right;">${new Date().toISOString()}</td>
                  </tr>
                </table>
              </div>

              <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin: 20px 0;">
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  <strong>Recommended Action:</strong> Review the Admin Monitoring dashboard for detailed logs and consider implementing additional security measures if attacks persist.
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="https://carbonconstruct.com.au/admin" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">View Admin Dashboard</a>
              </div>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated security alert from CarbonConstruct.<br>
                Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`[log-security-event] Security alert email sent for: ${alert.type}`);
  } catch (error) {
    console.error('[log-security-event] Failed to send security alert email:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const event: SecurityEvent = await req.json();
    
    console.log(`[log-security-event] Logging security event: ${event.event_type}`);

    // Log the security event to error_logs with security metadata
    const { error: logError } = await supabaseClient
      .from('error_logs')
      .insert({
        error_type: `security_${event.event_type}`,
        error_message: event.details || `Security event: ${event.event_type}`,
        user_id: event.user_id || null,
        page_url: event.endpoint || null,
        severity: 'warning',
        metadata: {
          security_event: true,
          event_type: event.event_type,
          ip_address: event.ip_address,
          ...event.metadata
        }
      });

    if (logError) {
      console.error('[log-security-event] Failed to log event:', logError);
    }

    // Check if we need to create an alert based on recent events
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentEvents, error: countError } = await supabaseClient
      .from('error_logs')
      .select('id, error_type, metadata')
      .eq('severity', 'warning')
      .gte('created_at', oneHourAgo)
      .like('error_type', 'security_%');

    if (countError) {
      console.error('[log-security-event] Failed to count recent events:', countError);
    } else {
      // Count events by type
      const eventCounts: Record<string, number> = {};
      recentEvents?.forEach(e => {
        const type = e.error_type.replace('security_', '');
        eventCounts[type] = (eventCounts[type] || 0) + 1;
      });

      console.log(`[log-security-event] Recent event counts:`, eventCounts);

      // Check thresholds and create alerts
      const alerts: Array<{ type: string; message: string; count: number }> = [];

      if ((eventCounts['auth_failure'] || 0) >= ALERT_THRESHOLDS.auth_failures_per_hour) {
        alerts.push({
          type: 'auth_failure',
          message: `High number of authentication failures detected: ${eventCounts['auth_failure']} in the last hour`,
          count: eventCounts['auth_failure']
        });
      }

      if ((eventCounts['rate_limit_exceeded'] || 0) >= ALERT_THRESHOLDS.rate_limit_violations_per_hour) {
        alerts.push({
          type: 'rate_limit',
          message: `High number of rate limit violations detected: ${eventCounts['rate_limit_exceeded']} in the last hour`,
          count: eventCounts['rate_limit_exceeded']
        });
      }

      if ((eventCounts['invalid_token'] || 0) >= ALERT_THRESHOLDS.suspicious_activity_per_hour) {
        alerts.push({
          type: 'invalid_token',
          message: `High number of invalid token attempts detected: ${eventCounts['invalid_token']} in the last hour`,
          count: eventCounts['invalid_token']
        });
      }

      // Create alerts for any threshold breaches
      for (const alert of alerts) {
        // Check if similar alert already exists in last hour (to avoid duplicates)
        const { data: existingAlert } = await supabaseClient
          .from('alerts')
          .select('id')
          .eq('alert_type', `security_${alert.type}`)
          .eq('resolved', false)
          .gte('created_at', oneHourAgo)
          .limit(1)
          .single();

        if (!existingAlert) {
          const { error: alertError } = await supabaseClient
            .from('alerts')
            .insert({
              alert_type: `security_${alert.type}`,
              severity: 'error',
              message: alert.message,
              metadata: {
                event_count: alert.count,
                threshold: ALERT_THRESHOLDS[`${alert.type.replace('_', '_') as keyof typeof ALERT_THRESHOLDS}s_per_hour`] || 10,
                detected_at: new Date().toISOString()
              }
            });

          if (alertError) {
            console.error('[log-security-event] Failed to create alert:', alertError);
          } else {
            console.log(`[log-security-event] Created security alert: ${alert.type}`);
            // Send email notification for new security alerts
            await sendSecurityAlertEmail(alert);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[log-security-event] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to log security event' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
