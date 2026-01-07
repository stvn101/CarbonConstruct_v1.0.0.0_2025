# CI/CD npm Cache Troubleshooting Guide

## Overview
This guide documents the resolution of npm dependency conflicts in GitHub Actions workflows and provides guidance on when to use or disable npm caching.

## Issue Background

### Problem
The Deploy Preview workflow was failing due to dependency conflicts between `react-helmet-async` and `react`. The root cause was stale cached dependencies from when React 19 was temporarily in use.

### Symptoms
- CI/CD build failures with peer dependency conflicts
- Local builds working fine but CI builds failing
- Dependency resolution errors despite correct `package.json` and `package-lock.json`

## Solution Implemented

### Changes to `.github/workflows/preview.yml`

1. **Disabled npm cache**
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       node-version: ${{ env.NODE_VERSION }}
       cache: false  # Changed from 'npm' to false
   ```

2. **Added explicit cache clearing**
   ```yaml
   - name: Clear npm cache
     run: npm cache clean --force
   ```

3. **Added debug logging**
   ```yaml
   - name: Debug Environment
     run: |
       echo "=== Environment Versions ==="
       npm --version
       node --version
       echo ""
       echo "=== React Dependencies ==="
       npm list react react-dom react-helmet-async || true
       echo ""
       echo "=== Package Lock Info ==="
       npm ls react --depth=0 || true
   ```

## When to Use npm Cache

### ✅ Use npm cache when:
- Dependencies are stable and not frequently changing
- Build performance is critical
- No recent major version changes in dependencies
- CI builds are consistently successful

### ❌ Disable npm cache when:
- Experiencing dependency conflicts in CI
- After major dependency version changes (especially React, Node, or core libraries)
- Troubleshooting build failures that work locally
- Stale cache suspected from previous builds
- Package-lock.json has been significantly regenerated

## Best Practices

### 1. Temporary Disabling
When troubleshooting, temporarily disable cache:
```yaml
cache: false  # Temporary for debugging
```

### 2. Re-enable After Resolution
Once dependencies are confirmed working, re-enable cache:
```yaml
cache: 'npm'  # Re-enable after verification
```

### 3. Cache Key Customization
For more control, use custom cache keys:
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## Debugging Steps

### 1. Check Installed Versions
```bash
npm --version
node --version
npm list react react-dom
```

### 2. Verify package-lock.json
```bash
npm ls react --depth=0
```

### 3. Clear Local Cache
```bash
npm cache clean --force
rm -rf node_modules
npm ci
```

### 4. Compare Local vs CI
- Run same commands locally that CI runs
- Check for environment differences
- Verify Node version matches

## Current Dependency Versions

### React Ecosystem
- **react**: `18.3.1` (specified as `^18.2.0` in package.json)
- **react-dom**: `18.3.1` (specified as `^18.2.0` in package.json)
- **react-helmet-async**: `2.0.5` (compatible with React 18)

### Node Environment
- **Node**: `20.x` (specified in workflow env)
- **npm**: `10.8.2`

## Monitoring

### Success Indicators
- Build completes without dependency errors
- All tests pass
- No peer dependency warnings for React
- Build time is reasonable (< 30s for install)

### Failure Indicators
- ERESOLVE errors
- Peer dependency conflicts
- Module not found errors
- Inconsistent behavior between local and CI

## Re-enabling Cache

Once the following conditions are met, cache can be re-enabled:

1. ✅ Multiple successful builds without cache (3+ consecutive)
2. ✅ No React version changes in pipeline
3. ✅ Package-lock.json is stable
4. ✅ All developers have updated dependencies locally

To re-enable:
```diff
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: ${{ env.NODE_VERSION }}
-     cache: false
+     cache: 'npm'

- - name: Clear npm cache
-   run: npm cache clean --force
```

## Related Documentation

- [GitHub Actions Cache Documentation](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [npm ci Documentation](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- [npm cache Documentation](https://docs.npmjs.com/cli/v10/commands/npm-cache)

## History

| Date | Change | Reason |
|------|--------|--------|
| 2026-01-07 | Disabled cache in preview.yml | React dependency conflicts from cached React 19 |

## Support

If you encounter similar issues:

1. Check this guide first
2. Review GitHub Actions logs for dependency errors
3. Compare local `node_modules` with CI behavior
4. Try disabling cache temporarily
5. Document any new patterns discovered
