# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of CarbonConstruct seriously. If you discover a security vulnerability, please report it to us as described below.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:

**security@carbonconstruct.com.au**

You should receive a response within 24 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

After you submit a report:

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 24 hours
2. **Assessment**: We will assess the vulnerability and determine its impact and severity
3. **Timeline**: We will provide an estimated timeline for a fix
4. **Updates**: We will keep you informed of the progress toward a fix
5. **Credit**: We will credit you for the discovery when we publish the fix (unless you prefer to remain anonymous)

## Security Update Process

When we receive a security bug report:

1. We confirm the problem and determine the affected versions
2. We audit code to find any similar problems
3. We prepare fixes for all supported versions
4. We release new security patch versions as soon as possible

## Security Best Practices

When using CarbonConstruct, we recommend:

### For Developers

- Always use environment variables for sensitive configuration (never commit secrets)
- Keep all dependencies up to date
- Use the latest supported version of CarbonConstruct
- Follow the principle of least privilege when configuring database access
- Regularly review and rotate API keys and credentials

### For Users

- Use strong, unique passwords
- Enable two-factor authentication when available
- Be cautious of phishing attempts
- Keep your browser and operating system up to date
- Review your account activity regularly

## Current Security Measures

CarbonConstruct implements comprehensive security controls:

### Authentication & Authorization
- Supabase Auth with bcrypt password hashing
- Google OAuth 2.0 integration
- JWT token validation on all protected endpoints
- Role-based access control (RBAC)
- Automatic token refresh mechanism

### Data Protection
- AES-256 encryption at rest
- TLS 1.3 encryption in transit
- Row-Level Security (RLS) on all database tables
- Data isolation per user/project
- Secure secrets management via Supabase Vault

### API Security
- CORS configuration on all endpoints
- Rate limiting on resource-intensive operations
- Input validation using Zod schemas
- XSS prevention via HTML escaping
- Admin role verification for privileged operations

### Compliance
- Privacy Act 1988 (Cth) compliance
- OWASP Top 10 2021 addressed
- NCC 2024 Section J support
- ISO 27001 control alignment

## Security Audit Results

**Last Security Audit**: November 27, 2025

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | ✅ No issues |
| High | 0 | ✅ All remediated |
| Medium | 4 | ✅ Acceptable design choices |
| Low/Info | 3 | ✅ Documented |

- **RLS Coverage**: 100% (18/18 tables)
- **Edge Function Auth**: All protected endpoints secured
- **Input Validation**: Zod schemas implemented
- **Rate Limiting**: All resource endpoints protected

For detailed security documentation, see [SECURITY_DOCUMENTATION.md](./SECURITY_DOCUMENTATION.md).

## Disclosure Policy

When we learn of a security vulnerability, we will:

1. Patch all supported versions as quickly as possible
2. Release new versions
3. Publicly disclose the vulnerability details after users have had time to upgrade

We request that security researchers:

- Give us reasonable time to address the issue before public disclosure
- Make a good faith effort to avoid privacy violations, data destruction, and service interruption
- Do not access or modify data that doesn't belong to you

## Contact

For security concerns or vulnerability reports:

- **Email**: security@carbonconstruct.com.au
- **Response Time**: Within 24 hours for critical issues
- **Business Hours**: Monday-Friday, 9:00 AM - 5:00 PM AEST

## Legal

This security policy is subject to our Terms of Service. By reporting vulnerabilities, you agree to our responsible disclosure policy.

---

*Last Updated: December 2025*
