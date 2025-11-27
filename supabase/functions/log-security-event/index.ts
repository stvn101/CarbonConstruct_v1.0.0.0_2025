import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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
