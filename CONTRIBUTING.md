# Contributing to CarbonConstruct

## Quick Start
```bash
npm install
npm run dev
```

## Before Submitting
1. Run `npm run build` - TypeScript must compile
2. Run `npm test` - All tests must pass
3. Run `npm run lint` - No linting errors

## Code Standards
- **TypeScript**: Strict mode, no `any` types
- **React**: Functional components with hooks
- **Styling**: Tailwind semantic tokens only
- **Security**: Never hardcode secrets

## Commit Messages
Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`

## Pull Requests
- Fill out the PR template completely
- Ensure CI passes before requesting review
- Security changes require security team review
