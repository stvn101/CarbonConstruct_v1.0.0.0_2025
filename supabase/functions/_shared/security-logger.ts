/**
 * Security event logging helper for edge functions
 * Logs security-related events to the central monitoring system
 */

export interface SecurityEventData {
  event_type: 'auth_failure' | 'rate_limit_exceeded' | 'invalid_token' | 'suspicious_activity' | 'honeypot_triggered';
  user_id?: string;
  ip_address?: string;
  endpoint?: string;
  details?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a security event to the monitoring system
 * This is fire-and-forget to avoid blocking the main request
 */
export async function logSecurityEvent(event: SecurityEventData): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[security-logger] Missing Supabase credentials');
      return;
    }

    // Fire and forget - don't await to avoid blocking main request
    fetch(`${supabaseUrl}/functions/v1/log-security-event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify(event),
    }).catch(err => {
      console.error('[security-logger] Failed to log security event:', err);
    });
  } catch (error) {
    console.error('[security-logger] Error logging security event:', error);
  }
}

/**
 * Extract IP address from request headers
 */
export function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}
