import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calcUrgency, daysElapsedSince, urgencyLevel } from "./urgency";

/** Fixed "today" = 2026-11-17 local calendar via Date ctor (Y, M0, D). */
const TODAY = new Date(2026, 10, 17);

function boughtDaysAgo(days: number): string {
  const d = new Date(2026, 10, 17 - days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("daysElapsedSince", () => {
  it("counts whole calendar days", () => {
    assert.equal(daysElapsedSince(boughtDaysAgo(0), TODAY), 0);
    assert.equal(daysElapsedSince(boughtDaysAgo(4), TODAY), 4);
  });
});

describe("urgencyLevel", () => {
  it("is red when past suggested window (daysLeftMax <= 0)", () => {
    assert.equal(urgencyLevel(-1, -1), "red");
    assert.equal(urgencyLevel(-2, 0), "red");
  });

  it("is red when daysLeftMax <= 1 (today/tomorrow)", () => {
    assert.equal(urgencyLevel(0, 1), "red");
    assert.equal(urgencyLevel(-1, 1), "red");
  });

  it("is yellow when daysLeftMin <= 2 (and not red)", () => {
    assert.equal(urgencyLevel(2, 4), "yellow");
    assert.equal(urgencyLevel(1, 3), "yellow");
    assert.equal(urgencyLevel(0, 3), "yellow");
  });

  it("is green otherwise", () => {
    assert.equal(urgencyLevel(3, 5), "green");
    assert.equal(urgencyLevel(10, 20), "green");
  });
});

describe("calcUrgency — acceptance cases from PLAN.md §8", () => {
  it("spinach fridge 3–5: day 4 is yellow", () => {
    // daysElapsed=4 → leftMin=-1, leftMax=1 → red actually because max<=1
    // PLAN: 菠菜第 4 天显示黄色 — boughtAt day 0 is buy day; "第 4 天" = elapsed 3
    // Interpret "第 N 天" as daysElapsed = N - 1 (day 1 = buy day).
    const day4 = calcUrgency([3, 5], boughtDaysAgo(3), TODAY);
    assert.equal(day4.daysElapsed, 3);
    assert.equal(day4.daysLeftMin, 0);
    assert.equal(day4.daysLeftMax, 2);
    assert.equal(day4.level, "yellow");
  });

  it("spinach fridge 3–5: day 6 is red", () => {
    // 第 6 天 → elapsed 5 → leftMin=-2, leftMax=0 → red
    const day6 = calcUrgency([3, 5], boughtDaysAgo(5), TODAY);
    assert.equal(day6.daysElapsed, 5);
    assert.equal(day6.daysLeftMax, 0);
    assert.equal(day6.level, "red");
  });

  it("chicken breast fridge 1–2: buy day 2 is red", () => {
    // 第 2 天 → elapsed 1 → leftMin=0, leftMax=1 → red (max <= 1)
    const day2 = calcUrgency([1, 2], boughtDaysAgo(1), TODAY);
    assert.equal(day2.daysElapsed, 1);
    assert.equal(day2.daysLeftMax, 1);
    assert.equal(day2.level, "red");
  });

  it("fresh chicken on buy day is yellow (eat soon)", () => {
    const day1 = calcUrgency([1, 2], boughtDaysAgo(0), TODAY);
    assert.equal(day1.daysElapsed, 0);
    assert.equal(day1.daysLeftMin, 1);
    assert.equal(day1.daysLeftMax, 2);
    assert.equal(day1.level, "yellow");
  });

  it("carrot fridge 14–21 stays green early on", () => {
    const early = calcUrgency([14, 21], boughtDaysAgo(2), TODAY);
    assert.equal(early.level, "green");
  });
});
