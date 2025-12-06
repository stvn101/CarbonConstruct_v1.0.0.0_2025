import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatAssistant } from "@/components/ChatAssistant";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  return (
    <SidebarProvider defaultOpen={false}>
      {/* Skip links for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header
            className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-3 md:px-4"
            role="banner"
            aria-label="Main navigation"
          >
            <SidebarTrigger className="mr-2 md:mr-4" aria-label="Toggle sidebar navigation" />
            <div className="flex-1" />
            <div
              className="text-xs md:text-sm text-muted-foreground hidden sm:block"
              aria-label="Compliance information"
            >
              Australian NCC Compliant • Green Star Ready
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
      </div>
    </SidebarProvider>
  );
}