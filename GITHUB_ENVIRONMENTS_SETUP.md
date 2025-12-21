# GitHub Environments Setup Guide

## CarbonConstruct Production Deployment Configuration

**Version:** 1.0  
**Last Updated:** December 2025  

---

## Overview

This guide documents the required GitHub environment configuration for CarbonConstruct's CI/CD pipeline, implementing security controls aligned with the ACSC Essential Eight and organizational security policies.

---

## Environment Configuration

### Production Environment

The `production` environment is required for deploying to the live production infrastructure.

#### 1. Create Production Environment

Navigate to: **Repository → Settings → Environments → New environment**

```
Environment name: production
```

#### 2. Configure Environment Protection Rules

| Setting | Value | Purpose |
|---------|-------|---------|
| Required reviewers | 2+ team members | Dual-control for production changes |
| Wait timer | 0-5 minutes | Allow time for review consideration |
| Deployment branches | `main` only | Prevent direct deployment from feature branches |

**Required Reviewers (Recommended):**
- Tech Lead / CTO
- Senior Developer
- Security Officer (for security-sensitive changes)

#### 3. Branch Protection for `main`

Navigate to: **Repository → Settings → Branches → Branch protection rules**

| Rule | Setting | Rationale |
|------|---------|-----------|
| Require a pull request before merging | ✅ Enabled | No direct pushes to main |
| Require approvals | 1-2 reviewers | Peer review mandatory |
| Require status checks to pass | ✅ Enabled | CI must succeed |
| Required status checks | `test`, `build`, `security` | All quality gates |
| Require branches to be up to date | ✅ Enabled | No stale merges |
| Include administrators | ✅ Enabled | No admin bypass |

---

## Environment Secrets

### Production Secrets

These secrets are set at the **environment level** (not repository level) for production:

| Secret Name | Description | Rotation Schedule |
|-------------|-------------|-------------------|
| `STRIPE_SECRET_KEY` | Production Stripe API key | 90 days |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend service access | 90 days |
| `RESEND_API_KEY` | Email service credentials | 90 days |

**Note:** Secrets set at environment level are only available to jobs that specify that environment.

### Setting Environment Secrets

1. Navigate to: **Repository → Settings → Environments → production**
2. Click **Add secret**
3. Enter secret name and value
4. Click **Add secret**

```yaml
# Example workflow usage
jobs:
  deploy:
    environment: production  # Required to access production secrets
    steps:
      - name: Deploy
        env:
          STRIPE_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
```

---

## CI/CD Pipeline Integration

### Workflow Configuration

The `.github/workflows/ci.yml` file references the production environment:

```yaml
jobs:
  deploy:
    needs: [test, security]
    runs-on: ubuntu-latest
    environment: production  # Triggers protection rules
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        # Deployment steps here
```

### Security Gates

Before deployment, the following jobs must pass:

1. **test** - Unit tests, integration tests
2. **security** - npm audit, trufflehog, CodeQL
3. **build** - Vite production build

---

## Secret Rotation Procedure

### 90-Day Rotation Schedule

Set calendar reminders for secret rotation:

| Week | Action |
|------|--------|
| Week 1 | Generate new API keys in respective dashboards |
| Week 2 | Update GitHub environment secrets |
| Week 3 | Verify new keys work in staging |
| Week 4 | Invalidate old keys |

### Rotation Checklist

```markdown
## Secret Rotation: [SECRET_NAME]
- [ ] Generate new key in provider dashboard
- [ ] Update GitHub environment secret
- [ ] Trigger test deployment to verify
- [ ] Monitor for errors (24h)
- [ ] Revoke old key
- [ ] Update rotation log
- [ ] Set next rotation reminder
```

---

## Deployment Approval Workflow

### Manual Approval Process

When a PR is merged to `main`:

1. **CI runs automatically** - Tests, security checks, build
2. **Deployment job starts** - Paused for approval
3. **Reviewers notified** - Via GitHub/email
4. **Reviewer examines:**
   - CI job results
   - Code changes in PR
   - Any security findings
5. **Reviewer approves/rejects** - In GitHub UI
6. **Deployment proceeds** - If approved

### Approval Interface

Reviewers can approve via:
- GitHub Actions tab → Pending deployments
- Email notification link
- GitHub mobile app

---

## Security Considerations

### Essential Eight Alignment

| E8 Control | Implementation |
|------------|----------------|
| Restrict admin privileges | Environment reviewers are limited |
| Multi-factor authentication | GitHub MFA required for all team members |
| Application control | Only signed commits, CI-verified code |
| Patch applications | Dependabot enabled, security checks blocking |

### Audit Trail

All deployment approvals are logged:
- GitHub audit log (Enterprise)
- Environment deployment history
- Git commit history

---

## Troubleshooting

### Common Issues

#### "Deployment pending approval"

**Cause:** Required reviewers haven't approved.  
**Solution:** Request review from designated approvers.

#### "Branch not allowed for deployment"

**Cause:** Attempting to deploy from non-main branch.  
**Solution:** Merge changes to main first via PR.

#### "Status checks failed"

**Cause:** CI jobs failed.  
**Solution:** Fix failing tests/security issues and push updates.

### Emergency Bypass

**ONLY for critical production incidents:**

1. Repository admin temporarily disables branch protection
2. Deploy hotfix directly to main
3. Immediately re-enable protection
4. Create post-incident PR for proper review
5. Document in incident report

---

## Team Roles

### Required GitHub Roles

| Role | Permissions | Responsibilities |
|------|-------------|------------------|
| Admin | Full repository access | Environment configuration |
| Maintainer | Write + merge | PR approval, deployment approval |
| Developer | Write | PR creation, code reviews |
| Viewer | Read | Monitoring, stakeholder access |

### Adding Environment Reviewers

Only repository admins can modify environment protection rules:

1. Navigate to: **Settings → Environments → production**
2. Click **Edit** next to "Required reviewers"
3. Search and add team members
4. Save changes

---

## Monitoring

### Deployment Metrics

Monitor via GitHub Insights:
- Deployment frequency
- Lead time for changes
- Time to restore service
- Change failure rate

### Alerts

Configure notifications for:
- Failed deployments
- Pending approvals (if stale)
- Security vulnerabilities in dependencies

---

## References

- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Environment Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-an-environment)
- [ACSC Essential Eight](https://www.cyber.gov.au/resources-business-and-government/essential-cyber-security/essential-eight)
