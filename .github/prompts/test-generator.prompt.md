# Test Generator Prompt

Generate tests for the provided code following CarbonConstruct testing standards.

## Test Framework

- **Unit/Integration**: Vitest
- **E2E**: Playwright
- **Assertions**: Testing Library

## Naming Convention

```typescript
// Pattern: should_ExpectedBehavior_When_StateUnderTest
it('should_ReturnEmissions_When_ValidMaterialProvided')
it('should_ShowError_When_InvalidInput')
it('should_DisableButton_When_FormIncomplete')
```

## AAA Pattern Required

```typescript
it('should_CalculateCorrectly_When_MaterialAdded', async () => {
  // Arrange - set up test conditions
  const material = { name: 'Concrete', quantity: 100, factor: 0.12 };

  // Act - perform the action
  const result = calculateEmissions(material);

  // Assert - verify the outcome
  expect(result.kgCO2e).toBe(12);
});
```

## Generate Tests For:

### 1. Happy Path
- Normal expected usage
- Valid inputs
- Successful operations

### 2. Edge Cases
- Empty inputs
- Maximum/minimum values
- Boundary conditions

### 3. Error States
- Invalid inputs
- Network failures
- Unauthorized access

### 4. Async Operations
- Loading states
- Success callbacks
- Error callbacks

## Mocking Patterns

### Supabase Mock
```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
    functions: { invoke: vi.fn() },
  },
}));
```

### Hook Mock
```typescript
vi.mock('@/hooks/useMyHook', () => ({
  useMyHook: () => ({
    data: mockData,
    isLoading: false,
    error: null,
  }),
}));
```

## Coverage Targets

| Category | Target |
|----------|--------|
| Critical paths | 95%+ |
| Business logic | 85%+ |
| Components | 70%+ |
| Utilities | 90%+ |

## Output Format

Generate complete, runnable test files:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Component/function imports

// Mocks

describe('ModuleName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('functionOrFeature', () => {
    it('should_ExpectedBehavior_When_Condition', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```
