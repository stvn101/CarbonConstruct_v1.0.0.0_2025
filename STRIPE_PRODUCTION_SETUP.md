# Stripe Production Setup Guide

## Overview
This guide covers the critical steps to configure Stripe for production deployment of CarbonConstruct.

---

## 1. Switch to Live Mode

### In Stripe Dashboard
1. Navigate to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle from **Test Mode** to **Live Mode** (top right corner)
3. Complete Stripe account activation if prompted:
   - Business details
   - Bank account information
   - Identity verification

---

## 2. Configure Production Webhook

### Create Webhook Endpoint
1. Go to **Developers** → **Webhooks** in Stripe Dashboard (Live Mode)
2. Click **Add endpoint**
3. Set endpoint URL:
   ```
   https://htruyldcvakkzpykfoxq.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.trial_will_end`

5. Click **Add endpoint**
6. **CRITICAL**: Copy the **Signing Secret** (starts with `whsec_`)

### Update Webhook Secret
1. In Lovable, navigate to your project
2. Go to **Cloud** → **Secrets**
3. Update `STRIPE_WEBHOOK_SECRET` with the new live mode signing secret
4. Save the secret

---

## 3. Update Stripe API Keys

### Get Live Mode Keys
1. In Stripe Dashboard (Live Mode), go to **Developers** → **API Keys**
2. Copy the **Publishable Key** (starts with `pk_live_`)
3. Reveal and copy the **Secret Key** (starts with `sk_live_`)

### Update in Lovable Cloud
1. Navigate to **Cloud** → **Secrets**
2. Update `STRIPE_SECRET_KEY` with your live secret key
3. Update `SUPABASE_PUBLISHABLE_KEY` if using Stripe publishable key directly
4. Save all changes

---

## 4. Configure Customer Portal (Production)

### Activate Portal
1. In Stripe Dashboard (Live Mode), go to **Settings** → **Billing** → **Customer Portal**
2. Click **Activate** if not already active

### Configure Portal Settings
1. **Business Information**:
   - Business name: `CarbonConstruct`
   - Support email: Your production support email
   - Support phone: Optional
   - Terms of service: Add link when ready
   - Privacy policy: Add link when ready

2. **Functionality**:
   - ✅ Enable "Customers can update payment methods"
   - ✅ Enable "Customers can update subscriptions"
   - Configure cancellation options:
     - ✅ "Allow cancellation"
     - Set cancellation behavior: "Cancel immediately" or "At period end"
     - Optional: Cancellation reasons survey
   - ✅ Enable "Customers can view invoices"

3. **Products**:
   - Ensure your Pro tier product is visible
   - Configure upgrade/downgrade options

4. **Branding**:
   - Upload logo (use CarbonConstruct logo)
   - Set brand colors
   - Customize button text if desired

5. Click **Save**

---

## 5. Verify Subscription Products & Prices

### Check Products
1. Go to **Products** → **Product Catalog** (Live Mode)
2. Verify your subscription tiers exist:
   - **Pro Tier**: Monthly subscription
   - Pricing should match your app

### Create Products if Needed
If products don't exist in live mode:
1. Click **Add product**
2. Set name: `CarbonConstruct Pro`
3. Set description
4. Add pricing:
   - Recurring: Monthly
   - Price: Your pricing (e.g., $49/month)
   - Currency: AUD (or your currency)
   - 14-day free trial
5. Copy the **Price ID** (starts with `price_`)
6. Update your code if the price ID changed

### Update Price IDs in Code
If your live mode price IDs differ from test mode:
1. Update `src/pages/Pricing.tsx` or wherever price IDs are stored
2. Update any hardcoded price IDs in checkout functions

---

## 6. Update Database (Subscription Tiers)

### Update Tier Records
If you have subscription tiers in the database:
1. Navigate to **Cloud** → **Database** → **subscription_tiers**
2. Update the `stripe_price_id` column with live mode price IDs
3. Verify tier limits and features are correct

---

## 7. Test Production Integration

### Pre-Deployment Checklist
Before going live, verify:

- [ ] Webhook endpoint is created and active in live mode
- [ ] `STRIPE_WEBHOOK_SECRET` is updated with live signing secret
- [ ] `STRIPE_SECRET_KEY` is updated with live secret key
- [ ] Customer Portal is activated and configured
- [ ] Products and prices exist in live mode
- [ ] Price IDs in code match live mode IDs
- [ ] Database tier records are updated (if applicable)

### Test with Real Payment
1. Use a real credit card (not test cards)
2. Complete a subscription purchase
3. Verify:
   - Checkout redirects correctly
   - Webhook events are received
   - User subscription is activated in database
   - Customer Portal link works
   - User can manage subscription

### Monitor Webhook Events
1. Go to **Developers** → **Webhooks** → Your production endpoint
2. Monitor incoming events
3. Check for any failures or errors
4. Review logs in Lovable Cloud → **Functions** → `stripe-webhook`

---

## 8. Security & Compliance

### Stripe Security
- [ ] Ensure HTTPS is enabled on your domain
- [ ] Verify webhook signature validation is working
- [ ] Never expose secret keys in frontend code
- [ ] Use environment variables for all keys

### Legal Requirements
- [ ] Add Terms of Service link to Customer Portal
- [ ] Add Privacy Policy link to Customer Portal
- [ ] Ensure compliance with payment regulations in your region
- [ ] Set up proper invoice and receipt emails

---

## 9. Monitoring & Maintenance

### Regular Checks
1. **Webhook Health**:
   - Monitor webhook delivery success rate
   - Set up alerts for webhook failures

2. **Failed Payments**:
   - Monitor `invoice.payment_failed` events
   - Set up email notifications for failed payments

3. **Subscription Metrics**:
   - Track MRR (Monthly Recurring Revenue)
   - Monitor churn rate
   - Track trial conversions

### Stripe Dashboard Monitoring
- Go to **Home** → View metrics dashboard
- Check for any unusual activity
- Review failed payments and disputes

---

## 10. Troubleshooting

### Webhook Not Receiving Events
1. Verify endpoint URL is correct
2. Check that events are selected in webhook configuration
3. Review Lovable Cloud function logs
4. Test webhook with Stripe CLI: `stripe listen --forward-to`

### Subscription Not Activating
1. Check `stripe-webhook` function logs
2. Verify `check-subscription` function is working
3. Check database `user_subscriptions` table
4. Verify RLS policies allow user access

### Customer Portal Issues
1. Ensure portal is activated in live mode
2. Verify `customer-portal` function uses live keys
3. Check function logs for errors
4. Test portal URL directly

---

## Support Resources

- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal Docs](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Lovable Cloud Functions Logs](https://lovable.dev) - Navigate to Cloud → Functions
- [Stripe Support](https://support.stripe.com/)

---

## Post-Launch Checklist

After successful production deployment:

- [ ] Send test purchase through the system
- [ ] Verify webhooks are processing correctly
- [ ] Test customer portal subscription management
- [ ] Monitor first real customer purchases
- [ ] Set up Stripe email notifications for your team
- [ ] Configure Stripe Radar for fraud prevention
- [ ] Set up proper accounting/bookkeeping integration
- [ ] Document any production-specific configurations

---

## Next Steps

Once Stripe production is configured:
1. ✅ Complete this guide
2. Populate emission factors database
3. Add legal pages (Privacy Policy, ToS)
4. Final end-to-end testing
5. Deploy to production domain
