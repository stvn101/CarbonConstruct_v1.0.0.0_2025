import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Verify webhook signature
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { type: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, supabaseClient);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabaseClient);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseClient);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabaseClient);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object as Stripe.Subscription, supabaseClient);
        break;

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabaseClient: any
) {
  logStep("Handling subscription update", { subscriptionId: subscription.id });

  try {
    // Get customer email
    const customerId = subscription.customer as string;
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted || !customer.email) {
      throw new Error("Customer not found or has no email");
    }

    logStep("Found customer", { email: customer.email });

    // Get user by email
    const { data: users, error: userError } = await supabaseClient.auth.admin.listUsers();
    if (userError) throw userError;

    const user = users.users.find((u: any) => u.email === customer.email);
    if (!user) {
      logStep("User not found in Supabase", { email: customer.email });
      return;
    }

    logStep("Found user", { userId: user.id });

    // Get price and tier information
    const priceId = subscription.items.data[0].price.id;
    const { data: tierData } = await supabaseClient
      .from('subscription_tiers')
      .select('id, name')
      .eq('stripe_price_id', priceId)
      .maybeSingle();

    if (!tierData) {
      logStep("Tier not found for price", { priceId });
      return;
    }

    logStep("Found tier", { tierId: tierData.id, tierName: tierData.name });

    // Prepare subscription data
    const subscriptionData = {
      user_id: user.id,
      tier_id: tierData.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      trial_end: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    };

    // Check if subscription exists
    const { data: existingSub } = await supabaseClient
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingSub) {
      // Update existing subscription
      const { error: updateError } = await supabaseClient
        .from('user_subscriptions')
        .update(subscriptionData)
        .eq('id', existingSub.id);

      if (updateError) throw updateError;
      logStep("Subscription updated", { subscriptionId: existingSub.id });
    } else {
      // Create new subscription
      const { error: insertError } = await supabaseClient
        .from('user_subscriptions')
        .insert(subscriptionData);

      if (insertError) throw insertError;
      logStep("Subscription created");
    }
  } catch (error) {
    logStep("Error in handleSubscriptionUpdate", { error: error.message });
    throw error;
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabaseClient: any
) {
  logStep("Handling subscription deletion", { subscriptionId: subscription.id });

  try {
    // Delete subscription record
    const { error } = await supabaseClient
      .from('user_subscriptions')
      .delete()
      .eq('stripe_subscription_id', subscription.id);

    if (error) throw error;
    logStep("Subscription deleted from database");
  } catch (error) {
    logStep("Error in handleSubscriptionDeleted", { error: error.message });
    throw error;
  }
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabaseClient: any
) {
  logStep("Handling payment succeeded", { invoiceId: invoice.id });

  try {
    if (!invoice.subscription) {
      logStep("Invoice not associated with subscription");
      return;
    }

    // Update subscription status to active
    const { error } = await supabaseClient
      .from('user_subscriptions')
      .update({ status: 'active' })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) throw error;
    logStep("Subscription marked as active");
  } catch (error) {
    logStep("Error in handlePaymentSucceeded", { error: error.message });
    throw error;
  }
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabaseClient: any
) {
  logStep("Handling payment failed", { invoiceId: invoice.id });

  try {
    if (!invoice.subscription) {
      logStep("Invoice not associated with subscription");
      return;
    }

    // Update subscription status to past_due
    const { error } = await supabaseClient
      .from('user_subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', invoice.subscription);

    if (error) throw error;
    logStep("Subscription marked as past_due");
  } catch (error) {
    logStep("Error in handlePaymentFailed", { error: error.message });
    throw error;
  }
}

async function handleTrialWillEnd(
  subscription: Stripe.Subscription,
  supabaseClient: any
) {
  logStep("Handling trial will end", { subscriptionId: subscription.id });

  try {
    // Get customer email for notification
    const customerId = subscription.customer as string;
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted || !customer.email) {
      throw new Error("Customer not found or has no email");
    }

    logStep("Trial ending soon for customer", { 
      email: customer.email,
      trialEnd: subscription.trial_end 
    });

    // TODO: Send email notification to user about trial ending
    // This could be implemented with a separate email service
  } catch (error) {
    logStep("Error in handleTrialWillEnd", { error: error.message });
    throw error;
  }
}
