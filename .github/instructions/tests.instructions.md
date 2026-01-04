---
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,e2e/**/*"
---

# Testing Development Guide

## Test Structure (AAA Pattern)

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('feature group', () => {
    it('should_ExpectedBehavior_When_StateUnderTest', async () => {
      // Arrange - set up test data and conditions
      const mockData = { id: '1', name: 'Test' };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: [mockData], error: null }),
      });

      // Act - perform the action being tested
      render(<Component />);
      await userEvent.click(screen.getByRole('button', { name: /submit/i }));

      // Assert - verify the expected outcome
      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      });
    });
  });
});
```

## Mocking Supabase

```typescript
import { vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock successful query
vi.mocked(supabase.from).mockReturnValue({
  select: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ 
        data: { id: '1', name: 'Test' }, 
        error: null 
      }),
    }),
  }),
} as any);

// Mock error
vi.mocked(supabase.from).mockReturnValue({
  select: vi.fn().mockResolvedValue({ 
    data: null, 
    error: { message: 'Database error' } 
  }),
} as any);
```

## Testing Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useMyHook', () => {
  it('should_ReturnData_When_QuerySucceeds', async () => {
    // Arrange
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
    } as any);

    // Act
    const { result } = renderHook(() => useMyHook('project-id'), {
      wrapper: createWrapper(),
    });

    // Assert
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.data).toHaveLength(1);
  });
});
```

## Testing Components with Context

```typescript
import { AuthProvider } from '@/contexts/AuthContext';
import { ProjectProvider } from '@/contexts/ProjectContext';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    <AuthProvider>
      <ProjectProvider>
        {children}
      </ProjectProvider>
    </AuthProvider>
  </QueryClientProvider>
);

describe('ProtectedComponent', () => {
  it('should_ShowContent_When_Authenticated', async () => {
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: { id: '1', email: 'test@example.com' } },
      error: null,
    } as any);

    render(<ProtectedComponent />, { wrapper: AllProviders });
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
```

## E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculator');
  });

  test('should calculate emissions when materials added', async ({ page }) => {
    // Add material
    await page.getByRole('button', { name: /add material/i }).click();
    await page.getByLabel('Material').fill('Concrete');
    await page.getByLabel('Quantity').fill('1000');
    await page.getByRole('button', { name: /save/i }).click();

    // Verify calculation
    await expect(page.getByTestId('total-emissions')).toContainText('kgCO2e');
  });

  test('should be accessible', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

## Coverage Targets

```
Overall Coverage Target: 70-80%

By Category:
- Critical paths (auth, calculations): 95%+
- Business logic (hooks): 85%+
- Components: 70%+
- Utilities: 90%+
```

## Test Naming Convention

```typescript
// Pattern: should_ExpectedBehavior_When_StateUnderTest
it('should_ShowError_When_InvalidInputProvided')
it('should_CalculateEmissions_When_MaterialAdded')
it('should_RedirectToLogin_When_Unauthenticated')
it('should_DisableButton_When_FormIsInvalid')
```

## Assertions

```typescript
// DOM assertions
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toHaveTextContent('text');
expect(element).toHaveAttribute('disabled');
expect(element).toHaveClass('className');

// Value assertions
expect(value).toBe(expected);
expect(value).toEqual({ key: 'value' });
expect(value).toBeTruthy();
expect(value).toBeNull();

// Array assertions
expect(array).toHaveLength(3);
expect(array).toContain(item);

// Function assertions
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg);
expect(mockFn).toHaveBeenCalledTimes(2);

// Async assertions
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow('error');
```

## Test Utilities

```typescript
// Custom render with providers
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: AllProviders });
}

// Wait for loading to complete
export async function waitForLoadingToComplete() {
  await waitFor(() => {
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
}

// Mock authenticated user
export function mockAuthenticatedUser() {
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { 
      user: { 
        id: 'test-user-id', 
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      } 
    },
    error: null,
  } as any);
}
```

## Checklist

Before committing tests:

- [ ] AAA pattern followed
- [ ] Descriptive test names
- [ ] Mocks properly set up and cleared
- [ ] Async operations awaited
- [ ] Edge cases covered
- [ ] Error states tested
- [ ] Accessibility tested (for components)
- [ ] No console errors in tests
