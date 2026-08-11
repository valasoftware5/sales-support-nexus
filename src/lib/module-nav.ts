import {
  LayoutDashboard,
  Headphones,
  UserCog,
  Contact,
  ShieldCheck,
  Bot,
  Blocks,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface ModuleSection {
  id: string;
  label: string;
}

export interface ModuleNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  sections: ModuleSection[];
}

/**
 * Single source of truth for the one and only app sidebar.
 * Every module's own sub-navigation lives here as `sections`, driven by the
 * `?section=` search param — the modules themselves render no sidebar.
 */
export const moduleNav: ModuleNavItem[] = [
  {
    to: "/",
    label: "Command Center",
    icon: LayoutDashboard,
    sections: [
      { id: "overview", label: "Overview" },
      { id: "support-tickets", label: "Support Tickets" },
      { id: "sales-leads", label: "Sales Leads" },
      { id: "crm", label: "CRM Customers" },
      { id: "call-center", label: "Call Center" },
      { id: "email-queue", label: "Email Queue" },
      { id: "live-chat", label: "Live Chat" },
      { id: "escalations", label: "Escalations" },
      { id: "sla-compliance", label: "SLA Compliance" },
      { id: "support-team", label: "Support Team" },
      { id: "sales-team", label: "Sales Team" },
      { id: "performance", label: "Performance" },
      { id: "ai-insights", label: "AI Insights" },
      { id: "settings", label: "Settings" },
    ],
  },
  {
    to: "/support",
    label: "Support Ops",
    icon: Headphones,
    sections: [
      { id: "dashboard", label: "Dashboard" },
      { id: "command", label: "Token Command" },
      { id: "inbox", label: "Ticket Inbox" },
      { id: "tokens", label: "Token System" },
      { id: "priority", label: "Priority Queue" },
      { id: "omnichannel", label: "Omni-Channel" },
      { id: "sla", label: "SLA Management" },
      { id: "approvals", label: "Approvals" },
      { id: "escalation", label: "Escalations" },
      { id: "canned", label: "Canned Responses" },
      { id: "wiki", label: "Knowledge Base" },
      { id: "ai", label: "AI Automation" },
      { id: "shifts", label: "Shift & Availability" },
      { id: "fraud", label: "Fraud Detection" },
      { id: "quality", label: "Quality & Audit" },
      { id: "analytics", label: "Analytics" },
      { id: "logs", label: "System Logs" },
    ],
  },
  { to: "/support-agent", label: "Agent Workspace", icon: UserCog, sections: [] },
  {
    to: "/sales-crm",
    label: "Sales CRM",
    icon: Contact,
    sections: [
      { id: "dashboard", label: "Dashboard" },
      { id: "leads", label: "Leads" },
      { id: "customers", label: "Customers" },
      { id: "deals", label: "Deals" },
      { id: "tasks", label: "Tasks" },
      { id: "reports", label: "Reports" },
      { id: "settings", label: "Settings" },
    ],
  },
  { to: "/sales-support-manager", label: "Manager Console", icon: ShieldCheck, sections: [] },
  {
    to: "/support-chatbot",
    label: "Chatbot",
    icon: Bot,
    sections: [
      { id: "overview", label: "Overview" },
      { id: "chatbots", label: "Chatbots" },
      { id: "live-chat", label: "Live Chat Inbox" },
      { id: "training", label: "Bot Training" },
      { id: "automation", label: "Automation Rules" },
      { id: "languages", label: "Languages" },
      { id: "android", label: "Android Integration" },
      { id: "analytics", label: "Analytics & Logs" },
    ],
  },
  {
    to: "/support-chatbot-blueprint",
    label: "Chatbot Blueprint",
    icon: Blocks,
    sections: [
      { id: "dashboard", label: "Dashboard" },
      { id: "chatbots", label: "Chatbots" },
      { id: "live-chats", label: "Live Chats" },
      { id: "training", label: "Training" },
      { id: "automation", label: "Automation" },
      { id: "languages", label: "Languages" },
      { id: "analytics", label: "Analytics" },
      { id: "logs", label: "Logs" },
      { id: "settings", label: "Settings" },
    ],
  },
  {
    to: "/internal-support-ai",
    label: "Internal Support AI",
    icon: Sparkles,
    sections: [
      { id: "dashboard", label: "Support Dashboard" },
      { id: "auto-detection", label: "Auto Issue Detection" },
      { id: "issue-classification", label: "Issue Classification" },
      { id: "auto-fix-engine", label: "Auto-Fix Engine" },
      { id: "smart-clarification", label: "Smart Clarification" },
      { id: "escalation-manager", label: "Escalation Manager" },
      { id: "resolution-confirmation", label: "Resolution Confirmation" },
      { id: "knowledge-intelligence", label: "Knowledge Intelligence" },
      { id: "ai-transparency-log", label: "AI Transparency Log" },
      { id: "security-privacy", label: "Security & Privacy" },
    ],
  },
];
