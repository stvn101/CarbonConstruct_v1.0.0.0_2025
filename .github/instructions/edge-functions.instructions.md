# Edge Functions Template & Best Practices

## Template Structure

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  // Define expected request structure
}

interface ResponseBody {
  // Define response structure
}

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Parse and validate request body
    const body: RequestBody = await req.json();
    
    // Add validation logic here
    
    // 4. Perform business logic
    const result = await processRequest(body, user, supabaseClient);

    // 5. Return response
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

async function processRequest(
  body: RequestBody,
  user: any,
  supabaseClient: any
): Promise<ResponseBody> {
  // Business logic here
  return {};
}
```

## Best Practices

### 1. Always Validate Auth
```typescript
const { data: { user }, error } = await supabaseClient.auth.getUser();
if (error || !user) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 2. Use Shared Utilities
```typescript
import { corsHeaders } from '../_shared/cors.ts';
import { validateRequest } from '../_shared/request-validator.ts';
import { rateLimit } from '../_shared/rate-limiter.ts';
```

### 3. Type Safety
```typescript
interface CreateProjectRequest {
  name: string;
  project_type: 'residential' | 'commercial' | 'industrial';
  location?: string;
}
```

### 4. Error Handling
```typescript
try {
  // Operation
} catch (error) {
  console.error('Error context:', error);
  return new Response(
    JSON.stringify({ error: 'User-friendly message' }),
    { status: 500, headers: corsHeaders }
  );
}
```

### 5. Rate Limiting
```typescript
const ip = req.headers.get('x-forwarded-for') || 'unknown';
const limited = await rateLimit(ip, { maxRequests: 10, windowMs: 60000 });
if (limited) {
  return new Response('Too many requests', { status: 429 });
}
```

### 6. Logging
```typescript
console.log('Function invoked:', {
  user: user.id,
  timestamp: new Date().toISOString(),
});
```

## Common Patterns

### Database Query
```typescript
const { data, error } = await supabaseClient
  .from('projects')
  .select('*')
  .eq('user_id', user.id);

if (error) {
  throw new Error(`Database error: ${error.message}`);
}
```

### File Upload
```typescript
const { data, error } = await supabaseClient.storage
  .from('uploads')
  .upload(`${user.id}/${filename}`, file);
```

### External API Call
```typescript
const response = await fetch('https://api.external.com/data', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('EXTERNAL_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

if (!response.ok) {
  throw new Error(`External API error: ${response.status}`);
}
```

## Testing Edge Functions

### Local Testing
```bash
supabase functions serve function-name --env-file .env.local
```

### Manual Test
```bash
curl -X POST http://localhost:54321/functions/v1/function-name \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Deploy
```bash
supabase functions deploy function-name
```

Last Updated: 2026-01-04
