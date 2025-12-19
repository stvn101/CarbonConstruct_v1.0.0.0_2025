import * as React from "react";
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

// Eager load only the index page for faster initial render
import Index from "./pages/Index";

// Lazy load all other routes to reduce initial bundle size
const Auth = lazy(() => import("./pages/Auth"));
const Calculator = lazy(() => import("./pages/Calculator"));
const BOQImport = lazy(() => import("./pages/BOQImport"));
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
const AdminCampaigns = lazy(() => import("./pages/AdminCampaigns"));
const AdminICEImport = lazy(() => import("./pages/AdminICEImport"));
const AccessibilityStatement = lazy(() => import("./pages/AccessibilityStatement"));
const MaterialVerification = lazy(() => import("./pages/MaterialVerification"));
const MaterialDatabaseStatus = lazy(() => import("./pages/MaterialDatabaseStatus"));
const EcoComplianceDashboard = lazy(() => import("./pages/EcoComplianceDashboard"));
const Demo = lazy(() => import("./pages/Demo"));
const DesignSystem = lazy(() => import("./pages/DesignSystem"));

// Campaign landing pages
const LandingBuilders = lazy(() => import("./pages/LandingBuilders"));
const LandingArchitects = lazy(() => import("./pages/LandingArchitects"));
const LandingDevelopers = lazy(() => import("./pages/LandingDevelopers"));
const LandingSupplyChain = lazy(() => import("./pages/LandingSupplyChain"));
const LandingConsultants = lazy(() => import("./pages/LandingConsultants"));
const LandingEngineers = lazy(() => import("./pages/LandingEngineers"));
const LandingGovernment = lazy(() => import("./pages/LandingGovernment"));
const LandingInvestors = lazy(() => import("./pages/LandingInvestors"));
const LandingMBAQueensland = lazy(() => import("./pages/LandingMBAQueensland"));
const LandingMBANSW = lazy(() => import("./pages/LandingMBANSW"));
const LandingMBAVictoria = lazy(() => import("./pages/LandingMBAVictoria"));
const LandingMBASA = lazy(() => import("./pages/LandingMBASA"));
const LandingMBAWA = lazy(() => import("./pages/LandingMBAWA"));
const LandingMBATas = lazy(() => import("./pages/LandingMBATas"));
const LandingMBANT = lazy(() => import("./pages/LandingMBANT"));
const LandingMBAACT = lazy(() => import("./pages/LandingMBAACT"));
const LandingProcurement = lazy(() => import("./pages/LandingProcurement"));
const LandingSubcontractors = lazy(() => import("./pages/LandingSubcontractors"));
const LandingEstimators = lazy(() => import("./pages/LandingEstimators"));
const LandingProjectManagers = lazy(() => import("./pages/LandingProjectManagers"));
const LandingSustainabilityManagers = lazy(() => import("./pages/LandingSustainabilityManagers"));
const LandingSiteSupervisors = lazy(() => import("./pages/LandingSiteSupervisors"));
const LandingCostPlanners = lazy(() => import("./pages/LandingCostPlanners"));
const LandingEnvironmentalOfficers = lazy(() => import("./pages/LandingEnvironmentalOfficers"));
const Resources = lazy(() => import("./pages/Resources"));

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

// Page transition wrapper
function AnimatedRoutes({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = React.useState(location);
  const [transitionStage, setTransitionStage] = React.useState("fade-in");

  React.useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("fade-out");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "fade-out") {
      setTransitionStage("fade-in");
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out",
        transitionStage === "fade-in" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      )}
      onTransitionEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
}

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
              <AnimatedRoutes>
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
                    <Route path="/boq-import" element={<BOQImport />} />
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
                    <Route path="/admin/campaigns" element={<AdminCampaigns />} />
                    <Route path="/admin/ice-import" element={<AdminICEImport />} />
                    <Route path="/admin/material-verification" element={<MaterialVerification />} />
                    <Route path="/admin/eco-compliance" element={<EcoComplianceDashboard />} />
                    <Route path="/materials/status" element={<MaterialDatabaseStatus />} />
                    <Route path="/demo" element={<Demo />} />
                    <Route path="/design-system" element={<DesignSystem />} />
                    {/* Campaign landing pages */}
                    <Route path="/lp/builders" element={<LandingBuilders />} />
                    <Route path="/lp/architects" element={<LandingArchitects />} />
                    <Route path="/lp/developers" element={<LandingDevelopers />} />
                    <Route path="/lp/suppliers" element={<LandingSupplyChain />} />
                    <Route path="/lp/supply-chain" element={<LandingSupplyChain />} />
                    <Route path="/lp/consultants" element={<LandingConsultants />} />
                    <Route path="/lp/engineers" element={<LandingEngineers />} />
                    <Route path="/lp/government" element={<LandingGovernment />} />
                    <Route path="/lp/investors" element={<LandingInvestors />} />
                    <Route path="/lp/mba" element={<LandingMBAQueensland />} />
                    <Route path="/lp/mba-nsw" element={<LandingMBANSW />} />
                    <Route path="/lp/mba-vic" element={<LandingMBAVictoria />} />
                    <Route path="/lp/mba-sa" element={<LandingMBASA />} />
                    <Route path="/lp/mba-wa" element={<LandingMBAWA />} />
                    <Route path="/lp/mba-tas" element={<LandingMBATas />} />
                    <Route path="/lp/mba-nt" element={<LandingMBANT />} />
                    <Route path="/lp/mba-act" element={<LandingMBAACT />} />
                    <Route path="/lp/procurement" element={<LandingProcurement />} />
                    <Route path="/lp/subcontractors" element={<LandingSubcontractors />} />
                    <Route path="/lp/estimators" element={<LandingEstimators />} />
                    <Route path="/lp/project-managers" element={<LandingProjectManagers />} />
                    <Route path="/lp/sustainability-managers" element={<LandingSustainabilityManagers />} />
                    <Route path="/lp/site-supervisors" element={<LandingSiteSupervisors />} />
                    <Route path="/lp/cost-planners" element={<LandingCostPlanners />} />
                    <Route path="/lp/environmental-officers" element={<LandingEnvironmentalOfficers />} />
                    <Route path="/resources" element={<Resources />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AnimatedRoutes>
            </Layout>
          </MonitoringProvider>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
