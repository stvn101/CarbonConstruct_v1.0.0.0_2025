# Testing Patterns Snippet

Reference this file in other prompts using: `@testing-patterns.md`

## Vitest Configuration

### Test File Location
```
src/
├── components/
│   ├── MaterialCard.tsx
│   └── __tests__/
│       └── MaterialCard.test.tsx
├── hooks/
│   ├── useEmissionTotals.ts
│   └── __tests__/
│       └── useEmissionTotals.test.ts
└── lib/
    ├── emission-factors.ts
    └── __tests__/
        └── emission-factors.test.ts
```

## AAA Pattern (Arrange-Act-Assert)

### Standard Test Structure
```typescript
describe('calculateEmissions', () => {
  it('should_ReturnCorrectEmissions_When_ValidMaterialProvided', () => {
    // Arrange
    const material = {
      name: 'Concrete',
      quantity: 100,
      unit: 'kg',
      factor: 0.12
    };

    // Act
    const result = calculateEmissions(material);

    // Assert
    expect(result).toBe(12);
  });
});
```

## Component Testing

### Basic Component Test
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MaterialCard } from '../MaterialCard';

describe('MaterialCard', () => {
  const mockMaterial = {
    id: '1',
    name: 'Steel Rebar',
    category: 'Steel',
    factor: 1.46,
    unit: 'kg'
  };

  it('should_DisplayMaterialName_When_Rendered', () => {
    // Arrange & Act
    render(<MaterialCard material={mockMaterial} onSelect={vi.fn()} />);

    // Assert
    expect(screen.getByText('Steel Rebar')).toBeInTheDocument();
  });

  it('should_CallOnSelect_When_Clicked', async () => {
    // Arrange
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<MaterialCard material={mockMaterial} onSelect={onSelect} />);

    // Act
    await user.click(screen.getByRole('button'));

    // Assert
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

### Testing with Providers
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProtectedComponent', () => {
  it('should_Render_When_UserAuthenticated', () => {
    render(<ProtectedComponent />, { wrapper: createWrapper() });
    // assertions...
  });
});
```

## Hook Testing

### Custom Hook Test
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useEmissionTotals } from '../useEmissionTotals';

describe('useEmissionTotals', () => {
  it('should_CalculateTotal_When_MaterialsProvided', async () => {
    // Arrange
    const materials = [
      { id: '1', quantity: 100, factor: 0.12 },
      { id: '2', quantity: 50, factor: 0.24 }
    ];

    // Act
    const { result } = renderHook(() => useEmissionTotals(materials));

    // Assert
    await waitFor(() => {
      expect(result.current.total).toBe(24); // 100*0.12 + 50*0.24
    });
  });

  it('should_ReturnZero_When_NoMaterials', () => {
    // Arrange & Act
    const { result } = renderHook(() => useEmissionTotals([]));

    // Assert
    expect(result.current.total).toBe(0);
  });
});
```

## Mocking Patterns

### Supabase Client Mock
```typescript
// src/lib/__tests__/setup.ts
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      }),
    },
  },
}));
```

### Using Mock in Test
```typescript
import { supabase } from '@/integrations/supabase/client';

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should_FetchProjects_When_Called', async () => {
    // Arrange
    const mockProjects = [{ id: '1', name: 'Test Project' }];
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockProjects, error: null }),
    } as any);

    // Act
    const result = await fetchProjects('user-id');

    // Assert
    expect(result).toEqual(mockProjects);
    expect(supabase.from).toHaveBeenCalledWith('projects');
  });
});
```

## Edge Cases to Test

### Financial Calculations
```typescript
describe('GST Calculation', () => {
  it('should_HandleSmallAmounts_WithPrecision', () => {
    // Test decimal precision
    expect(calculateGST(1)).toBe(0.10);
    expect(calculateGST(0.01)).toBe(0.001);
  });

  it('should_HandleLargeAmounts_WithoutOverflow', () => {
    // Test large numbers
    expect(calculateGST(999999999.99)).toBeDefined();
  });

  it('should_HandleNegativeAmounts_Gracefully', () => {
    // Test edge case
    expect(() => calculateGST(-100)).toThrow('Amount must be positive');
  });
});
```

### Empty States
```typescript
describe('MaterialList', () => {
  it('should_ShowEmptyState_When_NoMaterials', () => {
    render(<MaterialList materials={[]} />);
    expect(screen.getByText(/no materials found/i)).toBeInTheDocument();
  });

  it('should_ShowEmptyState_When_Undefined', () => {
    render(<MaterialList materials={undefined as any} />);
    expect(screen.getByText(/no materials found/i)).toBeInTheDocument();
  });
});
```

### Error States
```typescript
describe('DataFetcher', () => {
  it('should_ShowError_When_FetchFails', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Network error' } 
      }),
    } as any);

    render(<DataFetcher />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });
});
```

## E2E Testing (Playwright)

### Basic E2E Test
```typescript
// e2e/calculator.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Carbon Calculator', () => {
  test('should calculate emissions for added material', async ({ page }) => {
    // Navigate
    await page.goto('/calculator');

    // Add material
    await page.getByRole('button', { name: /add material/i }).click();
    await page.getByLabel('Material').fill('Concrete');
    await page.getByLabel('Quantity').fill('1000');
    await page.getByRole('button', { name: /save/i }).click();

    // Verify calculation
    await expect(page.getByTestId('total-emissions')).toContainText(/\d+/);
  });
});
```

### Accessibility Test
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

## Coverage Targets

| Area | Target | Critical Paths |
|------|--------|----------------|
| Utilities | 90%+ | Always |
| Hooks | 85%+ | Business logic |
| Components | 70%+ | User interactions |
| Integration | 80%+ | API calls |
| E2E | Key flows | Auth, Calculator, Reports |

## Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- src/lib/__tests__/emission-factors.test.ts

# Run in watch mode
npm test -- --watch

# Run E2E tests
npx playwright test
```
