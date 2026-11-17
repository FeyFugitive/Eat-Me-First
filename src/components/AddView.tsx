"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { StorageIcon } from "@/components/StorageIcon";
import { todayISO } from "@/lib/dates";
import {
  CATEGORY_DEFAULT_FRIDGE_DAYS,
  resolveShelfDays,
} from "@/lib/foods";
import { getFrequentFoods, recordRecentFood } from "@/lib/recent-foods";
import { searchFoods } from "@/lib/search-foods";
import { addItem, newItemId } from "@/lib/store";
import type {
  DayRange,
  FoodCategory,
  FoodDef,
  InventoryItem,
  StoragePlace,
} from "@/lib/types";
import { unitOptions } from "@/lib/units";

type Mode = "search" | "catalog" | "custom";

const STORAGE_OPTIONS: StoragePlace[] = ["fridge", "freezer", "pantry"];

const CATEGORY_OPTIONS: { value: FoodCategory; label: string }[] = [
  { value: "leafy", label: "叶菜 Leafy" },
  { value: "vegetable", label: "蔬菜 Vegetable" },
  { value: "fruit", label: "水果 Fruit" },
  { value: "meat", label: "肉 Meat" },
  { value: "seafood", label: "海鲜 Seafood" },
  { value: "dairy", label: "奶 Dairy" },
  { value: "egg", label: "蛋 Egg" },
  { value: "soy", label: "豆制品 Soy" },
  { value: "leftover", label: "剩菜 Leftover" },
  { value: "condiment", label: "调料 Condiment" },
  { value: "other", label: "其他 Other" },
];

const STORAGE_LABEL: Record<StoragePlace, string> = {
  fridge: "Fridge",
  freezer: "Freezer",
  pantry: "Pantry",
};

