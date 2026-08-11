import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Phone, MessageCircle, User, ChevronDown, Zap, Ticket, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import GlobalNotificationHeader from "@/components/shared/GlobalNotificationHeader";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAuth } from "@/hooks/useAuth";
import { useLeads, useTickets, useCustomers, useChatSessions } from "@/hooks/useSalesSupportData";

const SalesSupportTopBar = () => {
  const { notifications, dismissNotification, handleAction: handleNotificationAction } = useNotifications();
  const { user, userRole } = useAuth();
  const { data: leads } = useLeads();
  const { data: tickets } = useTickets();
  const { data: customers } = useCustomers();
  const { data: chatSessions } = useChatSessions();
  const [searchQuery, setSearchQuery] = useState("");

  const hotLeadsCount = (leads ?? []).filter(
    (l) => l.urgency === "hot" && l.stage !== "won" && l.stage !== "lost",
  ).length;

  const unreadChats = (chatSessions ?? []).reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { leads: [], tickets: [], customers: [] };
    return {
      leads: (leads ?? []).filter(
        (l) => l.company.toLowerCase().includes(q) || l.contact_name.toLowerCase().includes(q),
      ).slice(0, 5),
      tickets: (tickets ?? []).filter(
        (t) => t.subject.toLowerCase().includes(q) || t.customer_name.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q),
      ).slice(0, 5),
      customers: (customers ?? []).filter(
        (c) => c.company_name.toLowerCase().includes(q) || c.contact_name.toLowerCase().includes(q),
      ).slice(0, 5),
    };
  }, [searchQuery, leads, tickets, customers]);

  const hasResults =
    searchQuery.trim().length > 0 &&
    (searchResults.leads.length > 0 || searchResults.tickets.length > 0 || searchResults.customers.length > 0);

  const handleDismiss = (id: string) => {
    dismissNotification(id);
    toast.info("Notification dismissed");
  };

  const handleAction = (id: string) => {
    handleNotificationAction(id);
  };

  const displayName = user?.email?.split("@")[0] ?? "User";
  const displayRole = userRole ? userRole.replace(/_/g, " ") : "Sales Executive";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20 px-6 flex items-center justify-between relative"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, tickets..."
            className="w-80 pl-10 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/50"
          />
          {searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-96 max-h-96 overflow-auto bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50">
              {!hasResults && (
                <p className="p-4 text-sm text-slate-500">No matching leads, tickets, or customers.</p>
              )}
              {searchResults.leads.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase">Leads</p>
                  {searchResults.leads.map((l) => (
                    <div key={l.id} className="px-2 py-2 hover:bg-slate-800 rounded-md text-sm text-slate-200">
                      {l.company} <span className="text-slate-500">• {l.contact_name}</span>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.tickets.length > 0 && (
                <div className="p-2 border-t border-slate-800">
                  <p className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase">Tickets</p>
                  {searchResults.tickets.map((t) => (
                    <div key={t.id} className="px-2 py-2 hover:bg-slate-800 rounded-md text-sm text-slate-200">
                      {t.subject} <span className="text-slate-500">• {t.reference}</span>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.customers.length > 0 && (
                <div className="p-2 border-t border-slate-800">
                  <p className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase">Customers</p>
                  {searchResults.customers.map((c) => (
                    <div key={c.id} className="px-2 py-2 hover:bg-slate-800 rounded-md text-sm text-slate-200">
                      {c.company_name} <span className="text-slate-500">• {c.contact_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <Zap className="w-3 h-3 mr-1" />
          Hot Leads: {hotLeadsCount}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-cyan-300">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-cyan-300">
          <MessageCircle className="w-5 h-5" />
          {unreadChats > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {unreadChats}
            </span>
          )}
        </Button>

        {/* Global Notification Header */}
        <GlobalNotificationHeader
          userRole="support"
          notifications={notifications}
          onDismiss={handleDismiss}
          onAction={handleAction}
        />

        <div className="h-8 w-px bg-slate-700 mx-2" />

        <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/50 rounded-lg px-3 py-2 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-100 capitalize">{displayName}</p>
            <p className="text-xs text-slate-500 capitalize">{displayRole}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </motion.header>
  );
};

export default SalesSupportTopBar;
