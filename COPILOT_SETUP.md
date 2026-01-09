# GitHub Copilot Instructions Setup

This document describes the comprehensive GitHub Copilot instructions setup for CarbonConstruct.

## Overview

CarbonConstruct is fully configured for GitHub Copilot Coding Agent with:
- ✅ Main repository instructions
- ✅ Scoped file-specific instructions with YAML frontmatter
- ✅ Custom security agent
- ✅ Reusable prompt library
- ✅ Comprehensive agent documentation

## File Structure

```
.github/
├── copilot-instructions.md              # Main repository instructions
├── instructions/                         # Scoped instructions by file type
│   ├── compliance.instructions.md       # EN 15978, Australian/EU regulations
│   ├── components.instructions.md       # React component patterns
│   ├── edge-functions.instructions.md   # Deno Edge Function patterns
│   ├── hooks.instructions.md            # React hooks patterns
│   ├── security.instructions.md         # Security best practices
│   └── tests.instructions.md            # Testing patterns
├── agents/
│   └── my-agent.agent.md                # Custom security_pilot agent
├── prompts/                              # Detailed prompt templates
│   ├── code-review.prompt.md
│   ├── documentation.prompt.md
│   ├── refactor-helper.prompt.md
│   ├── security-audit.prompt.md
│   └── test-generator.prompt.md
└── prompt-snippets/                      # Reusable snippet library
    ├── australian-compliance.md
    ├── coding-standards.md
    ├── supabase-patterns.md
    └── testing-patterns.md

.copilot/
└── prompts/                              # Workspace prompts
    ├── code-review.md
    ├── documentation.md
    ├── security-review.md
    └── testing.md

AGENTS.md                                 # Complete agent workflow documentation
```

## Main Instructions

**File**: `.github/copilot-instructions.md`

Contains core guidance for the entire repository:
- Project identity and context (Australian carbon accounting SaaS)
- Technology stack (React 19, Vite, TypeScript, Supabase, Tailwind)
- Critical commands (dev, build, lint, test)
- Architecture overview
- Files that must never be modified
- Import conventions
- TypeScript standards
- Component patterns (shadcn/ui, Tailwind semantic tokens)
- Accessibility requirements (WCAG 2.2 AA)
- Financial calculations (Decimal.js for GST)
- Edge Function standards
- Security checklist
- Australian compliance (ABN, GST, ACL, Privacy Act, data residency)
- EN 15978 lifecycle stages
- Error handling patterns
- Testing standards

## Scoped Instructions

Each `.instructions.md` file in `.github/instructions/` uses YAML frontmatter with `applyTo` patterns to target specific files:

### compliance.instructions.md
```yaml
applyTo: "**/*"
```
- EN 15978 lifecycle stages (A1-D)
- Australian regulations (Privacy Act, ACL, GST, Cyber Security Act 2024)
- EU GDPR compliance
- NCC 2024 Section J
- Green Star requirements

### components.instructions.md
```yaml
applyTo: "src/components/**/*.tsx"
```
- Component structure
- shadcn/ui usage
- Tailwind CSS semantic tokens only
- Accessibility (WCAG 2.2 AA, 44x44px touch targets)
- Loading and error states
- Toast notifications
- Icons (Lucide)

### edge-functions.instructions.md
```yaml
applyTo: "supabase/functions/**/*"
```
- Standard template with CORS
- Authentication patterns
- Rate limiting integration
- Input validation with Zod
- Error response standards
- Admin-only function patterns

### hooks.instructions.md
```yaml
applyTo: "src/hooks/**/*.ts,src/hooks/**/*.tsx"
```
- Hook structure with TanStack Query
- Query key conventions
- Financial calculations with Decimal.js
- Authentication hook patterns
- Error handling
- Debounced hooks

### security.instructions.md
```yaml
applyTo: "**/*.ts,**/*.tsx,supabase/functions/**/*"
```
- Input validation with Zod
- Secret management
- XSS prevention (DOMPurify)
- Authentication patterns
- Rate limiting
- Row Level Security (RLS)
- Error handling (no leaks)

### tests.instructions.md
```yaml
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,e2e/**/*"
```
- AAA pattern (Arrange, Act, Assert)
- Mocking Supabase
- Testing hooks
- Testing components with Context
- E2E tests with Playwright
- Coverage targets (Critical 95%+, Components 70%+)

## Custom Agent

**File**: `.github/agents/my-agent.agent.md`

The `security_pilot` agent:
- Monitors for security vulnerabilities
- Reviews PRs against SECURITY.md
- Fixes security issues when possible
- Alerts @stvn101 for complex issues
- Checks for:
  - Hardcoded secrets
  - Missing input validation
  - XSS vulnerabilities
  - Missing authentication
  - Rate limiting gaps
  - SQL injection risks

## Custom Prompts

### Workspace Prompts (`.copilot/prompts/`)
Quick reference prompts for common tasks:
- `code-review.md` - Quick checklist
- `security-review.md` - Security checklist
- `testing.md` - Test generation guidelines
- `documentation.md` - Documentation templates

### Detailed Prompts (`.github/prompts/`)
Comprehensive prompt templates:
- `code-review.prompt.md` - Full quality checklist with response format
- `security-audit.prompt.md` - Security audit workflow
- `test-generator.prompt.md` - Test generation with coverage targets
- `documentation.prompt.md` - Documentation generation guidelines
- `refactor-helper.prompt.md` - Refactoring assistance

