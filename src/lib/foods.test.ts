import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { FOODS, getFoodById, shelfDaysForStorage } from "./foods";

/** Required first-batch ids from PLAN.md §5 table. */
const REQUIRED_IDS = [
  "spinach",
  "lettuce",
  "bok-choy",
  "bean-sprouts",
  "broccoli",
  "carrot",
  "tomato",
  "cucumber",
  "mushroom",
  "avocado",
  "banana",
  "apple",
  "berries",
  "egg",
  "milk",
  "yogurt",
  "cheese",
  "chicken-breast",
  "fresh-pork-beef",
  "hot-pot-meat-slices",
  "salmon-fish",
  "shrimp",
  "firm-tofu",
  "soft-tofu",
  "soy-milk",
  "frozen-dumplings",
  "leftovers",
  "bread",
] as const;

describe("foods seed catalog", () => {
  it("has 60–80 items", () => {
    assert.ok(FOODS.length >= 60, `expected >= 60, got ${FOODS.length}`);
    assert.ok(FOODS.length <= 80, `expected <= 80, got ${FOODS.length}`);
  });

  it("includes every PLAN.md §5 table food", () => {
    for (const id of REQUIRED_IDS) {
      assert.ok(getFoodById(id), `missing required food id: ${id}`);
    }
  });

  it("uses [min,max] day ranges and bilingual names", () => {
    for (const food of FOODS) {
      assert.ok(food.nameEn.length > 0, `${food.id} missing nameEn`);
      assert.ok(food.nameZh.length > 0, `${food.id} missing nameZh`);
      assert.ok(Array.isArray(food.aliases) && food.aliases.length > 0);
      assert.equal(food.fridgeDays.length, 2);
      assert.ok(food.fridgeDays[0] <= food.fridgeDays[1]);
      if (food.freezerDays) {
        assert.ok(food.freezerDays[0] <= food.freezerDays[1]);
      }
      if (food.pantryDays) {
        assert.ok(food.pantryDays[0] <= food.pantryDays[1]);
      }
    }
  });

  it("matches key §5 shelf ranges", () => {
    assert.deepEqual(getFoodById("spinach")!.fridgeDays, [3, 5]);
    assert.deepEqual(getFoodById("bean-sprouts")!.fridgeDays, [2, 3]);
    assert.deepEqual(getFoodById("chicken-breast")!.fridgeDays, [1, 2]);
    assert.deepEqual(getFoodById("chicken-breast")!.freezerDays, [60, 90]);
    assert.equal(getFoodById("soft-tofu")!.freezerDays, null);
    assert.deepEqual(getFoodById("frozen-dumplings")!.freezerDays, [30, 60]);
    assert.deepEqual(getFoodById("bread")!.pantryDays, [3, 5]);
    assert.deepEqual(getFoodById("leftovers")!.fridgeDays, [3, 4]);
  });

  it("shelfDaysForStorage respects null places", () => {
    const spinach = getFoodById("spinach")!;
    assert.deepEqual(shelfDaysForStorage(spinach, "fridge"), [3, 5]);
    assert.equal(shelfDaysForStorage(spinach, "freezer"), null);
  });
});
