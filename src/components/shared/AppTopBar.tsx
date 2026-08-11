import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, Bell, User } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { moduleNav } from "@/lib/module-nav";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/contexts/NotificationContext";
import GlobalNotificationHeader from "@/components/shared/GlobalNotificationHeader";

/**
 * Single global top bar — replaces every per-module top bar.
 */
export function AppTopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, userRole } = useAuth();
  const { notifications, dismissNotification, handleAction } = useNotifications();
  const [query, setQuery] = useState("");

  const results = useMemo<{ to: string; section?: string; label: string }[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all: { to: string; section?: string; label: string }[] = [];
    for (const m of moduleNav) {
      if (m.sections.length) {
        for (const s of m.sections) {
          all.push({ to: m.to, section: s.id, label: `${m.label} · ${s.label}` });
        }
      } else {
        all.push({ to: m.to, label: m.label });
      }
    }
    return all.filter((r) => r.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);


  const displayName = user?.email?.split("@")[0] ?? "Guest";
  const displayRole = userRole ? userRole.replace(/_/g, " ") : "Viewer";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onOpenMobileNav}
        aria-label="Open navigation"
        className="icon3d grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="relative min-w-0 flex-1 sm:max-w-md">
        <div className="focus-glow flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules and screens…"
            aria-label="Global search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {query.trim().length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-2xl">
            {results.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No screens match “{query}”.</p>
            ) : (
              results.map((r) => (
                <Link
                  key={`${r.to}-${r.section ?? "root"}`}
                  to={r.to}
                  search={r.section ? { section: r.section } : {}}
                  onClick={() => setQuery("")}
                  className={cn(
                    "block px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground",
                    pathname === r.to && "text-foreground",
                  )}
                >
                  {r.label}
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="hidden sm:block">
          <GlobalNotificationHeader
            userRole="support"
            notifications={notifications}
            onDismiss={(id: string) => {
              dismissNotification(id);
              toast.info("Notification dismissed");
            }}
            onAction={handleAction}
          />
        </div>
        <button
          aria-label="Notifications"
          className="icon3d grid h-9 w-9 place-items-center rounded-xl text-muted-foreground sm:hidden"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary">
            <User className="h-4 w-4" />
          </span>
          <div className="hidden min-w-0 leading-tight sm:block">
            <p className="truncate text-xs font-medium text-foreground capitalize">{displayName}</p>
            <p className="truncate text-[10px] text-muted-foreground capitalize">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppTopBar;
