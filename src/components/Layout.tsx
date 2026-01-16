import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatAssistant } from "@/components/ChatAssistant";
import { CookieConsent } from "@/components/CookieConsent";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { useLocation, useNavigate } from "react-router-dom";
import { Play, LogIn, UserPlus, Mail } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if on a Tools section page (but NOT on demo page - it has its own Book a Demo)
  const toolsPages = ['/settings', '/pricing', '/impact', '/roadmap', '/help'];
  const isToolsPage = toolsPages.some(page => location.pathname.startsWith(page));
  
  // Check if on landing page (root path) and user is not logged in
  const isLandingPage = location.pathname === '/' && !user;

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
        <div className="flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header
            className="h-14 border-b border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-3 md:px-4 pt-[env(safe-area-inset-top)]"
            role="banner"
            aria-label="Main navigation"
          >
            <SidebarTrigger className="mr-2 md:mr-4" aria-label="Toggle sidebar navigation" />
            <a href="/" className="flex items-center">
              <ResponsiveImage 
                src="/logo-32.webp" 
                sources={{
                  "32w": "/logo-32.webp",
                  "56w": "/logo-56.webp",
                  "96w": "/logo-96.webp"
                }}
                sizes="32px"
                alt="CarbonConstruct" 
                className="h-8 w-auto"
                width={32}
                height={32}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </a>
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/contact')}
                className="hidden sm:flex items-center gap-1.5"
              >
                <Mail className="h-4 w-4" />
                Contact
              </Button>
              <div
                className="text-xs md:text-sm text-muted-foreground hidden lg:block"
                aria-label="Compliance information"
              >
                Australian NCC Compliant • Green Star Ready
              </div>
              {/* Sign In / Sign Up buttons only on landing page */}
              {isLandingPage && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/auth')}
                    className="hidden sm:flex items-center gap-1.5"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => navigate('/auth')}
                    className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary/90"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Button>
                </>
              )}
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