import { createFileRoute } from "@tanstack/react-router";
import SalesSupportDashboard from "@/components/salespages/SalesSupportDashboard";

export const Route = createFileRoute("/")({
  // Dashboard UI is live/interactive; skip SSR so timers and live data hydrate cleanly.
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    section: typeof search.section === "string" ? search.section : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sales & Support Command Center | Software Vala" },
      {
        name: "description",
        content:
          "Software Vala Sales & Support command center: lead inbox, pipeline, tickets, SLA compliance, escalations and AI insights in one console.",
      },
      { property: "og:title", content: "Sales & Support Command Center | Software Vala" },
      {
        property: "og:description",
        content:
          "Unified sales and support operations console with leads, pipeline, tickets, SLA and AI insights.",
      },
    ],
  }),
  component: SalesSupportDashboard,
});
