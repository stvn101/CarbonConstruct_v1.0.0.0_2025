import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateRequest, PUBLIC_RATE_LIMIT } from '../_shared/request-validator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// IP-based rate limiting to prevent abuse (50 requests per hour per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = PUBLIC_RATE_LIMIT.windowMs;
const MAX_REQUESTS_PER_WINDOW = PUBLIC_RATE_LIMIT.maxRequests;

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         'unknown';
}

interface PerformanceMetric {
  metric_name: string;
  metric_value: number;
  page_url?: string;
  device_type?: string;
  metadata?: Record<string, unknown>;
}

interface PerformanceRequest {
  metrics: PerformanceMetric[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check IP-based rate limit
    const clientIP = getClientIP(req);
    if (!checkIpRateLimit(clientIP)) {
      console.warn(`[log-performance] Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header if present
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id || null;
    }

    const body: PerformanceRequest = await req.json();

    // Validate payload structure and check for abuse
    const validation = validateRequest(body);
    if (!validation.valid) {
      console.warn('[log-performance] Request validation failed:', validation.reason, 'IP:', clientIP);
      return new Response(
        JSON.stringify({ error: 'Invalid request payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log honeypot triggers for abuse detection
    if (validation.honeypotTriggered) {
      console.warn('[log-performance] Honeypot triggered from IP:', clientIP);
    }

    if (!body.metrics || !Array.isArray(body.metrics) || body.metrics.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid metrics array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit batch size
    const metrics = body.metrics.slice(0, 50);

    const records = metrics.map(metric => ({
      user_id: userId,
      metric_name: String(metric.metric_name).slice(0, 50),
      metric_value: Number(metric.metric_value) || 0,
      page_url: metric.page_url ? String(metric.page_url).slice(0, 500) : null,
      device_type: metric.device_type ? String(metric.device_type).slice(0, 50) : null,
      metadata: metric.metadata || null,
    }));

    const { error } = await supabase
      .from('performance_metrics')
      .insert(records);

    if (error) {
      console.error('Failed to insert performance metrics:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to log metrics' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Logged ${records.length} performance metrics`);

    return new Response(
      JSON.stringify({ success: true, count: records.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in log-performance function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
