import { useEffect, useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { moduleNav, type ModuleNavItem } from "@/lib/module-nav";
import softwareValaLogo from "@/assets/software-vala-logo-transparent.png";

const COLLAPSE_KEY = "sv:sidebar:collapsed";

export function useSidebarState() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((v) => {
      const next = !v;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });

  return { collapsed, toggleCollapsed, mobileOpen, setMobileOpen };
}

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

/**
 * The single application sidebar — reference "Creator's Launchpad" visual system.
 * Modules never render their own sidebar; their sub-navigation is merged here and
 * driven by the `?section=` search param.
 */
export function AppSidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as { section?: string } });
  const activeSection = search?.section;
  const [query, setQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return moduleNav
      .map((m) => ({
        ...m,
        sections: m.sections.filter((s) => s.label.toLowerCase().includes(q)),
      }))
      .filter((m) => m.label.toLowerCase().includes(q) || m.sections.length > 0);
  }, [query]);

  const groupOpen = (m: ModuleNavItem) => openGroups[m.to] ?? isActive(m.to);

  const content = (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2 border-b border-border px-3",
          collapsed && "justify-center px-0",
        )}
      >
        <Link
          to="/"
          search={{ section: undefined }}
          className="flex min-w-0 items-center gap-2"
          onClick={onCloseMobile}
        >
          <img
            src={softwareValaLogo}
            alt="Software Vala"
            className="h-9 w-9 shrink-0 rounded-xl object-contain"
          />
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight">Software Vala</span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggleCollapsed}
            className="ml-auto hidden h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground lg:grid"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={onCloseMobile}
          className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {collapsed && (
        <button
          onClick={onToggleCollapsed}
          className="mx-auto mt-3 hidden h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground lg:grid"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      {!collapsed && (
        <div className="shrink-0 px-3 pt-3">
          <div className="focus-glow flex items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a module…"
              aria-label="Find a module"
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-2 overflow-y-auto px-2 py-3" aria-label="Main navigation">
        {(filtered ?? moduleNav).length === 0 && (
          <p className="px-2.5 py-6 text-center text-xs text-muted-foreground">
            No modules match “{query}”.
          </p>
        )}

        {(filtered ?? moduleNav).map((module) => {
          const active = isActive(module.to);
          const open = filtered ? true : groupOpen(module);
          const Icon = module.icon;

          const moduleRow = (
            <Link
              to={module.to}
              search={module.sections.length ? { section: module.sections[0]!.id } : {}}
              onClick={() => {
                setOpenGroups((s) => ({ ...s, [module.to]: true }));
                onCloseMobile();
              }}
              title={module.label}
              className={cn(
                "group/item relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors duration-150",
                collapsed && "justify-center px-0",
                active
                  ? "bg-primary/18 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-primary" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{module.label}</span>
                  {module.sections.length > 0 && (
                    <button
                      type="button"
                      aria-label={open ? `Collapse ${module.label}` : `Expand ${module.label}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenGroups((s) => ({ ...s, [module.to]: !open }));
                      }}
                      className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                  )}
                </>
              )}
            </Link>
          );

          return (
            <div key={module.to}>
              {moduleRow}
              {!collapsed && open && module.sections.length > 0 && (
                <div className="mt-0.5 ml-4 space-y-0.5 border-l border-border/60 pl-2">
                  {module.sections.map((section) => {
                    const selected =
                      active &&
                      (activeSection === section.id ||
                        (!activeSection && section.id === module.sections[0]!.id));
                    return (
                      <Link
                        key={section.id}
                        to={module.to}
                        search={{ section: section.id }}
                        onClick={onCloseMobile}
                        className={cn(
                          "relative block truncate rounded-lg px-2.5 py-1.5 text-[13px] transition-colors duration-150",
                          selected
                            ? "bg-primary/15 font-medium text-foreground"
                            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                        )}
                      >
                        {selected && (
                          <span className="absolute top-1.5 bottom-1.5 -left-[9px] w-[2px] rounded-full bg-primary" />
                        )}
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

      <div className="shrink-0 border-t border-border px-3 py-3">
        <p
          className={cn(
            "text-[11px] text-muted-foreground",
            collapsed && "text-center text-[10px]",
          )}
        >
          {collapsed ? "SV" : "Software Vala · Sales & Support"}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside
        aria-label="Sales & Support navigation"
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-background/80 backdrop-blur-xl transition-[width] duration-200 lg:flex",
          collapsed ? "w-[72px]" : "w-[264px]",
        )}
      >
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-label="Close menu overlay"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-border bg-background shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export default AppSidebar;
