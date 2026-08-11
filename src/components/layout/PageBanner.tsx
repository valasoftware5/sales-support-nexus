import { useRouterState } from "@tanstack/react-router";

import { moduleNav } from "@/lib/module-nav";

/**
 * Per-screen banner header rendered globally so every route shares the same
 * spacing, density and typography.
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
    <div className="surface-sheen border-b border-border bg-surface/40">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="icon3d grid h-11 w-11 shrink-0 place-items-center rounded-xl text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] tracking-wider text-muted-foreground uppercase">
                {module.label}
              </p>
              <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                {section?.label ?? module.label}
              </h1>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-border bg-surface px-3 py-1 text-[11px] text-muted-foreground">
            Live data
          </span>
        </div>
      </div>
    </div>
  );
}

export default PageBanner;
