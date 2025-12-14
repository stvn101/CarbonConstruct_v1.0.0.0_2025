/**
 * Axe-core accessibility testing utility
 * Only runs in development mode to help catch WCAG violations
 *
 * NOTE: Currently disabled due to React 19 compatibility issues with @axe-core/react@4.11.0
 * The package was developed with React 17 and causes React version conflicts.
 * Re-enable when @axe-core/react releases a version compatible with React 19.
 */

export async function initAxeAccessibility(): Promise<void> {
  // Temporarily disabled due to React 19 compatibility issues
  // TODO: Re-enable when @axe-core/react supports React 19
  console.log('[Accessibility] axe-core disabled - waiting for React 19 compatibility');
  return;

  /* Disabled code - uncomment when compatible version is available
  // Only run in development
  if (import.meta.env.DEV) {
    try {
      const React = await import('react');
      const ReactDOM = await import('react-dom');
      const axe = await import('@axe-core/react');

      // Configure axe with all WCAG 2.1 AA rules and best practices
      const axePromise = axe.default(React.default, ReactDOM.default, 1000, {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
      });

      // Handle potential CSP-related errors gracefully
      if (axePromise && typeof axePromise.catch === 'function') {
        axePromise.catch(() => {
          console.log('[Accessibility] axe-core may have limited functionality due to CSP');
        });
      }

      console.log('[Accessibility] axe-core initialized with WCAG 2.1 AA rules');
    } catch (error) {
      console.warn('[Accessibility] Failed to initialize axe-core:', error);
    }
  }
  */
}
