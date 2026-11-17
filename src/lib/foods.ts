import foodsJson from "../../data/foods.json";
import type {
  DayRange,
  FoodCategory,
  FoodDef,
  StoragePlace,
} from "./types";

/** Seed catalog from data/foods.json (PLAN.md §5). */
export const FOODS: FoodDef[] = foodsJson as FoodDef[];

/**
 * Category fallback shelf life when the user adds a custom food (PLAN.md §5).
 * Values are fridge defaults; caller may still edit.
 */
export const CATEGORY_DEFAULT_FRIDGE_DAYS: Record<FoodCategory, DayRange> = {
  leafy: [3, 5],
  vegetable: [5, 7],
  fruit: [5, 7],
  meat: [1, 2],
  seafood: [1, 2],
  dairy: [5, 7],
  egg: [21, 35],
  soy: [5, 7],
  leftover: [3, 4],
  condiment: [90, 180],
  other: [5, 7],
};

export function getFoodById(id: string): FoodDef | undefined {
  return FOODS.find((food) => food.id === id);
}

/** Shelf-day range for a FoodDef at a storage place; null if not applicable. */
export function shelfDaysForStorage(
  food: FoodDef,
  storage: StoragePlace,
): DayRange | null {
  if (storage === "fridge") return food.fridgeDays;
  if (storage === "freezer") return food.freezerDays;
  return food.pantryDays;
}

/**
 * Resolve shelf days for an add flow: preferred storage, else first available,
 * else category fridge default.
 */
export function resolveShelfDays(
  food: FoodDef | null,
  storage: StoragePlace,
  category: FoodCategory = "other",
): DayRange {
  if (food) {
    const fromFood = shelfDaysForStorage(food, storage);
    if (fromFood) return [...fromFood] as DayRange;
    if (food.fridgeDays) return [...food.fridgeDays] as DayRange;
    if (food.freezerDays) return [...food.freezerDays] as DayRange;
    if (food.pantryDays) return [...food.pantryDays] as DayRange;
  }
  return [...CATEGORY_DEFAULT_FRIDGE_DAYS[category]] as DayRange;
}
