"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  EMPTY_INVENTORY,
  getInventory,
  getMonthlyWasteCount,
  subscribeInventory,
  subscribeMonthlyWaste,
} from "@/lib/store";
import type { InventoryItem } from "@/lib/types";

/**
 * Full inventory from localStorage.
 * useSyncExternalStore keeps SSR on a stable empty snapshot, then reads
 * storage on the client after hydration — no mount/useEffect gate.
 */
export function useInventory(): InventoryItem[] {
  return useSyncExternalStore(
    subscribeItems,
    getInventory,
    getServerInventory,
  );
}

/** Monthly waste count (v1 count only). */
export function useMonthlyWasteCount(): number {
  return useSyncExternalStore(
    subscribeWaste,
    getMonthlyWasteCount,
    getServerWasteCount,
  );
}

/**
 * Active list + live monthly waste counter.
 * `ready` flips true on the client via useSyncExternalStore (not useEffect),
 * so empty/unavailable storage still leaves the loading state after hydrate.
 */
export function useInventoryView(): {
  active: InventoryItem[];
  wasteThisMonth: number;
  ready: boolean;
} {
  const ready = useSyncExternalStore(
    subscribeReady,
    getClientReady,
    getServerReady,
  );
  const items = useInventory();
  const wasteThisMonth = useMonthlyWasteCount();

  const active = useMemo(
    () => items.filter((item) => item.status === "active"),
    [items],
  );

  return { active, wasteThisMonth, ready };
}

function subscribeItems(onStoreChange: () => void): () => void {
  return subscribeInventory(() => {
    onStoreChange();
  });
}

function subscribeWaste(onStoreChange: () => void): () => void {
  return subscribeMonthlyWaste(() => {
    onStoreChange();
  });
}

function getServerInventory(): InventoryItem[] {
  return EMPTY_INVENTORY;
}

function getServerWasteCount(): number {
  return 0;
}

/** Client-only “has hydrated” flag — always true in the browser. */
function subscribeReady(): () => void {
  return () => {};
}

function getClientReady(): boolean {
  return true;
}

function getServerReady(): boolean {
  return false;
}
