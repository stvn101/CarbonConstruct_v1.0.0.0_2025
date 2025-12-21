# Custom Domain Setup Guide for CarbonConstruct

## Email Links Configuration

All outbound email links in CarbonConstruct are configured to point to the production domain:

**Production URL**: `https://carbonconstruct.com.au`

### Files Updated

The following files have been configured to use the production URL for all email links:

1. **`src/pages/Reports.tsx`** - Report generation emails
2. **`src/components/PDFReport.tsx`** - PDF report email summaries
3. **`src/pages/Auth.tsx`** - Welcome emails after signup
4. **`src/components/MaterialVerificationReport.tsx`** - Outlier alert emails

### How It Works

Instead of using `window.location.origin` (which would point to the Lovable preview sandbox), all email templates now use the hardcoded production URL:

```typescript
// Before (incorrect - points to sandbox)
appUrl: window.location.origin

// After (correct - points to production)
appUrl: 'https://carbonconstruct.com.au'
```

## Custom Domain DNS Setup

To connect your custom domain to Lovable, follow these steps:

### 1. Add DNS Records at Your Registrar

Add the following records at your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare):

| Type | Name | Value |
|------|------|-------|
| A | @ | 185.158.133.1 |
| A | www | 185.158.133.1 |
| TXT | _lovable | lovable_verify=[your-verification-code] |

### 2. Connect Domain in Lovable

1. Go to **Project Settings** → **Domains**
2. Click **Connect Domain**
3. Enter your domain: `carbonconstruct.com.au`
4. Follow the verification steps
5. Add both root domain and `www` subdomain

### 3. Wait for SSL Provisioning

- DNS propagation can take up to 72 hours
- Lovable automatically provisions SSL (HTTPS) once DNS is verified
- Check status in **Settings** → **Domains**

### Domain Status Reference

| Status | Meaning | Action |
|--------|---------|--------|
| **Ready** | DNS configured, not published | Click Publish |
| **Verifying** | Waiting for DNS propagation | Wait up to 72 hours |
| **Setting up** | SSL being provisioned | Automatic, wait |
| **Active** | Domain is live | None required |
| **Offline** | DNS changed/broken | Fix DNS records |
| **Failed** | SSL failed | Retry after fixing DNS |

## Email Service Configuration

CarbonConstruct uses **Resend** for transactional emails.

### Required Environment Secrets

Ensure these secrets are configured in Supabase Edge Functions:

- `RESEND_API_KEY` - Your Resend API key

### Email Templates Location

Edge function email handler: `supabase/functions/send-email/index.ts`

### Supported Email Types

1. **welcome** - New user signup
2. **report_generated** - Carbon report summary
3. **outlier_alert** - Material verification alerts
4. **epd_expiry** - EPD renewal reminders

## Troubleshooting

### Links Still Point to Sandbox

If email links still point to the Lovable sandbox:
1. Search codebase for `window.location.origin`
2. Replace with `'https://carbonconstruct.com.au'`
3. Deploy changes

### DNS Not Resolving

1. Use [DNSChecker.org](https://dnschecker.org) to verify records
2. Ensure no conflicting A/AAAA records exist
3. Remove any old hosting provider records

### SSL Certificate Issues

If SSL fails to provision:
1. Check for CAA records blocking Let's Encrypt
2. Ensure A records point to `185.158.133.1`
3. Wait 24-48 hours and retry

## Contact

For domain setup assistance, contact: support@carbonconstruct.com.au

---

© 2025 CarbonConstruct Pty Ltd. All rights reserved.
