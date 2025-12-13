module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/pricing',
        'http://localhost:4173/calculator',
        'http://localhost:4173/auth',
      ],
      // Use the preview server (build already done in CI)
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 120000,
      // Number of runs per URL for consistency
      numberOfRuns: 3,
      // Lighthouse settings
      settings: {
        preset: 'desktop',
        // Use Chrome from the CI environment
        chromePath: process.env.CHROME_PATH || undefined,
        // Throttling for realistic conditions
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Categories to audit
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
        ],
        // Skip certain audits that may be flaky in CI
        skipAudits: [
          'uses-http2',
          'redirects-http',
        ],
      },
    },
    assert: {
      // Assertion configuration - use warn to prevent CI failures
      assertions: {
        // Performance thresholds
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        
        // Accessibility requirements (warn to not block CI)
        'color-contrast': 'warn',
        'document-title': 'warn',
        'html-has-lang': 'warn',
        'image-alt': 'warn',
        'link-name': 'warn',
        'meta-viewport': 'warn',
        
        // SEO requirements
        'meta-description': 'warn',
        'crawlable-anchors': 'warn',
        'robots-txt': 'warn',
        
        // Best practices
        'errors-in-console': 'warn',
        'deprecations': 'warn',
        'uses-passive-event-listeners': 'warn',
      },
    },
    upload: {
      // Upload to temporary public storage (for CI)
      target: 'temporary-public-storage',
    },
  },
};
