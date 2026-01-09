# Contributing to CarbonConstruct

## Quick Start
```bash
npm install --legacy-peer-deps  # Required for React 19 compatibility
npm run dev
```

## Before Submitting
1. Run `npm run build` - TypeScript must compile
2. Run `npm test` - All tests must pass
3. Run `npm run lint` - No linting errors
4. Review `.github/copilot-instructions.md` for coding standards

## Code Standards
- **TypeScript**: Strict mode, no `any` types
- **React**: Functional components with hooks
- **Styling**: Tailwind semantic tokens only (no direct colors)
- **Security**: Never hardcode secrets, validate all inputs with Zod
- **Financial**: Use Decimal.js for GST and currency calculations
- **Accessibility**: WCAG 2.2 AA compliance (44x44px touch targets, aria-labels)

## GitHub Copilot Workflow

This repository is configured for GitHub Copilot Coding Agent.

### For Human Contributors
- Review `.github/copilot-instructions.md` for comprehensive coding guidelines
- Check scoped instructions in `.github/instructions/` for specific file types
- Use custom prompts from `.copilot/prompts/` for code reviews and testing

### For Copilot Agent
- All instructions are automatically applied based on file patterns
- Security checks run automatically via `security_pilot` custom agent
- Follow validation checklist in `AGENTS.md` before creating PRs

## Commit Messages
Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `security:` - Security fixes
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

Examples:
```
feat(calculator): add Module D benefits calculation
fix(auth): resolve JWT validation race condition
security(edge): add rate limiting to public endpoints
docs(readme): update installation instructions
```

## Pull Requests
- Fill out the PR template completely
- Ensure CI passes before requesting review
- Security changes require security team review
- Include screenshots for UI changes
- Reference related issues with "Closes #123"

## Documentation
- Update relevant `.md` files when adding features
- Reference EN 15978 lifecycle stages in carbon calculations
- Document Australian compliance considerations (ACL, GST, Privacy Act)
- Include accessibility notes for UI components

## Testing
- Use AAA pattern (Arrange, Act, Assert)
- Mock Supabase client appropriately
- Test edge cases and error states
- Target coverage: Critical paths 95%+, Components 70%+

## Getting Help
- Review `AGENTS.md` for detailed coding guidelines
- Check `.github/instructions/` for domain-specific patterns
- See `SECURITY.md` for security requirements
- Consult `README.md` for project overview and setup
