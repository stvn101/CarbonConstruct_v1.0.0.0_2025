# Refactor Helper Prompt

Assist with safely refactoring code in CarbonConstruct.

## Pre-Refactor Checklist

### 1. Impact Analysis
- [ ] Identify all files importing the target code
- [ ] Check for dynamic imports/lazy loading
- [ ] Verify test coverage exists
- [ ] Note any circular dependencies

### 2. Safety Checks
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No linting errors: `npm run lint`

## Refactoring Patterns

### Extract Component
```typescript
// Before: Large component with embedded logic
function BigComponent() {
  // 200+ lines...
}

// After: Smaller, focused components
function ParentComponent() {
  return (
    <Container>
      <Header />
      <Content />
      <Footer />
    </Container>
  );
}
```

### Extract Hook
```typescript
// Before: Logic in component
function Component() {
  const [data, setData] = useState([]);
  useEffect(() => { fetchData(); }, []);
  // ...
}

// After: Logic in hook
function useData() {
  const [data, setData] = useState([]);
  useEffect(() => { fetchData(); }, []);
  return { data };
}

function Component() {
  const { data } = useData();
  // ...
}
```

### Extract Utility
```typescript
// Before: Repeated calculation
const gst = amount * 0.1;

// After: Centralized utility
import { calculateGST } from '@/lib/gst';
const gst = calculateGST(amount);
```

## Post-Refactor Verification

### 1. Type Check
```bash
npx tsc --noEmit
```

### 2. Run Tests
```bash
npm test
```

### 3. Visual Check
- Navigate to affected pages
- Verify functionality works
- Check console for errors

### 4. Build
```bash
npm run build
```

## File Organization Rules

| Type | Location | Max Lines |
|------|----------|-----------|
| Components | `src/components/` | 300 |
| Hooks | `src/hooks/` | 200 |
| Utilities | `src/lib/` | 150 |
| Types | `src/lib/types.ts` or co-located | 100 |
| Constants | `src/lib/constants.ts` | 100 |

## Response Format

### Refactoring Plan
1. What will be changed
2. Why this approach
3. Files affected
4. Potential risks

### Step-by-Step Changes
```typescript
// File: src/components/OldLocation.tsx
// Change: Extract to new file

// Before
[code snippet]

// After
[code snippet]
```

### Verification Steps
Commands to run after each step.

### Rollback Plan
How to revert if issues found.
