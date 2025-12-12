# Claude Code Review Prompt - Codebase Quality Assessment

## Context
CarbonConstruct is a production carbon accounting platform for the Australian construction industry. The codebase has undergone significant development including:

- EN 15978 whole-lifecycle carbon assessment implementation
- 4,000+ EPD materials database integration
- Subscription management with Stripe
- Security hardening (rate limiting, RLS policies, input validation)
- Accessibility compliance (WCAG 2.1 AA)

## Your Task
Perform a comprehensive code quality review focusing on maintainability, security, and architectural decisions.

## Areas to Review

### 1. Architecture & Code Organization
Review these key directories:
- `src/components/` - React components
- `src/hooks/` - Custom hooks
- `src/contexts/` - Context providers
- `src/lib/` - Utilities and schemas
- `src/pages/` - Page components
- `supabase/functions/` - Edge functions

**Questions to Answer:**
- Is the component hierarchy logical?
- Are hooks properly abstracted?
- Is there unnecessary code duplication?
- Are files appropriately sized (<300 lines ideal)?

### 2. Security Implementation
Review:
- `supabase/functions/_shared/rate-limiter.ts`
- `supabase/functions/_shared/security-logger.ts`
- `supabase/functions/_shared/request-validator.ts`
- Edge function authentication patterns
- `src/lib/validation-schemas.ts`

**Questions to Answer:**
- Are all edge functions properly authenticated?
- Is input validation comprehensive?
- Are rate limits appropriate?
- Are RLS policies correctly implemented?

### 3. Performance Considerations
Review:
- `vite.config.ts` - Build optimization
- `src/hooks/useEPDMaterials.ts` - Data fetching
- `src/components/LazyChart.tsx` - Code splitting
- Service worker and caching

**Questions to Answer:**
- Is code splitting effective?
- Are heavy components lazy-loaded?
- Is data fetching optimized?
- Are there memory leaks in hooks?

### 4. Type Safety
Review TypeScript usage across:
- Component props
- Hook return types
- API response types
- Edge function payloads

**Questions to Answer:**
- Are types comprehensive or using `any`?
- Are Zod schemas used for runtime validation?
- Is the Supabase types file properly utilized?

### 5. Error Handling
Review:
- `src/components/ErrorBoundary.tsx`
- `src/hooks/useErrorHandler.ts`
- `src/hooks/useErrorTracking.ts`
- Edge function error responses

**Questions to Answer:**
- Are errors properly caught and logged?
- Are user-facing error messages helpful?
- Is there proper fallback UI?

### 6. Testing Strategy
Review test files in:
- `src/__tests__/`
- `src/hooks/__tests__/`
- `src/components/__tests__/`
- `e2e/`

**Questions to Answer:**
- Is test coverage adequate (target: 70%)?
- Are tests maintainable?
- Are critical paths covered?

## Expected Output

### Executive Summary
2-3 paragraph overview of codebase health.

### Detailed Findings

For each area, provide:
1. **Rating**: Excellent / Good / Needs Improvement / Critical
2. **Key Observations**: What you found
3. **Specific Issues**: File, line, description, severity
4. **Recommendations**: How to improve

### Prioritized Action Items

1. **Critical** (must fix before production):
   - Security vulnerabilities
   - Data integrity issues
   - Breaking bugs

2. **High** (fix soon):
   - Performance issues
   - Type safety gaps
   - Error handling gaps

3. **Medium** (improve when possible):
   - Code organization
   - Duplication removal
   - Documentation

4. **Low** (nice to have):
   - Style consistency
   - Minor refactoring
   - Additional tests

### Technical Debt Assessment
Estimate hours to address each priority level.

### Architecture Recommendations
Suggestions for long-term maintainability.

## Commands for Analysis

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Test coverage
npx vitest run --coverage

# Build check
npm run build

# Bundle analysis
npx vite-bundle-visualizer
```

## Key Files Summary

| Category | Key Files |
|----------|-----------|
| Entry | `src/App.tsx`, `src/main.tsx` |
| Core Logic | `src/hooks/useUnifiedCalculations.ts`, `src/hooks/useEmissionCalculations.ts` |
| Security | `supabase/functions/_shared/*` |
| Database | `src/integrations/supabase/types.ts` |
| Config | `vite.config.ts`, `tailwind.config.ts`, `vitest.config.ts` |

Please provide actionable, specific feedback that a development team can implement. Focus on issues with real impact on reliability, security, and user experience.
