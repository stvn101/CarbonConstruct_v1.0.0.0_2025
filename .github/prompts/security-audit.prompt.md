# Security Audit Prompt

Perform a security audit on this code:

## 1. Authentication & Authorization

### Check:
- [ ] JWT tokens verified in all Edge Functions
- [ ] Admin-only routes check user roles
- [ ] Sensitive operations require re-authentication
- [ ] Session management is secure

### Look for:
```typescript
// Must have in Edge Functions
const { data: { user }, error } = await supabase.auth.getUser(token);
if (error || !user) { return unauthorized(); }

// Admin check pattern
const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
if (roles?.role !== 'admin') { return forbidden(); }
```

## 2. Input Validation

### Check:
- [ ] All user inputs validated with Zod
- [ ] URL parameters validated
- [ ] File uploads restricted by type/size
- [ ] SQL injection prevented (use Supabase client)

### Look for:
```typescript
// Must have for external inputs
const schema = z.object({
  field: z.string().max(255),
  email: z.string().email(),
});
const result = schema.safeParse(input);
```

## 3. Row Level Security (RLS)

### Check:
- [ ] RLS enabled on all tables
- [ ] Policies restrict access to own data
- [ ] Service role used only in Edge Functions
- [ ] No overly permissive policies

### Vulnerable patterns:
```sql
-- BAD: Anyone can read all data
CREATE POLICY "allow all" ON table FOR SELECT USING (true);

-- GOOD: Users only see their data
CREATE POLICY "users own data" ON table FOR SELECT USING (auth.uid() = user_id);
```

## 4. Secret Management

### Check:
- [ ] No secrets in client code
- [ ] Only VITE_SUPABASE_PUBLISHABLE_KEY in frontend
- [ ] API keys in Supabase secrets
- [ ] .env not committed to git

### Look for:
```typescript
// BAD: Secrets in client code
const apiKey = 'sk_live_...';
const secret = import.meta.env.VITE_SECRET_KEY;

// GOOD: Secrets in Edge Functions only
const apiKey = Deno.env.get('API_KEY');
```

## 5. XSS Prevention

### Check:
- [ ] No dangerouslySetInnerHTML without sanitization
- [ ] DOMPurify used for user content
- [ ] URLs properly encoded
- [ ] Content-Security-Policy headers set

### Look for:
```typescript
// BAD
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// GOOD
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

## 6. Rate Limiting

### Check:
- [ ] Public endpoints have rate limiting
- [ ] Rate limits logged for monitoring
- [ ] 429 responses include retry-after

### Pattern:
```typescript
import { checkRateLimit } from '../_shared/rate-limiter.ts';
const { allowed, retryAfter } = await checkRateLimit(supabase, userId, endpoint, 10, 60);
```

## 7. Error Handling

### Check:
- [ ] Internal errors not exposed to users
- [ ] Stack traces not in responses
- [ ] Errors logged with context
- [ ] Security events tracked

### Look for:
```typescript
// BAD
catch (error) { res.json({ error: error.stack }); }

// GOOD
catch (error) {
  logger.error('operation_failed', { error });
  res.status(500).json({ error: 'An error occurred' });
}
```

## Response Format:

### Critical Vulnerabilities
Issues requiring immediate fix before deployment.

### High Risk
Issues to fix soon.

### Medium Risk
Issues to address in next sprint.

### Low Risk / Recommendations
Best practice improvements.

### Secure Patterns Found
Code following security best practices.
