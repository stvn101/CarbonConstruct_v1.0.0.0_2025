# CarbonConstruct Build & Development Guide

## Quick Start

Get the development server running in your browser in just a few steps:

```bash
# 1. Install dependencies (use --legacy-peer-deps due to React compatibility)
npm install --legacy-peer-deps

# 2. Start the development server
npm run dev

# 3. Open your browser to:
# http://localhost:8080
```

That's it! The dev server will auto-reload when you make changes.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

To verify your installation:

```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 8.x or higher
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/stvn101/CarbonConstruct_v1.0.0.0_2025.git
cd CarbonConstruct_v1.0.0.0_2025
```

### 2. Install Dependencies

**Important**: Use the `--legacy-peer-deps` flag due to React 19 compatibility with some dependencies:

```bash
npm install --legacy-peer-deps
```

This will install all required packages including:
- React 18.2.0
- Vite 7.2.6 (build tool)
- TypeScript 5.8.3
- Tailwind CSS 3.4.17
- Supabase client
- And many more...

**Why `--legacy-peer-deps`?**
Some dependencies like `next-themes` have peer dependency requirements that need this flag. The memory notes indicate this is the recommended approach for this project.

---

## Development Server

### Start the Dev Server

```bash
npm run dev
```

This will:
- Start Vite development server on port **8080**
- Enable hot module replacement (HMR)
- Watch for file changes and auto-reload
- Provide source maps for debugging

### Access in Browser

Once the server starts, open your browser to:

```
http://localhost:8080
```

Or if you want to access from other devices on your network:

```
http://[your-ip-address]:8080
```

The server binds to `::` (all interfaces) so it's accessible from your local network.

### Development Features

- **Hot Reload**: Changes to React components update instantly
- **TypeScript**: Real-time type checking
- **Fast Refresh**: Preserves component state during updates
- **Source Maps**: Easy debugging in browser DevTools

---

## Building for Production

### Standard Build

Build the production-ready application:

```bash
npm run build
```

This will:
1. Compile TypeScript to JavaScript
2. Bundle and optimize React components
3. Process Tailwind CSS
4. Minify and tree-shake code
5. Generate optimized assets in `dist/` folder
6. Remove console statements and debuggers

**Output**: `dist/` directory with production files

### Development Build

Build with development settings (keeps debugging features):

```bash
npm run build:dev
```

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

This serves the built files from `dist/` on `http://localhost:4173`

---

## Project Scripts

All available npm scripts from `package.json`:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Build for production |
| `npm run build:dev` | Build with development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint code quality checks |
| `npm test` | Run Vitest unit tests |
| `npm run test:ui` | Run tests with UI dashboard |
| `npm run test:coverage` | Run tests with coverage report |

---

## Technology Stack

This project is built with modern web technologies:

### Core Framework
- **Vite 7.2.6** - Lightning-fast build tool
- **React 18.2.0** - UI framework
- **TypeScript 5.8.3** - Type-safe JavaScript
- **React Router 7.11.0** - Client-side routing

### Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Backend & State
- **Supabase** - Backend as a Service (Auth, Database, Edge Functions)
- **TanStack Query** - Powerful data fetching & caching
- **Zod** - TypeScript-first schema validation

### Development
- **Vitest** - Fast unit testing
- **Playwright** - E2E testing
- **ESLint** - Code quality
- **PostCSS** - CSS processing

---

## Port Configuration

The development server uses **port 8080** by default. This is configured in `vite.config.ts`:

```typescript
server: {
  host: "::",  // Binds to all network interfaces
  port: 8080,
}
```

### Change the Port

If port 8080 is in use, you can:

1. **Temporary override**: Add `--port` flag
   ```bash
   npm run dev -- --port 3000
   ```

2. **Permanent change**: Edit `vite.config.ts` and change the port number

---

## Browser Compatibility

The application supports modern browsers:

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

**Note**: Internet Explorer is not supported.

---

## Troubleshooting

### Issue: `npm install` fails with peer dependency errors

**Solution**: Use the `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

### Issue: Port 8080 is already in use

**Solution**: Either stop the process using that port, or use a different port:
```bash
npm run dev -- --port 3000
```

### Issue: Build fails with TypeScript errors

**Solution**: Run type checking to see detailed errors:
```bash
npx tsc --noEmit
```

### Issue: Module not found errors after pulling new changes

**Solution**: Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: Development server is slow

**Solution**: 
1. Clear Vite cache: `rm -rf node_modules/.vite`
2. Restart the dev server

---

## Development Workflow

### Typical Development Session

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Make your changes** in `src/` directory

3. **Browser auto-reloads** - see changes instantly

4. **Run tests** when needed:
   ```bash
   npm test
   ```

5. **Lint your code** before committing:
   ```bash
   npm run lint
   ```

6. **Build to verify** everything works:
   ```bash
   npm run build
   ```

### Project Structure

```
CarbonConstruct_v1.0.0.0_2025/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── lib/               # Utilities
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── supabase/              # Backend configuration
├── e2e/                   # End-to-end tests
├── dist/                  # Build output (generated)
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind configuration
└── package.json           # Dependencies and scripts
```

---

## Environment Variables

The project uses environment variables for configuration. These are managed automatically by Lovable Cloud, but for local development:

**Required variables** (in `.env`):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key

**Note**: Never commit `.env` files to Git. They contain sensitive information.

---

## Next Steps

### For Development
- Explore the codebase in `src/`
- Read `AGENTS.md` for coding guidelines
- Check `.github/instructions/` for component patterns
- Review `TAILWIND_VIEWING_GUIDE.md` for design system

### For Deployment
- See `README.md` for Lovable deployment
- Check `SUPABASE_DEPLOYMENT.md` for backend deployment
- Review `PRODUCTION_READINESS_CHECKLIST.md`

### For Testing
- Run `npm test` for unit tests
- Run `npx playwright test` for E2E tests
- See `SECURITY_TESTING_GUIDE.md` for security tests

---

## Additional Resources

- **Vite Documentation**: https://vitejs.dev/
- **React Documentation**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Supabase**: https://supabase.com/docs
- **Project Lovable**: https://lovable.dev/

---

## Support

For issues or questions:
1. Check this guide's troubleshooting section
2. Review repository documentation files
3. Check GitHub Issues
4. Consult Lovable documentation

---

**Happy coding! 🚀**
