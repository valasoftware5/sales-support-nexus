/**
 * Sales & Support data layer — real Lovable Cloud (Postgres) reads/writes.
 * No mock data: every hook here talks to the live database.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];

export type TeamMember = Tables["team_members"]["Row"];
export type CrmCustomer = Tables["crm_customers"]["Row"];
export type SalesLead = Tables["sales_leads"]["Row"];
export type SalesDeal = Tables["sales_deals"]["Row"];
export type CrmTask = Tables["crm_tasks"]["Row"];
export type SalesCommission = Tables["sales_commissions"]["Row"];
export type SupportTicket = Tables["support_tickets"]["Row"];
export type SupportEscalation = Tables["support_escalations"]["Row"];
export type CallLog = Tables["call_logs"]["Row"];
export type EmailQueueItem = Tables["email_queue"]["Row"];
export type ChatSession = Tables["chat_sessions"]["Row"];
export type ChatMessage = Tables["chat_messages"]["Row"];
export type Chatbot = Tables["chatbots"]["Row"];
export type BotTrainingDocument = Tables["bot_training_documents"]["Row"];
export type AutomationRule = Tables["automation_rules"]["Row"];
export type BotConversationLog = Tables["bot_conversation_logs"]["Row"];
export type BotLanguage = Tables["bot_languages"]["Row"];
export type CannedResponse = Tables["canned_responses"]["Row"];
export type WikiArticle = Tables["wiki_articles"]["Row"];

const STALE = 30_000;

/** Generic list reader for the Sales & Support tables. */
function useTable<T>(
  table: keyof Tables & string,
  options?: { orderBy?: string; ascending?: boolean; limit?: number },
) {
  const orderBy = options?.orderBy ?? "created_at";
  const ascending = options?.ascending ?? false;
  const limit = options?.limit ?? 500;

  return useQuery({
    queryKey: [table, orderBy, ascending, limit],
    staleTime: STALE,
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order(orderBy, { ascending })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export const useTeamMembers = (department?: string) => {
  const query = useTable<TeamMember>("team_members", { orderBy: "full_name", ascending: true });
  return {
    ...query,
    data: department ? (query.data ?? []).filter((m) => m.department === department) : query.data,
  };
};

export const useCustomers = () => useTable<CrmCustomer>("crm_customers");
export const useLeads = () => useTable<SalesLead>("sales_leads");
export const useDeals = () => useTable<SalesDeal>("sales_deals");
export const useTasks = () => useTable<CrmTask>("crm_tasks", { orderBy: "due_at", ascending: true });
export const useCommissions = () => useTable<SalesCommission>("sales_commissions");
export const useTickets = () => useTable<SupportTicket>("support_tickets");
export const useEscalations = () => useTable<SupportEscalation>("support_escalations");
export const useCallLogs = () => useTable<CallLog>("call_logs", { orderBy: "started_at" });
export const useEmailQueue = () => useTable<EmailQueueItem>("email_queue", { orderBy: "received_at" });
export const useChatSessions = () => useTable<ChatSession>("chat_sessions", { orderBy: "started_at" });
export const useChatbots = () => useTable<Chatbot>("chatbots", { orderBy: "name", ascending: true });
export const useBotTrainingDocuments = () => useTable<BotTrainingDocument>("bot_training_documents");
export const useAutomationRules = () => useTable<AutomationRule>("automation_rules", { orderBy: "name", ascending: true });
export const useBotConversationLogs = () => useTable<BotConversationLog>("bot_conversation_logs");
export const useBotLanguages = () => useTable<BotLanguage>("bot_languages", { orderBy: "name", ascending: true });
export const useCannedResponses = () => useTable<CannedResponse>("canned_responses", { orderBy: "title", ascending: true });
export const useWikiArticles = () => useTable<WikiArticle>("wiki_articles");

export const useChatMessages = (sessionId: string | null) =>
  useQuery({
    queryKey: ["chat_messages", sessionId],
    enabled: Boolean(sessionId),
    staleTime: 10_000,
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId as string)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

// Generic table access needs a loosened client: the generated types cannot
// narrow column names when the table name is a type parameter.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/** Generic row updater — used by every action button so changes persist. */
export function useUpdateRow<T extends keyof Tables & string>(table: T) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await db.from(table).update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
  });
}

/** Generic row inserter. */
export function useInsertRow<T extends keyof Tables & string>(table: T) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { data, error } = await db.from(table).insert(values).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
  });
}

/** Generic row deleter. */
export function useDeleteRow<T extends keyof Tables & string>(table: T) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [table] }),
  });
}

/** Relative time formatting shared by the ported screens. */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function memberName(members: TeamMember[] | undefined, id: string | null): string | null {
  if (!id) return null;
  return members?.find((m) => m.id === id)?.full_name ?? null;
}

export function currency(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return `$${Math.round(n).toLocaleString()}`;
}
