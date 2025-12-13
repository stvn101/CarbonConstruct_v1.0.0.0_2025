import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-DELETION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json().catch(() => ({}));
    const { token } = body;

    if (!token) {
      throw new Error("Cancellation token required");
    }

    // Validate token format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      throw new Error("Invalid cancellation token");
    }

    logStep("Token received", { token: token.substring(0, 8) + '...' });

    // Verify authenticated user
    const authHeader = req.headers.get('Authorization');
    const jwtToken = authHeader?.replace('Bearer ', '');
    
    if (!jwtToken) {
      throw new Error("Authentication required");
    }
    
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(jwtToken);
    
    if (userError || !userData?.user) {
      throw new Error("Invalid authentication");
    }

    // Find the user with this deletion token
    const { data: preferences, error: findError } = await supabaseAdmin
      .from('user_preferences')
      .select('user_id, deletion_scheduled_at')
      .eq('deletion_token', token)
      .eq('account_status', 'pending_deletion')
      .single();

    if (findError || !preferences) {
      throw new Error("Invalid or expired cancellation link");
    }

    // Verify authenticated user matches the token owner
    if (userData.user.id !== preferences.user_id) {
      logStep("Token ownership mismatch", { authenticatedUser: userData.user.id });
      throw new Error("Token does not belong to authenticated user");
    }

    // Check if deletion hasn't already happened
    if (preferences.deletion_scheduled_at) {
      const scheduledAt = new Date(preferences.deletion_scheduled_at);
      if (scheduledAt < new Date()) {
        throw new Error("Deletion period has expired. Please contact support.");
      }
    }

    // Cancel the deletion
    const { error: updateError } = await supabaseAdmin
      .from('user_preferences')
      .update({
        account_status: 'active',
        status_changed_at: new Date().toISOString(),
        deletion_scheduled_at: null,
        deletion_token: null
      })
      .eq('deletion_token', token);

    if (updateError) throw updateError;

    logStep("Deletion cancelled successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account deletion cancelled. Your account is now active."
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
