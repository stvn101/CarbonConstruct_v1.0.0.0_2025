# Claude Code Review Prompt - Test Suite Implementation

## Context
CarbonConstruct is an Australian carbon accounting platform for the construction industry. We have implemented a comprehensive testing strategy covering unit tests, integration tests, and end-to-end tests.

## Your Task
Review the test implementation in this repository and provide a detailed assessment.

## Files to Review

### Unit Tests (Priority 1-3)
- `src/lib/__tests__/*.test.ts` - Utility and schema tests
- `src/hooks/__tests__/*.test.ts` - Hook tests (calculations, subscriptions, favorites, EPD materials)
- `src/components/__tests__/*.test.tsx` - Component tests
- `src/components/calculator/__tests__/*.test.tsx` - Calculator component tests
- `src/contexts/__tests__/*.test.tsx` - Context provider tests

### Integration Tests
- `src/__tests__/integration/calculator-flow.test.tsx`
- `src/__tests__/integration/report-generation.test.tsx`
- `src/__tests__/integration/authentication-flow.test.tsx`

### E2E Tests
- `e2e/*.spec.ts` - Playwright end-to-end tests

### Configuration
- `vitest.config.ts` - Test runner configuration
- `playwright.config.ts` - E2E test configuration

## Review Criteria

1. **Test Coverage**
   - Are critical user journeys covered?
   - Are edge cases and error scenarios tested?
   - Is the 70% coverage threshold achievable?

2. **Test Quality**
   - Are tests isolated and independent?
   - Do tests have clear descriptions?
   - Are mocks appropriate and realistic?
   - Are assertions meaningful?

3. **Best Practices**
   - Follow AAA pattern (Arrange-Act-Assert)?
   - Avoid testing implementation details?
   - Use appropriate matchers?
   - Handle async operations correctly?

4. **Security Testing**
   - Are authentication flows tested?
   - Are authorization checks verified?
   - Are input validation tests present?
   - Are rate limiting scenarios covered?

5. **Compliance Testing**
   - EN 15978 lifecycle stage calculations?
   - Australian framework compliance (NCC, Green Star, NABERS)?
   - EPD data integrity validation?

## Expected Output

Provide:
1. **Summary**: Overall assessment (1-2 paragraphs)
2. **Strengths**: What's working well (bullet points)
3. **Issues Found**: Problems requiring attention (severity: critical/high/medium/low)
4. **Missing Tests**: Gaps in coverage
5. **Recommendations**: Specific improvements with code examples where helpful
6. **Action Items**: Prioritized list of fixes

## Commands to Run

```bash
# Run unit/integration tests
npx vitest run --coverage

# Run E2E tests
npx playwright test

# Generate coverage report
npx vitest run --coverage --reporter=html
```

## Additional Context

- Platform uses React + Vite + TypeScript
- Backend is Supabase with edge functions
- Calculator handles EN 15978 whole-life carbon assessment
- Material database contains 4,000+ verified EPD materials
- Users range from architects to subcontractors

Please be thorough but practical - focus on issues that impact reliability and maintainability.
