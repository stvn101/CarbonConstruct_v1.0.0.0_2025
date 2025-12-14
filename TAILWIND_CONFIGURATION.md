# Tailwind Configuration Overview

## 📋 Overview

This document provides a comprehensive view of the Tailwind CSS configuration for the Carbon Compass AI Guide. The design system uses a professional "twilight" theme optimized for carbon emissions data visualization and compliance reporting.

## 🎨 Design System Structure

### Configuration Files

1. **`src/index.css`** – Main Tailwind v4 configuration (via `@theme` block and CSS variables)
2. **`postcss.config.js`** – PostCSS configuration for Tailwind processing
## 🌈 Color System

### Base Colors (Twilight Theme)
```css
--background: 220 15% 92%      /* Soft warm grey background */
--foreground: 220 15% 12%      /* High contrast dark text */
--card: 0 0% 98%               /* Clean white cards */
--popover: 0 0% 98%            /* Popup backgrounds */
```

### Brand Colors
```css
--primary: 156 55% 35%         /* Vibrant Forest Green */
--primary-hover: 156 60% 30%   /* Darker on hover */
--secondary: 220 25% 45%       /* Rich Carbon Blue-Grey */
--accent: 142 70% 45%          /* Bright Environmental Green */
--muted: 220 15% 85%           /* Subtle Grey-Green */
```

### Emission Scope Colors (Data Visualization)
```css
--scope-1: 15 90% 58%          /* Bright coral-red (Direct emissions) */
--scope-2: 48 95% 55%          /* Golden amber (Energy emissions) */
--scope-3: 156 60% 42%         /* Rich forest green (Value chain) */
```

### Life Cycle Assessment (LCA) Colors
```css
--lca-material: 280 75% 60%    /* Vivid purple (Materials) */
--lca-transport: 200 90% 55%   /* Bright cyan (Transport) */
--lca-construction: 30 95% 58% /* Vibrant orange (Construction) */
--lca-eol: 340 80% 60%         /* Hot pink (End-of-life) */
```

### Compliance Framework Colors
```css
--ncc-blue: 210 90% 55%        /* NCC (National Construction Code) */
--gbca-green: 142 75% 48%      /* GBCA (Green Building Council) */
--nabers-teal: 180 80% 48%     /* NABERS Energy Rating */
--en15978-blue: 220 85% 55%    /* EN 15978 Standard */
--climate-active: 152 80% 45%  /* Climate Active Certification */
--is-rating: 270 70% 55%       /* Infrastructure Sustainability */
```

### Chart Colors (8-color palette)
```css
--chart-1: 15 90% 58%          /* Coral red */
--chart-2: 48 95% 55%          /* Golden amber */
--chart-3: 142 70% 45%         /* Forest green */
--chart-4: 210 90% 55%         /* Electric blue */
--chart-5: 280 75% 60%         /* Royal purple */
--chart-6: 180 80% 48%         /* Teal */
--chart-7: 30 95% 58%          /* Bright orange */
--chart-8: 340 80% 60%         /* Hot pink */
```

### Status Colors
```css
--success: 142 70% 45%         /* Success green */
--warning: 48 95% 55%          /* Warning amber */
--destructive: 0 85% 62%       /* Error red */
```

### Sidebar Colors
```css
--sidebar-background: 156 40% 25%      /* Dark green background */
--sidebar-foreground: 0 0% 95%         /* Light text */
--sidebar-primary: 142 70% 45%         /* Accent green */
--sidebar-accent: 156 45% 30%          /* Hover state */
--sidebar-border: 156 30% 20%          /* Border color */
```

## 🎭 Gradients

### Custom Background Gradients
- **`gradient-primary`** - Forest green to environmental green
- **`gradient-carbon`** - Blue-grey to forest green
- **`gradient-eco`** - Bright to rich environmental greens
- **`gradient-sunset`** - Coral red to golden amber
- **`gradient-ocean`** - Electric blue to teal

### Usage
```tsx
<div className="bg-gradient-primary">...</div>
// or
<div className="gradient-eco">...</div>
```

## 🌟 Custom Shadows

```css
--shadow-carbon: 0 4px 24px -8px hsl(156 55% 35% / 0.35)
--shadow-elevated: 0 10px 40px -12px hsl(156 55% 35% / 0.25)
--shadow-glow: 0 0 24px hsl(142 70% 45% / 0.2)
```

### Usage
```tsx
<Card className="shadow-carbon">...</Card>
<Button className="shadow-glow">...</Button>
```

## 🎬 Animations & Keyframes

### Available Animations

