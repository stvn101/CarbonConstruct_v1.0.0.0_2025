# Tailwind Quick Reference - Carbon Construct

A quick reference guide for developers working with the Carbon Construct Tailwind configuration.

## 🎨 Color Classes Quick Reference

### Emission Scopes
```
bg-scope-1    text-scope-1    border-scope-1    /* Scope 1: Direct emissions (coral red) */
bg-scope-2    text-scope-2    border-scope-2    /* Scope 2: Energy (golden amber) */
bg-scope-3    text-scope-3    border-scope-3    /* Scope 3: Value chain (forest green) */
```

### LCA Phases
```
bg-lca-material        text-lca-material        /* Material phase (purple) */
bg-lca-transport       text-lca-transport       /* Transport phase (cyan) */
bg-lca-construction    text-lca-construction    /* Construction phase (orange) */
bg-lca-eol            text-lca-eol             /* End of life (pink) */
```

### Compliance Frameworks
```
bg-compliance-ncc          text-compliance-ncc          /* NCC (blue) */
bg-compliance-gbca         text-compliance-gbca         /* GBCA (green) */
bg-compliance-nabers       text-compliance-nabers       /* NABERS (teal) */
bg-compliance-en15978      text-compliance-en15978      /* EN 15978 (blue) */
bg-compliance-climateActive text-compliance-climateActive /* Climate Active */
bg-compliance-isRating     text-compliance-isRating     /* IS Rating (purple) */
```

### Chart Colors (1-8)
```
bg-chart-1    text-chart-1    /* Coral red */
bg-chart-2    text-chart-2    /* Golden amber */
bg-chart-3    text-chart-3    /* Forest green */
bg-chart-4    text-chart-4    /* Electric blue */
bg-chart-5    text-chart-5    /* Royal purple */
bg-chart-6    text-chart-6    /* Teal */
bg-chart-7    text-chart-7    /* Bright orange */
bg-chart-8    text-chart-8    /* Hot pink */
```

### Status Colors
```
bg-success      text-success      /* Green */
bg-warning      text-warning      /* Amber */
bg-destructive  text-destructive  /* Red */
```

### Sidebar Colors
```
bg-sidebar                  text-sidebar-foreground
bg-sidebar-primary          text-sidebar-primary-foreground
bg-sidebar-accent           text-sidebar-accent-foreground
border-sidebar-border
```

## 🎭 Gradients

```
gradient-primary    /* Forest green → environmental green */
gradient-carbon     /* Blue-grey → forest green */
gradient-eco        /* Bright green → rich green */
gradient-sunset     /* Coral red → golden amber */
gradient-ocean      /* Electric blue → teal */

bg-gradient-primary    /* As background */
bg-gradient-carbon
bg-gradient-eco
bg-gradient-sunset
bg-gradient-ocean
```

## 🌟 Shadows

```
shadow-carbon     /* Standard carbon-themed shadow */
shadow-elevated   /* Elevated card shadow */
shadow-glow       /* Subtle glow effect */
```

## 🎬 Animations

```
animate-fade-in        /* Fade in with upward movement (0.3s) */
animate-scale-in       /* Scale up from 95% (0.2s) */
animate-slide-up       /* Slide up while fading (0.3s) */
animate-shimmer        /* Loading shimmer (2s infinite) */
animate-zoom-forward   /* Dramatic zoom (1.2s) */
animate-pulse-glow     /* Pulsing glow (1.5s infinite) */
animate-accordion-down /* Accordion expand (0.2s) */
animate-accordion-up   /* Accordion collapse (0.2s) */
```

## 📐 Border Radius

```
rounded-lg    /* 12px */
rounded-md    /* 10px */
rounded-sm    /* 8px */
```

## 🎯 Common Patterns

### Scope Card
```tsx
<Card className="border-l-4 border-scope-1 shadow-carbon">
  <CardTitle className="text-scope-1">Scope 1 Emissions</CardTitle>
</Card>
```

