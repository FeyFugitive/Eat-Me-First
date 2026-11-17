"use client";

import Link from "next/link";
import { useMemo } from "react";
import { InventoryItemRow } from "@/components/InventoryItemRow";
import { useInventoryView } from "@/hooks/useInventory";
import { markEaten, markHalfLeft, markThrown } from "@/lib/store";
import { todaySummarySentence, type TodayRow } from "@/lib/today-summary";
import { calcUrgency, urgencySortKey } from "@/lib/urgency";

/**
 * Eat First (/today) — Prompt 5.
 * Lists only red + yellow active items, sorted by urgency.
 * One Chinese summary sentence at the top (future daily push prototype).
 */
export function TodayView() {
  const { active, ready } = useInventoryView();

  const rows = useMemo(() => {
    const withUrgency: TodayRow[] = active.map((item) => ({
      item,
      urgency: calcUrgency(item.shelfDays, item.boughtAt),
    }));
    return withUrgency
      .filter((row) => row.urgency.level === "red" || row.urgency.level === "yellow")
      .sort((a, b) => urgencySortKey(a.urgency) - urgencySortKey(b.urgency));
  }, [active]);

  const summary = todaySummarySentence(rows);
  const isEmpty = ready && rows.length === 0;

  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="text-sm font-medium text-[var(--accent)]">EatMeFirst · 先吃我</p>
        <h1 className="text-2xl font-semibold tracking-tight">Eat First</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Today&apos;s priority list — red and yellow only.
        </p>
      </header>

      {!ready ? (
        <div
          className="rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-10 text-center text-sm text-[var(--muted)]"
          aria-busy="true"
        >
          Loading…
        </div>
      ) : (
        <>
          <p
            className="rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3 text-base leading-relaxed text-[var(--foreground)]"
            role="status"
            data-testid="today-summary"
          >
            {summary}
          </p>

          {isEmpty ? (
            <EmptyState />
          ) : (
            <ul className="flex flex-col gap-3" aria-label="Eat first by urgency">
              {rows.map(({ item, urgency }) => (
                <li key={item.id}>
                  <InventoryItemRow
                    item={item}
                    urgency={urgency}
                    onEaten={markEaten}
                    onHalfLeft={markHalfLeft}
                    onThrown={markThrown}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <footer className="mt-2 space-y-2 border-t border-[var(--border)] pt-4">
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          仅供参考，以气味和状态为准。One daily summary — not a push per item.
        </p>
      </footer>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 py-10 text-center">
      <div className="space-y-2">
        <p className="text-lg font-semibold text-[var(--foreground)]">Nothing urgent today</p>
        <p className="text-sm text-[var(--muted)]">
          Green items stay on Inventory. Add more when you shop.
        </p>
      </div>
      <div className="flex w-full max-w-[240px] flex-col gap-2">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 text-base font-semibold text-[var(--foreground)] transition-transform active:scale-[0.98]"
        >
          View inventory
        </Link>
        <Link
          href="/add"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-6 text-base font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
        >
          + Add
        </Link>
      </div>
    </div>
  );
}
