import { Suspense } from "react";
import { AddView } from "@/components/AddView";

export default function AddPage() {
  return (
    <Suspense
      fallback={
        <section className="flex flex-col gap-3">
          <header>
            <p className="text-sm font-medium text-[var(--accent)]">EatMeFirst · 先吃我</p>
            <h1 className="text-2xl font-semibold tracking-tight">Add</h1>
          </header>
          <div
            className="rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-10 text-center text-sm text-[var(--muted)]"
            aria-busy="true"
          >
            Loading…
          </div>
        </section>
      }
    >
      <AddView />
    </Suspense>
  );
}
