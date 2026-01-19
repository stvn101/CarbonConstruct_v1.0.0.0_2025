import { Link, useLocation } from "react-router-dom";
import { 
  Activity, 
  Database, 
  Megaphone, 
  FileSpreadsheet, 
  Shield, 
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  path: string;
  name: string;
  icon: React.ElementType;
  description: string;
}

const adminNavItems: NavItem[] = [
  {
    path: "/admin/monitoring",
    name: "Monitoring",
    icon: Activity,
    description: "System health, logs, and performance metrics",
  },
  {
    path: "/admin/campaigns",
    name: "Campaigns",
    icon: Megaphone,
    description: "UTM-tagged marketing campaign URLs",
  },
  {
    path: "/admin/ice-import",
    name: "ICE Import",
    icon: FileSpreadsheet,
    description: "Import ICE Database materials",
  },
  {
    path: "/materials/status",
    name: "Database Status",
    icon: Database,
    description: "Materials database statistics",
  },
  {
    path: "/admin/material-verification",
    name: "Verification",
    icon: Shield,
    description: "Material data verification reports",
  },
  {
    path: "/admin/marketing",
    name: "Marketing",
    icon: Target,
    description: "Tracking scripts and integrations",
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "sticky top-0 h-screen border-r bg-card transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="font-bold text-foreground">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">System management</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {adminNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} to={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary-foreground")} />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", isActive && "text-primary-foreground")}>
                      {item.name}
                    </p>
                    {!isActive && (
                      <p className="text-xs text-muted-foreground truncate group-hover:text-foreground/70">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        {!collapsed ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="h-3 w-3" />
            <span>CarbonConstruct Admin</span>
          </div>
        ) : (
          <Settings className="h-4 w-4 mx-auto text-muted-foreground" />
        )}
      </div>
    </aside>
  );
}

export default AdminSidebar;
