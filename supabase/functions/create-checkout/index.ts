import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { logSecurityEvent, getClientIP } from "../_shared/security-logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logSecurityEvent({
        event_type: 'auth_failure',
        ip_address: getClientIP(req),
        endpoint: 'create-checkout',
        details: 'Missing authorization header'
      });
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      logSecurityEvent({
        event_type: 'invalid_token',
        ip_address: getClientIP(req),
        endpoint: 'create-checkout',
        details: 'Invalid or expired token'
      });
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check rate limit (10 checkout attempts per 15 minutes)
    const rateLimitResult = await checkRateLimit(
      supabaseClient,
      user.id,
      'create-checkout',
      { windowMinutes: 15, maxRequests: 10 }
    );

    if (!rateLimitResult.allowed) {
      const resetInSeconds = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000);
      logStep("Rate limit exceeded", { userId: user.id, resetInSeconds });
      
      // Log security event for rate limit violation
      logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        user_id: user.id,
        ip_address: getClientIP(req),
        endpoint: 'create-checkout',
        details: `Rate limit exceeded. Reset in ${resetInSeconds}s`
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Too many checkout attempts. Please try again in ${Math.ceil(resetInSeconds / 60)} minutes.`,
          retryAfter: resetInSeconds
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(resetInSeconds)
          } 
        }
      );
    }

    logStep("Rate limit OK", { remaining: rateLimitResult.remaining });

    // Get the price_id from request body
    const { price_id, tier_name } = await req.json();
    if (!price_id) throw new Error("price_id is required");
    logStep("Received request", { price_id, tier_name });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("Creating new customer");
    }

    // Create checkout session with 14-day trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          user_id: user.id,
          tier_name: tier_name || 'unknown',
        },
      },
      success_url: `${req.headers.get("origin")}/?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
