# Security Instructions for CarbonConstruct

## Overview
Security is critical for CarbonConstruct. This guide covers authentication, authorization, input validation, and secure coding patterns.

## Authentication

### Client-Side Authentication
```typescript
import { useAuth } from '@/contexts/AuthContext';

function ProtectedComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <div>Protected content</div>;
}
```

### Edge Function Authentication
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export default async function handler(req: Request) {
  // ALWAYS validate Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
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

  // Verify user session
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  if (error || !user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Continue with authorized logic...
}
```

## Authorization

### Row Level Security (RLS)
**ALWAYS enable RLS on tables:**
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can only see their own projects
CREATE POLICY "Users view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own projects
CREATE POLICY "Users insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Role-Based Access
```typescript
// Check user role before sensitive operations
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

if (profile.role !== 'admin') {
  return new Response('Forbidden', { status: 403 });
}
```

## Input Validation

### Use Zod for All Inputs
```typescript
import { z } from 'zod';

const ProjectSchema = z.object({
  name: z.string().min(1).max(200),
  project_type: z.enum(['residential', 'commercial', 'industrial']),
  location: z.string().optional(),
  description: z.string().max(1000).optional(),
});

// Validate before processing
const result = ProjectSchema.safeParse(input);
if (!result.success) {
  return { error: 'Invalid input', details: result.error };
}
```

### Sanitize User Input
```typescript
import DOMPurify from 'dompurify';

// For rendering user-generated content
const sanitized = DOMPurify.sanitize(userInput);
```

### SQL Injection Prevention
```typescript
// ✅ GOOD - Parameterized queries (Supabase does this automatically)
await supabase
  .from('materials')
  .select('*')
  .eq('name', userInput);

// ❌ BAD - Never use raw SQL with user input
const { data } = await supabase.rpc('raw_query', {
  query: `SELECT * FROM materials WHERE name = '${userInput}'`
});
```

## XSS Prevention

### Escape Output
```typescript
// React automatically escapes JSX content
<div>{userInput}</div> // Safe

// But be careful with dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

### Content Security Policy
Set in `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">
```

## Secrets Management

### Environment Variables
```typescript
// ✅ GOOD - Use environment variables
const apiKey = import.meta.env.VITE_API_KEY;

// ❌ BAD - Never hardcode secrets
const apiKey = 'sk-1234567890abcdef';
```

### Supabase Service Role
```typescript
// Only use service role for admin operations
// NEVER expose service role key to client
if (Deno.env.get('ENVIRONMENT') === 'server') {
  const adminClient = createClient(
    url,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}
```

## Rate Limiting

### Edge Function Rate Limiting
```typescript
import { rateLimit } from '../_shared/rate-limiter.ts';

export default async function handler(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  const limited = await rateLimit(ip, {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  });
  
  if (limited) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // Continue...
}
```

## Security Event Logging

### Log Security Events
```typescript
import { logger } from '@/lib/logger';

// Log authentication failures
logger.critical('Authentication:FailedLogin', {
  email: email,
  ip: request.ip,
  timestamp: new Date().toISOString(),
});

// Log authorization failures
logger.critical('Authorization:AccessDenied', {
  userId: user.id,
  resource: 'admin_panel',
  timestamp: new Date().toISOString(),
});

// Log suspicious activity
logger.critical('Security:SuspiciousActivity', {
  type: 'excessive_api_calls',
  userId: user.id,
  count: apiCallCount,
});
```

## CORS Configuration

### Supabase Edge Functions
```typescript
// Allow specific origins only
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://carbonconstruct.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS requests
if (req.method === 'OPTIONS') {
  return new Response('ok', { headers: corsHeaders });
}
```

## File Upload Security

### Validate File Types
```typescript
const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const maxSize = 10 * 1024 * 1024; // 10MB

if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

if (file.size > maxSize) {
  throw new Error('File too large');
}
```

### Scan Uploads
```typescript
// Use Supabase storage with virus scanning enabled
const { data, error } = await supabase.storage
  .from('uploads')
  .upload(`${user.id}/${filename}`, file, {
    cacheControl: '3600',
    upsert: false
  });
```

## Session Management

### Secure Session Storage
```typescript
// Supabase handles session storage securely
// But avoid storing sensitive data in localStorage
localStorage.setItem('user_preference', 'dark_mode'); // OK
localStorage.setItem('api_key', key); // ❌ NEVER
```

### Session Timeout
```typescript
// Implement automatic logout after inactivity
useEffect(() => {
  let timeout: NodeJS.Timeout;
  
  const resetTimeout = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      supabase.auth.signOut();
    }, 30 * 60 * 1000); // 30 minutes
  };
  
  window.addEventListener('mousemove', resetTimeout);
  window.addEventListener('keypress', resetTimeout);
  
  return () => {
    window.removeEventListener('mousemove', resetTimeout);
    window.removeEventListener('keypress', resetTimeout);
    clearTimeout(timeout);
  };
}, []);
```

## API Security

### Request Validation
```typescript
// Validate request method
if (req.method !== 'POST') {
  return new Response('Method not allowed', { status: 405 });
}

// Validate content type
const contentType = req.headers.get('content-type');
if (!contentType?.includes('application/json')) {
  return new Response('Invalid content type', { status: 400 });
}

// Parse and validate body
let body;
try {
  body = await req.json();
} catch {
  return new Response('Invalid JSON', { status: 400 });
}
```

## Compliance

### GDPR Considerations
- Log user consent for analytics
- Provide data export functionality
- Implement data deletion on request
- Cookie consent banner required

### Australian Privacy Act
- Store data in Australian region when possible
- Transparent privacy policy
- Secure data handling

## Security Checklist

Before deploying:
- [ ] All tables have RLS enabled
- [ ] Edge functions validate Authorization header
- [ ] Input validation with Zod schemas
- [ ] No hardcoded secrets
- [ ] Rate limiting on public endpoints
- [ ] Security events logged
- [ ] CORS properly configured
- [ ] File upload validation
- [ ] HTTPS only in production
- [ ] Dependencies audited (`npm audit`)

## Security Testing

### Manual Testing
```bash
# Test authentication
curl -X POST https://api.carbonconstruct.com/edge-function \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
# Should return 401

# Test with invalid token
curl -X POST https://api.carbonconstruct.com/edge-function \
  -H "Authorization: Bearer invalid" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
# Should return 401

# Test rate limiting
for i in {1..20}; do
  curl -X POST https://api.carbonconstruct.com/edge-function
done
# Should return 429 after limit
```

### Automated Testing
- Run CodeQL security scans
- Use OWASP ZAP for vulnerability scanning
- Enable Dependabot for dependency updates

## References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Australian Privacy Principles](https://www.oaic.gov.au/privacy/australian-privacy-principles)

Last Updated: 2026-01-04
