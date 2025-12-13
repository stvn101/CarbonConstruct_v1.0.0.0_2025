# Code Review Prompt

Review this code for quality and maintainability:

## Check for:
1. **TypeScript** - Strict mode compliance, no `any`
2. **React** - Proper hooks usage, no memory leaks
3. **Performance** - Unnecessary re-renders, proper memoization
4. **Accessibility** - WCAG 2.1 AA, ARIA labels
5. **Testing** - Adequate coverage for critical paths

## CarbonConstruct patterns:
- Use semantic Tailwind tokens (not direct colors)
- Components < 300 lines
- Business logic in hooks, not components
- All calculations in kgCO2e, display in tCO2e
