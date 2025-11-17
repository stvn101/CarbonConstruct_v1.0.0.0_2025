import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Find customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier_name: 'Free'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let priceId = null;
    let subscriptionEnd = null;
    let trialEnd = null;
    let tierName = 'Free';

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      if (subscription.trial_end) {
        trialEnd = new Date(subscription.trial_end * 1000).toISOString();
      }
      
      productId = subscription.items.data[0].price.product as string;
      priceId = subscription.items.data[0].price.id;
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
        trialEnd,
        productId,
        priceId
      });

      // Get tier info from database
      const { data: tierData } = await supabaseClient
        .from('subscription_tiers')
        .select('name')
        .eq('stripe_price_id', priceId)
        .maybeSingle();
      
      if (tierData) {
        tierName = tierData.name;
      }

      // Update or create user subscription record
      const { data: existingSub } = await supabaseClient
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: tierInfo } = await supabaseClient
        .from('subscription_tiers')
        .select('id')
        .eq('stripe_price_id', priceId)
        .maybeSingle();

      if (existingSub && tierInfo) {
        await supabaseClient
          .from('user_subscriptions')
          .update({
            tier_id: tierInfo.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            trial_end: trialEnd,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: subscriptionEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('id', existingSub.id);
      } else if (tierInfo) {
        await supabaseClient
          .from('user_subscriptions')
          .insert({
            user_id: user.id,
            tier_id: tierInfo.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            trial_end: trialEnd,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: subscriptionEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
          });
      }
    } else {
      logStep("No active subscription found");
      
      // Delete any existing subscription record
      await supabaseClient
        .from('user_subscriptions')
        .delete()
        .eq('user_id', user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      tier_name: tierName,
      product_id: productId,
      price_id: priceId,
      subscription_end: subscriptionEnd,
      trial_end: trialEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
