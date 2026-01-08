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
    if (!authHeader) {
      logStep("No authorization header - returning free tier");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier_name: 'Free'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("Auth error or no user - returning free tier", { error: userError?.message });
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier_name: 'Free'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("No email available - returning free tier");
      return new Response(JSON.stringify({ 
        subscribed: false,
        tier_name: 'Free'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    logStep("User authenticated", { userId: user.id.substring(0, 8) + '...' });

    // CRITICAL SECURITY: Only this single admin email gets admin access
    // Do NOT add additional emails without explicit security review
    const ADMIN_EMAILS = [
      'contact@carbonconstruct.net',
    ];
    
    if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      logStep("Admin user detected - granting Pro access", { email: user.email });
      return new Response(JSON.stringify({
        subscribed: true,
        tier_name: 'Pro',
        product_id: 'admin_override',
        price_id: 'admin_override',
        subscription_end: null, // No expiry for admins
        trial_end: null,
        is_admin: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });
    
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
    logStep("Found Stripe customer");

    // Get active OR trialing subscriptions (trials count as valid subscriptions)
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    // Filter to active OR trialing status (trial users should have full access)
    const validSubscriptions = subscriptions.data.filter((s: { status: string }) => 
      s.status === "active" || s.status === "trialing"
    );
    const hasActiveSub = validSubscriptions.length > 0;
    let productId = null;
    let priceId = null;
    let subscriptionEnd = null;
    let trialEnd = null;
    let tierName = 'Free';

    if (hasActiveSub) {
      const subscription = validSubscriptions[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      if (subscription.trial_end) {
        trialEnd = new Date(subscription.trial_end * 1000).toISOString();
      }
      
      productId = subscription.items.data[0].price.product as string;
      priceId = subscription.items.data[0].price.id;
      
      logStep("Valid subscription found", { 
        status: subscription.status,
        endDate: subscriptionEnd,
        trialEnd,
        isTrialing: subscription.status === "trialing"
      });

      // Get tier info from database (check both monthly and yearly price IDs)
      let tierData = null;
      const { data: monthlyTier } = await supabaseClient
        .from('subscription_tiers')
        .select('name, id')
        .eq('stripe_price_id', priceId)
        .maybeSingle();
      
      if (monthlyTier) {
        tierData = monthlyTier;
      } else {
        const { data: yearlyTier } = await supabaseClient
          .from('subscription_tiers')
          .select('name, id')
          .eq('stripe_price_id_yearly', priceId)
          .maybeSingle();
        tierData = yearlyTier;
      }
      
      if (tierData) {
        tierName = tierData.name;
      }

      // Update or create user subscription record
      const { data: existingSub } = await supabaseClient
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Use the tierData we already fetched above for the tier ID
      const tierInfo = tierData;

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
    console.error('[CHECK-SUBSCRIPTION] Error:', errorMessage);
    return new Response(JSON.stringify({ error: 'An error occurred checking subscription status' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
