import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { checkRateLimit } from "../_shared/rate-limiter.ts";
import { logSecurityEvent, getClientIP } from "../_shared/security-logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[chat] No authorization header provided");
      logSecurityEvent({
        event_type: 'auth_failure',
        ip_address: getClientIP(req),
        endpoint: 'chat',
        details: 'Missing authorization header'
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("[chat] Authentication failed:", userError?.message);
      logSecurityEvent({
        event_type: 'invalid_token',
        ip_address: getClientIP(req),
        endpoint: 'chat',
        details: userError?.message || 'Invalid or expired token'
      });
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }), 
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.user;
    console.log(`[chat] Authenticated user: ${user.id}`);

    // Check rate limit (50 requests per 10 minutes for chat)
    const rateLimitResult = await checkRateLimit(
      supabaseClient,
      user.id,
      'chat',
      { windowMinutes: 10, maxRequests: 50 }
    );

    if (!rateLimitResult.allowed) {
      const resetInSeconds = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000);
      console.warn(`[chat] User ${user.id}: Rate limit exceeded. Reset in ${resetInSeconds}s`);
      
      // Log security event for rate limit violation
      logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        user_id: user.id,
        ip_address: getClientIP(req),
        endpoint: 'chat',
        details: `Rate limit exceeded. Reset in ${resetInSeconds}s`
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Rate limit exceeded. Please try again in ${resetInSeconds} seconds.`,
          retryAfter: resetInSeconds
        }), 
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(resetInSeconds)
          } 
        }
      );
    }

    console.log(`[chat] User ${user.id}: Rate limit OK (${rateLimitResult.remaining} remaining)`);

    const { messages } = await req.json();

    // Validate messages is an array
    if (!Array.isArray(messages)) {
      console.error(`[chat] User ${user.id}: Invalid messages type - expected array, got ${typeof messages}`);
      return new Response(
        JSON.stringify({ error: "Messages must be an array" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate array is not empty
    if (messages.length === 0) {
      console.error(`[chat] User ${user.id}: Empty messages array`);
      return new Response(
        JSON.stringify({ error: "Messages array cannot be empty" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate array length (prevent abuse)
    if (messages.length > 50) {
      console.error(`[chat] User ${user.id}: Too many messages (${messages.length}, max 50)`);
      return new Response(
        JSON.stringify({ error: "Too many messages - maximum 50 messages per request" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each message structure
    const validRoles = ['user', 'assistant', 'system'];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      // Check message has required fields
      if (!msg.role || !msg.content) {
        console.error(`[chat] User ${user.id}: Invalid message structure at index ${i} - missing role or content`);
        return new Response(
          JSON.stringify({ error: `Invalid message at position ${i + 1} - must have 'role' and 'content' fields` }), 
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate role
      if (!validRoles.includes(msg.role)) {
        console.error(`[chat] User ${user.id}: Invalid role at index ${i}: ${msg.role}`);
        return new Response(
          JSON.stringify({ error: `Invalid role at position ${i + 1} - must be 'user', 'assistant', or 'system'` }), 
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate content is string
      if (typeof msg.content !== 'string') {
        console.error(`[chat] User ${user.id}: Invalid content type at index ${i} - expected string, got ${typeof msg.content}`);
        return new Response(
          JSON.stringify({ error: `Invalid content at position ${i + 1} - must be a string` }), 
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validate content length
      if (msg.content.length > 10000) {
        console.error(`[chat] User ${user.id}: Content too long at index ${i} (${msg.content.length} chars, max 10,000)`);
        return new Response(
          JSON.stringify({ error: `Message at position ${i + 1} exceeds maximum length of 10,000 characters` }), 
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`[chat] User ${user.id}: Validated ${messages.length} messages`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful AI assistant for a Carbon Calculator app used by the Australian construction industry. You help users understand carbon emissions, scope calculations, compliance requirements (NCC, GBCA, NABERS), and best practices for reducing embodied carbon. Be concise, friendly, and technically accurate." 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("[chat] Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
