import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { searchFoods } from "./search-foods";

describe("searchFoods", () => {
  it("matches Chinese name", () => {
    const hits = searchFoods("菠");
    assert.ok(hits.some((f) => f.id === "spinach"));
  });

  it("matches English name case-insensitively", () => {
    const hits = searchFoods("SPINACH");
    assert.equal(hits[0]?.id, "spinach");
  });

  it("matches aliases", () => {
    const hits = searchFoods("小白菜");
    assert.ok(hits.some((f) => f.id === "bok-choy"));
  });

  it("returns empty for blank query", () => {
    assert.deepEqual(searchFoods("   "), []);
  });

  it("limits results", () => {
    const hits = searchFoods("a", 3);
    assert.ok(hits.length <= 3);
  });
});
