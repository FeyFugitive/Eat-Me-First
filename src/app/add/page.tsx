export default function AddPage() {
  return (
    <section className="flex flex-col gap-3">
      <header>
        <p className="text-sm font-medium text-[var(--accent)]">EatMeFirst</p>
        <h1 className="text-2xl font-semibold tracking-tight">Add</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Fast entry UI lands in a later prompt. Placeholder for now.
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--accent-soft)] px-4 py-10 text-center text-sm text-[var(--muted)]">
        Search, chips, and save actions are not built yet.
      </div>
    </section>
  );
}
