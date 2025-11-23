# Google OAuth Setup Guide - CarbonConstruct

Complete guide for setting up Google OAuth authentication for your CarbonConstruct application.

## Prerequisites

1. A Google Cloud Platform account
2. Access to your Lovable Cloud backend settings
3. Your production domain or Lovable preview URL

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select an existing project
3. Name your project: "CarbonConstruct"
4. Click **"Create"**

## Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services → OAuth consent screen**
2. Select **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**

### Fill in the Consent Screen Details:

**App Information:**
- **App name**: CarbonConstruct
- **User support email**: YOUR_EMAIL@carbonconstruct.com.au
- **App logo**: Upload your CarbonConstruct logo (optional)

**App domain:**
- **Application home page**: Your production URL or Lovable domain
- **Privacy policy**: `https://YOUR_DOMAIN/privacy`
- **Terms of service**: `https://YOUR_DOMAIN/terms`

**Authorized domains:**
Add these domains (without http/https):
```
YOUR_DOMAIN.com.au
lovable.app
htruyldcvakkzpykfoxq.supabase.co
```

**Developer contact information:**
- Add your email address

**Scopes:**
Click **"Add or Remove Scopes"** and select:
- `../auth/userinfo.email`
- `../auth/userinfo.profile`
- `openid`

Click **"Save and Continue"**

## Step 3: Create OAuth Credentials

1. Navigate to **APIs & Services → Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**

### Configure the OAuth Client:

**Name**: CarbonConstruct Production

**Authorized JavaScript origins:**
Add ALL of these URLs (one per line):
```
https://loval-carbon-compass.lovable.app
https://YOUR_PRODUCTION_DOMAIN.com.au
http://localhost:5173
```

**Authorized redirect URIs:**
Add this Supabase callback URL:
```
https://htruyldcvakkzpykfoxq.supabase.co/auth/v1/callback
```

**CRITICAL**: This must be EXACTLY this URL. Do not modify it.

## Step 4: Get Your Credentials

After creating the OAuth client, you'll see a popup with:
- **Client ID**: Something like `123456789-abc.apps.googleusercontent.com`
- **Client Secret**: A long string like `GOCSPX-abc123xyz`

⚠️ **IMPORTANT**: Save these immediately! You'll only see them once.

## Step 5: Configure in Lovable Cloud

1. Open your Lovable project
2. Go to Settings → Integrations → Lovable Cloud
3. Click to open the backend interface
4. Navigate to **Authentication → Providers → Google**
5. Toggle **"Enable Google provider"**
6. Enter your credentials:
   - **Client ID**: Paste from Step 4
   - **Client Secret**: Paste from Step 4
7. Click **"Save"**

## Step 6: Test the Integration

### Test on Staging:
1. Go to your Lovable preview URL: `https://loval-carbon-compass.lovable.app/auth`
2. Click **"Continue with Google"**
3. Select your Google account
4. Authorize the app
5. You should be redirected back to the app, signed in

### Test on Production:
1. After deploying to your custom domain
2. Go to `https://YOUR_DOMAIN.com.au/auth`
3. Test the Google sign-in flow
4. Verify users are created in your database

## Required Email Configuration

Google requires these email addresses/scopes:

### OAuth Scopes (Already configured):
- ✅ `https://www.googleapis.com/auth/userinfo.email`
- ✅ `https://www.googleapis.com/auth/userinfo.profile`
- ✅ `openid`

### Email Addresses to Add:
You need to configure these in your Google Cloud project:

**Developer Contact Information:**
- Your primary admin email: `admin@carbonconstruct.com.au`
- Your support email: `support@carbonconstruct.com.au`

**User Support Email:**
- The email shown to users in the consent screen: `support@carbonconstruct.com.au`

## Domain Redirect Configuration

Since you mentioned redirecting your domain to the Lovable address:

### Option A: Custom Domain (Recommended)
1. In Lovable, go to **Settings → Domains**
2. Click **"Connect Domain"**
3. Add your domain: `carbonconstruct.com.au`
4. Follow the DNS instructions to point to Lovable
5. Update Google OAuth with your custom domain

### Option B: Permanent Redirect
If you're using a permanent redirect from your domain to Lovable:

**Update OAuth URLs to include both:**
```
https://carbonconstruct.com.au
https://loval-carbon-compass.lovable.app
```

⚠️ **IMPORTANT**: Redirects can cause OAuth issues. Using a custom domain in Lovable is better.

## Testing Checklist

- [ ] Created Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Added all authorized domains
- [ ] Created OAuth client ID
- [ ] Saved Client ID and Client Secret
- [ ] Configured in Lovable Cloud backend
- [ ] Added email addresses to Google Cloud
- [ ] Tested sign-in on staging
- [ ] Tested sign-in on production
- [ ] Verified users appear in database
- [ ] Tested sign-out functionality

## Common Issues

### "redirect_uri_mismatch" Error
**Cause**: The redirect URI doesn't exactly match what's in Google Cloud Console.
**Fix**: Ensure you added exactly: `https://htruyldcvakkzpykfoxq.supabase.co/auth/v1/callback`

### "Access blocked: This app's request is invalid"
**Cause**: JavaScript origins don't match your app URL.
**Fix**: Add your exact app URL to Authorized JavaScript origins (including http/https).

### "Error 400: redirect_uri_mismatch" on localhost
**Cause**: Missing localhost in authorized origins.
**Fix**: Add `http://localhost:5173` to Authorized JavaScript origins.

### Users can't sign in after deployment
**Cause**: Production URL not in authorized origins.
**Fix**: Add your production domain to both:
- Authorized JavaScript origins
- Authorized domains (in consent screen)

### "Requested path is invalid"
**Cause**: Site URL and Redirect URLs not configured in Supabase/Lovable Cloud.
**Fix**: Lovable Cloud handles this automatically. If you see this error:
1. Open Lovable Cloud backend
2. Go to Authentication → URL Configuration
3. Verify Site URL and Redirect URLs are set correctly

## Security Best Practices

1. **Never commit** Client ID or Client Secret to version control
2. **Rotate secrets** if they're ever exposed
3. **Monitor** OAuth logs in Google Cloud Console
4. **Review** authorized apps periodically
5. **Test** OAuth flow after any domain changes

## Production Deployment

Before going live:

1. ✅ Update Google OAuth with production domain
2. ✅ Test OAuth flow on production
3. ✅ Verify all redirect URIs work
4. ✅ Check consent screen displays correctly
5. ✅ Test with multiple Google accounts
6. ✅ Verify user data saves to database

## URLs Reference

**Your Project:**
- Lovable Staging: `https://loval-carbon-compass.lovable.app`
- Supabase Project ID: `htruyldcvakkzpykfoxq`
- Callback URL: `https://htruyldcvakkzpykfoxq.supabase.co/auth/v1/callback`

**Google Cloud:**
- Console: https://console.cloud.google.com/
- OAuth Consent: https://console.cloud.google.com/apis/credentials/consent
- Credentials: https://console.cloud.google.com/apis/credentials

## Support

If you encounter issues:
1. Check Google Cloud Console → APIs & Services → OAuth consent screen → Status
2. Review Lovable Cloud backend logs
3. Check browser console for error messages
4. Verify all URLs match exactly (no trailing slashes, correct http/https)

---

**Last Updated**: 2025-11-23
**Supabase Project**: htruyldcvakkzpykfoxq
**Google OAuth Status**: Ready for configuration
