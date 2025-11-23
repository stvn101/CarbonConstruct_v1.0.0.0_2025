# Email Notification Setup Guide

This guide covers setting up email notifications for CarbonConstruct using Resend.

## Prerequisites

1. **Resend Account**: Sign up at [https://resend.com](https://resend.com)
2. **Domain Verification**: Verify your domain at [https://resend.com/domains](https://resend.com/domains)
3. **API Key**: Create an API key at [https://resend.com/api-keys](https://resend.com/api-keys)

## Step 1: Configure Resend

### Create Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Complete email verification

### Verify Your Domain
1. Navigate to [https://resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain: `carbonconstruct.com.au`
4. Add the provided DNS records to your domain:
   - SPF Record
   - DKIM Record
   - DMARC Record
5. Wait for verification (usually 5-10 minutes)

### Generate API Key
1. Go to [https://resend.com/api-keys](https://resend.com/api-keys)
2. Click "Create API Key"
3. Name it "CarbonConstruct Production"
4. Select "Full Access" permissions
5. Copy the API key (you'll only see it once!)

## Step 2: Add API Key to Lovable Cloud

1. In your Lovable project, go to **Settings → Secrets**
2. Add a new secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key
3. Save the secret

## Step 3: Update Email Domain

Once your domain is verified, update the "from" address in the edge function:

**File**: `supabase/functions/send-email/index.ts`

Change line:
```typescript
from: "CarbonConstruct <noreply@carbonconstruct.com.au>",
```

To use your verified domain. Examples:
- `CarbonConstruct <hello@yourdomain.com>`
- `CarbonConstruct <noreply@yourdomain.com>`

## Step 4: Test Email Sending

### Test Welcome Email
```typescript
import { supabase } from "@/integrations/supabase/client";

const testWelcomeEmail = async () => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      type: 'welcome',
      to: 'your-email@example.com',
      data: {
        appUrl: window.location.origin
      }
    }
  });
  
  if (error) console.error('Error:', error);
  else console.log('Success:', data);
};
```

### Test Subscription Email
```typescript
const testSubscriptionEmail = async () => {
  const { data, error } = await supabase.functions.invoke('send-email', {
    body: {
      type: 'subscription_updated',
      to: 'your-email@example.com',
      data: {
        tierName: 'Pro',
        features: [
          'Unlimited projects',
          'Advanced analytics',
          'Priority support'
        ],
        renewalDate: 'January 15, 2025',
        appUrl: window.location.origin
      }
    }
  });
  
  if (error) console.error('Error:', error);
  else console.log('Success:', data);
};
```

## Email Types Supported

### 1. Welcome Email (`welcome`)
Sent when a new user signs up.

**Data required**:
```typescript
{
  type: 'welcome',
  to: 'user@example.com',
  data: {
    appUrl: 'https://your-app.com'
  }
}
```

### 2. Subscription Updated (`subscription_updated`)
Sent when user upgrades/downgrades subscription.

**Data required**:
```typescript
{
  type: 'subscription_updated',
  to: 'user@example.com',
  data: {
    tierName: 'Pro',
    features: ['Feature 1', 'Feature 2'],
    renewalDate: 'January 15, 2025',
    appUrl: 'https://your-app.com'
  }
}
```

### 3. Subscription Cancelled (`subscription_cancelled`)
Sent when user cancels subscription.

**Data required**:
```typescript
{
  type: 'subscription_cancelled',
  to: 'user@example.com',
  data: {
    endDate: 'January 15, 2025',
    appUrl: 'https://your-app.com'
  }
}
```

### 4. Trial Ending (`trial_ending`)
Sent 3 days before trial ends.

**Data required**:
```typescript
{
  type: 'trial_ending',
  to: 'user@example.com',
  data: {
    daysLeft: 3,
    endDate: 'January 15, 2025',
    appUrl: 'https://your-app.com'
  }
}
```

### 5. Report Generated (`report_generated`)
Sent when emissions report is generated.

**Data required**:
```typescript
{
  type: 'report_generated',
  to: 'user@example.com',
  data: {
    projectName: 'Sydney Office Tower',
    totalEmissions: '1,234.56',
    scope1: '234.56',
    scope2: '345.67',
    scope3: '654.33',
    complianceStatus: 'Compliant',
    appUrl: 'https://your-app.com'
  }
}
```

## Integration Points

### Auth Flow - Welcome Email
**File**: `src/contexts/AuthContext.tsx`

Add after successful signup:
```typescript
// Send welcome email
supabase.functions.invoke('send-email', {
  body: {
    type: 'welcome',
    to: user.email,
    data: {
      appUrl: window.location.origin
    }
  }
}).catch(err => console.error('Failed to send welcome email:', err));
```

### Subscription Changes - Stripe Webhook
**File**: `supabase/functions/stripe-webhook/index.ts`

Update the webhook handlers to trigger emails:
```typescript
// After subscription updated
await supabase.functions.invoke('send-email', {
  body: {
    type: 'subscription_updated',
    to: customer.email,
    data: {
      tierName: subscription.items.data[0].price.nickname,
      features: ['Feature list from tier'],
      renewalDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
      appUrl: 'https://your-app.com'
    }
  }
});
```

### Report Generation
**File**: `src/pages/Reports.tsx`

Add after report is generated:
```typescript
// Send report notification
await supabase.functions.invoke('send-email', {
  body: {
    type: 'report_generated',
    to: user.email,
    data: {
      projectName: project.name,
      totalEmissions: reportData.total.toFixed(2),
      scope1: reportData.scope1.toFixed(2),
      scope2: reportData.scope2.toFixed(2),
      scope3: reportData.scope3.toFixed(2),
      complianceStatus: reportData.compliant ? 'Compliant' : 'Non-Compliant',
      appUrl: window.location.origin
    }
  }
});
```

## Monitoring & Troubleshooting

### Check Email Logs
1. Go to [https://resend.com/emails](https://resend.com/emails)
2. View sent emails, delivery status, and any errors
3. Check bounce and complaint rates

### Common Issues

#### Domain Not Verified
**Error**: "Domain not verified"
**Solution**: Complete DNS setup and wait for verification

#### Invalid API Key
**Error**: "Invalid API key"
**Solution**: Regenerate API key and update in Lovable Cloud secrets

#### Rate Limiting
**Error**: "Rate limit exceeded"
**Solution**: Upgrade Resend plan or reduce email frequency

#### Emails in Spam
**Solution**: 
- Ensure SPF, DKIM, DMARC records are correct
- Add unsubscribe links
- Warm up your domain by sending gradually increasing volumes

## Production Checklist

- [ ] Resend account created
- [ ] Domain verified with DNS records
- [ ] API key generated and added to secrets
- [ ] "From" email address updated to verified domain
- [ ] Welcome email tested
- [ ] Subscription emails tested
- [ ] Report emails tested
- [ ] Email monitoring dashboard reviewed
- [ ] Unsubscribe functionality added (optional)
- [ ] Email preferences page created (optional)

## Resend Pricing

**Free Tier**:
- 100 emails/day
- 3,000 emails/month
- Perfect for development and small-scale production

**Pro Tier** ($20/month):
- 50,000 emails/month
- $1 per additional 1,000 emails
- Better for production

## Security Notes

1. **Never commit API keys**: Always use Lovable Cloud secrets
2. **Validate recipients**: Ensure email addresses are verified before sending
3. **Rate limiting**: Implement application-level rate limiting
4. **Bounce handling**: Monitor and handle bounced emails
5. **Unsubscribe**: Add unsubscribe links to comply with regulations

## Support

- **Resend Docs**: [https://resend.com/docs](https://resend.com/docs)
- **Resend Status**: [https://status.resend.com](https://status.resend.com)
- **Resend Support**: support@resend.com
