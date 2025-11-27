# CarbonConstruct Security Documentation

**Version:** 1.0  
**Last Updated:** November 2025  
**Classification:** Internal Use  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [API Security](#api-security)
5. [Input Validation](#input-validation)
6. [Rate Limiting](#rate-limiting)
7. [Database Security](#database-security)
8. [Edge Function Security](#edge-function-security)
9. [Compliance Standards](#compliance-standards)
10. [Security Audit Log](#security-audit-log)

---

## Executive Summary

CarbonConstruct implements a comprehensive, defense-in-depth security architecture designed to protect Australian construction industry carbon emissions data. The platform adheres to industry best practices and Australian privacy standards.

### Security Highlights

- ✅ **Zero critical vulnerabilities** in latest security scan
- ✅ **Row-Level Security (RLS)** on all 18 database tables
- ✅ **JWT authentication** on all protected endpoints
- ✅ **Rate limiting** on resource-intensive operations
- ✅ **Input validation** using Zod schemas on all edge functions
- ✅ **XSS protection** via HTML escaping on all user-generated content
- ✅ **Role-based access control** for administrative functions

---

## Authentication & Authorization

### Authentication Methods

| Method | Implementation | Status |
|--------|---------------|--------|
| Email/Password | Supabase Auth with bcrypt hashing | ✅ Active |
| Google OAuth | OAuth 2.0 via Supabase | ✅ Active |
| Session Management | JWT tokens with auto-refresh | ✅ Active |
| Password Reset | Email-based secure token flow | ✅ Active |

### Session Security

```typescript
// Session configuration (src/integrations/supabase/client.ts)
{
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
}
```

### Role-Based Access Control (RBAC)

**Implementation:** Separate `user_roles` table with security definer function

```sql
-- Role checking function (prevents RLS recursion)
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

**Roles:**
- `admin` - Full system access, user management, data import
- `user` - Standard user access to own data

---

## Data Protection

### Data Classification

| Classification | Examples | Protection Level |
|---------------|----------|-----------------|
| **Highly Sensitive** | Stripe IDs, API keys | Server-side only, encrypted at rest |
| **Sensitive** | User emails, project data | RLS-protected, user-scoped |
| **Internal** | Emission factors, materials | Read-only for authenticated users |
| **Public** | Pricing tiers, features | Publicly readable |

### Encryption

- **At Rest:** AES-256 encryption via Supabase infrastructure
- **In Transit:** TLS 1.3 for all connections
- **Secrets:** Stored in Supabase Vault, never in codebase

### Data Isolation

All user data is isolated using Row-Level Security policies:

```sql
-- Example: Users can only access their own projects
CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
USING (auth.uid() = user_id);
```

---

## API Security

### Edge Function Authentication

All protected edge functions require valid JWT tokens:

```typescript
// Standard authentication pattern
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

const { data: { user }, error } = await supabase.auth.getUser(
  authHeader.replace('Bearer ', '')
);

if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}
```

### Protected Endpoints

| Endpoint | Auth Required | Admin Only | Rate Limited |
|----------|--------------|------------|--------------|
| `/parse-boq` | ✅ | ❌ | ✅ |
| `/chat` | ✅ | ❌ | ✅ |
| `/carbon-recommendations` | ✅ | ❌ | ✅ |
| `/validate-calculation` | ✅ | ❌ | ✅ |
| `/extract-pdf-text` | ✅ | ❌ | ✅ |
| `/send-email` | ✅ | ❌ | ✅ |
| `/import-materials` | ✅ | ✅ | ❌ |
| `/create-checkout` | ✅ | ❌ | ❌ |
| `/customer-portal` | ✅ | ❌ | ❌ |

### Public Endpoints (JWT Verification Disabled)

| Endpoint | Purpose | Protection |
|----------|---------|------------|
| `/stripe-webhook` | Payment webhooks | Stripe signature verification |
| `/send-contact-email` | Contact form | IP-based rate limiting |
| `/health-check` | Uptime monitoring | No sensitive data |
| `/log-error` | Error tracking | Input validation |
| `/log-performance` | Performance monitoring | Input validation |
| `/log-analytics` | Analytics collection | Input validation |

---

## Input Validation

### Validation Strategy

All user inputs are validated using Zod schemas before processing:

```typescript
// Example: Carbon recommendations input validation
const HotspotSchema = z.object({
  name: z.string().max(200).optional(),
  category: z.string().max(100),
  severity: z.enum(['low', 'medium', 'high']),
  emissions: z.number().nonnegative().max(1000000000),
  percentageOfTotal: z.number().min(0).max(100),
  stage: z.string().max(50),
});

const RequestSchema = z.object({
  hotspots: z.array(HotspotSchema).min(1).max(100),
  totalEmissions: z.number().nonnegative().max(1000000000),
});
```

### XSS Prevention

All user-generated content in HTML templates is escaped:

```typescript
const escapeHtml = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
};
```

### Validated Edge Functions

| Function | Validation Type | Max Input Size |
|----------|----------------|----------------|
| `parse-boq` | Text length, content markers | 50,000 chars |
| `chat` | Message array structure | 50 messages, 10K chars each |
| `carbon-recommendations` | Zod schema | 100 hotspots |
| `validate-calculation` | Zod schema | Standard limits |
| `send-email` | Zod schema + HTML escape | Per-field limits |
| `send-contact-email` | Required fields + HTML escape | Per-field limits |
| `extract-pdf-text` | File type, size | 10MB max |

---

## Rate Limiting

### Implementation

Database-backed rate limiting for authenticated endpoints:

```typescript
// Rate limit configuration
interface RateLimitConfig {
  windowMinutes: number;
  maxRequests: number;
}

// Shared rate limiter (supabase/functions/_shared/rate-limiter.ts)
export async function checkRateLimit(
  supabaseClient: SupabaseClient,
  userId: string,
  endpoint: string,
  config: RateLimitConfig
): Promise<RateLimitResult>
```

### Rate Limits by Endpoint

| Endpoint | Window | Max Requests | Type |
|----------|--------|--------------|------|
| `parse-boq` | 1 minute | 10 | User-based |
| `chat` | 1 minute | 10 | User-based |
| `send-email` | 1 hour | 10 | User-based |
| `extract-pdf-text` | 1 hour | 20 | User-based |
| `send-contact-email` | 1 hour | 5 | IP-based |

### Rate Limit Response

```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "resetAt": "2025-11-27T16:00:00.000Z"
}
```

---

## Database Security

### Row-Level Security (RLS)

**All 18 tables have RLS enabled** with appropriate policies:

#### User Data Tables (User-Scoped)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `projects` | Own only | Own only | Own only | Own only |
| `unified_calculations` | Own only | Own only | Own only | Own only |
| `user_subscriptions` | Own only | Own only | Own only | Own only |
| `usage_metrics` | Own only | Own only | Own only | Own only |
| `rate_limits` | Own only | Own only | Own only | Admin |

#### Project-Scoped Tables

| Table | Access Pattern |
|-------|---------------|
| `scope1_emissions` | Via project ownership |
| `scope2_emissions` | Via project ownership |
| `scope3_emissions` | Via project ownership |
| `reports` | Via project ownership |

#### Reference Data Tables (Read-Only)

| Table | SELECT | MODIFY |
|-------|--------|--------|
| `lca_materials` | Authenticated | Service role only |
| `emission_factors` | Authenticated | Service role only |
| `subscription_tiers` | Active tiers only | Service role only |

#### Administrative Tables

| Table | Access |
|-------|--------|
| `user_roles` | Own roles (SELECT), Admin (ALL) |
| `alerts` | Admin only |
| `materials_import_jobs` | Own jobs + Admin |

### Security Functions

```sql
-- Tier access function
CREATE FUNCTION public.get_user_tier(user_id_param uuid)
RETURNS TABLE(tier_name text, tier_limits jsonb, ...)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public;

-- Action permission check
CREATE FUNCTION public.can_perform_action(user_id_param uuid, action_type text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public;
```

---

## Edge Function Security

### Security Checklist for Edge Functions

- [x] CORS headers configured
- [x] JWT validation (where required)
- [x] User authentication via `supabase.auth.getUser()`
- [x] Input validation with Zod schemas
- [x] Rate limiting implementation
- [x] Error logging for audit trails
- [x] Admin role verification (for privileged operations)

### Admin-Only Operations

```typescript
// Admin check pattern (import-materials)
const { data: isAdmin } = await supabaseClient.rpc('has_role', {
  _user_id: user.id,
  _role: 'admin'
});

if (!isAdmin) {
  return new Response(
    JSON.stringify({ error: 'Admin access required' }),
    { status: 403 }
  );
}
```

---

## Compliance Standards

### Australian Standards Supported

| Standard | Implementation |
|----------|---------------|
| **Privacy Act 1988** | Data minimization, user consent, access controls |
| **NCC 2024** | Emission factor compliance |
| **GBCA Green Star** | Reporting methodologies |
| **NABERS** | Energy rating calculations |
| **ISO 14040-44** | LCA methodology support |

### Data Retention

- **User Data:** Retained while account active
- **Error Logs:** 90 days (scheduled cleanup)
- **Rate Limits:** 1 hour (auto-cleanup function)
- **Analytics:** 1 year

### Audit Logging

All security-relevant actions are logged:

```typescript
console.log(`[function-name] User ${user.id}: Action description`);
```

---

## Security Audit Log

### Recent Security Improvements (November 2025)

| Date | Improvement | Impact |
|------|-------------|--------|
| Nov 27 | Added admin role check to `import-materials` | Prevents unauthorized data imports |
| Nov 27 | Added HTML escaping to `send-contact-email` | Prevents XSS in emails |
| Nov 27 | Added Zod validation to `carbon-recommendations` | Prevents malformed AI inputs |
| Nov 27 | Added Zod validation to `send-email` | Validates all email data |
| Nov 27 | Added rate limiting to `send-email` | 10 req/hour per user |
| Nov 27 | Added rate limiting to `send-contact-email` | 5 req/hour per IP |
| Nov 27 | Added rate limiting to `extract-pdf-text` | 20 req/hour per user |
| Nov 27 | Hardened RLS on `rate_limits` | Admin-based access control |
| Nov 27 | Hardened RLS on `materials_import_jobs` | Admin-based access control |

### Security Scan Results

**Last Scan:** November 27, 2025

| Level | Count | Notes |
|-------|-------|-------|
| Critical | 0 | None |
| Error | 1 | Architectural consideration (Stripe IDs) |
| Warning | 4 | Design recommendations |
| Info | 4 | Properly secured |

---

## Contact

For security concerns or vulnerability reports:

- **Email:** security@carbonconstruct.com.au
- **Response Time:** Within 24 hours for critical issues

---

*This document is maintained by the CarbonConstruct development team and updated with each security review.*
