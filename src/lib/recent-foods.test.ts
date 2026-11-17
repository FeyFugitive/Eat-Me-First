import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clearRecentFoods,
  getFrequentFoods,
  getRecentFoodIds,
  recordRecentFood,
  RECENT_FOODS_KEY,
} from "./recent-foods";

describe("recent foods MRU", () => {
  it("records newest first and dedupes", () => {
    // jsdom-less: polyfill localStorage for node test
    const store = new Map<string, string>();
    const localStorage: Storage = {
      get length() {
        return store.size;
      },
      clear() {
        store.clear();
      },
      getItem(k: string) {
        return store.get(k) ?? null;
      },
      setItem(k: string, v: string) {
        store.set(k, String(v));
      },
      removeItem(k: string) {
        store.delete(k);
      },
      key(index: number) {
        return [...store.keys()][index] ?? null;
      },
    };
    Object.defineProperty(globalThis, "window", {
      value: { localStorage },
      configurable: true,
      writable: true,
    });

    clearRecentFoods();
    recordRecentFood("spinach");
    recordRecentFood("egg");
    recordRecentFood("spinach");
    assert.deepEqual(getRecentFoodIds(), ["spinach", "egg"]);
    assert.equal(store.get(RECENT_FOODS_KEY), JSON.stringify(["spinach", "egg"]));

    const frequent = getFrequentFoods(5);
    assert.equal(frequent[0]?.id, "spinach");
    assert.equal(frequent[1]?.id, "egg");
    assert.ok(frequent.length === 5);

    clearRecentFoods();
    assert.deepEqual(getRecentFoodIds(), []);
  });
});
