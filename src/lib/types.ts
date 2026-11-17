/**
 * EatMeFirst data model (PLAN.md §4).
 * No auth/backend — inventory lives in localStorage via lib/store.ts.
 */

export type StoragePlace = "fridge" | "freezer" | "pantry";
export type ItemStatus = "active" | "eaten" | "thrown";

export type FoodCategory =
  | "leafy"
  | "vegetable"
  | "fruit"
  | "meat"
  | "seafood"
  | "dairy"
  | "egg"
  | "soy"
  | "leftover"
  | "condiment"
  | "other";

/** Shelf-life suggestion as [min, max] days. Never a single fake expiry date. */
export type DayRange = [number, number];

export type UrgencyLevel = "red" | "yellow" | "green";

export interface FoodDef {
  id: string;
  nameEn: string;
  nameZh: string;
  /** Search aliases in both languages */
  aliases: string[];
  category: FoodCategory;
  fridgeDays: DayRange;
  freezerDays: DayRange | null;
  pantryDays: DayRange | null;
  /** Coarse unit hint: 盒 / 个 / 包 — not grams/ml */
  unitHint: string;
}

export interface InventoryItem {
  id: string;
  /** null for custom (user-defined) foods */
  foodId: string | null;
  name: string;
  qty: number;
  unit: string;
  storage: StoragePlace;
  /** ISO date (YYYY-MM-DD), default today */
  boughtAt: string;
  /** Copied from FoodDef for storage; user may edit */
  shelfDays: DayRange;
  /** Opened marker only in v1 — does not auto-change days */
  opened: boolean;
  /** 1 = full, 0.5 = half; 0 pairs with status eaten/thrown */
  remaining: 1 | 0.5 | 0;
  status: ItemStatus;
  note?: string;
}

/** Derived urgency fields — compute live, do not persist. */
export interface UrgencyInfo {
  daysElapsed: number;
  daysLeftMin: number;
  daysLeftMax: number;
  level: UrgencyLevel;
}
