# CarbonConstruct Security Controls Summary

**Version:** 1.0  
**Last Updated:** 2025-12-07  
**Classification:** Internal Documentation

---

## Executive Summary

CarbonConstruct implements a comprehensive, defense-in-depth security architecture covering authentication, authorization, input validation, rate limiting, threat detection, and real-time alerting. This document provides a complete inventory of all security controls for audit and compliance purposes.

---

## 1. Edge Function Hardening

### 1.1 Authentication & Authorization

All protected edge functions implement JWT-based authentication:

| Function | Auth Required | Admin Only | Description |
|----------|--------------|------------|-------------|
| `parse-boq` | ✅ | ❌ | BOQ parsing with AI |
| `chat` | ✅ | ❌ | AI chat assistant |
| `chat-boq-import` | ✅ | ❌ | BOQ import via chat |
| `validate-calculation` | ✅ | ❌ | Server-side calculation validation |
| `carbon-recommendations` | ✅ | ❌ | AI carbon reduction suggestions |
| `create-checkout` | ✅ | ❌ | Stripe checkout session |
| `customer-portal` | ✅ | ❌ | Stripe customer portal |
| `check-subscription` | ✅ | ❌ | Subscription status check |
| `export-user-data` | ✅ | ❌ | GDPR data export |
| `schedule-deletion` | ✅ | ❌ | Account deletion scheduling |
| `cancel-deletion` | ✅ | ❌ | Cancel scheduled deletion |
| `suspend-account` | ✅ | ❌ | Account suspension |
| `import-materials` | ✅ | ✅ | Material database import |
| `import-epd-materials` | ✅ | ✅ | EPD material import |
| `import-icm-materials` | ✅ | ✅ | ICM material import |
| `import-nabers-epd` | ✅ | ✅ | NABERS EPD import |
| `send-audit-report` | ✅ | ✅ | Security audit email |
| `log-security-event` | 🔒 | 🔒 | Internal only (service role) |

### 1.2 Authentication Pattern

```typescript
// Standard authentication pattern used across all protected functions
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
    status: 401 
  });
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { Authorization: authHeader } }
});

const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
if (authError || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
    status: 401 
  });
}
```

### 1.3 Admin Role Verification

```typescript
// Admin-only functions use has_role() security definer function
const { data: isAdmin } = await supabaseClient
  .rpc('has_role', { _role: 'admin', _user_id: user.id });

if (!isAdmin) {
  return new Response(JSON.stringify({ error: 'Admin access required' }), { 
    status: 403 
  });
}
```

### 1.4 Input Validation with Zod

All edge functions validate input using Zod schemas:

```typescript
// Example: parse-boq validation
const ParseBoqSchema = z.object({
  text: z.string().min(10).max(15000),
  honeypot: z.string().max(0).optional()
});
```

**Validated Functions:**
- `parse-boq` - Text length, BOQ markers, character sanitization
- `chat` - Message array, role validation, content length
- `validate-calculation` - Material, fuel, electricity, transport schemas
- `carbon-recommendations` - Project data, emission totals

---

## 2. Rate Limiting

### 2.1 Database-Backed Rate Limiting

Rate limits are tracked in the `rate_limits` table with per-user, per-endpoint tracking:

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| `parse-boq` | 10 | 1 minute | Prevent AI abuse |
| `chat` | 20 | 1 minute | Prevent AI abuse |
| `validate-calculation` | 30 | 1 minute | Prevent spam |
| `carbon-recommendations` | 10 | 1 minute | Prevent AI abuse |
| `create-checkout` | 5 | 1 minute | Prevent payment abuse |
| `customer-portal` | 10 | 1 minute | Standard protection |

### 2.2 IP-Based Rate Limiting (Public Endpoints)

Public logging endpoints use IP-based rate limiting:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `log-error` | 100 | 1 hour |
| `log-performance` | 100 | 1 hour |
| `log-analytics` | 100 | 1 hour |

### 2.3 Rate Limit Implementation

```typescript
// Shared rate limiter module: supabase/functions/_shared/rate-limiter.ts
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  endpoint: string,
  maxRequests: number = 10,
  windowMinutes: number = 1
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }>
```

### 2.4 Rate Limit Response

```json
{
  "error": "Rate limit exceeded",
  "remaining": 0,
  "resetAt": "2025-12-07T12:05:00Z"
}
```

---

## 3. Honeypot Detection

### 3.1 Implementation

Hidden form fields detect bot submissions:

```typescript
// Frontend: Hidden honeypot field
<input
  type="text"
  name="website"
  value={honeypot}
  onChange={(e) => setHoneypot(e.target.value)}
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
/>

// Backend: Detection and logging
if (honeypot && honeypot.length > 0) {
  await logSecurityEvent(supabase, {
    event_type: 'honeypot_triggered',
    user_id: user?.id,
    ip_address: req.headers.get('x-forwarded-for'),
    details: { endpoint: 'parse-boq', honeypot_value: honeypot }
  });
  return new Response(JSON.stringify({ error: 'Invalid request' }), { 
    status: 400 
  });
}
```

### 3.2 Protected Forms

- BOQ Import form
- Contact form
- Calculator submission

---

