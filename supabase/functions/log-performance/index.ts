import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
