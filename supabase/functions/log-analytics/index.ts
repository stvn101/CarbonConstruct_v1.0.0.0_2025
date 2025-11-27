import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  event_name: string;
  event_data?: Record<string, unknown>;
  page_url?: string;
  session_id?: string;
}

interface AnalyticsRequest {
  events: AnalyticsEvent[];
  session_id?: string;
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

    const body: AnalyticsRequest = await req.json();

    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid events array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit batch size
    const events = body.events.slice(0, 100);
    const sessionId = body.session_id || null;

    const records = events.map(event => ({
      user_id: userId,
      session_id: event.session_id || sessionId,
      event_name: String(event.event_name).slice(0, 100),
      event_data: event.event_data || null,
      page_url: event.page_url ? String(event.page_url).slice(0, 500) : null,
    }));

    const { error } = await supabase
      .from('analytics_events')
      .insert(records);

    if (error) {
      console.error('Failed to insert analytics events:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to log events' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Logged ${records.length} analytics events`);

    return new Response(
      JSON.stringify({ success: true, count: records.length }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in log-analytics function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
