import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  INVENTORY_STORAGE_KEY,
  addItem,
  clearInventory,
  getInventory,
  newItemId,
  removeItem,
  updateItem,
} from "./store";
import type { InventoryItem } from "./types";

function memoryLocalStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  };
}

function sampleItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: newItemId(),
    foodId: "spinach",
    name: "菠菜",
    qty: 1,
    unit: "把",
    storage: "fridge",
    boughtAt: "2026-11-17",
    shelfDays: [3, 5],
    opened: false,
    remaining: 1,
    status: "active",
    ...overrides,
  };
}

describe("inventory store (localStorage)", () => {
  beforeEach(() => {
    const storage = memoryLocalStorage();
    // @ts-expect-error test shim for Node
    globalThis.window = { localStorage: storage };
    globalThis.localStorage = storage;
    clearInventory();
  });

  afterEach(() => {
    // @ts-expect-error cleanup
    delete globalThis.window;
    // @ts-expect-error cleanup
    delete globalThis.localStorage;
  });

  it("starts empty", () => {
    assert.deepEqual(getInventory(), []);
  });

  it("adds, updates, and removes items", () => {
    const item = sampleItem({ id: "a1" });
    addItem(item);
    assert.equal(getInventory().length, 1);
    assert.equal(getInventory()[0].name, "菠菜");

    const updated = updateItem("a1", { qty: 2, remaining: 0.5 });
    assert.ok(updated);
    assert.equal(updated!.qty, 2);
    assert.equal(updated!.remaining, 0.5);
    assert.equal(getInventory()[0].qty, 2);

    assert.equal(updateItem("missing", { qty: 9 }), null);

    assert.equal(removeItem("a1"), true);
    assert.deepEqual(getInventory(), []);
    assert.equal(removeItem("a1"), false);
  });

  it("persists JSON under the expected key", () => {
    addItem(sampleItem({ id: "persist-1", name: "鸡胸肉" }));
    const raw = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
    assert.ok(raw);
    const parsed = JSON.parse(raw!) as InventoryItem[];
    assert.equal(parsed[0].name, "鸡胸肉");
  });
});
