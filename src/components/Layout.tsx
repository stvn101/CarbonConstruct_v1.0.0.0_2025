import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 flex items-center px-3 md:px-4">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <div className="flex-1" />
            <div className="text-xs md:text-sm text-muted-foreground hidden sm:block">
              Australian NCC Compliant • Green Star Ready
            </div>
          </header>
          
          <main className="flex-1 p-3 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}