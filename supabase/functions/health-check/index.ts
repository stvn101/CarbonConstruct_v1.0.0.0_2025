import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check database connectivity
    const dbStart = Date.now();
    try {
      const { error } = await supabase
        .from('subscription_tiers')
        .select('id')
        .limit(1);
      
      checks.database = {
        status: error ? 'unhealthy' : 'healthy',
        latency: Date.now() - dbStart,
        ...(error && { error: error.message })
      };
    } catch (err) {
      checks.database = {
        status: 'unhealthy',
        latency: Date.now() - dbStart,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Check auth service
    const authStart = Date.now();
    try {
      const { error } = await supabase.auth.getSession();
      checks.auth = {
        status: error ? 'unhealthy' : 'healthy',
        latency: Date.now() - authStart,
        ...(error && { error: error.message })
      };
    } catch (err) {
      checks.auth = {
        status: 'unhealthy',
        latency: Date.now() - authStart,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Check storage service
    const storageStart = Date.now();
    try {
      const { error } = await supabase.storage.listBuckets();
      checks.storage = {
        status: error ? 'unhealthy' : 'healthy',
        latency: Date.now() - storageStart,
        ...(error && { error: error.message })
      };
    } catch (err) {
      checks.storage = {
        status: 'unhealthy',
        latency: Date.now() - storageStart,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Get recent error count (last hour)
    const { count: recentErrors } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 3600000).toISOString());

    // Determine overall status
    const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
    const overallStatus = allHealthy ? 'healthy' : 'degraded';

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      total_latency: Date.now() - startTime,
      checks,
      metrics: {
        recent_errors_1h: recentErrors || 0
      }
    };

    console.log('Health check completed:', overallStatus);

    return new Response(
      JSON.stringify(response),
      { 
        status: allHealthy ? 200 : 503, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        total_latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
