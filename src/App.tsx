import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Calculator from "./pages/Calculator";
import Scope1 from "./pages/Scope1";
import Scope2 from "./pages/Scope2";
import Scope3 from "./pages/Scope3";
import LCA from "./pages/LCA";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Pricing from "./pages/Pricing";
import Impact from "./pages/Impact";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProjectProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/calculator" 
                  element={
                    <ErrorBoundary fallbackTitle="Calculator Error" showHomeButton>
                      <Calculator />
                    </ErrorBoundary>
                  } 
                />
                <Route path="/scope-1" element={<Scope1 />} />
                <Route path="/scope-2" element={<Scope2 />} />
                <Route path="/scope-3" element={<Scope3 />} />
                <Route 
                  path="/lca" 
                  element={
                    <ErrorBoundary fallbackTitle="LCA Analysis Error" showHomeButton>
                      <LCA />
                    </ErrorBoundary>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <ErrorBoundary fallbackTitle="Reports Error" showHomeButton>
                      <Reports />
                    </ErrorBoundary>
                  } 
                />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route 
                  path="/impact" 
                  element={
                    <ErrorBoundary fallbackTitle="Impact Page Error" showHomeButton>
                      <Impact />
                    </ErrorBoundary>
                  } 
                />
                <Route path="/install" element={<Install />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </ProjectProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
