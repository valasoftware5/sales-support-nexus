import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { moduleNav } from "@/lib/module-nav";

/**
 * Per-screen hero banner — 1:1 with the reference "hero-surface" pattern:
 * gradient surface, glow blobs, module pill, title, subtitle, status chip and a
 * horizontally sliding section tab strip driven by the `?section=` param.
 */
export function PageBanner() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as { section?: string } });

  const module =
    moduleNav.find((m) => (m.to === "/" ? pathname === "/" : pathname.startsWith(m.to))) ?? null;

  if (!module) return null;

  const Icon = module.icon;
  const section =
    module.sections.find((s) => s.id === search?.section) ?? module.sections[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <section className="hero-surface relative overflow-hidden p-5 sm:p-7 lg:p-9">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="bg-accent-pink/40 pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full blur-3xl" />

        <div className="relative grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-medium backdrop-blur">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{module.label}</span>
            </div>
            <h1 className="mt-4 truncate text-2xl font-semibold tracking-tight sm:text-3xl lg:text-[34px]">
              {section?.label ?? module.label}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-white/80 sm:text-[15px]">
              {module.label} · live workspace connected to your Software Vala backend.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to={module.to}
                search={module.sections.length ? { section: module.sections[0]!.id } : {}}
                className="text-primary inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-white/90"
              >
                Open {module.label} <ArrowUpRight className="h-4 w-4" />
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium">
                <Activity className="h-3 w-3" />
                Live data
              </span>
            </div>
          </div>
        </div>
      </section>

      {module.sections.length > 0 && (
        <div className="-mx-1 mt-4 overflow-x-auto">
          <div className="flex min-w-max items-center gap-2 px-1 pb-1">
            {module.sections.map((s) => {
              const active = s.id === section?.id;
              return (
                <Link
                  key={s.id}
                  to={module.to}
                  search={{ section: s.id }}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors",
                    active
                      ? "bg-primary/20 border-primary/40 text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PageBanner;
