export default function InventoryPage() {
  return (
    <section className="flex flex-col gap-3">
      <header>
        <p className="text-sm font-medium text-[var(--accent)]">EatMeFirst</p>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Your fridge list will show here. Placeholder for Prompt 1.
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--accent-soft)] px-4 py-10 text-center text-sm text-[var(--muted)]">
        No items yet — Add and data layer come in later prompts.
      </div>
    </section>
  );
}
