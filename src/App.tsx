import * as React from "react";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useAnalytics } from "@/hooks/useAnalytics";

// Eager load only the index page for faster initial render
import Index from "./pages/Index";

// Lazy load all other routes to reduce initial bundle size
const Auth = lazy(() => import("./pages/Auth"));
const Calculator = lazy(() => import("./pages/Calculator"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Help = lazy(() => import("./pages/Help"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Impact = lazy(() => import("./pages/Impact"));
const Install = lazy(() => import("./pages/Install"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const AdminMonitoring = lazy(() => import("./pages/AdminMonitoring"));
const AccessibilityStatement = lazy(() => import("./pages/AccessibilityStatement"));
const MaterialVerification = lazy(() => import("./pages/MaterialVerification"));
const MaterialDatabaseStatus = lazy(() => import("./pages/MaterialDatabaseStatus"));
const Demo = lazy(() => import("./pages/Demo"));
const DesignSystem = lazy(() => import("./pages/DesignSystem"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute - data considered fresh
      gcTime: 1000 * 60 * 5, // 5 minutes - cache garbage collection
      refetchOnWindowFocus: false, // Don't refetch when tab focused
      retry: 1, // Only retry once on failure
    },
  },
});

// Monitoring wrapper component
function MonitoringProvider({ children }: { children: React.ReactNode }) {
  usePerformanceMonitor();
  useAnalytics();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProjectProvider>
        <Toaster />
        <BrowserRouter>
          <MonitoringProvider>
            <Layout>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen" role="status" aria-live="polite">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-hidden="true"></div>
                  <span className="sr-only">Loading page content...</span>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/calculator" element={<Calculator />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/impact" element={<Impact />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  <Route path="/roadmap" element={<Roadmap />} />
                  <Route path="/accessibility" element={<AccessibilityStatement />} />
                  <Route path="/admin" element={<AdminMonitoring />} />
                  <Route path="/admin/monitoring" element={<AdminMonitoring />} />
                  <Route path="/admin/material-verification" element={<MaterialVerification />} />
                  <Route path="/materials/status" element={<MaterialDatabaseStatus />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/design-system" element={<DesignSystem />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </MonitoringProvider>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
