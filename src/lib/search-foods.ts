import { FOODS } from "./foods";
import type { FoodDef } from "./types";

/** Normalize for bilingual substring match (case-fold + trim). */
export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

function foodSearchBlob(food: FoodDef): string {
  return [food.nameEn, food.nameZh, food.id, ...food.aliases]
    .join("\0")
    .toLowerCase();
}

/**
 * Autocomplete over foods.json: English, Chinese, and aliases (PLAN.md §6).
 * Empty query → []. Rank: nameZh/nameEn prefix, then alias/id hit, then contains.
 */
export function searchFoods(query: string, limit = 8): FoodDef[] {
  const q = normalizeSearchQuery(query);
  if (!q) return [];

  type Ranked = { food: FoodDef; rank: number };
  const hits: Ranked[] = [];

  for (const food of FOODS) {
    const nameZh = food.nameZh.toLowerCase();
    const nameEn = food.nameEn.toLowerCase();
    const id = food.id.toLowerCase();
    const aliases = food.aliases.map((a) => a.toLowerCase());

    let rank = -1;
    if (nameZh.startsWith(q) || nameEn.startsWith(q)) rank = 0;
    else if (aliases.some((a) => a.startsWith(q)) || id.startsWith(q)) rank = 1;
    else if (foodSearchBlob(food).includes(q)) rank = 2;

    if (rank >= 0) hits.push({ food, rank });
  }

  hits.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.food.nameZh.localeCompare(b.food.nameZh, "zh");
  });

  return hits.slice(0, limit).map((h) => h.food);
}
