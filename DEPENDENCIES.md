# Dependency Notes

## xlsx Package

**Current Version**: 0.20.3 (via local tarball)

### Background

The `xlsx` package is currently installed from a local tarball (`xlsx-0.20.3.tgz`) rather than from the npm registry. This was done to address critical security vulnerabilities discovered in version 0.18.5:

- **GHSA-4r6h-8v6p-xvw6**: Prototype Pollution vulnerability
- **GHSA-5pgg-2g8v-p4x9**: Regular Expression Denial of Service (ReDoS)

### Why Local Tarball?

Version 0.20.3 fixes these vulnerabilities but is not yet published to the npm registry. The local tarball was obtained from the official SheetJS repository to ensure we have the security fixes while maintaining our build pipeline.

### Action Required

**Monitor for registry availability**: Once `xlsx@0.20.3` or higher becomes available on the npm registry, update `package.json` to use the registry version:

```json
"xlsx": "^0.20.3"
```

### How to Check

```bash
# Check if version is available on npm
npm view xlsx versions --json | grep "0.20"
```

### Security Verification

The current installation passes all npm audit checks:
```bash
npm audit
# found 0 vulnerabilities
```

## html2pdf.js Package

**Current Version**: 0.13.0

Upgraded from 0.12.1 to fix a critical vulnerability in its jspdf dependency (GHSA-f8cm-6447-x5h2 - Local File Inclusion/Path Traversal).
