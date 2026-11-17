import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dayNumberZh, todaySummarySentence, type TodayRow } from "./today-summary";
import type { InventoryItem, UrgencyInfo } from "./types";

function row(
  name: string,
  daysElapsed: number,
  level: UrgencyInfo["level"] = "red",
): TodayRow {
  const item: InventoryItem = {
    id: name,
    foodId: null,
    name,
    qty: 1,
    unit: "个",
    storage: "fridge",
    boughtAt: "2026-01-01",
    shelfDays: [1, 2],
    opened: false,
    remaining: 1,
    status: "active",
  };
  const urgency: UrgencyInfo = {
    daysElapsed,
    daysLeftMin: 0,
    daysLeftMax: level === "red" ? 0 : 2,
    level,
  };
  return { item, urgency };
}

describe("dayNumberZh", () => {
  it("treats buy day as 第 1 天", () => {
    assert.equal(dayNumberZh(0), 1);
    assert.equal(dayNumberZh(2), 3);
  });
});

describe("todaySummarySentence", () => {
  it("handles empty list", () => {
    assert.equal(todaySummarySentence([]), "今天有 0 样建议优先吃。");
  });

  it("lists all names when fewer than 3", () => {
    assert.equal(
      todaySummarySentence([row("豆芽", 2)]),
      "今天有 1 样建议优先吃：豆芽（第 3 天）",
    );
  });

  it("includes N and top 3 with days elapsed", () => {
    const rows = [
      row("豆芽", 2),
      row("鸡胸肉", 1),
      row("菠菜", 3, "yellow"),
      row("蘑菇", 4, "yellow"),
    ];
    assert.equal(
      todaySummarySentence(rows),
      "今天有 4 样建议优先吃：豆芽（第 3 天）、鸡胸肉（第 2 天）、菠菜（第 4 天）",
    );
  });
});
