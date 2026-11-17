/**
 * Inventory persistence for v1.
 * localStorage only — swap this module for Supabase in v1.5/v2.
 * No auth, no backend.
 */

import type { InventoryItem } from "./types";

export const INVENTORY_STORAGE_KEY = "eat-me-first:inventory";

type Listener = (items: InventoryItem[]) => void;

const listeners = new Set<Listener>();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readRaw(): InventoryItem[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as InventoryItem[];
  } catch {
    return [];
  }
}

function writeRaw(items: InventoryItem[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
  for (const listener of listeners) listener(items);
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
  const items = readRaw();
  items.push(item);
  writeRaw(items);
  return item;
}

/** Merge a partial update by id. Returns the updated item, or null if missing. */
export function updateItem(
  id: string,
  patch: Partial<Omit<InventoryItem, "id">>,
): InventoryItem | null {
  const items = readRaw();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const updated: InventoryItem = { ...items[index], ...patch, id };
  items[index] = updated;
  writeRaw(items);
  return updated;
}

/** Remove by id. Returns true if something was removed. */
export function removeItem(id: string): boolean {
  const items = readRaw();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return false;
  writeRaw(next);
  return true;
}

/** Active (not eaten/thrown) items only — convenience for inventory UI later. */
export function getActiveInventory(): InventoryItem[] {
  return readRaw().filter((item) => item.status === "active");
}

/** Subscribe to inventory writes (same-tab). Returns unsubscribe. */
export function subscribeInventory(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Clear inventory (useful for tests / reset). */
export function clearInventory(): void {
  writeRaw([]);
}

/** Create a new inventory item id (browser / modern Node). */
export function newItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