export function AddView() {
  const router = useRouter();
  const searchId = useId();
  const listboxId = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<FoodDef[]>([]);
  const [chips, setChips] = useState<FoodDef[]>([]);
  const [highlight, setHighlight] = useState(0);

  const [food, setFood] = useState<FoodDef | null>(null);
  const [customName, setCustomName] = useState("");
  const [category, setCategory] = useState<FoodCategory>("other");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("个");
  const [storage, setStorage] = useState<StoragePlace>("fridge");
  const [boughtAt, setBoughtAt] = useState("");
  const [shelfDays, setShelfDays] = useState<DayRange>([5, 7]);
  const [shelfTouched, setShelfTouched] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const refreshChips = useEffectEvent(() => {
    setChips(getFrequentFoods(10));
  });

  useEffect(() => {
    // Defer Date + localStorage until after mount (Cache Components / prerender).
    setBoughtAt(todayISO());
    refreshChips();
  }, []);

  useEffect(() => {
    if (mode !== "search") return;
    setHits(searchFoods(query, 8));
    setHighlight(0);
  }, [query, mode]);

  function resetForm(keepFlash = false) {
    setMode("search");
    setQuery("");
    setHits([]);
    setFood(null);
    setCustomName("");
    setCategory("other");
    setQty(1);
    setUnit("个");
    setStorage("fridge");
    setBoughtAt(todayISO());
    setShelfDays([5, 7]);
    setShelfTouched(false);
    if (!keepFlash) setFlash(null);
    refreshChips();
    queueMicrotask(() => searchRef.current?.focus());
  }

  function selectFood(next: FoodDef) {
    setFood(next);
    setMode("catalog");
    setQuery("");
    setHits([]);
    setQty(1);
    setUnit(next.unitHint || "个");
    const preferred: StoragePlace =
      next.fridgeDays ? "fridge" : next.freezerDays ? "freezer" : "pantry";
    setStorage(preferred);
    setBoughtAt(todayISO());
    setShelfDays(resolveShelfDays(next, preferred, next.category));
    setShelfTouched(false);
    setFlash(null);
  }

  function startCustom(fromQuery?: string) {
    const name = (fromQuery ?? query).trim();
    setMode("custom");
    setFood(null);
    setCustomName(name);
    setCategory("other");
    setQty(1);
    setUnit("个");
    setStorage("fridge");
    setBoughtAt(todayISO());
    setShelfDays([...CATEGORY_DEFAULT_FRIDGE_DAYS.other] as DayRange);
    setShelfTouched(false);
    setHits([]);
    setFlash(null);
  }

  function onStorageChange(next: StoragePlace) {
    setStorage(next);
    if (mode === "catalog" && food && !shelfTouched) {
      setShelfDays(resolveShelfDays(food, next, food.category));
    }
  }

  function onCategoryChange(next: FoodCategory) {
    setCategory(next);
    if (!shelfTouched) {
      setShelfDays([...CATEGORY_DEFAULT_FRIDGE_DAYS[next]] as DayRange);
    }
  }

  function buildItem(): InventoryItem | null {
    if (mode === "catalog" && food) {
      const min = Math.max(0, Math.min(shelfDays[0], shelfDays[1]));
      const max = Math.max(shelfDays[0], shelfDays[1]);
      return {
        id: newItemId(),
        foodId: food.id,
        name: food.nameZh,
        qty,
        unit,
        storage,
        boughtAt,
        // Prefer form state (tracks storage switches); fall back to resolver.
        shelfDays:
          shelfDays[0] >= 0 && shelfDays[1] >= 0
            ? [min, max]
            : resolveShelfDays(food, storage, food.category),
        opened: false,
        remaining: 1,
        status: "active",
      };
    }
    if (mode === "custom") {
      const name = customName.trim();
      if (!name) return null;
      const min = Math.max(0, Math.min(shelfDays[0], shelfDays[1]));
      const max = Math.max(shelfDays[0], shelfDays[1]);
      return {
        id: newItemId(),
        foodId: null,
        name,
        qty,
        unit,
        storage,
        boughtAt,
        shelfDays: [min, max],
        opened: false,
        remaining: 1,
        status: "active",
      };
    }
    return null;
  }

  function save(andAnother: boolean) {
    const item = buildItem();
    if (!item) return;
    addItem(item);
    if (item.foodId) recordRecentFood(item.foodId);
    refreshChips();

    if (andAnother) {
      setFlash(`Added ${item.name}`);
      resetForm(true);
      return;
    }
    router.push("/");
  }

  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hits.length === 0) return;
      setHighlight((h) => (h + 1) % hits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hits.length === 0) return;
      setHighlight((h) => (h - 1 + hits.length) % hits.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hits[highlight]) selectFood(hits[highlight]);
      else if (query.trim()) startCustom();
    } else if (e.key === "Escape") {
      setHits([]);
    }
  }

  function onDetailsSubmit(e: FormEvent) {
    e.preventDefault();
    save(false);
  }

  const showResults = mode === "search" && query.trim().length > 0;

  return (
    <section className="flex flex-col gap-4">
      <header>
        <p className="text-sm font-medium text-[var(--accent)]">EatMeFirst · 先吃我</p>
        <h1 className="text-2xl font-semibold tracking-tight">Add</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Under 5 seconds — search, tap, save.
        </p>
      </header>

      {flash ? (
        <p
          className="rounded-lg bg-[var(--accent-soft)] px-3 py-2 text-sm font-medium text-[var(--accent)]"
          role="status"
        >
          {flash} — keep going
        </p>
      ) : null}

      {mode === "search" ? (
        <div className="flex flex-col gap-3">
          <label className="sr-only" htmlFor={searchId}>
            Search foods
          </label>
          <div className="relative">
            <input
              ref={searchRef}
              id={searchId}
              type="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="菠菜 / spinach / 小白菜…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              role="combobox"
              aria-expanded={showResults}
              aria-controls={listboxId}
              aria-autocomplete="list"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base outline-none ring-[var(--accent)] focus:ring-2"
              autoFocus
            />
            {showResults ? (
              <ul
                id={listboxId}
                role="listbox"
                className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-md"
              >
                {hits.map((hit, i) => (
                  <li key={hit.id} role="option" aria-selected={i === highlight}>
                    <button
                      type="button"
                      className={`flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm ${
                        i === highlight
                          ? "bg-[var(--accent-soft)]"
                          : "hover:bg-[var(--accent-soft)]/60"
                      }`}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => selectFood(hit)}
                    >
                      <span className="font-semibold">{hit.nameZh}</span>
                      <span className="text-[var(--muted)]">{hit.nameEn}</span>
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 border-t border-[var(--border)] px-4 py-3 text-left text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]/60"
                    onClick={() => startCustom()}
                  >
                    + Add custom “{query.trim()}”
                  </button>
                </li>
              </ul>
            ) : null}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Frequent
            </p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {chips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => selectFood(chip)}
                  className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-[var(--border)] bg-[var(--accent-soft)] px-3.5 py-2 text-sm font-medium text-[var(--foreground)] transition-transform active:scale-[0.97]"
                >
                  {chip.nameZh}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => startCustom("")}
            className="text-left text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
          >
            Not in list? Add custom item
          </button>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={onDetailsSubmit}>
          <div className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3">
            <div className="min-w-0">
              {mode === "catalog" && food ? (
                <>
                  <p className="truncate text-lg font-semibold">{food.nameZh}</p>
                  <p className="text-sm text-[var(--muted)]">{food.nameEn}</p>
                </>
              ) : (
                <label className="block">
                  <span className="text-xs font-medium text-[var(--muted)]">Name</span>
                  <input
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="茼蒿…"
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-base outline-none ring-[var(--accent)] focus:ring-2"
                  />
                </label>
              )}
            </div>
            <button
              type="button"
              onClick={() => resetForm()}
              className="shrink-0 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Change
            </button>
          </div>

          {mode === "custom" ? (
            <label className="block">
              <span className="text-xs font-medium text-[var(--muted)]">Category</span>
              <select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value as FoodCategory)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-base outline-none ring-[var(--accent)] focus:ring-2"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs font-medium text-[var(--muted)]">Qty</span>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] text-xl font-semibold active:bg-[var(--accent-soft)]"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-lg font-semibold tabular-nums">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] text-xl font-semibold active:bg-[var(--accent-soft)]"
                >
                  +
                </button>
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-[var(--muted)]">Unit</span>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-base outline-none ring-[var(--accent)] focus:ring-2"
              >
                {unitOptions(unit).map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset>
            <legend className="text-xs font-medium text-[var(--muted)]">Storage</legend>
            <div
              className="mt-1 grid grid-cols-3 gap-1 rounded-xl border border-[var(--border)] bg-[var(--background)] p-1"
              role="radiogroup"
              aria-label="Storage place"
            >
              {STORAGE_OPTIONS.map((place) => {
                const active = storage === place;
                return (
                  <button
                    key={place}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onStorageChange(place)}
                    className={`flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? "bg-[var(--surface)] text-[var(--accent)] shadow-sm"
                        : "text-[var(--muted)]"
                    }`}
                  >
                    <StorageIcon storage={place} />
                    {STORAGE_LABEL[place]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className="text-xs font-medium text-[var(--muted)]">Bought</span>
            <input
              type="date"
              value={boughtAt}
              onChange={(e) => setBoughtAt(e.target.value || todayISO())}
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-base outline-none ring-[var(--accent)] focus:ring-2"
            />
          </label>

          {mode === "custom" ? (
            <div>
              <span className="text-xs font-medium text-[var(--muted)]">
                Suggested days (min–max)
              </span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={365}
                  inputMode="numeric"
                  value={shelfDays[0]}
                  onChange={(e) => {
                    setShelfTouched(true);
                    const n = Number(e.target.value);
                    setShelfDays([Number.isFinite(n) ? n : 0, shelfDays[1]]);
                  }}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-base outline-none ring-[var(--accent)] focus:ring-2"
                  aria-label="Shelf life min days"
                />
                <span className="text-[var(--muted)]">–</span>
                <input
                  type="number"
                  min={0}
                  max={365}
                  inputMode="numeric"
                  value={shelfDays[1]}
                  onChange={(e) => {
                    setShelfTouched(true);
                    const n = Number(e.target.value);
                    setShelfDays([shelfDays[0], Number.isFinite(n) ? n : 0]);
                  }}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-base outline-none ring-[var(--accent)] focus:ring-2"
                  aria-label="Shelf life max days"
                />
              </div>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Default from category — edit if you know better.
              </p>
            </div>
          ) : food ? (
            <p className="text-xs text-[var(--muted)]">
              Suggest eat in {shelfDays[0]}–{shelfDays[1]} days ({STORAGE_LABEL[storage]}
              ).
            </p>
          ) : null}

          <div className="sticky bottom-16 z-10 -mx-4 flex flex-col gap-2 border-t border-[var(--border)] bg-[var(--surface)]/95 px-4 py-3 backdrop-blur-sm">
            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--accent)] px-6 text-base font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => save(true)}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-[var(--accent)] bg-[var(--surface)] px-6 text-base font-semibold text-[var(--accent)] transition-transform active:scale-[0.98]"
            >
              Save & add another
            </button>
          </div>
        </form>
      )}

      <p className="text-xs leading-relaxed text-[var(--muted)]">
        仅供参考，以气味和状态为准。No login, no grams — just get it in fast.
      </p>
    </section>
  );
}
