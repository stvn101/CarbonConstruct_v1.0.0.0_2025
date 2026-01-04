# React Component Instructions

## Component Structure
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [state, setState] = useState(false);
  
  return (
    <Card>
      <h2>{title}</h2>
      <Button onClick={onAction}>Action</Button>
    </Card>
  );
}
```

## Best Practices
1. **Use shadcn/ui components** - Import from `@/components/ui`
2. **Prop types** - Always define TypeScript interfaces
3. **Accessibility** - Add ARIA labels, roles, keyboard navigation
4. **Performance** - Use memo, useMemo, useCallback appropriately
5. **Styling** - Use Tailwind utility classes, semantic tokens

## Accessibility Checklist
- [ ] Interactive elements have accessible names
- [ ] Forms have proper labels
- [ ] Images have alt text
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Screen reader tested

Last Updated: 2026-01-04
