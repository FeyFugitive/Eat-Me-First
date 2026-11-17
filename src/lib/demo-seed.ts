/**
 * Demo seed for smoke-testing Inventory (Prompt 3).
 * Not auto-run — call seedDemoInventory() from the browser console
 * or a temporary UI affordance.
 *
 * Creates red / yellow / green items so sorting and actions are visible.
 */

import { addItem, clearInventory, clearWasteStats, newItemId } from "./store";
import type { InventoryItem } from "./types";

function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD that is `daysAgo` calendar days before `now`. */
function boughtDaysAgo(daysAgo: number, now: Date = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
  return todayISO(d);
}

function item(partial: Omit<InventoryItem, "id"> & { id?: string }): InventoryItem {
  return { id: partial.id ?? newItemId(), ...partial };
}

/**
 * Replace inventory with a few demo rows spanning urgency tiers.
 * Clears waste stats so the monthly counter starts at 0.
 */
export function seedDemoInventory(now: Date = new Date()): InventoryItem[] {
  clearInventory();
  clearWasteStats();

  const samples: InventoryItem[] = [
    // Chicken day 2 → red (shelf 1–2)
    item({
      foodId: "chicken-breast",
      name: "鸡胸肉",
      qty: 2,
      unit: "块",
      storage: "fridge",
      boughtAt: boughtDaysAgo(1, now),
      shelfDays: [1, 2],
      opened: false,
      remaining: 1,
      status: "active",
    }),
    // Bean sprouts day 3 → red / past window (shelf 2–3)
    item({
      foodId: "bean-sprouts",
      name: "豆芽",
      qty: 1,
      unit: "袋",
      storage: "fridge",
      boughtAt: boughtDaysAgo(3, now),
      shelfDays: [2, 3],
      opened: false,
      remaining: 1,
      status: "active",
    }),
    // Spinach day 4 → yellow (shelf 3–5; 第4天 = elapsed 3)
    item({
      foodId: "spinach",
      name: "菠菜",
      qty: 1,
      unit: "把",
      storage: "fridge",
      boughtAt: boughtDaysAgo(3, now),
      shelfDays: [3, 5],
      opened: false,
      remaining: 1,
      status: "active",
    }),
    // Carrot early → green
    item({
      foodId: "carrot",
      name: "胡萝卜",
      qty: 3,
      unit: "根",
      storage: "fridge",
      boughtAt: boughtDaysAgo(2, now),
      shelfDays: [14, 21],
      opened: false,
      remaining: 1,
      status: "active",
    }),
    // Frozen dumplings — freezer green
    item({
      foodId: "frozen-dumplings",
      name: "冷冻饺子",
      qty: 1,
      unit: "袋",
      storage: "freezer",
      boughtAt: boughtDaysAgo(5, now),
      shelfDays: [30, 60],
      opened: false,
      remaining: 1,
      status: "active",
    }),
    // Bread in pantry — mid
    item({
      foodId: "bread",
      name: "面包",
      qty: 1,
      unit: "袋",
      storage: "pantry",
      boughtAt: boughtDaysAgo(1, now),
      shelfDays: [3, 5],
      opened: true,
      remaining: 0.5,
      status: "active",
    }),
  ];

  for (const sample of samples) addItem(sample);
  return samples;
}
