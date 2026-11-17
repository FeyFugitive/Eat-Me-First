export default function EatFirstPage() {
  return (
    <section className="flex flex-col gap-3">
      <header>
        <p className="text-sm font-medium text-[var(--accent)]">EatMeFirst</p>
        <h1 className="text-2xl font-semibold tracking-tight">Eat First</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Today&apos;s priority summary will appear here.
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--accent-soft)] px-4 py-10 text-center text-sm text-[var(--muted)]">
        Red + yellow items summary is Prompt 5 — placeholder only.
      </div>
    </section>
  );
}
