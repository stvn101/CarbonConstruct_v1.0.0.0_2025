import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify user authentication
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
    logStep("User authenticated", { userId: userId.substring(0, 8) + '...' });

    // Parse request body for confirmation
    const body = await req.json().catch(() => ({}));
    if (body.confirmEmail !== userEmail) {
      throw new Error("Email confirmation does not match");
    }

    logStep("Starting data deletion");

    // Delete user data from all tables in order (respecting foreign key constraints)
    // 1. Delete reports (depends on projects)
    const { error: reportsError } = await supabaseAdmin
      .from('reports')
      .delete()
      .eq('project_id', supabaseAdmin.from('projects').select('id').eq('user_id', userId));
    
    // Actually need to delete via project lookup
    const { data: userProjects } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('user_id', userId);
    
    const projectIds = userProjects?.map(p => p.id) || [];
    
    if (projectIds.length > 0) {
      // Delete reports for user's projects
      await supabaseAdmin.from('reports').delete().in('project_id', projectIds);
      logStep("Deleted reports");

      // Delete scope emissions
      await supabaseAdmin.from('scope1_emissions').delete().in('project_id', projectIds);
      await supabaseAdmin.from('scope2_emissions').delete().in('project_id', projectIds);
      await supabaseAdmin.from('scope3_emissions').delete().in('project_id', projectIds);
      logStep("Deleted scope emissions");
    }

    // 2. Delete unified calculations
    await supabaseAdmin.from('unified_calculations').delete().eq('user_id', userId);
    logStep("Deleted unified calculations");

    // 3. Delete projects
    await supabaseAdmin.from('projects').delete().eq('user_id', userId);
    logStep("Deleted projects");

    // 4. Delete user preferences
    await supabaseAdmin.from('user_preferences').delete().eq('user_id', userId);
    logStep("Deleted user preferences");

    // 5. Delete usage metrics
    await supabaseAdmin.from('usage_metrics').delete().eq('user_id', userId);
    logStep("Deleted usage metrics");

    // 6. Delete rate limits
    await supabaseAdmin.from('rate_limits').delete().eq('user_id', userId);
    logStep("Deleted rate limits");

    // 7. Delete analytics events
    await supabaseAdmin.from('analytics_events').delete().eq('user_id', userId);
    logStep("Deleted analytics events");

    // 8. Delete error logs
    await supabaseAdmin.from('error_logs').delete().eq('user_id', userId);
    logStep("Deleted error logs");

    // 9. Delete performance metrics
    await supabaseAdmin.from('performance_metrics').delete().eq('user_id', userId);
    logStep("Deleted performance metrics");

    // 10. Delete user roles
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
    logStep("Deleted user roles");

    // 11. Delete user subscriptions
    await supabaseAdmin.from('user_subscriptions').delete().eq('user_id', userId);
    logStep("Deleted user subscriptions");

    // 12. Delete materials import jobs
    await supabaseAdmin.from('materials_import_jobs').delete().eq('user_id', userId);
    logStep("Deleted materials import jobs");

    // Finally, delete the user from auth
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteAuthError) {
      logStep("Error deleting auth user", { error: deleteAuthError.message });
      throw new Error("Failed to delete user account");
    }

    logStep("Account deletion complete");

    return new Response(
      JSON.stringify({ success: true, message: "Account and all data deleted successfully" }),
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
