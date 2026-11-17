/**
 * Most-recently-used catalog foods for Add-page chips (PLAN.md §6).
 * Persisted in localStorage; max 10, newest first.
 */

import { FOODS, getFoodById } from "./foods";
import type { FoodDef } from "./types";

export const RECENT_FOODS_KEY = "eat-me-first:recent-food-ids";
export const RECENT_FOODS_LIMIT = 10;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Read recent food ids (newest first). Invalid / unknown ids dropped. */
export function getRecentFoodIds(): string[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(RECENT_FOODS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const ids: string[] = [];
    for (const entry of parsed) {
      if (typeof entry !== "string") continue;
      if (!getFoodById(entry)) continue;
      if (ids.includes(entry)) continue;
      ids.push(entry);
      if (ids.length >= RECENT_FOODS_LIMIT) break;
    }
    return ids;
  } catch {
    return [];
  }
}

/** Push a catalog food id to the front of the MRU list. */
export function recordRecentFood(foodId: string): string[] {
  if (!getFoodById(foodId)) return getRecentFoodIds();
  const next = [foodId, ...getRecentFoodIds().filter((id) => id !== foodId)].slice(
    0,
    RECENT_FOODS_LIMIT,
  );
  if (canUseStorage()) {
    window.localStorage.setItem(RECENT_FOODS_KEY, JSON.stringify(next));
  }
  return next;
}

/** Resolve MRU chips; if empty, fall back to a few common seed foods for speed. */
export function getFrequentFoods(limit = RECENT_FOODS_LIMIT): FoodDef[] {
  const recent = getRecentFoodIds()
    .map((id) => getFoodById(id))
    .filter((f): f is FoodDef => Boolean(f));

  if (recent.length >= limit) return recent.slice(0, limit);

  const seen = new Set(recent.map((f) => f.id));
  const fallbackIds = [
    "spinach",
    "egg",
    "chicken-breast",
    "milk",
    "tomato",
    "bean-sprouts",
    "firm-tofu",
    "carrot",
    "banana",
    "leftovers",
  ];

  const out = [...recent];
  for (const id of fallbackIds) {
    if (out.length >= limit) break;
    if (seen.has(id)) continue;
    const food = getFoodById(id);
    if (!food) continue;
    seen.add(id);
    out.push(food);
  }

  // Absolute last resort: first N from catalog
  if (out.length === 0) {
    return FOODS.slice(0, limit);
  }

  return out;
}

export function clearRecentFoods(): void {
  if (canUseStorage()) {
    window.localStorage.removeItem(RECENT_FOODS_KEY);
  }
}
