import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    force: true, // Force re-bundling of dependencies
    exclude: ['react', 'react-dom'], // Force fresh React modules
    esbuildOptions: {
      target: 'esnext'
    }
  },
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
}));