### Prompt Snippets (`.github/prompt-snippets/`)
Reusable knowledge snippets:
- `australian-compliance.md` - Privacy Act, ACL, GST, NCC 2024
- `coding-standards.md` - TypeScript, React, Tailwind standards
- `supabase-patterns.md` - Auth, RLS, Edge Functions
- `testing-patterns.md` - Vitest, Playwright, mocking

## Agent Documentation

**File**: `AGENTS.md`

Complete workflow documentation:
- Project context and compliance requirements
- Validation commands
- Files that must never be modified
- Pre-commit security checklist
- TypeScript compliance checklist
- Australian compliance checklist
- Accessibility checklist
- Code style requirements (import order, component structure)
- Commit message conventions
- PR requirements
- Debugging tips

## Using Copilot Agent

### As a Human Contributor

1. **Review Instructions**: Check `.github/copilot-instructions.md` and relevant scoped instructions
2. **Use Prompts**: Reference `.copilot/prompts/` for code reviews and testing
3. **Follow Patterns**: Use examples from `.github/prompt-snippets/`
4. **Validate**: Run pre-commit checklist from `AGENTS.md`

### As Copilot Agent

Instructions are automatically applied based on file patterns:
- Editing a component? → `components.instructions.md` applies
- Editing a hook? → `hooks.instructions.md` applies
- Editing an Edge Function? → `edge-functions.instructions.md` applies
- All files? → `security.instructions.md` and `compliance.instructions.md` apply

### Creating Issues for Copilot

Good issue structure:
```markdown
## Goal
[Clear, specific objective]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests added
- [ ] Documentation updated

## Context
- Affected files: src/components/Calculator.tsx
- Related: #123
- Compliance: EN 15978 Module A1-A3

## Technical Notes
- Use Decimal.js for calculations
- Follow semantic Tailwind tokens
- Ensure WCAG 2.2 AA compliance
```

### Reviewing Copilot PRs

1. **Verify Instructions Followed**: Check compliance with scoped instructions
2. **Run Validation**: Ensure `npm run build`, `npm test`, `npm run lint` pass
3. **Security Review**: Use `security_pilot` agent or manual review
4. **Request Changes**: Use `@copilot` mentions in PR comments
5. **Iterate**: Copilot will update PR based on feedback

## Best Practices

### Do's ✅
- Keep instructions concise and actionable
- Use YAML frontmatter with specific `applyTo` patterns
- Include code examples for complex patterns
- Reference compliance requirements explicitly
- Update instructions when patterns change
- Test agent behavior with real issues

### Don'ts ❌
- Don't create overly broad instructions (use scoping)
- Don't duplicate content across multiple files
- Don't include sensitive information in instructions
- Don't skip YAML frontmatter in scoped instructions
- Don't forget to update AGENTS.md when workflows change

## Maintenance

### Updating Instructions

When code patterns change:
1. Update relevant `.instructions.md` file
2. Test with example issue
3. Update `AGENTS.md` if workflow changes
4. Update `COPILOT_SETUP.md` (this file) if structure changes
5. Document in `CHANGELOG.md`

### Adding New Instructions

To add a new scoped instruction file:
1. Create `.github/instructions/[name].instructions.md`
2. Add YAML frontmatter with `applyTo` pattern
3. Include clear, actionable guidance
4. Add code examples
5. Reference from `.github/copilot-instructions.md`
6. Document in this file

### Testing Instructions

Verify instructions work:
1. Create test issue with clear acceptance criteria
2. Assign to Copilot agent
3. Review generated PR
4. Check instruction adherence
5. Iterate on instructions if needed

## Resources

### GitHub Documentation
- [GitHub Copilot Coding Agent](https://docs.github.com/en/copilot/tutorials/coding-agent)
- [Best practices for Copilot tasks](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [Custom instructions (.instructions.md)](https://github.blog/changelog/2025-07-23-github-copilot-coding-agent-now-supports-instructions-md-custom-instructions/)
- [Custom agents configuration](https://gh.io/customagents/config)

### Internal Documentation
- `AGENTS.md` - Complete agent workflow
- `SECURITY.md` - Security requirements
- `CONTRIBUTING.md` - Contribution guidelines
- `README.md` - Project overview

## Troubleshooting

### Agent Not Following Instructions
- Verify YAML frontmatter is correct
- Check `applyTo` pattern matches file paths
- Ensure instructions are clear and specific
- Add code examples for complex patterns

### Instructions Conflicting
- Use specific `applyTo` patterns to avoid overlaps
- Check instruction priority (scoped > general)
- Consolidate duplicate guidance

### Agent Missing Context
- Add relevant context to issue description
- Reference related files and PRs
- Include specific acceptance criteria
- Link to compliance requirements

## Version History

- **2026-01-09**: Initial comprehensive Copilot instructions setup
  - Main instructions in `.github/copilot-instructions.md`
  - 6 scoped instruction files with YAML frontmatter
  - Custom `security_pilot` agent
  - Prompt library (workspace, detailed, snippets)
  - Complete agent documentation in `AGENTS.md`
  - Documentation in README.md and CONTRIBUTING.md
