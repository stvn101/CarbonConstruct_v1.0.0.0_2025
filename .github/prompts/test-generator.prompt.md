# Test Generator Prompt

Generate tests for this code following these patterns:

## Unit Tests (Vitest)
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('value')).toBeInTheDocument();
  });
  
  it('should handle user interaction', async () => {
    const handler = vi.fn();
    render(<ComponentName onAction={handler} />);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalled();
  });
});
```

## Coverage
- Happy path
- Error states
- Edge cases
- Async operations

Last Updated: 2026-01-04
