# Supabase Functions Deployment Guide

## Overview

This project uses Supabase Edge Functions (Deno-based serverless functions) that are automatically deployed via GitHub Actions.

## Automatic Deployment

The `.github/workflows/supabase.yml` workflow automatically deploys all Edge Functions when:

1. Changes are pushed to the `main` branch in the `supabase/` directory
2. The workflow is manually triggered via GitHub Actions UI

### Deployment Trigger Paths

The workflow monitors these paths:
- `supabase/**` - Any changes to functions, migrations, or config
- `.github/workflows/supabase.yml` - Changes to the deployment workflow itself

## Manual Deployment

To manually deploy functions:

1. Navigate to **Actions** tab in GitHub
2. Select **Deploy Supabase Functions** workflow
3. Click **Run workflow**
4. Choose the branch (typically `main`)
5. Optionally check "Force deploy all functions"
6. Click **Run workflow**

## Required Secrets

The workflow requires the following GitHub secret to be configured:

### SUPABASE_ACCESS_TOKEN

**Description:** Personal access token for Supabase CLI authentication

**How to obtain:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your profile → Account Settings
3. Navigate to **Access Tokens**
4. Click **Generate New Token**
5. Give it a descriptive name (e.g., "GitHub Actions Deploy")
6. Copy the token (you won't be able to see it again)

**How to configure:**
1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SUPABASE_ACCESS_TOKEN`
5. Value: Paste your Supabase access token
6. Click **Add secret**

## Project Configuration

The workflow uses the project ID from `supabase/config.toml`:

```toml
project_id = "htruyldcvakkzpykfoxq"
```

This ID links the deployment to the correct Supabase project.

## Deployed Functions

The repository contains 43+ Edge Functions in `supabase/functions/`:

### Authentication & Security
- `log-security-event` - Security event logging
- `log-error` - Error logging
- `log-performance` - Performance monitoring
- `log-analytics` - Analytics tracking
- `health-check` - Service health monitoring

### Material Database
- `import-materials` - Import materials
- `import-nabers-epd` - Import NABERS EPD data
- `import-nger-data` - Import NGER materials
- `import-ice-materials` - Import ICE database
- `import-icm-materials` - Import ICM database
- `import-bluescope-epd` - Import BlueScope EPD
- `import-epic-materials` - Import EPIC materials
- `import-epd-materials` - Import EPD materials
- `search-ec3-materials` - Search EC3 database

### Validation & Compliance
- `validate-materials` - Validate material data
- `validate-calculation` - Validate carbon calculations
- `validate-eco-compliance` - Validate eco compliance
- `check-epd-registry` - Check EPD registry
- `check-epd-expiry` - Check EPD expiration dates
- `send-epd-reminders` - Send EPD expiry reminders

### User Management
- `export-user-data` - Export user data (GDPR)
- `schedule-deletion` - Schedule account deletion
- `cancel-deletion` - Cancel account deletion
- `suspend-account` - Suspend user account
- `delete-account` - Delete user account

### AI & Processing
- `chat` - AI chat functionality
- `chat-boq-import` - AI BOQ import
- `parse-boq` - Parse Bill of Quantities
- `carbon-recommendations` - AI carbon recommendations
- `extract-pdf-text` - Extract text from PDFs

### Payments & Subscriptions
- `create-checkout` - Create Stripe checkout
- `check-subscription` - Check subscription status
- `customer-portal` - Stripe customer portal
- `stripe-webhook` - Stripe webhook handler

### Communication
- `send-email` - Send transactional emails
- `send-contact-email` - Send contact form emails
- `send-audit-report` - Send audit reports
- `send-campaign-email` - Send marketing emails

### Data Management
- `process-epd-upload` - Process EPD file uploads
- `migrate-emissions` - Migrate emissions data
- `inspect-external-schema` - Inspect external schemas

## Function Configuration

Each function's JWT verification setting is defined in `supabase/config.toml`:

```toml
[functions.health-check]
verify_jwt = false  # Public endpoint

[functions.import-materials]
verify_jwt = true   # Requires authentication
```

## Deployment Process

The workflow performs these steps:

1. **Checkout Code** - Clones the repository
2. **Setup Supabase CLI** - Installs the latest Supabase CLI
3. **Link Project** - Links to the Supabase project using the project ID
4. **Deploy Functions** - Deploys all functions from `supabase/functions/`
5. **Verify Deployment** - Tests the health-check endpoint to verify deployment
6. **Summary** - Generates a deployment summary

## Monitoring Deployments

### View Deployment Status

1. Go to **Actions** tab in GitHub
2. Click on the latest **Deploy Supabase Functions** workflow run
3. View logs for each step

### Check Function Status

After deployment, functions are available at:
```
https://htruyldcvakkzpykfoxq.supabase.co/functions/v1/<function-name>
```

### Test Health Check

```bash
curl https://htruyldcvakkzpykfoxq.supabase.co/functions/v1/health-check
```

## Troubleshooting

### Deployment Fails with Authentication Error

**Problem:** `Error: Invalid access token`

**Solution:**
1. Verify `SUPABASE_ACCESS_TOKEN` secret is set correctly
2. Ensure the token hasn't expired
3. Generate a new token if necessary

### Function Not Found After Deployment

**Problem:** Function returns 404 after deployment

**Solution:**
1. Check the deployment logs for errors
2. Verify the function exists in `supabase/functions/`
3. Wait 1-2 minutes for CDN propagation
4. Check `supabase/config.toml` for function configuration

### Deployment Times Out

**Problem:** Deployment takes too long or times out

**Solution:**
1. Check if all functions are necessary
2. Consider deploying functions individually if needed
3. Check Supabase dashboard for service status

## Local Development

To test functions locally:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test a function
curl http://localhost:54321/functions/v1/health-check
```

## Best Practices

1. **Test Locally First** - Always test functions locally before deploying
2. **Small Changes** - Deploy frequently with small, tested changes
3. **Monitor Logs** - Check deployment logs after each deployment
4. **Version Control** - Never edit functions directly in Supabase dashboard
5. **Secrets Management** - Use environment variables for sensitive data
6. **Error Handling** - Implement proper error handling in all functions
7. **Documentation** - Document function purpose and API in comments

## Related Documentation

- [Edge Functions Guide](.github/instructions/edge-functions.instructions.md)
- [Supabase Patterns](.github/prompt-snippets/supabase-patterns.md)
- [Security Instructions](.github/instructions/security.instructions.md)

## Support

For issues with:
- **GitHub Actions**: Check Actions tab logs
- **Supabase CLI**: Visit [Supabase CLI docs](https://supabase.com/docs/guides/cli)
- **Edge Functions**: Visit [Edge Functions docs](https://supabase.com/docs/guides/functions)
