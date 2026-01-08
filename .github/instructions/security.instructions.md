---
applyTo: "**/*.ts,**/*.tsx,supabase/functions/**/*"
---

# Security Instructions for CarbonConstruct

## Input Validation

### Always Use Zod for External Inputs

```typescript
import { z } from 'zod';

// Define schema
const userInputSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).trim(),
  quantity: z.number().positive().max(10_000_000),
});

// Validate before use
const result = userInputSchema.safeParse(input);
if (!result.success) {
  throw new ValidationError(result.error.format());
}
```

### Validate URL Parameters
```typescript
// Never trust URL parameters
const id = z.string().uuid().parse(params.id);
```

## Secret Management

### Never Expose in Client Code
```typescript
// ❌ NEVER do this
const apiKey = 'sk_live_...';
const secret = import.meta.env.VITE_SECRET_KEY;

// ✅ Only these are allowed in client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

### Edge Function Secrets
```typescript
// Access secrets in Edge Functions only
const apiKey = Deno.env.get('API_SECRET_KEY');
if (!apiKey) {
  throw new Error('API_SECRET_KEY not configured');
}
```

## XSS Prevention

### Sanitize HTML Content
```typescript
import DOMPurify from 'dompurify';

// Always sanitize before rendering
const safeHtml = DOMPurify.sanitize(userContent);

// If you must use dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

### Escape User Content in URLs
```typescript
// Always encode URL parameters
const url = `https://api.example.com?q=${encodeURIComponent(userInput)}`;
```

## Authentication Patterns

### Edge Function JWT Verification
```typescript
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return new Response(
    JSON.stringify({ error: 'Missing authorization header' }),
    { status: 401, headers: corsHeaders }
  );
}

const token = authHeader.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(token);

if (error || !user) {
  return new Response(
    JSON.stringify({ error: 'Invalid or expired token' }),
    { status: 401, headers: corsHeaders }
  );
}
```

### Admin Role Verification
```typescript
// Check admin role for sensitive operations
const { data: roles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .single();

if (roles?.role !== 'admin') {
  return new Response(
    JSON.stringify({ error: 'Insufficient permissions' }),
    { status: 403, headers: corsHeaders }
  );
}
```

## Rate Limiting

### Use Shared Rate Limiter
```typescript
import { checkRateLimit } from '../_shared/rate-limiter.ts';

const rateLimitResult = await checkRateLimit(supabase, userId, 'endpoint_name', 10, 60);
if (!rateLimitResult.allowed) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter }),
    { status: 429, headers: corsHeaders }
  );
}
```

### Public Endpoint Protection
```typescript
// For public endpoints, rate limit by IP
const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
const ipRateLimit = await checkRateLimit(supabase, clientIp, 'public_endpoint', 100, 3600);
```

## Row Level Security (RLS)

### Required for All Tables
```sql
-- Enable RLS
ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data"
  ON public.my_table
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON public.my_table
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Service Role for Admin Operations
```typescript
// Use service role only in Edge Functions for admin operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);
```

## Error Handling

### Don't Leak Sensitive Information
```typescript
// ❌ Never expose internal errors
catch (error) {
  return res.status(500).json({ error: error.stack });
}

// ✅ Generic error messages
catch (error) {
  console.error('Internal error:', error); // Log internally
  return res.status(500).json({ error: 'An unexpected error occurred' });
}
```

### Log Security Events
```typescript
import { logSecurityEvent } from '../_shared/security-logger.ts';

await logSecurityEvent(supabase, {
  event_type: 'auth_failure',
  user_id: userId,
  ip_address: clientIp,
  metadata: { reason: 'invalid_token' }
});
```

## Security Checklist

Before committing code:

- [ ] All user inputs validated with Zod
- [ ] No hardcoded secrets or API keys
- [ ] JWT tokens verified in Edge Functions
- [ ] Rate limiting on public endpoints
- [ ] RLS policies on database tables
- [ ] HTML sanitized with DOMPurify
- [ ] URLs properly encoded
- [ ] Error messages don't leak internals
- [ ] Security events logged
- [ ] Admin operations require role check
