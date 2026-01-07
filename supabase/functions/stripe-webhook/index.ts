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
 * Calculate GST from total amount using Decimal.js for precision
 * 
 * Australian GST Calculation per ATO GSTR 2001/1:
 * - Formula: GST = Total ÷ 11 (tax-inclusive method for 10% GST)
 * - Rounding: ROUND_HALF_UP to nearest cent
 * - Precision: Decimal.js prevents JavaScript floating-point errors
 * 
 * @see GST_COMPLIANCE.md
 * @see https://www.ato.gov.au/law/view/document?docid=GST/GSTR20011/NAT/ATO/00001
 * 
 * @param totalAmountCents - Total amount in cents (GST-inclusive)
 * @returns Object with grossCents, gstCents, and netCents
 */
function calculateGST(totalAmountCents: number): { grossCents: number; gstCents: number; netCents: number } {
  const gross = new Decimal(totalAmountCents);
  // Explicitly use ROUND_HALF_UP per ATO GSTR 2001/1 rounding requirements
  const gst = gross.dividedBy(11).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
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

    // Handle different event types - wrap each in try-catch to ensure 200 response
    // Key principle: ALWAYS return 200 to Stripe, even if internal processing fails
    // This prevents Stripe from retrying and marking endpoint as failed
    try {
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
          logStep("Unhandled event type (acknowledged)", { type: event.type });
      }
    } catch (handlerError) {
      // Log the error but DON'T throw - always return 200 to Stripe
      const handlerErrorMessage = handlerError instanceof Error ? handlerError.message : String(handlerError);
      logStep("Handler error (non-fatal, returning 200 to Stripe)", { 
        eventType: event.type,
        error: handlerErrorMessage 
      });
    }

    logStep("Webhook processed successfully", { type: event.type });
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    // Only reach here for signature verification failures or pre-handler errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("CRITICAL ERROR (returning 500)", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
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
      apiVersion: "2025-08-27.basil" 
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

    // Extract amounts using decimal.js for precision (ATO compliance)
    const totalAmountCents = invoice.amount_paid || 0;
    const stripeTaxCents = invoice.tax || 0;
    const currency = invoice.currency?.toUpperCase() || 'AUD';
    
    // Calculate GST using decimal.js for precision
    // Australian GST is 10% inclusive: GST = Total / 11 (rounded to nearest cent per ATO rules)
    let gstData;
    if (stripeTaxCents > 0) {
      // Use Stripe's tax if provided (e.g., from Stripe Tax integration)
      const gross = new Decimal(totalAmountCents);
      const gst = new Decimal(stripeTaxCents);
      gstData = {
        grossCents: gross.toNumber(),
        gstCents: gst.toNumber(),
        netCents: gross.minus(gst).toNumber(),
        source: 'stripe_tax',
      };
    } else if (currency === 'AUD') {
      // Calculate Australian GST: Total includes GST, so GST = Total / 11
      // Per ATO: Round to nearest cent (ROUND_HALF_UP)
      const gross = new Decimal(totalAmountCents);
      const gst = gross.dividedBy(11).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
      gstData = {
        grossCents: gross.toNumber(),
        gstCents: gst.toNumber(),
        netCents: gross.minus(gst).toNumber(),
        source: 'calculated_aud',
      };
    } else {
      // No GST for non-AUD currencies without Stripe tax
      gstData = {
        grossCents: totalAmountCents,
        gstCents: 0,
        netCents: totalAmountCents,
        source: 'no_tax',
      };
    }

    logStep("GST calculation completed (decimal.js precision)", {
      invoiceId: invoice.id,
      currency,
      source: gstData.source,
      grossCents: gstData.grossCents,
      gstCents: gstData.gstCents,
      netCents: gstData.netCents,
      grossAUD: `$${new Decimal(gstData.grossCents).dividedBy(100).toFixed(2)}`,
      gstAUD: `$${new Decimal(gstData.gstCents).dividedBy(100).toFixed(2)}`,
      netAUD: `$${new Decimal(gstData.netCents).dividedBy(100).toFixed(2)}`,
    });

    // Get customer and user information
    const customerId = invoice.customer as string;
    const customer = await stripe.customers.retrieve(customerId);
    
    let userId: string | null = null;
    let customerEmail: string | null = null;
    if (customer && !customer.deleted && customer.email) {
      customerEmail = customer.email;
      const { data: users } = await supabaseClient.auth.admin.listUsers();
      const user = users?.users?.find((u: any) => u.email === customer.email);
      userId = user?.id || null;
    }

    // Insert tax record into payment_tax_records table for ATO compliance
    // This record maintains 5-year retention per ATO requirements
    if (userId) {
      const taxRecord = {
        user_id: userId,
        stripe_invoice_id: invoice.id,
        stripe_customer_id: customerId,
        stripe_payment_intent_id: typeof invoice.payment_intent === 'string' 
          ? invoice.payment_intent 
          : invoice.payment_intent?.id || null,
        subscription_id: typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id || null,
        gross_amount_cents: gstData.grossCents,
        gst_amount_cents: gstData.gstCents,
        net_amount_cents: gstData.netCents,
        currency: currency.toLowerCase(),
        payment_status: 'succeeded',
        invoice_date: invoice.created 
          ? new Date(invoice.created * 1000).toISOString() 
          : new Date().toISOString(),
        metadata: {
          calculation_source: gstData.source,
          stripe_tax_provided: stripeTaxCents > 0,
          invoice_number: invoice.number || null,
          customer_email: customerEmail,
          period_start: invoice.period_start 
            ? new Date(invoice.period_start * 1000).toISOString() 
            : null,
          period_end: invoice.period_end 
            ? new Date(invoice.period_end * 1000).toISOString() 
            : null,
        },
      };

      const { error: taxError } = await supabaseClient
        .from('payment_tax_records')
        .insert(taxRecord);
      
      if (taxError) {
        // Log error but don't throw - subscription update should still proceed
        logStep("WARNING: Failed to insert tax record", { 
          error: taxError.message,
          code: taxError.code,
          invoiceId: invoice.id,
        });
      } else {
        logStep("Tax record inserted successfully (ATO-compliant)", {
          invoiceId: invoice.id,
          userId,
          totalIncGST: `$${new Decimal(gstData.grossCents).dividedBy(100).toFixed(2)}`,
          gstComponent: `$${new Decimal(gstData.gstCents).dividedBy(100).toFixed(2)}`,
          netExGST: `$${new Decimal(gstData.netCents).dividedBy(100).toFixed(2)}`,
        });
      }
    } else {
      logStep("User not found - tax record not inserted", { 
        invoiceId: invoice.id,
        customerId,
        customerEmail,
      });
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
