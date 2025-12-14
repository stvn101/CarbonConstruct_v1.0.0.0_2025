# How to View Tailwind Configuration

This guide explains different ways to view and explore the Tailwind CSS configuration for Carbon Construct.

## 📚 Documentation Files

The Tailwind configuration is thoroughly documented in three complementary files:

### 1. **TAILWIND_CONFIGURATION.md** - Complete Documentation
   - Full overview of all colors, gradients, and design tokens
   - Detailed descriptions of each color system (scopes, LCA, compliance)
   - Animation and keyframe documentation
   - Border radius, shadows, and utility classes
   - Theme philosophy and best practices
   - **When to use**: For comprehensive understanding and reference

### 2. **TAILWIND_EXAMPLES.md** - Practical Code Examples
   - Real-world code snippets using the configuration
   - Component examples (cards, badges, charts)
   - Responsive patterns and layouts
   - Interactive element styling
   - Chart integration examples
   - **When to use**: When implementing features or learning by example

### 3. **TAILWIND_QUICK_REFERENCE.md** - Developer Cheat Sheet
   - Quick lookup of color classes
   - Common pattern snippets
   - Animation classes list
   - Responsive breakpoints
   - VSCode setup tips
   - **When to use**: During active development for quick lookups

## 🎨 Visual Showcase

### HTML Showcase File
A standalone HTML file (`tailwind-showcase.html`) demonstrates the color system visually:

**To view locally:**
```bash
# Option 1: Using Python
python3 -m http.server 8080
# Then open: http://localhost:8080/tailwind-showcase.html

# Option 2: Using Node.js
npx http-server -p 8080
# Then open: http://localhost:8080/tailwind-showcase.html

# Option 3: Open directly in browser
# Simply double-click tailwind-showcase.html
```

The showcase displays:
- ✅ All 3 emission scope colors with example cards
- ✅ 4 LCA phase colors with badges
- ✅ 3 compliance framework colors with indicators
- ✅ 8-color chart palette
- ✅ Live color values (HSL format)

## 🔍 Exploring Source Files

### Configuration Files

1. **`tailwind.config.ts`** - Main Tailwind Configuration
   ```bash
   # View the file
   cat tailwind.config.ts
   
   # Or in your editor
   code tailwind.config.ts
   ```
   Contains:
   - Theme extensions
   - Color definitions
   - Animation keyframes
   - Plugin configuration

2. **`src/index.css`** - CSS Variables & Utilities
   ```bash
   # View the file
   cat src/index.css
   
   # Or in your editor
   code src/index.css
   ```
   Contains:
   - HSL color variables
   - Custom utility classes
   - Base styles
   - Gradient definitions

3. **`postcss.config.js`** - PostCSS Configuration
   ```bash
   cat postcss.config.js
   ```
   Shows how Tailwind is processed.

## 🚀 Running the Application

To see the Tailwind configuration in action within the actual application:

```bash
# 1. Install dependencies
# Use --legacy-peer-deps due to React 19 compatibility issues with next-themes (see repo notes)
npm install --legacy-peer-deps

# 2. Start development server
npm run dev

# 3. Open your browser to the URL shown (typically http://localhost:5173)
```

### What You'll See in the App:
- Dashboard with scope-colored emission cards
- Charts using the 8-color palette
- Compliance framework badges
- LCA phase indicators
- Animated transitions and gradients
- Responsive sidebar navigation

## 🔎 Inspecting Colors in Browser DevTools

Once the app is running:

1. **Open DevTools** (F12 or Right-click → Inspect)
2. **Select the Elements tab**
3. **Click on any colored element**
4. **In the Styles panel**, look for:
   ```css
   background-color: hsl(var(--scope-1));
   ```
5. **In the Console**, check variable values:
   ```javascript
   getComputedStyle(document.documentElement).getPropertyValue('--scope-1')
   // Returns: "15 90% 58%"
   ```

## 📊 Viewing in Git

### Current Branch
```bash
# Check what branch you're on
git branch

# View recent Tailwind-related changes
git log --oneline --all -- tailwind.config.ts src/index.css
```

