import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXPORT-USER-DATA] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false }
    });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    logStep("User authenticated", { userId: userId.substring(0, 8) + '...' });

    // Collect all user data from various tables
    const exportData: Record<string, unknown> = {
      export_date: new Date().toISOString(),
      export_format: "GDPR Data Export",
      user_info: {
        id: userId,
        email: userEmail,
        created_at: userData.user.created_at,
        last_sign_in_at: userData.user.last_sign_in_at,
      },
    };

    // Fetch projects
    const { data: projects } = await supabaseClient
      .from("projects")
      .select("*")
      .eq("user_id", userId);
    exportData.projects = projects || [];
    logStep("Fetched projects", { count: projects?.length || 0 });

    // Fetch unified calculations
    const { data: calculations } = await supabaseClient
      .from("unified_calculations")
      .select("*")
      .eq("user_id", userId);
    exportData.calculations = calculations || [];
    logStep("Fetched calculations", { count: calculations?.length || 0 });

    // Fetch user preferences
    const { data: preferences } = await supabaseClient
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId);
    exportData.preferences = preferences || [];
    logStep("Fetched preferences", { count: preferences?.length || 0 });

    // Fetch subscription info (safe view - no Stripe IDs)
    const { data: subscription } = await supabaseClient
      .from("user_subscriptions_safe")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    exportData.subscription = subscription || null;
    logStep("Fetched subscription");

    // Fetch usage metrics
    const { data: usageMetrics } = await supabaseClient
      .from("usage_metrics")
      .select("*")
      .eq("user_id", userId);
    exportData.usage_metrics = usageMetrics || [];
    logStep("Fetched usage metrics", { count: usageMetrics?.length || 0 });

    // Fetch user roles
    const { data: roles } = await supabaseClient
      .from("user_roles")
      .select("role, created_at")
      .eq("user_id", userId);
    exportData.roles = roles || [];
    logStep("Fetched roles", { count: roles?.length || 0 });

    // Fetch reports (via projects)
    if (projects && projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      const { data: reports } = await supabaseClient
        .from("reports")
        .select("*")
        .in("project_id", projectIds);
      exportData.reports = reports || [];
      logStep("Fetched reports", { count: reports?.length || 0 });

      // Fetch scope emissions
      const { data: scope1 } = await supabaseClient
        .from("scope1_emissions")
        .select("*")
        .in("project_id", projectIds);
      exportData.scope1_emissions = scope1 || [];

      const { data: scope2 } = await supabaseClient
        .from("scope2_emissions")
        .select("*")
        .in("project_id", projectIds);
      exportData.scope2_emissions = scope2 || [];

      const { data: scope3 } = await supabaseClient
        .from("scope3_emissions")
        .select("*")
        .in("project_id", projectIds);
      exportData.scope3_emissions = scope3 || [];
      logStep("Fetched emissions data");
    }

    // Fetch analytics events (user's own)
    const { data: analytics } = await supabaseClient
      .from("analytics_events")
      .select("event_name, event_data, page_url, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1000);
    exportData.analytics_events = analytics || [];
    logStep("Fetched analytics", { count: analytics?.length || 0 });

    // Add summary
    exportData.summary = {
      total_projects: (exportData.projects as unknown[])?.length || 0,
      total_calculations: (exportData.calculations as unknown[])?.length || 0,
      total_reports: (exportData.reports as unknown[])?.length || 0,
      total_analytics_events: (exportData.analytics_events as unknown[])?.length || 0,
    };

    logStep("Export complete");

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="carbonconstruct-data-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[EXPORT-USER-DATA] Error:", errorMessage);
    return new Response(JSON.stringify({ error: "Failed to export data" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
