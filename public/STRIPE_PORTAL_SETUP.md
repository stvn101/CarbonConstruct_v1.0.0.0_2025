# Stripe Customer Portal Setup Guide

## Overview
The Stripe Customer Portal allows your subscribers to manage their subscriptions, update payment methods, view invoices, and cancel subscriptions directly without contacting support.

## Setup Instructions

### Step 1: Access Stripe Dashboard
1. Go to [https://dashboard.stripe.com/settings/billing/portal](https://dashboard.stripe.com/settings/billing/portal)
2. Log in to your Stripe account if prompted

### Step 2: Activate the Customer Portal
1. Click **"Activate"** to enable the Customer Portal
2. Review the default settings

### Step 3: Configure Portal Features

#### Subscription Management
Enable the following features:
- ✅ **Cancel subscriptions** - Allow customers to cancel their subscriptions
- ✅ **Pause subscriptions** - Allow customers to pause subscriptions (optional)
- ✅ **Update subscriptions** - Allow customers to switch between plans
- ✅ **Update payment methods** - Allow customers to add/remove payment methods

#### Cancellation Settings (Recommended)
- Select: **"Customers can cancel and pause subscriptions at any time"**
- Enable: **"Cancel at period end"** - Subscriptions remain active until the end of the billing period
- Optional: Enable cancellation feedback survey to understand why customers cancel

#### Invoice History
- ✅ Enable **"Invoice history"** - Customers can view and download past invoices

#### Business Information
Configure your business details:
- **Business name**: CarbonConstruct
- **Support email**: Your support email address
- **Support phone**: Your support phone number (optional)
- **Website**: Your website URL

#### Branding (Optional)
- Upload your company logo
- Customize colors to match your brand
- Set custom link text

### Step 4: Configure Return URL
The return URL is already configured in your edge function:
```
return_url: ${origin}/settings
```
This will redirect customers back to your Settings page after they finish managing their subscription.

### Step 5: Test the Portal
1. In your CarbonConstruct app, go to **Settings**
2. Click **"Manage Subscription"**
3. Verify that the portal opens correctly
4. Test the following:
   - View subscription details
   - Update payment method
   - View invoice history
   - Cancel subscription (test in test mode)

### Step 6: Go Live
Once you've tested everything in test mode:
1. Switch your Stripe account to **Live mode**
2. Verify the webhook is configured for live mode
3. Test the portal again with a live payment method

## Features Available in Customer Portal

### For Customers
- View current subscription and plan details
- Update payment methods (credit/debit cards)
- View billing history and download invoices
- Upgrade or downgrade subscription plans
- Cancel subscription (remains active until period end)
- Update billing information

### Portal Configuration Options
You can customize:
- Which features are available to customers
- Cancellation flow (immediate vs. at period end)
- Proration behavior when switching plans
- Custom messaging and branding

## Security Notes
- The Customer Portal is hosted by Stripe (secure by default)
- Your edge function generates a time-limited portal session URL
- Sessions expire after a short period for security
- All payment data is handled securely by Stripe (PCI compliant)

## Troubleshooting

### Portal button doesn't work
- Check that the `customer-portal` edge function is deployed
- Verify the customer has an active Stripe customer ID
- Check browser console for errors

### Customer can't see their subscription
- Ensure the customer has an active subscription in Stripe
- Verify the email addresses match between Supabase auth and Stripe

### Changes not reflecting immediately
- Subscription changes are processed via webhooks
- Check webhook delivery in Stripe Dashboard
- Verify webhook endpoint is receiving events

## Support
For Stripe-specific questions, refer to:
- [Stripe Customer Portal Documentation](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Support](https://support.stripe.com/)
