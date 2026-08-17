import { useMemo, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, Bell, User, LogOut, Activity, Zap, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { moduleNav } from "@/lib/module-nav";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@/lib/navigation";
import { useNotifications } from "@/contexts/NotificationContext";
import GlobalNotificationHeader from "@/components/shared/GlobalNotificationHeader";
import { useLeads, useTickets, useCustomers, useChatSessions } from "@/hooks/useSalesSupportData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Single global top bar — replaces every per-module top bar.
 * Carries the live workload pulse (open tickets / hot leads / unread chats),
 * global entity + screen search, notifications and the account menu.
 */
export function AppTopBar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const { notifications, dismissNotification, handleAction } = useNotifications();
  const [query, setQuery] = useState("");

  const { data: leads } = useLeads();
  const { data: tickets } = useTickets();
  const { data: customers } = useCustomers();
  const { data: chatSessions } = useChatSessions();

  const openTickets = (tickets ?? []).filter(
    (t) => t.status !== "closed" && t.status !== "resolved",
  ).length;
  const hotLeads = (leads ?? []).filter(
    (l) => l.urgency === "hot" && l.stage !== "won" && l.stage !== "lost",
  ).length;
  const unreadChats = (chatSessions ?? []).reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  const screenResults = useMemo<{ to: string; section?: string; label: string }[]>(() => {
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
    return all.filter((r) => r.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const entityResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { leads: [], tickets: [], customers: [] };
    return {
      leads: (leads ?? [])
        .filter(
          (l) =>
            l.company?.toLowerCase().includes(q) || l.contact_name?.toLowerCase().includes(q),
        )
        .slice(0, 4),
      tickets: (tickets ?? [])
        .filter(
          (t) =>
            t.subject?.toLowerCase().includes(q) ||
            t.customer_name?.toLowerCase().includes(q) ||
            t.reference?.toLowerCase().includes(q),
        )
        .slice(0, 4),
      customers: (customers ?? [])
        .filter(
          (c) =>
            c.company_name?.toLowerCase().includes(q) ||
            c.contact_name?.toLowerCase().includes(q),
        )
        .slice(0, 4),
    };
  }, [query, leads, tickets, customers]);

  const hasAnyResult =
    screenResults.length > 0 ||
    entityResults.leads.length > 0 ||
    entityResults.tickets.length > 0 ||
    entityResults.customers.length > 0;

  const displayName = user?.email?.split("@")[0] ?? "Guest";
  const displayRole = userRole ? userRole.replace(/_/g, " ") : "Viewer";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

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
            placeholder="Search screens, leads, tickets…"
            aria-label="Global search"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {query.trim().length > 0 && (
          <div className="absolute top-full left-0 z-50 mt-2 max-h-[70vh] w-full overflow-auto rounded-xl border border-border bg-popover shadow-2xl sm:w-[420px]">
            {!hasAnyResult && (
              <p className="p-4 text-sm text-muted-foreground">No matches for “{query}”.</p>
            )}
            {screenResults.length > 0 && (
              <div className="p-1.5">
                <p className="px-2 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Screens
                </p>
                {screenResults.map((r) => (
                  <Link
                    key={`${r.to}-${r.section ?? "root"}`}
                    to={r.to}
                    search={r.section ? { section: r.section } : {}}
                    onClick={() => setQuery("")}
                    className={cn(
                      "block rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground",
                      pathname === r.to && "text-foreground",
                    )}
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
            {entityResults.leads.length > 0 && (
              <div className="border-t border-border p-1.5">
                <p className="px-2 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Leads
                </p>
                {entityResults.leads.map((l) => (
                  <Link
                    key={l.id}
                    to="/"
                    search={{ section: "sales-leads" }}
                    onClick={() => setQuery("")}
                    className="block rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.05]"
                  >
                    {l.company} <span className="text-muted-foreground">· {l.contact_name}</span>
                  </Link>
                ))}
              </div>
            )}
            {entityResults.tickets.length > 0 && (
              <div className="border-t border-border p-1.5">
                <p className="px-2 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Tickets
                </p>
                {entityResults.tickets.map((t) => (
                  <Link
                    key={t.id}
                    to="/support"
                    search={{ section: "inbox" }}
                    onClick={() => setQuery("")}
                    className="block rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.05]"
                  >
                    {t.subject} <span className="text-muted-foreground">· {t.reference}</span>
                  </Link>
                ))}
              </div>
            )}
            {entityResults.customers.length > 0 && (
              <div className="border-t border-border p-1.5">
                <p className="px-2 py-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  Customers
                </p>
                {entityResults.customers.map((c) => (
                  <Link
                    key={c.id}
                    to="/sales-crm"
                    search={{ section: "customers" }}
                    onClick={() => setQuery("")}
                    className="block rounded-lg px-2 py-2 text-sm text-foreground transition-colors hover:bg-white/[0.05]"
                  >
                    {c.company_name}{" "}
                    <span className="text-muted-foreground">· {c.contact_name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-2 xl:flex">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
            <Activity className="h-3 w-3 text-primary" />
            <span className="text-foreground">{openTickets}</span> open
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-foreground">{hotLeads}</span> hot leads
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground">
            <MessageCircle className="h-3 w-3 text-primary" />
            <span className="text-foreground">{unreadChats}</span> unread
          </span>
        </div>

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
          className="icon3d relative grid h-9 w-9 place-items-center rounded-xl text-muted-foreground sm:hidden"
        >
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5 transition-colors hover:bg-white/[0.05]"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/20 text-primary">
                <User className="h-4 w-4" />
              </span>
              <div className="hidden min-w-0 text-left leading-tight sm:block">
                <p className="truncate text-xs font-medium text-foreground capitalize">
                  {displayName}
                </p>
                <p className="truncate text-[10px] text-muted-foreground capitalize">
                  {displayRole}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="capitalize">
              {displayName}
              <span className="block text-[11px] font-normal text-muted-foreground capitalize">
                {displayRole}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/" search={{ section: "settings" }}>
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default AppTopBar;
