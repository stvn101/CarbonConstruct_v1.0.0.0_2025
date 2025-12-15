import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatAssistant } from "@/components/ChatAssistant";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Play } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if on a Tools section page (but NOT on demo page - it has its own Book a Demo)
  const toolsPages = ['/settings', '/pricing', '/impact', '/roadmap', '/help'];
  const isToolsPage = toolsPages.some(page => location.pathname.startsWith(page));

  return (
    <>
      {/* Skip links - MUST be first focusable elements */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <a
        href="#footer"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-52 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to footer
      </a>

      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col md:ml-[--sidebar-width-icon] group-data-[state=expanded]/sidebar-wrapper:md:ml-[--sidebar-width] transition-[margin] duration-200 ease-linear">
          <header
            className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-3 md:px-4"
            role="banner"
            aria-label="Main navigation"
          >
            <SidebarTrigger className="mr-2 md:mr-4" aria-label="Toggle sidebar navigation" />
            {isToolsPage && (
              <a href="https://calendar.app.google/1SMFPsNBFS7V5pu37" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="mr-4">
                  <Play className="h-4 w-4 mr-2" />
                  Book a Demo
                </Button>
              </a>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div
                className="text-xs md:text-sm text-muted-foreground hidden sm:block"
                aria-label="Compliance information"
              >
                Australian NCC Compliant • Green Star Ready
              </div>
              <ThemeToggle />
            </div>
          </header>

          <main
            id="main-content"
            className="flex-1 p-3 md:p-6"
            role="main"
            aria-label="Main content"
          >
            {children}
          </main>

          <Footer />
        </div>
          {user && <ChatAssistant />}
          <CookieConsent />
        </div>
      </SidebarProvider>
    </>
  );
}