/**
 * Shared test helpers: a fake Lovable Cloud (Supabase) client that answers the
 * same chainable query shape used by src/hooks/useSalesSupportData.ts.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createElement } from "react";

export type TableRows = Record<string, Record<string, unknown>[]>;

/** Builds a thenable chain supporting .select().order().limit().eq() */
export function createFakeSupabase(tables: TableRows) {
  const calls: string[] = [];

  const makeChain = (table: string) => {
    let rows = [...(tables[table] ?? [])];
    const chain: Record<string, unknown> = {};
    const self = () => chain;

    chain.select = self;
    chain.order = self;
    chain.limit = self;
    chain.eq = (column: string, value: unknown) => {
      rows = rows.filter((r) => r[column] === value);
      return chain;
    };
    chain.then = (resolve: (v: { data: unknown; error: null }) => unknown) =>
      Promise.resolve({ data: rows, error: null }).then(resolve);

    return chain;
  };

  return {
    calls,
    client: {
      from: (table: string) => {
        calls.push(table);
        return makeChain(table);
      },
    },
  };
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 }, mutations: { retry: false } },
  });
}

export function withQueryClient(ui: ReactNode, client = createTestQueryClient()) {
  return createElement(QueryClientProvider, { client }, ui);
}
