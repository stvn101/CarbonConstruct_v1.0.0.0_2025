import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Cache bust: 2025-12-14T08:15 - React 19 scheduler override fix v24
// Note: Using npm overrides to force scheduler@0.23.2 (React 19 compatible)
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      strict: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "react/jsx-runtime": path.resolve(__dirname, "node_modules/react/jsx-runtime"),
      "react/jsx-dev-runtime": path.resolve(__dirname, "node_modules/react/jsx-dev-runtime"),
      "react-dom/client": path.resolve(__dirname, "node_modules/react-dom/client"),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
      '@radix-ui/react-toast',
      'sonner',
      'next-themes',
      '@supabase/supabase-js',
      'react-router-dom',
      'class-variance-authority',
      'embla-carousel-react',
    ],
    exclude: [
      '@axe-core/react',  // Excluded: React 17 compatibility issues (disabled in code)
      'lovable-tagger',   // Excluded: May cause version conflicts in Lovable cloud
    ],
    force: true,
    esbuildOptions: {
      target: "esnext",
    },
  },
  clearScreen: false,
  build: {
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select'],
          'charts': ['recharts'],
          'supabase': ['@supabase/supabase-js'],
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
