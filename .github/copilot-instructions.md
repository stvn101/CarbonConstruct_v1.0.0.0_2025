# CarbonConstruct AI Coding Guide

## Project Identity

CarbonConstruct is an Australian carbon accounting SaaS for the construction industry. It implements EN 15978 whole-lifecycle carbon assessment (A1-D) with strict compliance requirements for Australian regulations (Privacy Act, ACL, GST, NCC 2024) and EU GDPR.

## Technology Stack

- **Frontend**: Vite + React 19 + TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (Lovable Cloud) with Edge Functions (Deno)
- **State**: TanStack Query for server state, React Context for app state
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Build**: `npm run dev` | `npm run build` | `npm run lint` | `npm test`

## Critical Commands

```bash
npm run dev          # Start development server
npm run build        # Production build (must pass before PR)
npm run lint         # ESLint with strict rules
npm test             # Vitest unit tests
npx playwright test  # E2E tests
npx tsc --noEmit     # Type checking
```

## Architecture Overview

```
src/
├── components/       # React components (shadcn/ui based)
│   ├── ui/          # Primitive UI components (DO NOT MODIFY)
│   └── calculator/  # Domain-specific calculator components
├── hooks/           # Custom React hooks (business logic here)
├── contexts/        # React Context providers
├── pages/           # Route page components
├── lib/             # Utilities, schemas, constants
└── integrations/    # Supabase client (AUTO-GENERATED - DO NOT EDIT)

supabase/
├── functions/       # Deno Edge Functions
│   └── _shared/     # Shared utilities (rate-limiter, security-logger)
└── config.toml      # Function configuration
```

## Files You Must NEVER Modify

- `src/integrations/supabase/client.ts` - Auto-generated
- `src/integrations/supabase/types.ts` - Auto-generated from schema
- `package.json` / `package-lock.json` - Use npm commands
- `.env` - Auto-managed by Lovable Cloud
- `supabase/migrations/` - Database migrations (use migration tool)

## Import Conventions

```typescript
// Always use path aliases
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Never use relative paths like ../../../
```

## TypeScript Standards

- **Strict mode enabled**: `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`
- **No `any` types**: Use `unknown` and narrow with type guards
- **Zod for runtime validation**: All external inputs validated
- **Explicit return types**: Required for exported functions

```typescript
// ✅ Correct
export function calculateEmissions(material: MaterialInput): EmissionResult {
  const parsed = materialSchema.safeParse(material);
  if (!parsed.success) throw new ValidationError(parsed.error);
  return { kgCO2e: parsed.data.quantity * parsed.data.factor };
}

// ❌ Wrong
export function calculateEmissions(material: any) {
  return { kgCO2e: material.quantity * material.factor };
}
```

## Component Patterns

### Use shadcn/ui Primitives
```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
```

### Semantic Tailwind Tokens Only
```typescript
// ✅ Use semantic tokens
<div className="bg-background text-foreground border-border" />
<Button className="bg-primary text-primary-foreground" />

// ❌ Never use arbitrary colors
<div className="bg-white text-black" />
<div className="bg-[#1a1a1a]" />
```

### Accessibility Requirements (WCAG 2.2 AA)
```typescript
// Minimum touch target: 24x24px
<Button className="min-h-[44px] min-w-[44px]" />

// Always include aria-labels for icon buttons
<Button variant="ghost" size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Use semantic HTML
<main> <section> <article> <nav> <header> <footer>
```

## Financial Calculations

**CRITICAL**: Never use floating-point for currency. Always use Decimal.js.

```typescript
import Decimal from 'decimal.js';

// ✅ Correct GST calculation
const net = new Decimal(amount);
const gst = net.mul(0.10).toDecimalPlaces(2);
const gross = net.plus(gst);

// ❌ Wrong - floating point errors
const gst = amount * 0.10;
```

## Edge Function Standards

```typescript
// Standard CORS headers (required for all functions)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Authentication pattern
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

const { data: { user }, error } = await supabase.auth.getUser(
  authHeader.replace('Bearer ', '')
);
```

## Security Checklist

- [ ] All user inputs validated with Zod schemas
- [ ] No secrets in client-side code (except VITE_SUPABASE_PUBLISHABLE_KEY)
- [ ] Edge functions verify JWT tokens
- [ ] Rate limiting on public endpoints
- [ ] RLS policies on all database tables
- [ ] HTML content sanitized with DOMPurify
- [ ] Error messages don't leak sensitive information

## Australian Compliance

- **ABN**: Must display in footer (validated 11-digit checksum)
- **GST**: 10% calculated with Decimal.js precision
- **ACL**: Explicit Major/Minor Failure language in Terms
- **Privacy Act**: 30-day breach notification, OAIC contact info
- **Data Residency**: Sydney (ap-southeast-2) only

## EN 15978 Lifecycle Stages

Always reference stages correctly:
- **A1-A3**: Product stage (raw materials, manufacturing)
- **A4-A5**: Construction stage (transport, installation)
- **B1-B7**: Use stage (maintenance, repair, replacement)
- **C1-C4**: End-of-life (demolition, transport, disposal)
- **D**: Benefits beyond system boundary (recycling credits)

## Error Handling Pattern

```typescript
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

try {
  const result = await riskyOperation();
  toast({ title: "Success", description: "Operation completed" });
} catch (error) {
  logger.error('operation_failed', { error, context: 'user_action' });
  toast({
    variant: "destructive",
    title: "Error",
    description: error instanceof Error ? error.message : "An error occurred"
  });
}
```

## Testing Standards

```typescript
// Use AAA pattern
describe('calculateEmissions', () => {
  it('should_ReturnCorrectEmissions_When_ValidMaterialProvided', () => {
    // Arrange
    const material = { name: 'Concrete', quantity: 100, factor: 0.12 };
    
    // Act
    const result = calculateEmissions(material);
    
    // Assert
    expect(result.kgCO2e).toBe(12);
  });
});
```

## Cross-References

- Security patterns: `.github/instructions/security.instructions.md`
- Edge functions: `.github/instructions/edge-functions.instructions.md`
- Components: `.github/instructions/components.instructions.md`
- Testing: `.github/instructions/tests.instructions.md`
- Compliance: `.github/instructions/compliance.instructions.md`
- Agent instructions: `AGENTS.md`
