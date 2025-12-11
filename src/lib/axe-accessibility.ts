/**
 * Axe-core accessibility testing utility
 * Only runs in development mode to help catch WCAG violations
 */

export async function initAxeAccessibility(): Promise<void> {
  // Only run in development
  if (import.meta.env.DEV) {
    try {
      const React = await import('react');
      const ReactDOM = await import('react-dom');
      const axe = await import('@axe-core/react');
      
      // Configure axe with WCAG 2.1 AA rules
      axe.default(React.default, ReactDOM.default, 1000, {
        rules: [
          // Enable all WCAG 2.1 AA rules
          { id: 'color-contrast', enabled: true },
          { id: 'keyboard', enabled: true },
          { id: 'focus-visible', enabled: true },
          { id: 'link-name', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'image-alt', enabled: true },
          { id: 'label', enabled: true },
          { id: 'aria-roles', enabled: true },
          { id: 'aria-valid-attr', enabled: true },
          { id: 'aria-valid-attr-value', enabled: true },
        ],
      });
      
      console.log('[Accessibility] axe-core initialized - violations will be logged to console');
    } catch (error) {
      console.warn('[Accessibility] Failed to initialize axe-core:', error);
    }
  }
}
