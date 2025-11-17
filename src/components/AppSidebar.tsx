import { Calculator, Factory, Zap, Truck, FileBarChart, Settings, Home, HelpCircle, Package, ChevronRight, DollarSign } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import logoImage from "@/assets/carbonconstruct-logo.png";
const calculatorItems = [{
  title: "Dashboard",
  url: "/",
  icon: Home,
  color: "text-chart-4"
}, {
  title: "Scope 1 (Direct)",
  url: "/scope-1",
  icon: Factory,
  color: "text-chart-1"
}, {
  title: "Scope 2 (Energy)",
  url: "/scope-2",
  icon: Zap,
  color: "text-chart-2"
}, {
  title: "Scope 3 (Value Chain)",
  url: "/scope-3",
  icon: Truck,
  color: "text-chart-3"
}, {
  title: "LCA Calculator",
  url: "/lca",
  icon: Package,
  color: "text-chart-5"
}, {
  title: "Reports & Analysis",
  url: "/reports",
  icon: FileBarChart,
  color: "text-chart-6"
}];
const otherItems = [{
  title: "Settings",
  url: "/settings",
  icon: Settings,
  color: "text-muted-foreground"
}, {
  title: "Pricing",
  url: "/pricing",
  icon: DollarSign,
  color: "text-muted-foreground"
}, {
  title: "Help & Resources",
  url: "/help",
  icon: HelpCircle,
  color: "text-muted-foreground"
}];
export function AppSidebar() {
  const {
    open
  } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => path === "/" ? currentPath === path : currentPath.startsWith(path);
  return <Sidebar collapsible="icon" className="transition-all duration-300">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Brand Header */}
        <div className="p-4 border-b border-sidebar-border/50 bg-sidebar-accent/30">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]/sidebar-wrapper:justify-center">
            <img 
              src={logoImage} 
              alt="CarbonConstruct Logo" 
              className="h-8 w-8 flex-shrink-0 object-contain" 
            />
            <div className="group-data-[collapsible=icon]/sidebar-wrapper:hidden animate-fade-in">
              <h1 className="font-bold text-base text-sidebar-foreground">CarbonConstruct</h1>
              <p className="text-xs text-sidebar-foreground/70">Pro Edition</p>
            </div>
          </div>
        </div>

        {/* Calculator Section */}
        <SidebarGroup className="mt-4 px-3">
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-semibold text-xs uppercase tracking-wider mb-2 px-2 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            Carbon Calculator
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {calculatorItems.map(item => {
              const active = isActive(item.url);
              return <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} end={item.url === "/"} className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md scale-105" : "text-sidebar-foreground hover:bg-sidebar-accent hover:scale-102"}`}>
                        <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${active ? "text-sidebar-primary-foreground" : item.color}`} />
                        <span className="font-medium text-sm group-data-[collapsible=icon]/sidebar-wrapper:hidden">{item.title}</span>
                        {active && <ChevronRight className="h-4 w-4 ml-auto opacity-70 group-data-[collapsible=icon]/sidebar-wrapper:hidden" />}
                        {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary-foreground rounded-r-full" />}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>;
            })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider */}
        <div className="mx-6 my-4 border-t border-sidebar-border/30" />

        {/* Tools Section */}
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-semibold text-xs uppercase tracking-wider mb-2 px-2 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {otherItems.map(item => {
              const active = isActive(item.url);
              return <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md scale-105" : "text-sidebar-foreground hover:bg-sidebar-accent hover:scale-102"}`}>
                        <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-sidebar-primary-foreground" : item.color}`} />
                        <span className="font-medium text-sm group-data-[collapsible=icon]/sidebar-wrapper:hidden">{item.title}</span>
                        {active && <ChevronRight className="h-4 w-4 ml-auto opacity-70 group-data-[collapsible=icon]/sidebar-wrapper:hidden" />}
                        {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary-foreground rounded-r-full" />}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>;
            })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer Gradient */}
        <div className="mt-auto h-20 bg-gradient-to-t from-sidebar-accent/50 to-transparent" />
      </SidebarContent>
    </Sidebar>;
}