# CI Test User Setup Guide

This guide documents the required environment variables and GitHub secrets for running E2E authentication tests in CI/CD.

## Overview

The E2E test suite includes comprehensive authentication tests that require a dedicated test user account. This ensures tests can validate login flows, protected routes, and session management without affecting production user data.

## Required GitHub Secrets

Add these secrets to your GitHub repository settings:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `TEST_USER_EMAIL` | Email for CI test user | `test-ci@carbonconstruct.com.au` |
| `TEST_USER_PASSWORD` | Password for CI test user | `SecureTestP@ss2024!` |

### Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the appropriate value

## Creating the CI Test User Account

### Step 1: Create the Account

1. Navigate to `https://carbonconstruct.com.au/auth`
2. Click **Sign Up**
3. Enter the following details:
   - **Email:** `test-ci@carbonconstruct.com.au`
   - **Password:** Use a strong password (min 8 chars, uppercase, lowercase, number, special char)
4. Complete the sign-up process

### Step 2: Verify the Account

- If email confirmation is enabled, verify the email address
- If auto-confirm is enabled, the account is ready immediately

### Step 3: Configure Account Permissions

The CI test user should have **limited permissions**:
- ✅ Basic user access (Free tier)
- ❌ No admin privileges
- ❌ No access to production data

## Local Development Setup

For running authenticated tests locally, create a `.env.test` file (do NOT commit this):

```bash
# .env.test - Local test configuration
TEST_USER_EMAIL=test-ci@carbonconstruct.com.au
TEST_USER_PASSWORD=YourSecurePassword123!
```

Then run tests with:

```bash
# Load env vars and run tests
export $(cat .env.test | xargs) && npx playwright test auth-comprehensive
```

Or on Windows PowerShell:

```powershell
# Load env vars and run tests
Get-Content .env.test | ForEach-Object { $var = $_.Split('='); [System.Environment]::SetEnvironmentVariable($var[0], $var[1]) }
npx playwright test auth-comprehensive
```

## Test Categories

### Public Tests (No Auth Required)

These tests run without credentials and validate:
- Login form validation
- Password strength requirements
- Error message display
- Public route accessibility

```bash
npx playwright test auth-comprehensive --grep "Public Auth"
```

### Authenticated Tests (Requires Credentials)

These tests require valid credentials and validate:
- Successful login/logout flows
- Protected route access
- Session management
- Account status checks

```bash
npx playwright test auth-comprehensive --grep "@authenticated"
```

## CI/CD Workflow

The GitHub Actions workflow runs tests in two phases:

1. **Public E2E Tests** - No secrets required
2. **Authenticated E2E Tests** - Uses `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` secrets
3. **Comprehensive Auth Tests** - Full authentication test suite

### Workflow Configuration

The CI workflow is configured in `.github/workflows/ci.yml`:

```yaml
e2e-auth-comprehensive:
  name: E2E Auth Comprehensive Tests
  runs-on: ubuntu-latest
  steps:
    # ... setup steps ...
    - name: Run comprehensive auth E2E tests
      run: npx playwright test auth-comprehensive --project=chromium
      env:
        CI: true
        TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
        TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
```

## Security Considerations

### ⚠️ Important Security Notes

1. **Never commit credentials** - All secrets must be stored in GitHub Secrets or local `.env.test` files (gitignored)
2. **Use unique password** - The CI test user password should be unique and not used elsewhere
3. **Limited permissions** - CI test user should have minimal permissions (Free tier only)
4. **Rotate credentials** - Periodically rotate the test user password
5. **Monitor usage** - Review test user activity in production logs

### Credential Rotation

To rotate the CI test user password:

1. Log into `https://carbonconstruct.com.au/auth` with the test account
2. Navigate to Settings → Change Password
3. Update the password
4. Update the `TEST_USER_PASSWORD` GitHub secret
5. Verify CI tests still pass

## Troubleshooting

### Tests Fail with "Invalid credentials"

- Verify the test user account exists
- Check GitHub secrets are correctly set
- Ensure password hasn't been changed without updating secrets

### Tests Fail with "Rate limited"

- The test user may have triggered rate limiting
- Wait 1-5 minutes before retrying
- Check if failed login attempts accumulated

### Tests Fail with "Session expired"

- Session timeout may have occurred during test
- Tests should handle re-authentication automatically
- Check session timeout configuration

### Environment Variables Not Loading

```bash
# Verify env vars are set
echo $TEST_USER_EMAIL
echo $TEST_USER_PASSWORD

# Or in Node.js
console.log(process.env.TEST_USER_EMAIL);
```

## Test User Account Details

| Property | Value |
|----------|-------|
| Email | `test-ci@carbonconstruct.com.au` |
| Account Type | Free tier |
| Purpose | CI/CD E2E testing only |
| Admin Access | No |
| Data Access | Test data only |

## Related Files

- `e2e/fixtures/auth.constants.ts` - Test credentials and constants
- `e2e/fixtures/auth.fixture.ts` - Authentication test helpers
- `e2e/auth-comprehensive.spec.ts` - Comprehensive auth test suite
- `.github/workflows/ci.yml` - CI/CD pipeline configuration
