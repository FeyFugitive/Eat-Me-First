/**
 * Inventory persistence for v1.
 * localStorage only — swap this module for Supabase in v1.5/v2.
 * No auth, no backend.
 */

import type { InventoryItem } from "./types";

export const INVENTORY_STORAGE_KEY = "eat-me-first:inventory";
/** Monthly waste counts: { "2026-11": 3 }. v1 counts only — no money. */
export const WASTE_STORAGE_KEY = "eat-me-first:waste-by-month";

type Listener = (items: InventoryItem[]) => void;
type WasteListener = (count: number) => void;

const listeners = new Set<Listener>();
const wasteListeners = new Set<WasteListener>();

/** Stable snapshot refs for useSyncExternalStore (Object.is identity). */
const EMPTY_ITEMS: InventoryItem[] = [];
let cachedItems: InventoryItem[] | null = null;
let cachedWasteCount: number | null = null;
let cachedWasteMonth: string | null = null;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function monthKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function parseItems(): InventoryItem[] {
  if (!canUseStorage()) return EMPTY_ITEMS;
  try {
    const raw = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return EMPTY_ITEMS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_ITEMS;
    return parsed as InventoryItem[];
  } catch {
    return EMPTY_ITEMS;
  }
}

function readRaw(): InventoryItem[] {
  if (cachedItems === null) {
    cachedItems = parseItems();
  }
  return cachedItems;
}

function writeRaw(items: InventoryItem[]): void {
  cachedItems = items;
  if (!canUseStorage()) {
    for (const listener of listeners) listener(items);
    return;
  }
  window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  for (const listener of listeners) listener(items);
}

function readWasteMap(): Record<string, number> {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(WASTE_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, number>;
  } catch {
    return {};
  }
}

function writeWasteMap(map: Record<string, number>, now: Date = new Date()): void {
  const key = monthKey(now);
  const count = map[key] ?? 0;
  cachedWasteCount = count;
  cachedWasteMonth = key;
  if (!canUseStorage()) {
    for (const listener of wasteListeners) listener(count);
    return;
  }
  window.localStorage.setItem(WASTE_STORAGE_KEY, JSON.stringify(map));
  for (const listener of wasteListeners) listener(count);
}

/** Load all inventory items (including eaten/thrown history if kept). */
export function getInventory(): InventoryItem[] {
  return readRaw();
}

/** Replace the entire inventory list. */
export function setInventory(items: InventoryItem[]): void {
  writeRaw(items);
}

/** Append one item; returns the saved item. */
export function addItem(item: InventoryItem): InventoryItem {
  const items = [...readRaw(), item];
  writeRaw(items);
  return item;
}

/** Merge a partial update by id. Returns the updated item, or null if missing. */
export function updateItem(
  id: string,
  patch: Partial<Omit<InventoryItem, "id">>,
): InventoryItem | null {
  const items = readRaw();
  const index = items.findIndex((entry) => entry.id === id);
  if (index === -1) return null;
  const updated: InventoryItem = { ...items[index], ...patch, id };
  const next = items.slice();
  next[index] = updated;
  writeRaw(next);
  return updated;
}

/**
 * Mark item eaten (leaves active list). Does not touch waste stats.
 */
export function markEaten(id: string): InventoryItem | null {
  return updateItem(id, { status: "eaten", remaining: 0 });
}

/**
 * Mark remaining half; stays active.
 */
export function markHalfLeft(id: string): InventoryItem | null {
  return updateItem(id, { remaining: 0.5 });
}

/**
 * Mark thrown away: leaves active list and increments this month's waste count.
 */
export function markThrown(id: string, now: Date = new Date()): InventoryItem | null {
  const updated = updateItem(id, { status: "thrown", remaining: 0 });
  if (updated) recordWaste(now);
  return updated;
}

/** Remove by id. Returns true if something was removed. */
export function removeItem(id: string): boolean {
  const items = readRaw();
  const next = items.filter((entry) => entry.id !== id);
  if (next.length === items.length) return false;
  writeRaw(next);
  return true;
}

/** Active (not eaten/thrown) items only — convenience for inventory UI later. */
export function getActiveInventory(): InventoryItem[] {
  return readRaw().filter((item) => item.status === "active");
}

/** How many items thrown away this calendar month (v1 count only). */
export function getMonthlyWasteCount(now: Date = new Date()): number {
  const key = monthKey(now);
  if (cachedWasteCount !== null && cachedWasteMonth === key) {
    return cachedWasteCount;
  }
  const map = readWasteMap();
  const count = map[key] ?? 0;
  cachedWasteCount = count;
  cachedWasteMonth = key;
  return count;
}

/** Increment this month's waste counter by 1. */
export function recordWaste(now: Date = new Date()): number {
  const map = readWasteMap();
  const key = monthKey(now);
  map[key] = (map[key] ?? 0) + 1;
  writeWasteMap(map, now);
  return map[key];
}

/** Subscribe to inventory writes (same-tab). Returns unsubscribe. */
export function subscribeInventory(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Subscribe to monthly waste count changes (same-tab). */
export function subscribeMonthlyWaste(listener: WasteListener): () => void {
  wasteListeners.add(listener);
  return () => {
    wasteListeners.delete(listener);
  };
}

/** Clear inventory (useful for tests / reset). */
export function clearInventory(): void {
  writeRaw(EMPTY_ITEMS);
}

/** Clear waste counters (tests / reset). */
export function clearWasteStats(): void {
  cachedWasteCount = 0;
  cachedWasteMonth = monthKey();
  if (canUseStorage()) {
    window.localStorage.removeItem(WASTE_STORAGE_KEY);
  }
  for (const listener of wasteListeners) listener(0);
}

/** Create a new inventory item id (browser / modern Node). */
export function newItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
