# Contributing to CarbonConstruct

Welcome to CarbonConstruct! We're excited you want to contribute to Australia's leading carbon accounting platform.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Commit Conventions](#commit-conventions)
- [Testing Requirements](#testing-requirements)
- [CI/CD Pipeline](#cicd-pipeline)
- [Security Guidelines](#security-guidelines)
- [Documentation](#documentation)
- [Getting Help](#getting-help)

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/NeoPrint3D/CarbonConstruct.git
cd CarbonConstruct

# Install dependencies (--legacy-peer-deps required for React 19)
npm install --legacy-peer-deps

# Start development server
npm run dev
```

**Prerequisites:**
- Node.js 18+ (recommend using nvm)
- npm 9+
- Git

---

## 🔄 Development Workflow

### Branch Strategy

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Production-ready code | Production |
| `development` | Active development | Staging |
| `experiment` | Experimental features | None |

### Branch Protection Rules

The `main` branch has the following protections enabled:

#### Required Status Checks

All of these must pass before merging:

| Check | Description |
|-------|-------------|
| `lint` | ESLint code quality |
| `typecheck` | TypeScript compilation |
| `test` | Vitest unit tests |
| `coverage` | Code coverage thresholds |
| `security-scan` | CodeQL SAST analysis |
| `secrets-scan` | TruffleHog detection |
| `audit` | npm dependency audit |

#### Review Requirements

- ✅ **Minimum 1 approval** required before merge
- ✅ **Dismiss stale reviews** when new commits are pushed
- ✅ **Require review from code owners** for critical paths
- ✅ **Restrict who can dismiss reviews** to maintainers only

#### Additional Protections

- 🔒 **Require signed commits** (recommended)
- 🔒 **Require linear history** (squash merge only)
- 🔒 **Do not allow bypassing** above settings
- 🔒 **Restrict force pushes** to nobody
- 🔒 **Restrict deletions** enabled

#### Setting Up Branch Protection

Repository admins can configure these rules at:
```
Settings → Branches → Branch protection rules → Add rule
```

Select `main` as the branch pattern and enable the required checks.

### Workflow Steps

1. **Create a feature branch** from `development`:
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following our code standards

3. **Run local checks** before committing:
   ```bash
   npm run lint          # ESLint checks
   npm run build         # TypeScript compilation
   npm test              # Run test suite
   ```

4. **Commit your changes** using conventional commits

5. **Push and create a PR** to `development`

6. **Address review feedback** and ensure CI passes

7. **Merge** once approved (squash merge preferred)

---

## 📝 Code Standards

### TypeScript
- **Strict mode** enabled - no `any` types
- Use proper type definitions for all functions and components
- Prefer interfaces over type aliases for object shapes

### React
- Functional components with hooks only
- Use `React.FC` sparingly - prefer explicit prop types
- Extract complex logic into custom hooks

### Styling
- **Tailwind semantic tokens only** - no direct colors (e.g., use `bg-primary` not `bg-blue-500`)
- All colors must be HSL format in design system
- Reference `index.css` and `tailwind.config.ts` for tokens

### Financial Calculations
- **Always use Decimal.js** for currency and GST calculations
- Never use floating-point arithmetic for money

### Accessibility
- WCAG 2.2 AA compliance required
- Minimum 44x44px touch targets
- Proper `aria-labels` on interactive elements

### Security
- Never hardcode secrets or API keys
- Validate all inputs with Zod schemas
- Sanitize user-generated content with DOMPurify

---

## 🔀 Pull Request Guidelines

### Before Submitting

1. **Run all checks locally:**
   ```bash
   npm run build         # TypeScript must compile
   npm test              # All tests must pass
   npm run lint          # No linting errors
   ```

2. **Review relevant documentation:**
   - `.github/copilot-instructions.md` for coding standards
   - `.github/instructions/` for domain-specific patterns

### PR Template Checklist

Your PR should include:

- [ ] Clear, descriptive title using conventional commit format
- [ ] Description of changes and motivation
- [ ] Screenshots for UI changes
- [ ] Reference to related issues (`Closes #123`)
- [ ] All CI checks passing
- [ ] Tests added for new functionality
- [ ] Documentation updated if needed

### Review Process

1. **Automated Checks**: CI must pass (lint, build, test, security scans)
2. **Code Review**: At least one approval required
3. **Security Review**: Required for auth, RLS, or API changes
4. **Merge**: Use squash merge to `development`

---

## 📌 Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New features |
| `fix` | Bug fixes |
| `docs` | Documentation changes |
| `refactor` | Code refactoring |
| `security` | Security fixes |
| `test` | Test additions/changes |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |

### Examples

```bash
feat(calculator): add Module D benefits calculation
fix(auth): resolve JWT validation race condition
security(edge): add rate limiting to public endpoints
docs(readme): update installation instructions
test(materials): add EPD expiry validation tests
refactor(hooks): extract useSubscription from component
```

---

## 🧪 Testing Requirements

### Test Structure

Use **AAA Pattern** (Arrange, Act, Assert):

```typescript
describe('calculateGST', () => {
  it('should calculate 10% GST correctly', () => {
    // Arrange
    const amount = new Decimal(100);
    
    // Act
    const gst = calculateGST(amount);
    
    // Assert
    expect(gst.toString()).toBe('10');
  });
});
```

### Coverage Targets

| Category | Target |
|----------|--------|
| Critical paths (auth, payments) | 95%+ |
| Utility functions | 90%+ |
| Components | 70%+ |
| Edge functions | 80%+ |

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm run test:e2e            # Playwright E2E tests
```

---

## 🔄 CI/CD Pipeline

### Automated Checks

Every PR triggers:

| Check | Tool | Blocking |
|-------|------|----------|
| Linting | ESLint | ✅ Yes |
| Type Check | TypeScript | ✅ Yes |
| Unit Tests | Vitest | ✅ Yes |
| Coverage | Vitest + v8 | ✅ Yes (thresholds) |
| Security Scan | CodeQL | ✅ Yes |
| Secrets Detection | TruffleHog | ✅ Yes |
| Dependency Audit | npm audit | ⚠️ Critical only |
| Lighthouse | Lighthouse CI | ℹ️ Info only |

### Pipeline Badges

[![CI/CD Pipeline](https://github.com/NeoPrint3D/CarbonConstruct/actions/workflows/ci.yml/badge.svg)](https://github.com/NeoPrint3D/CarbonConstruct/actions/workflows/ci.yml)
[![CodeQL Security](https://github.com/NeoPrint3D/CarbonConstruct/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/NeoPrint3D/CarbonConstruct/security/code-scanning)

---

## 🔒 Security Guidelines

### Critical Requirements

1. **No Secrets in Code**: Use environment variables or Supabase secrets
2. **Input Validation**: All user input validated with Zod
3. **RLS Policies**: All database tables must have Row Level Security
4. **CORS**: Edge functions must have proper CORS headers
5. **Rate Limiting**: Public endpoints must be rate-limited

### Security Review Required For

- Authentication/authorization changes
- RLS policy modifications
- New edge functions
- API endpoint changes
- Payment-related code

### Reporting Vulnerabilities

See [SECURITY.md](./SECURITY.md) for our security policy and responsible disclosure process.

---

## 📚 Documentation

### Update Docs When

- Adding new features
- Changing APIs or interfaces
- Modifying database schemas
- Updating configuration

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and setup |
| `BUILD_GUIDE.md` | Detailed build instructions |
| `AGENTS.md` | Copilot agent guidelines |
| `SECURITY.md` | Security policy |
| `TAILWIND_*.md` | Design system documentation |

### Compliance Documentation

When working on carbon calculations:
- Reference EN 15978 lifecycle stages
- Document Australian compliance (ACL, GST, Privacy Act)
- Include NCC 2024 considerations
- Note EU GDPR requirements for international users

---

## ❓ Getting Help

### Resources

- **[AGENTS.md](./AGENTS.md)** - Detailed coding guidelines
- **[BUILD_GUIDE.md](./BUILD_GUIDE.md)** - Build and setup guide
- **[PR_MANAGEMENT_GUIDE.md](./PR_MANAGEMENT_GUIDE.md)** - PR workflow details
- **`.github/instructions/`** - Domain-specific patterns

### GitHub Copilot Workflow

This repository supports GitHub Copilot Coding Agent:

1. Review `.github/copilot-instructions.md` for coding standards
2. Check `.github/instructions/` for scoped instructions
3. Use prompts from `.copilot/prompts/` for reviews and testing

### Questions?

- Check existing documentation first
- Search closed issues for similar problems
- Open a new issue with the `question` label

---

## 🙏 Thank You!

We appreciate your contribution to making carbon accounting accessible and accurate. Every improvement helps Australia's construction industry reduce its environmental impact.

**Happy coding!** 🌿
