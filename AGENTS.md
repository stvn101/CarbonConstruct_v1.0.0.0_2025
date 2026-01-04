# Coding Agent Automation Rules

## Purpose
This document defines automated workflows and rules for AI coding agents working in the CarbonConstruct repository.

## Agent Behavior Rules

### 1. Testing Requirements
- **ALWAYS** run tests after code changes: `npm test -- --run`
- Tests MUST pass before committing (495 passing, 12 skipped expected)
- Fix any test failures immediately
- Add tests for new features following Vitest patterns

### 2. Code Quality
- **ALWAYS** run linter: `npm run lint`
- Fix critical linting errors (React hooks, TypeScript errors)
- Auto-fix when possible: `npm run lint -- --fix`
- Backend `any` types can be deferred to dedicated PRs

### 3. Build Verification
- **ALWAYS** run build before finalizing: `npm run build`
- Build MUST succeed
- Address any build errors immediately
- Check for missing dependencies

### 4. Dependency Management
- Use `npm install --legacy-peer-deps` (required for React 19)
- Never commit `node_modules/` or `dist/`
- Update `package.json` and `package-lock.json` together
- Check for security vulnerabilities: `npm audit`

### 5. Git & Branching
- Create feature branches from `main` (or current default)
- Use descriptive commit messages
- Push changes regularly using `report_progress` tool
- Review `.gitignore` before committing

### 6. Code Review Process
- Run `code_review` tool before finalizing
- Address all critical review comments
- Run `codeql_checker` for security (may timeout, that's OK)
- Document any remaining issues in PR description

### 7. React & TypeScript Standards
- No `any` types in frontend code - use proper types
- Hooks MUST be called unconditionally
- No `Math.random()` or impure functions in render
- Move side effects to `useEffect` with proper cleanup
- Add TypeScript declarations to `src/vite-env.d.ts` for globals

### 8. Error Handling
- Use `logger` from `@/lib/logger` for errors
- Use `toast` from `sonner` for user-facing messages
- Never use `console.log` in production code
- Mock logger in tests: `vi.mock('@/lib/logger')`

### 9. Performance
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to children
- Lazy load routes with `React.lazy()`
- Check bundle size warnings in build output

### 10. Accessibility
- All interactive elements need ARIA labels
- Buttons must have accessible names
- Test with screen readers when possible
- Follow WCAG 2.1 AA standards

## Automation Workflows

### Pre-Commit Checklist
```bash
npm run lint -- --fix
npm test -- --run
npm run build
```

### Before PR Creation
```bash
npm test -- --run
npm run build
# Run code_review tool
# Run codeql_checker tool
```

### Emergency Rollback
```bash
git reset --hard origin/main
npm install --legacy-peer-deps
npm test -- --run
```

## Common Issues & Solutions

### Issue: Tests Failing
**Solution:** 
1. Check logger mocks include all methods (error, warn, info, debug, critical)
2. Use specific queries like `getByRole('button', { name: /text/i })`
3. Check for async issues - use `waitFor` or `findBy` queries

### Issue: Build Failing
**Solution:**
1. Run `npm install --legacy-peer-deps`
2. Check for missing dependencies in error message
3. Clear cache: `rm -rf node_modules package-lock.json && npm install --legacy-peer-deps`

### Issue: Linting Errors
**Solution:**
1. Auto-fix first: `npm run lint -- --fix`
2. Fix React hooks violations manually
3. Add type declarations for missing types
4. Backend issues can be deferred

### Issue: React Hook Errors
**Solution:**
1. Hooks must be at top level (no conditionals)
2. Move random values outside component or to `useMemo`
3. Clean up effects with return function
4. Use callback pattern for setState in effects

## Agent-Specific Instructions

### For Custom Agents
- Read project context from `.github/copilot-instructions.md`
- Follow patterns in `.github/instructions/*.instructions.md`
- Use templates from `.github/prompts/*.prompt.md`
- When in doubt, ask the user

### For Code Review Agents
- Check against `.github/prompts/code-review.prompt.md`
- Verify security with `.github/instructions/security.instructions.md`
- Test compliance with `.github/instructions/tests.instructions.md`

### For Documentation Agents
- Follow `.github/prompts/documentation.prompt.md`
- Include EN 15978 context where relevant
- Document Australian compliance (NCC, Green Star, NABERS)
- Use TSDoc format for code comments

## Repository-Specific Patterns

### Calculation Units
- Internal: Always kgCO2e
- Display: Always tCO2e (divide by 1000)
- Use `formatNumber()` helper for display

### Authentication
- Check `user` from `useAuth()` hook
- Guard routes with `AuthProvider`
- All edge functions validate JWT

### Supabase
- Use `supabase` client from `@/integrations/supabase/client`
- Enable RLS on all tables
- Use service role sparingly

### Project Context
- Access via `useProject()` hook
- Always check `currentProject` exists
- Call `refreshProjects()` after mutations

## Version Information
- Node: 18+
- React: 19.2.3
- TypeScript: 5.8.3
- Vite: 7.2.6
- Vitest: 4.0.16

Last Updated: 2026-01-04