1. **`animate-fade-in`** - Fade in with slight upward movement (0.3s)
2. **`animate-scale-in`** - Scale up from 95% to 100% (0.2s)
3. **`animate-slide-up`** - Slide up while fading in (0.3s)
4. **`animate-shimmer`** - Infinite shimmer effect (2s)
5. **`animate-zoom-forward`** - Dramatic zoom forward effect (1.2s)
6. **`animate-pulse-glow`** - Pulsing glow effect (1.5s infinite)
7. **`animate-accordion-down`** - Accordion expand (0.2s)
8. **`animate-accordion-up`** - Accordion collapse (0.2s)

### Usage Examples
```tsx
<div className="animate-fade-in">Content fades in</div>
<div className="animate-scale-in">Content scales in</div>
<div className="animate-shimmer">Loading shimmer</div>
```

## 📐 Border Radius

```typescript
borderRadius: {
  lg: "var(--radius)",           // 0.75rem (12px)
  md: "calc(var(--radius) - 2px)", // 10px
  sm: "calc(var(--radius) - 4px)", // 8px
}
```

## 🖼️ Container Settings

```typescript
container: {
  center: true,
  padding: "2rem",
  screens: {
    "2xl": "1400px",
  },
}
```

## 🔧 Content Paths

Tailwind scans the following paths for class usage:
```typescript
content: [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./app/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}"
]
```

## 📦 Plugins

- **`tailwindcss-animate`** - Provides animation utilities
- **`@tailwindcss/typography`** (dev dependency) - Typography plugin for prose content

## 🎯 Usage Examples

### Scope-specific Cards
```tsx
<Card className="border-l-4 border-scope-1">
  <CardTitle className="text-scope-1">Scope 1 Emissions</CardTitle>
</Card>
```

### Compliance Badges
```tsx
<Badge className="bg-compliance-ncc text-white">NCC Compliant</Badge>
<Badge className="bg-compliance-gbca text-white">GBCA Certified</Badge>
```

### LCA Phase Indicators
```tsx
<div className="bg-lca-material text-white p-4 rounded-lg">
  Material Phase
</div>
```

### Interactive Elements with Animations
```tsx
<Button className="animate-fade-in hover:shadow-glow transition-all">
  Calculate Emissions
</Button>
```

### Chart Components
```tsx
// Recharts automatically uses chart-1 through chart-8 colors
<BarChart data={emissions}>
  <Bar dataKey="scope1" fill="hsl(var(--chart-1))" />
  <Bar dataKey="scope2" fill="hsl(var(--chart-2))" />
</BarChart>
```

## 🎨 Theme Philosophy

The Carbon Construct design system follows these principles:

1. **Professional Twilight Theme** - Balanced between light and dark for optimal visibility
2. **High Contrast** - All colors meet WCAG accessibility standards
3. **Vibrant Data Visualization** - Bright, distinct colors for charts and metrics
4. **Semantic Color Usage** - Colors convey meaning (red for direct emissions, green for value chain)
5. **Consistent Spacing** - Uses Tailwind's default spacing scale
6. **Smooth Interactions** - 200ms transitions on interactive elements
7. **Responsive Design** - Mobile-first approach with sensible breakpoints

## 🔍 Custom Utility Classes

### Text Gradient
```tsx
<h1 className="text-gradient gradient-primary">
  Carbon Calculator
</h1>
```

### Print Utilities
```css
.print\:block  /* Show only in print */
.print\:hidden /* Hide in print */
```

## 📱 Responsive Design

Tailwind's default breakpoints are used:
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1400px (custom)

## 🚀 Development

### Running Tailwind
```bash
npm run dev    # Development with hot reload
npm run build  # Production build with purging
```

### Adding New Colors
1. Add HSL values to `src/index.css` under `:root`
2. Add corresponding key to `tailwind.config.ts` colors object
3. Use in components: `className="bg-your-color"`

### Creating New Animations
1. Define keyframes in `tailwind.config.ts`
2. Add to animations object with timing
3. Use: `className="animate-your-animation"`

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Animate Plugin](https://github.com/jamiebuilds/tailwindcss-animate)
- [shadcn/ui Components](https://ui.shadcn.com/) - Used for base UI components

## 🎓 Best Practices

1. **Use CSS Variables** - All colors use HSL format for consistency
2. **Compose Utilities** - Prefer Tailwind classes over custom CSS
3. **Semantic Naming** - Color names reflect their purpose (scope-1, compliance-ncc)
4. **Maintain Contrast** - Always pair with appropriate foreground colors
5. **Test Accessibility** - Verify color contrast ratios meet WCAG standards
6. **Mobile First** - Apply responsive classes progressively (sm:, md:, lg:)
7. **Optimize Builds** - Tailwind purges unused classes in production

---

**Last Updated**: December 2025  
**Tailwind Version**: 3.4.17  
**Design System**: Carbon Construct v1.0.0
