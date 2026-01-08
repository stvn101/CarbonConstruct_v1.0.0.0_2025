# Quick Setup Guide: Supabase Workflow

## ⚠️ Important: Required Secret

The Supabase deployment workflow requires **one GitHub secret** to be configured before it can run successfully.

## Setup Steps

### 1. Get Your Supabase Access Token

1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Click your profile icon (top right) → **Account Settings**
3. In the left sidebar, click **Access Tokens**
4. Click **Generate New Token**
5. Name it: `GitHub Actions Deploy`
6. Select appropriate permissions (needs deploy access)
7. Click **Generate Token**
8. **Copy the token immediately** (you won't see it again!)

### 2. Add Secret to GitHub

1. Go to your repository: https://github.com/stvn101/CarbonConstruct_v1.0.0.0_2025
2. Click **Settings** tab
3. In left sidebar: **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `SUPABASE_ACCESS_TOKEN`
6. Value: Paste the token you copied
7. Click **Add secret**

### 3. Verify Setup

Once the secret is added:

1. Go to **Actions** tab
2. Click **Deploy Supabase Functions** workflow
3. Click **Run workflow** (top right)
4. Select `main` branch
5. Click **Run workflow**

The workflow should now run successfully!

## What the Workflow Does

✅ **Automatically deploys** when you push changes to `supabase/` directory on `main` branch
✅ **Deploys all 43 Edge Functions** to Supabase
✅ **Verifies deployment** by testing the health-check endpoint
✅ **Provides summary** of deployment in GitHub Actions

## Troubleshooting

### Error: "Invalid access token"
- Check that `SUPABASE_ACCESS_TOKEN` is set correctly
- Generate a new token if the old one expired
- Ensure the token has deployment permissions

### Error: "Project not found"
- Verify the project ID in `supabase/config.toml` is correct
- Check that your access token has access to this project

### Functions not accessible after deployment
- Wait 1-2 minutes for CDN propagation
- Check Supabase dashboard for function status
- Review deployment logs in GitHub Actions

## Next Steps

See [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) for:
- Complete function list
- Local development setup
- Best practices
- Advanced troubleshooting

## Questions?

Check the deployment logs in GitHub Actions for detailed error messages.
