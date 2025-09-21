import { 
  Calculator, 
  Factory, 
  Zap, 
  Truck, 
  FileBarChart, 
  Settings,
  Home,
  HelpCircle
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const calculatorItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Scope 1 (Direct)", url: "/scope-1", icon: Factory },
  { title: "Scope 2 (Energy)", url: "/scope-2", icon: Zap },
  { title: "Scope 3 (Value Chain)", url: "/scope-3", icon: Truck },
  { title: "Reports & Analysis", url: "/reports", icon: FileBarChart },
];

const otherItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help & Resources", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => path === "/" ? currentPath === path : currentPath.startsWith(path);

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-green-800 text-white font-medium border-l-4 border-green-600"
      : "bg-green-700 text-white hover:bg-green-600 transition-colors";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent className="bg-green-50 border-r">
        <div className="p-4 border-b">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg text-primary">CarbonCalc Pro</span>
            </div>
          )}
          {collapsed && (
            <Calculator className="h-6 w-6 text-primary mx-auto" />
          )}
        </div>

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-muted-foreground font-medium">
            {!collapsed && "Carbon Calculator"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calculatorItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"} 
                      className={getNavClass}
                    >
                       <item.icon className="h-4 w-4" />
                       <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-muted-foreground font-medium">
            {!collapsed && "Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      className={getNavClass}
                    >
                       <item.icon className="h-4 w-4" />
                       <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}