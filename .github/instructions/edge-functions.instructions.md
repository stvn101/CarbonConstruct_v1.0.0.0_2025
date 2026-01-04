---
applyTo: "supabase/functions/**/*"
---

# Edge Functions Development Guide

## File Structure

```
supabase/functions/
├── _shared/                    # Shared utilities
│   ├── rate-limiter.ts        # Rate limiting helper
│   ├── security-logger.ts     # Security event logging
│   └── request-validator.ts   # Input validation
├── my-function/
│   └── index.ts               # Function entry point
└── config.toml                # Function configuration
```

## Standard Template

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[my-function] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  logStep('Request received', { method: req.method });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logStep('Unauthorized request');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // 3. Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logStep('Auth failed', { error: authError?.message });
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    logStep('User authenticated', { userId: user.id });

    // 4. Parse and validate request body
    const body = await req.json();
    logStep('Request body parsed', { keys: Object.keys(body) });

    // 5. Business logic here
    const result = await processRequest(body, user, supabase);
    logStep('Processing complete', { success: true });

    // 6. Return success response
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('Error occurred', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function processRequest(
  body: unknown, 
  user: { id: string }, 
  supabase: ReturnType<typeof createClient>
) {
  // Implementation
  return { success: true };
}
```

## Configuration (config.toml)

```toml
[functions.my-function]
verify_jwt = true  # Set to false for public endpoints

[functions.public-function]
verify_jwt = false  # Requires manual auth handling
```

## Rate Limiting Integration

```typescript
import { checkRateLimit } from '../_shared/rate-limiter.ts';

// In your function
const rateLimitResult = await checkRateLimit(
  supabase,
  user.id,
  'my-function',
  10,  // max requests
  60   // window in seconds
);

if (!rateLimitResult.allowed) {
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded',
      retryAfter: rateLimitResult.retryAfter 
    }),
    { status: 429, headers: corsHeaders }
  );
}
```

## Input Validation

```typescript
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const requestSchema = z.object({
  materialName: z.string().min(1).max(300),
  quantity: z.number().positive().max(10_000_000),
  unit: z.enum(['kg', 't', 'm3', 'm2', 'm', 'unit']),
});

// Validate input
const parseResult = requestSchema.safeParse(body);
if (!parseResult.success) {
  return new Response(
    JSON.stringify({ 
      error: 'Invalid input',
      details: parseResult.error.format()
    }),
    { status: 400, headers: corsHeaders }
  );
}
const validatedData = parseResult.data;
```

## Error Response Standards

```typescript
// 400 - Bad Request (validation errors)
{ error: 'Invalid input', details: { field: 'error message' } }

// 401 - Unauthorized
{ error: 'Authorization required' }
{ error: 'Invalid authentication' }

// 403 - Forbidden
{ error: 'Insufficient permissions' }

// 404 - Not Found
{ error: 'Resource not found' }

// 429 - Rate Limited
{ error: 'Rate limit exceeded', retryAfter: 60 }

// 500 - Internal Error
{ error: 'Internal server error' }  // Never expose stack traces
```

## Calling External APIs

```typescript
// Store API keys as secrets
const apiKey = Deno.env.get('EXTERNAL_API_KEY');
if (!apiKey) {
  throw new Error('EXTERNAL_API_KEY not configured');
}

const response = await fetch('https://api.external.com/endpoint', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});

if (!response.ok) {
  logStep('External API error', { status: response.status });
  throw new Error(`External API returned ${response.status}`);
}
```

## Admin-Only Functions

```typescript
// Verify admin role
const { data: roleData } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .single();

if (roleData?.role !== 'admin') {
  return new Response(
    JSON.stringify({ error: 'Admin access required' }),
    { status: 403, headers: corsHeaders }
  );
}

// Use service role for admin operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);
```

## Checklist

Before deploying:

- [ ] CORS headers included
- [ ] OPTIONS method handled
- [ ] Authorization verified (or explicitly public)
- [ ] Input validated with Zod
- [ ] Rate limiting added for public endpoints
- [ ] Errors logged with context
- [ ] No secrets in response
- [ ] config.toml updated
- [ ] Function tested locally with `supabase functions serve`
