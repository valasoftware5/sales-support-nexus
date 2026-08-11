import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { moduleNav } from "@/lib/module-nav";
import softwareValaLogo from "@/assets/software-vala-logo-transparent.png";

/**
 * The single application sidebar. Modules do NOT render their own sidebar —
 * their sub-navigation is merged here and driven by the `?section=` param.
 */
export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as { section?: string } });
  const [openModule, setOpenModule] = useState<string>(pathname);

  useEffect(() => {
    setOpenModule(pathname);
  }, [pathname]);

  const activeSection = search?.section;

  return (
    <aside
      aria-label="Sales & Support navigation"
      className={cn(
        "sticky top-0 z-50 flex h-screen shrink-0 flex-col border-r border-border/60 bg-card/60 backdrop-blur transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
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
        {moduleNav.map(({ to, label, icon: Icon, sections }) => {
          const isCurrent = to === "/" ? pathname === "/" : pathname.startsWith(to);
          const isOpen = !collapsed && openModule === to && sections.length > 0;

          const moduleRow = (
            <Link
              to={to}
              search={sections.length ? { section: sections[0]!.id } : {}}
              onClick={() => setOpenModule(to)}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground",
                isCurrent ? "bg-primary/15 text-primary" : "text-muted-foreground",
                collapsed && "justify-center px-0",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  {sections.length > 0 && (
                    <button
                      type="button"
                      aria-label={isOpen ? `Collapse ${label}` : `Expand ${label}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenModule(isOpen ? "" : to);
                      }}
                      className="rounded p-0.5 hover:bg-accent"
                    >
                      <ChevronDown
                        className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
                      />
                    </button>
                  )}
                </>
              )}
            </Link>
          );

          return (
            <div key={to}>
              {collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>{moduleRow}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              ) : (
                moduleRow
              )}

              {isOpen && (
                <div className="mt-0.5 ml-4 space-y-0.5 border-l border-border/60 pl-2">
                  {sections.map((section) => {
                    const selected =
                      isCurrent &&
                      (activeSection === section.id ||
                        (!activeSection && section.id === sections[0]!.id));
                    return (
                      <Link
                        key={section.id}
                        to={to}
                        search={{ section: section.id }}
                        className={cn(
                          "block truncate rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-accent hover:text-foreground",
                          selected
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground",
                        )}
                      >
                        {section.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
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
