import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Decimal } from "https://esm.sh/decimal.js@10.4.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

/**
 * Calculate GST from total amount using decimal.js for precision
 * Australian GST is 10% - GST = Total / 11
 */
function calculateGST(totalAmountCents: number): { grossCents: number; gstCents: number; netCents: number } {
  const gross = new Decimal(totalAmountCents);
  const gst = gross.dividedBy(11).round(); // GST = Total / 11, rounded to nearest cent
  const net = gross.minus(gst);
  
  return {
    grossCents: gross.toNumber(),
    gstCents: gst.toNumber(),
    netCents: net.toNumber(),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2024-12-18.acacia" 
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
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabaseClient, stripe);
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
      apiVersion: "2024-12-18.acacia" 
    });
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted || !customer.email) {
      throw new Error("Customer not found or has no email");
    }

    logStep("Found customer");

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

    // Send subscription updated email
    try {
      const { data: tierDetails } = await supabaseClient
        .from('subscription_tiers')
        .select('name, features')
        .eq('id', tierData.id)
        .single();

      await supabaseClient.functions.invoke('send-email', {
        body: {
          type: 'subscription_updated',
          to: customer.email,
          data: {
            tierName: tierDetails?.name || tierData.name,
            features: Array.isArray(tierDetails?.features) ? tierDetails.features : [],
            renewalDate: new Date(subscription.current_period_end * 1000).toLocaleDateString('en-AU'),
            appUrl: 'https://carbonconstruct.com.au'
          }
        }
      });
      logStep("Subscription email sent", { email: customer.email });
    } catch (emailError) {
      logStep("Failed to send subscription email", { error: emailError.message });
      // Don't throw - email failure shouldn't block webhook
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
    // Get customer email before deletion
    const customerId = subscription.customer as string;
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2024-12-18.acacia" 
    });
    const customer = await stripe.customers.retrieve(customerId);
    const customerEmail = customer && !customer.deleted ? customer.email : null;

    // Delete subscription record
    const { error } = await supabaseClient
      .from('user_subscriptions')
      .delete()
      .eq('stripe_subscription_id', subscription.id);

    if (error) throw error;
    logStep("Subscription deleted from database");

    // Send cancellation email
    if (customerEmail) {
      try {
        await supabaseClient.functions.invoke('send-email', {
          body: {
            type: 'subscription_cancelled',
            to: customerEmail,
            data: {
              endDate: new Date(subscription.current_period_end * 1000).toLocaleDateString('en-AU'),
              appUrl: 'https://carbonconstruct.com.au'
            }
          }
        });
        logStep("Cancellation email sent", { email: customerEmail });
      } catch (emailError) {
        logStep("Failed to send cancellation email", { error: emailError.message });
      }
    }
  } catch (error) {
    logStep("Error in handleSubscriptionDeleted", { error: error.message });
    throw error;
  }
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabaseClient: any,
  stripe: Stripe
) {
  logStep("Handling payment succeeded", { invoiceId: invoice.id });

  try {
    if (!invoice.subscription) {
      logStep("Invoice not associated with subscription");
      return;
    }

    // Extract tax information with precision arithmetic
    const totalAmountCents = invoice.amount_paid || 0;
    const stripeTaxCents = invoice.tax || 0;
    const currency = invoice.currency?.toUpperCase() || 'AUD';
    
    // Calculate GST using decimal.js for precision
    // If Stripe provides tax, use it; otherwise calculate Australian GST (10%)
    let gstData;
    if (stripeTaxCents > 0) {
      gstData = {
        grossCents: totalAmountCents,
        gstCents: stripeTaxCents,
        netCents: totalAmountCents - stripeTaxCents,
      };
    } else if (currency === 'AUD') {
      // Calculate Australian GST (Total includes GST, so GST = Total / 11)
      gstData = calculateGST(totalAmountCents);
    } else {
      // No tax for non-AUD currencies without Stripe tax
      gstData = {
        grossCents: totalAmountCents,
        gstCents: 0,
        netCents: totalAmountCents,
      };
    }

    logStep("Tax calculation completed", {
      invoiceId: invoice.id,
      currency,
      grossCents: gstData.grossCents,
      gstCents: gstData.gstCents,
      netCents: gstData.netCents,
      grossAUD: (gstData.grossCents / 100).toFixed(2),
      gstAUD: (gstData.gstCents / 100).toFixed(2),
      netAUD: (gstData.netCents / 100).toFixed(2),
    });

    // Get customer information
    const customerId = invoice.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    
    let userId: string | null = null;
    if (customer && !customer.deleted && customer.email) {
      const { data: users } = await supabaseClient.auth.admin.listUsers();
      const user = users?.users?.find((u: any) => u.email === customer.email);
      userId = user?.id || null;
    }

    // Prepare tax record for payment_tax_records table
    // Note: This prepares the data - table must exist via migration
    const taxRecord = {
      invoice_id: invoice.id,
      stripe_invoice_id: invoice.id,
      stripe_customer_id: customerId,
      user_id: userId,
      gross_amount_cents: gstData.grossCents,
      gst_amount_cents: gstData.gstCents,
      net_amount_cents: gstData.netCents,
      currency: currency,
      invoice_date: invoice.created ? new Date(invoice.created * 1000).toISOString() : new Date().toISOString(),
      stripe_tax_amount_cents: stripeTaxCents,
      calculated_gst: stripeTaxCents === 0 && currency === 'AUD',
    };

    // Log the tax record for audit purposes
    logStep("GST Record prepared for ATO compliance", {
      invoiceId: invoice.id,
      totalIncGST: `$${(gstData.grossCents / 100).toFixed(2)}`,
      gstComponent: `$${(gstData.gstCents / 100).toFixed(2)}`,
      netExGST: `$${(gstData.netCents / 100).toFixed(2)}`,
      userId: userId || 'unknown',
    });

    // TODO: Insert into payment_tax_records table when migration is applied
    // Uncomment the following when the table exists:
    /*
    const { error: taxError } = await supabaseClient
      .from('payment_tax_records')
      .insert(taxRecord);
    
    if (taxError) {
      logStep("Warning: Failed to insert tax record", { error: taxError.message });
      // Don't throw - subscription update should still proceed
    } else {
      logStep("Tax record inserted successfully");
    }
    */

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
      apiVersion: "2024-12-18.acacia" 
    });
    const customer = await stripe.customers.retrieve(customerId);
    
    if (!customer || customer.deleted || !customer.email) {
      throw new Error("Customer not found or has no email");
    }

    logStep("Trial ending soon for customer", { 
      trialEnd: subscription.trial_end 
    });

    // Send trial ending email
    if (subscription.trial_end) {
      const trialEndDate = new Date(subscription.trial_end * 1000);
      const daysLeft = Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      try {
        await supabaseClient.functions.invoke('send-email', {
          body: {
            type: 'trial_ending',
            to: customer.email,
            data: {
              daysLeft,
              endDate: trialEndDate.toLocaleDateString('en-AU'),
              appUrl: 'https://carbonconstruct.com.au'
            }
          }
        });
        logStep("Trial ending email sent", { email: customer.email, daysLeft });
      } catch (emailError) {
        logStep("Failed to send trial ending email", { error: emailError.message });
      }
    }
  } catch (error) {
    logStep("Error in handleTrialWillEnd", { error: error.message });
    throw error;
  }
}
