# Stripe Integration Testing Guide

## ✅ Implementation Status

### Completed Components

1. **Database Schema**
   - ✅ subscription_tiers table with Free, Pro, Business, Enterprise tiers
   - ✅ user_subscriptions table tracking active subscriptions
   - ✅ usage_metrics table for tracking usage

2. **Edge Functions**
   - ✅ `create-checkout` - Creates Stripe checkout sessions
   - ✅ `check-subscription` - Verifies subscription status
   - ✅ `customer-portal` - Manages subscription via Stripe portal
   - ✅ `stripe-webhook` - Handles all Stripe events

3. **Frontend Components**
   - ✅ CheckoutButton - Initiates checkout flow
   - ✅ ManageSubscriptionButton - Opens customer portal
   - ✅ UpgradeModal - Prompts users to upgrade
   - ✅ Pricing page with Stripe pricing table embed
   - ✅ Usage tracking integrated in ProjectSelector and Reports

4. **Stripe Configuration**
   - ✅ Products created: Professional (monthly & yearly), Business (monthly & yearly)
   - ✅ Price IDs updated in database
   - ✅ Webhook endpoint: `https://htruyldcvakkzpykfoxq.supabase.co/functions/v1/stripe-webhook`

## 🧪 Testing Checklist

### 1. Stripe Dashboard Configuration

**Before Testing:**
- [ ] Ensure Stripe webhook is configured:
  - URL: `https://htruyldcvakkzpykfoxq.supabase.co/functions/v1/stripe-webhook`
  - Events to listen for:
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
    - `customer.subscription.trial_will_end`

- [ ] Verify Customer Portal is activated:
  - Go to Stripe Dashboard → Settings → Customer Portal
  - Enable subscription management features
  - Set return URL to your app

### 2. Free Tier Testing

**Test Flow:**
1. [ ] Sign up as a new user
2. [ ] Verify you're on "Free" tier (check `/pricing` page)
3. [ ] Create projects (should stop at 2 projects)
4. [ ] Try to create 3rd project - should show upgrade modal
5. [ ] Download reports (should stop at 2 per month)
6. [ ] Try LCA calculator - should show upgrade prompt

**Expected Behavior:**
- Default tier: Free
- Projects limit: 2
- Reports per month: 2
- LCA calculations: Blocked

### 3. Checkout Flow Testing

**Test Flow:**
1. [ ] Click "Upgrade to Pro" on pricing page
2. [ ] Verify checkout session opens in new tab
3. [ ] Use Stripe test card: `4242 4242 4242 4242`
4. [ ] Complete checkout with test data:
   - Any future expiry date (e.g., 12/34)
   - Any 3-digit CVC
   - Any postal code

5. [ ] After successful payment:
   - [ ] Check Stripe Dashboard for new subscription
   - [ ] Verify webhook received (check Edge Function logs)
   - [ ] Refresh app - tier should update to "Pro"
   - [ ] Verify unlimited projects can be created
   - [ ] Verify unlimited reports can be downloaded
   - [ ] Verify LCA calculator is accessible

**Expected Behavior:**
- Checkout opens in new tab
- 14-day trial starts
- Subscription status updates in database
- Limits change to unlimited

### 4. Subscription Management Testing

**Test Flow:**
1. [ ] Go to `/settings` or `/pricing` page
2. [ ] Click "Manage Subscription" button
3. [ ] Verify Stripe Customer Portal opens
4. [ ] Test portal features:
   - [ ] Update payment method
   - [ ] View invoices
   - [ ] Cancel subscription
   - [ ] Reactivate subscription (if cancelled)

**Expected Behavior:**
- Portal opens successfully
- All features are accessible
- Changes reflect in your app

### 5. Webhook Testing

**Test in Stripe Dashboard:**
1. [ ] Go to Developers → Webhooks
2. [ ] Click your webhook endpoint
3. [ ] Click "Send test webhook"
4. [ ] Test these events:
   - [ ] `customer.subscription.updated`
   - [ ] `invoice.payment_succeeded`
   - [ ] `customer.subscription.deleted`

**Check Results:**
- [ ] View Edge Function logs: Lovable → Cloud → Edge Functions → stripe-webhook
- [ ] Verify events are processed successfully
- [ ] Check database updates in subscription_tiers table

### 6. Trial Period Testing

**Test Flow:**
1. [ ] Start new subscription (gets 14-day trial)
2. [ ] Verify trial_end date is set in user_subscriptions
3. [ ] Check subscription status shows "Trial Active"
4. [ ] Access all Pro features during trial
5. [ ] Simulate trial end (manually update database or wait)
6. [ ] Verify trial expiry behavior

**Expected Behavior:**
- Trial lasts 14 days
- Full access during trial
- Auto-charges after trial ends
- Downgrades to Free if payment fails

### 7. Usage Tracking Testing

**Test Flow:**
1. [ ] Create multiple projects
2. [ ] Check current usage displays correctly
3. [ ] Download multiple reports
4. [ ] Verify usage increments in database
5. [ ] Check usage resets at month start

**Database Verification:**
```sql
-- Check current usage
SELECT * FROM usage_metrics WHERE user_id = 'your-user-id';

-- Check subscription status
SELECT * FROM user_subscriptions WHERE user_id = 'your-user-id';
```

### 8. Upgrade/Downgrade Testing

**Test Flow:**
1. [ ] Subscribe to Pro
2. [ ] Upgrade to Business
3. [ ] Verify plan changes immediately
4. [ ] Check proration is applied
5. [ ] Downgrade back to Pro
6. [ ] Cancel subscription
7. [ ] Verify access until period end
8. [ ] Verify downgrade to Free after period end

## 🐛 Common Issues & Solutions

### Issue: Checkout doesn't open
**Solution:** Check console logs, verify price IDs match Stripe

### Issue: Subscription doesn't update after payment
**Solution:** 
- Check webhook is configured correctly
- View Edge Function logs for errors
- Verify STRIPE_WEBHOOK_SECRET is set

### Issue: Usage limits not enforcing
**Solution:**
- Check `canPerformAction` is called before actions
- Verify limits in subscription_tiers table
- Check usage_metrics entries

### Issue: Customer Portal doesn't open
**Solution:**
- Activate Customer Portal in Stripe Dashboard
- Verify customer exists in Stripe
- Check Edge Function logs

## 📊 Success Criteria

✅ All checkout flows complete successfully
✅ Webhooks process without errors
✅ Subscription status updates in real-time
✅ Usage limits enforce correctly
✅ Customer Portal functions properly
✅ Trial periods work as expected
✅ Database records are accurate

## 🚀 Next Phase: Production Checklist

Once testing is complete:

1. **Security**
   - [ ] Review RLS policies on all tables
   - [ ] Ensure webhook secret is secure
   - [ ] Verify no sensitive data in logs

2. **Monitoring**
   - [ ] Set up Stripe webhook monitoring
   - [ ] Configure failed payment alerts
   - [ ] Track subscription metrics

3. **User Experience**
   - [ ] Add success messages for upgrades
   - [ ] Implement email notifications for payments
   - [ ] Create subscription confirmation emails

4. **Documentation**
   - [ ] Document for users how to manage subscriptions
   - [ ] Create FAQ for billing questions
   - [ ] Add troubleshooting guide

## 📞 Support Resources

- Stripe Dashboard: https://dashboard.stripe.com
- Edge Function Logs: Lovable → Cloud → Edge Functions
- Database: Lovable → Cloud → Database
- Test Cards: https://stripe.com/docs/testing
