# GitHub Copilot Agent Instructions

This file provides instructions for GitHub Copilot Coding Agent when working autonomously on this repository.

## Project Context

CarbonConstruct is a production Australian carbon accounting platform for the construction industry. It requires strict compliance with:
- Australian regulations (Privacy Act, ACL, GST, Cyber Security Act 2024)
- EU GDPR (for international users)
- EN 15978 whole-lifecycle carbon assessment standards
- WCAG 2.2 AA accessibility

## Validation Commands

Before creating any PR, run these commands and ensure they pass:

```bash
# 1. Type checking (MUST pass)
npx tsc --noEmit

# 2. Linting (MUST pass)
npm run lint

# 3. Build (MUST pass)
npm run build

# 4. Unit tests (MUST pass)
npm test

# 5. E2E tests (run if available)
npx playwright test
```

## Files That Must NEVER Be Modified

These files are auto-generated or externally managed:

```
src/integrations/supabase/client.ts    # Auto-generated Supabase client
src/integrations/supabase/types.ts     # Auto-generated from DB schema
package.json                            # Use npm commands only
package-lock.json                       # Auto-managed
.env                                    # Managed by Lovable Cloud
.gitignore                              # Repository configuration
supabase/migrations/                    # Database migrations (use tools)
components.json                         # shadcn/ui configuration
tsconfig.json                           # TypeScript configuration
tsconfig.app.json                       # App TypeScript config
tsconfig.node.json                      # Node TypeScript config
postcss.config.js                       # PostCSS configuration
```

## Pre-Commit Checklist

### Security Verification
- [ ] No API keys or secrets in code (except VITE_SUPABASE_PUBLISHABLE_KEY)
- [ ] All user inputs validated with Zod schemas
- [ ] Edge functions include JWT verification
- [ ] No `dangerouslySetInnerHTML` without DOMPurify
- [ ] Rate limiting on public endpoints

### TypeScript Compliance
- [ ] No `any` types (use `unknown` with type guards)
- [ ] No unused variables or imports
- [ ] Explicit return types on exported functions
- [ ] All errors handled with try/catch

### Australian Compliance
- [ ] GST calculations use Decimal.js (never floating point)
- [ ] ABN displayed in footer where required
- [ ] Australian Consumer Law language preserved
- [ ] Data sovereignty maintained (ap-southeast-2)

### Accessibility
- [ ] Minimum touch targets 44x44px for interactive elements
- [ ] aria-labels on icon-only buttons
- [ ] Semantic HTML structure (main, section, article, etc.)
- [ ] Color contrast ratios maintained

## Code Style Requirements

### Import Order
```typescript
// 1. React/external libraries
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal aliases
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

// 3. Relative imports (avoid when possible)
import { localHelper } from './helpers';
```

### Component Structure
```typescript
// Props interface first
interface ComponentProps {
  prop: string;
}

// Component with explicit typing
export function Component({ prop }: ComponentProps) {
  // Hooks at top
  const [state, setState] = useState<string>('');
  
  // Effects after hooks
  useEffect(() => {
    // Effect logic
  }, []);
  
  // Handlers before return
  const handleClick = () => {
    // Handler logic
  };
  
  // Single return with JSX
  return (
    <div>Content</div>
  );
}
```

### Edge Function Structure
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 2. Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // 4. Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Business logic
    const result = await doSomething();

    // 6. Success response
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `security`

Examples:
```
feat(calculator): add Module D benefits calculation
fix(auth): resolve JWT validation race condition
security(edge): add rate limiting to public endpoints
docs(readme): update installation instructions
```

## PR Requirements

1. **Title**: Follows commit message format
2. **Description**: Explains what and why
3. **Tests**: Added for new functionality
4. **Screenshots**: For UI changes
5. **Breaking Changes**: Clearly documented
6. **Security Impact**: Noted if applicable

## Debugging Tips

### Check Console Logs
```typescript
// Use structured logging
import { logger } from "@/lib/logger";
logger.info('operation_started', { userId, action });
logger.error('operation_failed', { error, context });
```

### Check Network Requests
- Edge function calls go through `supabase.functions.invoke()`
- Database calls use Supabase client methods
- Never make direct HTTP calls to Supabase

### Check Database
- All tables have RLS policies
- Use `supabase--read-query` tool for debugging
- Never modify production data without backup

## Emergency Contacts

- Security issues: SECURITY.md
- Breach response: BREACH_RESPONSE.md
- Incident response: INCIDENT_RESPONSE.md
