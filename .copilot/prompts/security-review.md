# Security Review Prompt

Review this code for security vulnerabilities:

## Check for:
1. **Authentication** - Verify JWT tokens, check auth guards
2. **Authorization** - Ensure RLS policies, role checks
3. **Input Validation** - Zod schemas, sanitization
4. **Secrets** - No hardcoded keys, proper env usage
5. **XSS/Injection** - Escaped outputs, parameterized queries

## CarbonConstruct-specific:
- Edge functions must validate Authorization header
- Rate limiting on public endpoints
- Service role only for sensitive operations
- Log security events via logSecurityEvent()
