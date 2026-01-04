# Code Review Prompt

Review this code for quality and maintainability:

## Check for:

### 1. TypeScript Compliance
- [ ] Strict mode compliance (no `any` types)
- [ ] Explicit return types on exported functions
- [ ] No unused variables or imports
- [ ] Proper error typing

### 2. React Best Practices
- [ ] Proper hooks usage (dependencies, order)
- [ ] No memory leaks (cleanup in useEffect)
- [ ] Memoization where needed
- [ ] Stable callback references (useCallback)

### 3. Performance
- [ ] No unnecessary re-renders
- [ ] Proper code splitting
- [ ] Large data sets virtualized
- [ ] Images optimized

### 4. Accessibility (WCAG 2.2 AA)
- [ ] Minimum touch targets (44x44px)
- [ ] aria-labels on icon buttons
- [ ] Semantic HTML structure
- [ ] Keyboard navigation works
- [ ] Focus visible and managed

### 5. Security
- [ ] No hardcoded secrets
- [ ] Input validation with Zod
- [ ] HTML sanitized with DOMPurify
- [ ] JWT tokens verified in Edge Functions
- [ ] Rate limiting on public endpoints

### 6. Testing
- [ ] Critical paths tested
- [ ] AAA pattern followed
- [ ] Edge cases covered
- [ ] Mocks properly managed

## CarbonConstruct-Specific:

### Styling
- [ ] Semantic Tailwind tokens only (no direct colors)
- [ ] Uses shadcn/ui components

### Architecture
- [ ] Components under 300 lines
- [ ] Business logic in hooks, not components
- [ ] No direct Supabase calls in components

### Calculations
- [ ] All financial calculations use Decimal.js
- [ ] Emissions stored in kgCO2e internally
- [ ] Display values in tCO2e where appropriate
- [ ] EN 15978 stages correctly referenced

### Compliance
- [ ] Australian Consumer Law language preserved
- [ ] GST calculated with precision
- [ ] Data sovereignty maintained

## Response Format:

### Summary
Brief overview of code quality.

### Issues Found
| Severity | Location | Issue | Recommendation |
|----------|----------|-------|----------------|
| Critical | file:line | Description | Fix |
| High | file:line | Description | Fix |
| Medium | file:line | Description | Fix |

### Strengths
- What's done well

### Suggestions
- Improvements for next iteration
