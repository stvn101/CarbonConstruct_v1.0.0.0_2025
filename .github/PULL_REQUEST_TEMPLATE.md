# Pull Request

## Description

<!-- Brief description of what this PR does and why -->

**Related Issue:** Closes #<!-- issue number -->

## Type of Change

<!-- Check all that apply -->

- [ ] `feat` - New feature
- [ ] `fix` - Bug fix
- [ ] `refactor` - Code refactoring (no functional changes)
- [ ] `security` - Security fix
- [ ] `docs` - Documentation update
- [ ] `test` - Test additions/changes
- [ ] `chore` - Maintenance tasks
- [ ] `perf` - Performance improvement
- [ ] ⚠️ Breaking change (requires migration)

---

## Pre-Submission Checklist

### Code Quality

- [ ] Code follows [TypeScript strict mode](./CONTRIBUTING.md#typescript) - no `any` types
- [ ] Uses [Tailwind semantic tokens](./CONTRIBUTING.md#styling) only - no direct colors
- [ ] Financial calculations use [Decimal.js](./CONTRIBUTING.md#financial-calculations) - no floating-point for money
- [ ] All colors are HSL format in design system

### Testing

- [ ] All tests pass locally: `npm test`
- [ ] TypeScript compiles: `npm run build`
- [ ] ESLint passes: `npm run lint`
- [ ] New tests added for new functionality
- [ ] Coverage thresholds maintained (70%+ overall)

### Accessibility

- [ ] WCAG 2.2 AA compliance maintained
- [ ] Touch targets minimum 44x44px
- [ ] Proper `aria-labels` on interactive elements

### Security

- [ ] No secrets or API keys in code
- [ ] User inputs validated with Zod schemas
- [ ] User-generated content sanitized with DOMPurify
- [ ] RLS policies reviewed (if database changes)
- [ ] Security review requested (if auth/payment changes)

### Documentation

- [ ] Documentation updated if needed
- [ ] Commit messages follow [Conventional Commits](./CONTRIBUTING.md#commit-conventions)

---

## Testing Details

<!-- Describe how you tested these changes -->

**Test Commands Run:**
```bash
npm run lint
npm run build
npm test
```

**Manual Testing:**
- [ ] Tested on desktop (Chrome, Firefox, Safari)
- [ ] Tested on mobile viewport
- [ ] Tested with keyboard navigation

---

## Screenshots

<!-- Required for UI changes. Delete this section if no UI changes. -->

| Before | After |
|--------|-------|
| <!-- Screenshot --> | <!-- Screenshot --> |

---

## Additional Notes

<!-- Any additional context, considerations, or notes for reviewers -->

---

## Reviewer Checklist

<!-- For reviewers to complete -->

- [ ] Code follows project standards
- [ ] Tests are adequate
- [ ] No security concerns
- [ ] Documentation is sufficient