### Main Branch Comparison
```bash
# View Tailwind config from main branch
git show main:tailwind.config.ts

# Compare with current branch
git diff main -- tailwind.config.ts

# View CSS variables from main
git show main:src/index.css
```

## 🎓 Learning Path

### For New Developers:
1. Start with **TAILWIND_QUICK_REFERENCE.md** (5 min read)
2. Browse **TAILWIND_EXAMPLES.md** for patterns (15 min)
3. Open **tailwind-showcase.html** in browser (visual reference)
4. Read **TAILWIND_CONFIGURATION.md** for deep dive (30 min)
5. Run `npm run dev` to see it in action

### For Designers:
1. Open **tailwind-showcase.html** to see all colors
2. Review **TAILWIND_CONFIGURATION.md** for color meanings
3. Run the application to see real usage
4. Use browser DevTools to inspect specific elements

### For Experienced Developers:
1. Check **TAILWIND_QUICK_REFERENCE.md** for class names
2. Reference **TAILWIND_EXAMPLES.md** when implementing
3. Jump into `tailwind.config.ts` and `src/index.css` directly
4. Use VSCode IntelliSense for autocomplete

## 🛠️ Development Tools

### VSCode Extensions
Install these for the best experience:
- **Tailwind CSS IntelliSense** - Autocomplete and previews
- **PostCSS Language Support** - Syntax highlighting
- **Color Highlight** - Shows colors inline

### Browser Extensions
- **React Developer Tools** - Inspect component props
- **Tailwind CSS Devtools** - View applied Tailwind classes

### Command Line Tools
```bash
# Search for specific color usage
grep -r "bg-scope-1" src/

# Find all gradient usage
grep -r "gradient-" src/

# List all animation usage
grep -r "animate-" src/
```

## 📁 File Structure

```
├── tailwind.config.ts              # Main Tailwind config
├── postcss.config.js               # PostCSS processing
├── src/
│   ├── index.css                   # CSS variables & utilities
│   ├── components/                 # React components using Tailwind
│   └── pages/                      # Page components
├── TAILWIND_CONFIGURATION.md       # Complete documentation
├── TAILWIND_EXAMPLES.md            # Code examples
├── TAILWIND_QUICK_REFERENCE.md     # Quick lookup guide
├── TAILWIND_VIEWING_GUIDE.md       # This file
└── tailwind-showcase.html          # Visual color showcase
```

## 🎯 Common Use Cases

### "I need to know what color to use for Scope 1 emissions"
→ Open **TAILWIND_QUICK_REFERENCE.md** → Search "scope-1" → `bg-scope-1`

### "I want to see examples of gradient usage"
→ Open **TAILWIND_EXAMPLES.md** → Search "gradient" → Copy example

### "I need to understand the design system philosophy"
→ Open **TAILWIND_CONFIGURATION.md** → Read "Theme Philosophy" section

### "I want to see all colors visually"
→ Open **tailwind-showcase.html** in browser

### "I need to implement a compliance badge"
→ Open **TAILWIND_EXAMPLES.md** → Search "Compliance Badges" → Copy code

## 💡 Tips

1. **Keep TAILWIND_QUICK_REFERENCE.md open** while coding
2. **Bookmark tailwind-showcase.html** for color reference
3. **Use browser DevTools** to inspect real implementations
4. **Search documentation** with Ctrl+F / Cmd+F
5. **Check git history** to see how colors evolved

## 🔗 External Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Color Tools](https://tailwindcss.com/docs/customizing-colors)
- [HSL Color Picker](https://hslpicker.com/)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)

## 📞 Getting Help

If you can't find what you need:
1. Search all documentation files with your keyword
2. Check the examples file for similar patterns
3. Inspect working code in `src/components/`
4. Review recent git commits for context
5. Consult Tailwind CSS official documentation

---

**Happy Coding!** 🎨 The Tailwind configuration is comprehensive and well-documented. Use this guide to navigate it effectively.