## 4. Row Level Security (RLS) Policies

### 4.1 User-Scoped Tables

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `projects` | Own only | Own only | Own only | Own only |
| `unified_calculations` | Own only | Own only | Own only | Own only |
| `user_preferences` | Own only | Own only | Own only | Own only |
| `scope1_emissions` | Project owner | Project owner | Project owner | Project owner |
| `scope2_emissions` | Project owner | Project owner | Project owner | Project owner |
| `scope3_emissions` | Project owner | Project owner | Project owner | Project owner |
| `reports` | Project owner | Project owner | Project owner | Project owner |

### 4.2 Subscription & Usage Tables (Service Role Only)

| Table | User Access | Service Role |
|-------|-------------|--------------|
| `user_subscriptions` | Read own (via safe view) | Full access |
| `usage_metrics` | Read own | Full access |
| `rate_limits` | Read/Write own | Full access |

### 4.3 Reference Tables (Public Read)

| Table | SELECT | INSERT/UPDATE/DELETE |
|-------|--------|----------------------|
| `materials_epd` | Public | Admin only |
| `emission_factors` | Public | Admin only |
| `subscription_tiers` | Public | Admin only |

### 4.4 Admin-Only Tables

| Table | Access |
|-------|--------|
| `alerts` | Admin read/write |
| `error_logs` | Service role only |
| `analytics_events` | Service role only |
| `performance_metrics` | Service role only |

### 4.5 Sensitive Data Protection

Stripe IDs are protected via database view:

```sql
-- user_subscriptions_safe view excludes sensitive columns
CREATE VIEW user_subscriptions_safe AS
SELECT 
  id, user_id, tier_id, status, trial_end,
  current_period_start, current_period_end,
  cancel_at_period_end, created_at, updated_at
  -- stripe_customer_id and stripe_subscription_id EXCLUDED
FROM user_subscriptions;
```

---

## 5. Admin Alerting System

### 5.1 Alert Thresholds

| Event Type | Threshold | Window | Severity |
|------------|-----------|--------|----------|
| Authentication failures | 10 | 1 hour | High |
| Rate limit violations | 20 | 1 hour | Medium |
| Honeypot triggers | 5 | 1 hour | High |
| Invalid tokens | 10 | 1 hour | High |

### 5.2 Alert Flow

```
Security Event → log-security-event → error_logs table
                                    ↓
                              Threshold Check
                                    ↓
                              alerts table
                                    ↓
                              Email Notification
                              (contact@carbonconstruct.net)
```

### 5.3 Security Event Types

- `auth_failure` - Failed authentication attempts
- `rate_limit_exceeded` - Rate limit violations
- `honeypot_triggered` - Bot detection
- `invalid_token` - Malformed or expired tokens
- `admin_access_denied` - Unauthorized admin access attempts
- `suspicious_activity` - Anomalous behavior patterns

### 5.4 Admin Monitoring Dashboard

Located at `/admin/monitoring` (admin-only access):
- Real-time security events feed
- Active alerts panel
- Manual security test buttons
- Error log viewer

---

## 6. Additional Security Controls

### 6.1 XSS Prevention

```typescript
// HTML escaping for email templates
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### 6.2 CORS Configuration

Edge functions include proper CORS headers:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

### 6.3 Stripe Webhook Verification

```typescript
const signature = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

### 6.4 Service Worker Security

```javascript
// public/sw.js filters non-cacheable requests
if (event.request.method !== 'GET') return;
if (event.request.url.startsWith('chrome-extension://')) return;
```

---

## 7. Compliance Standards

### 7.1 Supported Standards

- **GDPR** - Data export, account deletion, cookie consent
- **ISO 27001** - Access control, encryption, audit logging
- **Australian Privacy Act** - Data handling, breach notification
- **NCC 2024** - Building compliance calculations

### 7.2 Data Retention

| Data Type | Retention Period |
|-----------|-----------------|
| User data | Until deletion requested |
| Security logs | 90 days |
| Performance metrics | 30 days |
| Analytics events | 90 days |

### 7.3 Encryption

- **At Rest:** AES-256 (Supabase managed)
- **In Transit:** TLS 1.3

---

## 8. Security Testing

### 8.1 Automated Tests

Browser console test suite available at `/security-tests.js`:

```javascript
// Run in browser console
fetch('/security-tests.js').then(r => r.text()).then(eval);
SecurityTests.runAll();
```

### 8.2 Test Coverage

- Authentication requirements
- Input validation (XSS, injection)
- Rate limiting enforcement
- Honeypot detection
- CORS headers
- Deep nesting protection
- RLS policy verification

### 8.3 Manual Testing

Admin Monitoring page includes manual test buttons:
- Test Honeypot Detection
- Test Rate Limit Alert

---

## 9. Incident Response

### 9.1 Alert Response Procedure

1. Alert received via email
2. Review alert details in Admin Monitoring
3. Check related security events
4. Investigate affected user/IP
5. Take remediation action if needed
6. Mark alert as resolved

### 9.2 Contact

Security issues: contact@carbonconstruct.net

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-07 | System | Initial documentation |

---

*This document is automatically generated and maintained as part of the CarbonConstruct security documentation suite.*
