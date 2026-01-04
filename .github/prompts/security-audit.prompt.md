# Security Audit Prompt

Audit this code for vulnerabilities:

## Authentication
- [ ] JWT validation
- [ ] Auth guards present
- [ ] Session management

## Authorization
- [ ] RLS policies
- [ ] Role checks
- [ ] Permission validation

## Input Validation
- [ ] Zod schemas used
- [ ] Sanitization applied
- [ ] SQL injection prevented

## XSS Prevention
- [ ] Output escaped
- [ ] DOMPurify used
- [ ] CSP headers set

## Secrets
- [ ] No hardcoded keys
- [ ] Environment variables
- [ ] Service role protected

## Rate Limiting
- [ ] Public endpoints limited
- [ ] Abuse prevention
- [ ] DoS protection

Last Updated: 2026-01-04
