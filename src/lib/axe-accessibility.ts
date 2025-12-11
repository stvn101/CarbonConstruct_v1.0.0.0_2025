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
      
      // Configure axe with all WCAG 2.1 AA rules and best practices
      axe.default(React.default, ReactDOM.default, 1000, {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
      });
      
      console.log('[Accessibility] axe-core initialized with WCAG 2.1 AA rules - violations will be logged to console');
    } catch (error) {
      console.warn('[Accessibility] Failed to initialize axe-core:', error);
    }
  }
}
