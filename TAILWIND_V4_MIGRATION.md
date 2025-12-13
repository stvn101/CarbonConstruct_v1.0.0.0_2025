# Tailwind CSS v4 Migration Guide

## Overview

This document explains the migration from Tailwind CSS v3.4.17 to v4.1.18, a major version upgrade initiated by Dependabot.

## What Changed

### 1. New Dependencies

Added two new packages required by Tailwind v4:
- `@tailwindcss/postcss` - The PostCSS plugin (moved from main package)
- `@tailwindcss/vite` - Native Vite integration for optimal performance

### 2. Configuration Files

#### `postcss.config.js`
**Before:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**After:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

#### `vite.config.ts`
Added the Vite plugin:
```typescript
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(), 
    tailwindcss(),  // ← New
    mode === "development" && componentTagger()
  ].filter(Boolean),
  // ...
}));
```

#### `tailwind.config.ts`
**Before:** Full configuration with theme, colors, animations, etc.

**After:** Minimal configuration (most config moved to CSS):
```typescript
export default {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  plugins: [],
};
```

### 3. CSS Changes (`src/index.css`)

#### Import Syntax
**Before:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**After:**
```css
@import "tailwindcss";
```

#### Theme Configuration
Theme settings moved from JS/TS config to CSS `@theme` block:

```css
@theme {
  --radius: 0.75rem;
  --color-primary: hsl(var(--primary));
  --color-scope-1: hsl(var(--scope-1));
  /* etc. */
}
```

#### Animations
Keyframes now defined directly in CSS (outside @theme block):

```css
@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}
```

#### Base Styles
Replaced `@apply` directives with standard CSS:

**Before:**
```css
body {
  @apply bg-background text-foreground;
}
```

**After:**
```css
body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

## Why These Changes Were Made

Tailwind v4 is a complete rewrite with these key improvements:

1. **Performance**: Up to 10x faster build times with new Rust-based engine
2. **CSS-First Configuration**: Better IDE support, type safety, and autocomplete
3. **Simplified Setup**: Native Vite integration eliminates PostCSS complexity
4. **Modern Architecture**: Leverages Lightning CSS for optimization

## Breaking Changes & Compatibility

### What Still Works
- All existing utility classes (bg-*, text-*, flex, etc.)
- Custom CSS variables defined in `:root`
- Component styles and custom utilities
- All Radix UI components and shadcn/ui
- Existing color schemes and design tokens

### What Changed
- Configuration syntax (JS → CSS)
- Plugin loading (new package structure)
- Custom utilities must be defined in `@theme` block

### No Changes Required For
- React components using Tailwind classes
- Existing HTML/JSX markup
- Custom CSS variables in `:root`
- Utility class names

## Testing Checklist

✅ **Completed:**
- [x] Build process (`npm run build`) - Successfully builds
- [x] Dev server (`npm run dev`) - Starts without errors
- [x] Linting (`npm run lint`) - Pre-existing warnings only
- [x] Security scan - No new vulnerabilities
- [x] Code review - Issues addressed

⏳ **Recommended Next Steps:**
- [ ] Visual regression testing on all pages
- [ ] Test calculator functionality
- [ ] Test report generation (PDF export)
- [ ] Test dark/light theme switching
- [ ] Verify responsive layouts on different screen sizes
- [ ] Test all interactive components (dialogs, dropdowns, etc.)

## Rollback Plan

If issues arise, you can rollback by:

1. Revert to previous branch/commit
2. Run `npm install` to restore v3 packages
3. The changes are isolated to configuration files

## Best Practices for Future Dependabot PRs

This migration demonstrates the proper approach for major version updates:

1. **Understand Breaking Changes**: Read release notes and migration guides
2. **Install New Dependencies**: Add any new required packages
3. **Update Configuration**: Migrate config files to new formats
4. **Test Thoroughly**: Build, dev server, and functionality tests
5. **Security Check**: Verify no new vulnerabilities
6. **Document Changes**: Create migration guides for the team
7. **Incremental Commits**: Commit changes in logical steps

## Resources

- [Tailwind v4 Official Docs](https://tailwindcss.com/docs)
- [Tailwind v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind v4 Changelog](https://github.com/tailwindlabs/tailwindcss/blob/main/CHANGELOG.md)

## Questions?

If you encounter issues or have questions about this migration, check:
1. This document first
2. The official Tailwind v4 documentation
3. The commit history for this PR
4. Open an issue in the repository

---

**Migration Date:** December 13, 2025  
**Migrated By:** GitHub Copilot Agent  
**Dependabot PR:** Bump tailwindcss from 3.4.17 to 4.1.18
