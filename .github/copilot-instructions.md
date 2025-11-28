# Carbon Compass AI Guide

## Project Snapshot

- Frontend-only Vite + React + TypeScript app (`npm run dev`, `npm run build`, `npm run lint`); Vitest is installed but no suites yet.
- Tailwind + shadcn/ui provide the design system (`src/components/ui` primitives) and Lucide icons; prefer composing new UI from these building blocks.
- Path alias `@/*` maps to `src/*` (see `tsconfig.json`); always import via aliases to keep tree-shaking effective.
- Supabase is the single backend: client lives in `src/integrations/supabase/client.ts` and requires `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` at runtime.

## Application Architecture

- `src/App.tsx` wires providers (`QueryClientProvider`, `AuthProvider`, `ProjectProvider`) plus monitoring hooks before rendering routes; add new routes here so they inherit layout + analytics.
- Layout is opinionated: `components/Layout.tsx` wraps every page with sidebar navigation, sticky header, footer, and the persistent `ChatAssistant` panel; reuse this structure instead of page-specific chrome.
- Domains live in feature folders: calculators/reporting in `components/*` and `hooks/use*`, static marketing or settings flows inside `src/pages/*`.
- Data-heavy logic belongs in hooks (e.g., `useEmissionCalculations`, `useEmissionTotals`, `useComplianceCheck`) that orchestrate Supabase queries and formatting; UI components expect these hooks to handle toasts + error states.

## Data & Supabase Patterns

- Project context (`contexts/ProjectContext.tsx`) is the gateway for anything tied to a project; guard calculator/report features by checking `currentProject` and call `refreshProjects` after inserts.
- Emission data uses per-scope tables (`scope1_emissions`, `scope2_emissions`, etc.). Hooks delete-and-insert for idempotency—maintain that behavior to avoid duplicates.
- Validation relies on Zod (see project schema) and `toast` helper for user feedback; follow the same pattern for new forms.
- Edge logging: `lib/logger.ts`, `hooks/usePerformanceMonitor`, and `hooks/useAnalytics` batch events and invoke Supabase Functions (`log-error`, `log-performance`, `log-analytics`). Whenever you add new telemetry, push through these utilities rather than calling fetch directly.

## UI & State Conventions

- Keep presentation components declarative and data-agnostic; pass already formatted numbers/strings from hooks (example: `Index.tsx` receives scoped totals from `useEmissionTotals`).
- Prefer shadcn primitives (`Button`, `Card`, `Tabs`, etc.) and utility classes from Tailwind; animations leverage custom classes like `hover-scale`, `animate-fade-in` defined in the global styles.
- Recharts-based visualizations live in `components/EmissionsChart.tsx`; extend this component or add props rather than duplicating chart setup.
- PDF/Report generation happens through `components/PDFReport.tsx` + `@react-pdf/renderer`; keep expensive rendering inside `React.Suspense` boundaries to avoid blocking the dashboard.

## Developer Workflows

- Install dependencies with npm only (project intentionally removed `bun.lockb`); run `npm install` before any script.
- Environment variables live in `.env` (not committed). For Supabase auth to work locally, provide URL/key and optional GA ID.
- When debugging Supabase edge functions, check `supabase/functions/*` and run them via the Supabase CLI, but front-end code should keep using `supabase.functions.invoke` to stay consistent with production.
- Use `logger` for any non-trivial error path so failures reach monitoring; pair user-facing issues with `toast` notifications in the same block.

## Extension Tips for AI Agents

- Before touching calculator or reporting flows, trace data requirements from the relevant hook to its components; many components assume the hook already normalized units (kg vs tCO₂e) and set `loading` flags.
- Any new feature that depends on authentication must live under `AuthProvider` and ideally expose a hook to keep components lean.
- Keep bundle size in mind: non-critical pages load via `React.lazy` in `App.tsx`; follow that model for additional routes.
- If you introduce new Supabase tables, add their type definitions under `src/integrations/supabase/types.ts` so TypeScript remains accurate.

Please let me know if any section above needs clarification or if other workflows should be captured.
