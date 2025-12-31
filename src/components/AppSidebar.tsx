import { Calculator, FileBarChart, Settings, Home, HelpCircle, ChevronRight, DollarSign, Leaf, Map, Play, Upload, Sparkles } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const logoImage32 = "/logo-32.webp";
const calculatorItems = [{
  title: "Dashboard",
  url: "/",
  icon: Home,
  color: "text-chart-4"
}, {
  title: "Calculator",
  url: "/calculator",
  icon: Calculator,
  color: "text-chart-1"
}, {
  title: "BOQ Import",
  url: "/boq-import",
  icon: Upload,
  color: "text-purple-400"
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
  color: "text-sidebar-foreground/70"
}, {
  title: "Pricing",
  url: "/pricing",
  icon: DollarSign,
  color: "text-amber-400"
}, {
  title: "AI BOQ Demo",
  url: "/demo",
  icon: Play,
  color: "text-purple-400"
}, {
  title: "Eco-Glass Dashboard",
  url: "/eco-dashboard",
  icon: Sparkles,
  color: "text-emerald-400"
}, {
  title: "Our Impact",
  url: "/impact",
  icon: Leaf,
  color: "text-green-400"
}, {
  title: "Roadmap",
  url: "/roadmap",
  icon: Map,
  color: "text-blue-400"
}, {
  title: "Help & Resources",
  url: "/help",
  icon: HelpCircle,
  color: "text-cyan-400"
}] as const;
export function AppSidebar() {
  useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => path === "/" ? currentPath === path : currentPath.startsWith(path);
  return <Sidebar collapsible="icon" className="transition-all duration-500 ease-in-out">
      <SidebarContent className="bg-sidebar border-r border-primary/30 transition-all duration-500 ease-in-out">
        {/* Brand Header */}
        <div className="p-4 border-b border-sidebar-border/50 bg-sidebar-accent/30 overflow-visible">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer whitespace-nowrap">
                  <img 
                    src={logoImage32} 
                    alt="CarbonConstruct Logo" 
                    className="h-8 w-8 min-h-8 min-w-8 flex-shrink-0 object-contain"
                    width="32"
                    height="32"
                  />
                  <div className="group-data-[collapsible=icon]/sidebar-wrapper:opacity-0 group-data-[collapsible=icon]/sidebar-wrapper:w-0 group-data-[collapsible=icon]/sidebar-wrapper:overflow-hidden transition-all duration-300 ease-in-out">
                    <h1 className="font-bold text-base text-sidebar-foreground whitespace-nowrap">CarbonConstruct</h1>
                    <p className="text-xs text-sidebar-foreground/70 whitespace-nowrap">Pro Edition</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="group-data-[state=expanded]/sidebar-wrapper:hidden">
                <p>CarbonConstruct Pro Edition</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Calculator Section */}
        <SidebarGroup className="mt-4 px-3">
          <SidebarGroupLabel className="text-sidebar-foreground/60 font-semibold text-xs uppercase tracking-wider mb-2 px-2 group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            Carbon Calculator
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1" role="navigation" aria-label="Carbon Calculator">
              {calculatorItems.map(item => {
              const active = isActive(item.url);
              return <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} end={item.url === "/"} className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-in-out ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md scale-105" : "text-sidebar-foreground hover:bg-sidebar-accent hover:scale-102"}`}>
                        <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ease-in-out ${active ? "text-sidebar-primary-foreground" : item.color}`} />
                        <span className="font-medium text-sm group-data-[collapsible=icon]/sidebar-wrapper:hidden group-data-[collapsible=icon]/sidebar-wrapper:opacity-0 transition-all duration-500 ease-in-out opacity-100">{item.title}</span>
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
            <SidebarMenu className="space-y-1" role="navigation" aria-label="Tools">
              {otherItems.map(item => {
              const active = !('external' in item) && isActive(item.url);
              const isExternal = 'external' in item && item.external;
              
              if (isExternal) {
                return <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-in-out text-sidebar-foreground hover:bg-sidebar-accent hover:scale-102">
                          <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ease-in-out ${item.color}`} />
                          <span className="font-medium text-sm group-data-[collapsible=icon]/sidebar-wrapper:hidden group-data-[collapsible=icon]/sidebar-wrapper:opacity-0 transition-all duration-500 ease-in-out opacity-100">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>;
              }
              
              return <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url} className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-in-out ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md scale-105" : "text-sidebar-foreground hover:bg-sidebar-accent hover:scale-102"}`}>
                        <item.icon className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ease-in-out ${active ? "text-sidebar-primary-foreground" : item.color}`} />
                        <span className="font-medium text-sm group-data-[collapsible=icon]/sidebar-wrapper:hidden group-data-[collapsible=icon]/sidebar-wrapper:opacity-0 transition-all duration-500 ease-in-out opacity-100">{item.title}</span>
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