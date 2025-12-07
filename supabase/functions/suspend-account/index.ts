import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUSPEND-ACCOUNT] ${step}${detailsStr}`);
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
    logStep("User authenticated", { userId: userId.substring(0, 8) + '...' });

    const body = await req.json().catch(() => ({}));
    const action = body.action; // 'suspend' or 'reactivate'

    if (!['suspend', 'reactivate'].includes(action)) {
      throw new Error("Invalid action. Use 'suspend' or 'reactivate'");
    }

    const newStatus = action === 'suspend' ? 'suspended' : 'active';

    // Check if user_preferences exists, create if not
    const { data: existing } = await supabaseAdmin
      .from('user_preferences')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { error: updateError } = await supabaseAdmin
        .from('user_preferences')
        .update({
          account_status: newStatus,
          status_changed_at: new Date().toISOString(),
          deletion_scheduled_at: null,
          deletion_token: null
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('user_preferences')
        .insert({
          user_id: userId,
          account_status: newStatus,
          status_changed_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
    }

    logStep(`Account ${action}ed successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: newStatus,
        message: action === 'suspend' 
          ? "Account suspended. You can reactivate anytime." 
          : "Account reactivated successfully."
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
