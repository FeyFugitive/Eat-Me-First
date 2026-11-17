"use client";

import Link from "next/link";
import { useMemo } from "react";
import { InventoryItemRow } from "@/components/InventoryItemRow";
import { useInventoryView } from "@/hooks/useInventory";
import { markEaten, markHalfLeft, markThrown } from "@/lib/store";
import { calcUrgency, urgencySortKey } from "@/lib/urgency";
import type { InventoryItem, UrgencyInfo } from "@/lib/types";

type Row = { item: InventoryItem; urgency: UrgencyInfo };

export function InventoryView() {
  const { active, wasteThisMonth, ready } = useInventoryView();

  const rows = useMemo(() => {
    const withUrgency: Row[] = active.map((item) => ({
      item,
      urgency: calcUrgency(item.shelfDays, item.boughtAt),
    }));
    withUrgency.sort((a, b) => urgencySortKey(a.urgency) - urgencySortKey(b.urgency));
    return withUrgency;
  }, [active]);

  const isEmpty = ready && rows.length === 0;

  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="text-sm font-medium text-[var(--accent)]">EatMeFirst · 先吃我</p>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Sorted eat-me-first — ranges, not fake expiry dates.
        </p>
      </header>

      {!ready ? (
        <div
          className="rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-10 text-center text-sm text-[var(--muted)]"
          aria-busy="true"
        >
          Loading inventory…
        </div>
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Inventory by urgency">
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

      <footer className="mt-2 space-y-2 border-t border-[var(--border)] pt-4">
        <p className="text-sm text-[var(--foreground)]">
          Thrown away this month:{" "}
          <span className="font-semibold tabular-nums">{wasteThisMonth}</span>
        </p>
        <p className="text-xs leading-relaxed text-[var(--muted)]">
          仅供参考，以气味和状态为准。Shelf-life ranges are guides only.
        </p>
      </footer>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--accent-soft)] px-5 py-12 text-center">
      <div className="space-y-2">
        <p className="text-lg font-semibold text-[var(--foreground)]">Fridge looks empty</p>
        <p className="text-sm text-[var(--muted)]">
          Add what you bought — keep it under 30 seconds next trip.
        </p>
      </div>
      <Link
        href="/add"
        className="inline-flex min-h-12 w-full max-w-[240px] items-center justify-center rounded-xl bg-[var(--accent)] px-6 text-base font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
      >
        + Add
      </Link>
    </div>
  );
}
