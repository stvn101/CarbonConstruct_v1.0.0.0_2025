# Test Instructions

## Vitest Unit Test Template
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/lib/__tests__/setup';
import { MyComponent } from '../MyComponent';

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const onAction = vi.fn();
    render(<MyComponent title="Test" onAction={onAction} />);
    
    const button = screen.getByRole('button', { name: /action/i });
    await button.click();
    
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
```

## Test Coverage Targets
- Critical paths: 95%+
- Business logic: 85%+
- Components: 70%+
- Utilities: 90%+

## Running Tests
```bash
npm test -- --run          # Run all tests
npm test -- --run --watch  # Watch mode
npm test -- --coverage     # With coverage
```

Last Updated: 2026-01-04
