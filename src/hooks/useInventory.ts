"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getInventory,
  getMonthlyWasteCount,
  subscribeInventory,
  subscribeMonthlyWaste,
} from "@/lib/store";
import type { InventoryItem } from "@/lib/types";

/**
 * Full inventory from localStorage.
 * Starts empty on SSR / first paint, then hydrates after mount
 * (localStorage is browser-only).
 */
export function useInventory(): InventoryItem[] {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    setItems(getInventory());
    return subscribeInventory((next) => setItems(next));
  }, []);

  return items;
}

/** Monthly waste count (v1 count only). */
export function useMonthlyWasteCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getMonthlyWasteCount());
    const unsubItems = subscribeInventory(() => {
      setCount(getMonthlyWasteCount());
    });
    const unsubWaste = subscribeMonthlyWaste((next) => setCount(next));
    return () => {
      unsubItems();
      unsubWaste();
    };
  }, []);

  return count;
}

/** Active list + live monthly waste counter. */
export function useInventoryView(): {
  active: InventoryItem[];
  wasteThisMonth: number;
  ready: boolean;
} {
  const [ready, setReady] = useState(false);
  const items = useInventory();
  const wasteThisMonth = useMonthlyWasteCount();

  useEffect(() => {
    setReady(true);
  }, []);

  const active = useMemo(
    () => items.filter((item) => item.status === "active"),
    [items],
  );

  return { active, wasteThisMonth, ready };
}