### Compliance Badge
```tsx
<Badge className="bg-compliance-ncc text-white">NCC Compliant</Badge>
```

### Gradient Hero
```tsx
<section className="gradient-primary text-white py-20">
  <h1 className="text-5xl font-bold">Title</h1>
</section>
```

### Interactive Card
```tsx
<Card className="hover:shadow-glow transition-all duration-300 animate-fade-in">
  {/* Content */}
</Card>
```

### Loading State
```tsx
<div className="animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted h-4 rounded" />
```

### Text Gradient
```tsx
<h1 className="text-gradient gradient-primary">
  Gradient Text
</h1>
```

### Staggered Animation
```tsx
{items.map((item, i) => (
  <div 
    key={item.id}
    className="animate-fade-in"
    style={{ animationDelay: `${i * 0.1}s` }}
  >
    {item.content}
  </div>
))}
```

## 📱 Responsive Breakpoints

```
sm:   /* 640px and up */
md:   /* 768px and up */
lg:   /* 1024px and up */
xl:   /* 1280px and up */
2xl:  /* 1400px and up (custom) */
```

### Responsive Grid Example
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## 🎨 Opacity Modifiers

All colors support opacity modifiers:
```
bg-scope-1/10      /* 10% opacity */
bg-scope-1/50      /* 50% opacity */
text-chart-1/75    /* 75% opacity */
border-primary/20  /* 20% opacity */
```

## 🔧 Hover & Focus States

```
hover:bg-primary-hover       /* Hover state for primary */
hover:shadow-glow            /* Add glow on hover */
hover:scale-105              /* Scale up on hover */
focus:ring-primary           /* Focus ring in primary color */
focus-visible:outline-none   /* Remove default outline */
group-hover:scale-110        /* Scale when parent hovered */
```

## 🎯 Common Combinations

### Primary Button
```
bg-primary hover:bg-primary-hover text-primary-foreground shadow-carbon transition-colors
```

### Secondary Button
```
bg-secondary text-secondary-foreground hover:shadow-glow transition-all
```

### Input Field
```
bg-input border-border focus:ring-primary focus:border-primary transition-all
```

### Card Header
```
gradient-carbon text-white px-6 py-4 rounded-t-lg
```

### Data Badge
```
bg-scope-1 text-white px-2 py-1 rounded text-xs font-medium
```

## 🚀 Performance Tips

1. **Avoid arbitrary values** - Use predefined colors and sizes
2. **Use CSS variables** - Access via `hsl(var(--color-name))`
3. **Compose utilities** - Combine classes instead of custom CSS
4. **Leverage purging** - Unused classes removed in production
5. **Optimize animations** - Use transform and opacity for performance

## 📚 File Locations

```
tailwind.config.ts    /* Main Tailwind configuration */
src/index.css         /* CSS variables and custom utilities */
postcss.config.js     /* PostCSS configuration */
```

## 🎓 VSCode IntelliSense

For autocomplete, ensure you have:
1. Tailwind CSS IntelliSense extension installed
2. Settings in `.vscode/settings.json`:

```json
{
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "\"([^\"]*)\""]
  ]
}
```

## 🔍 Debugging

### View computed color values
```tsx
<div className="bg-primary" style={{ backgroundColor: 'hsl(var(--primary))' }}>
  Inspect this element
</div>
```

### Check if class is applied
```bash
# Search for class usage
grep -r "bg-scope-1" src/
```

### Verify color in browser DevTools
```javascript
getComputedStyle(document.documentElement).getPropertyValue('--scope-1')
// Should return: "15 90% 58%"
```

## 📖 More Resources

- Full Documentation: `TAILWIND_CONFIGURATION.md`
- Code Examples: `TAILWIND_EXAMPLES.md`
- Tailwind Docs: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/

---

**Tip**: Bookmark this page for quick reference while coding! 🚀
