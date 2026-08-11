import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Headphones,
  UserCog,
  Contact,
  ShieldCheck,
  Bot,
  Blocks,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import softwareValaLogo from "@/assets/software-vala-logo-transparent.png";

const items = [
  { to: "/", label: "Command Center", icon: LayoutDashboard },
  { to: "/support", label: "Support Ops", icon: Headphones },
  { to: "/support-agent", label: "Agent Workspace", icon: UserCog },
  { to: "/sales-crm", label: "Sales CRM", icon: Contact },
  { to: "/sales-support-manager", label: "Manager Console", icon: ShieldCheck },
  { to: "/support-chatbot", label: "Chatbot", icon: Bot },
  { to: "/support-chatbot-blueprint", label: "Chatbot Blueprint", icon: Blocks },
  { to: "/internal-support-ai", label: "Internal Support AI", icon: Sparkles },
] as const;

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      aria-label="Sales & Support modules"
      className={cn(
        "sticky top-0 z-50 flex h-screen shrink-0 flex-col border-r border-border/60 bg-card/60 backdrop-blur transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2 border-b border-border/60 px-3",
          collapsed && "justify-center px-0",
        )}
      >
        <img
          src={softwareValaLogo}
          alt="Software Vala"
          className="h-9 w-9 shrink-0 rounded-full object-contain"
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">Software Vala</p>
            <p className="truncate text-[10px] text-muted-foreground">Sales &amp; Support</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {items.map(({ to, label, icon: Icon }) => {
          const link = (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-0",
              )}
              activeProps={{ className: "bg-primary/15 text-primary" }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );

          if (!collapsed) return link;
          return (
            <Tooltip key={to} delayDuration={0}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-2">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default AppSidebar;
