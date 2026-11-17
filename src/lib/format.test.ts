import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { dayNumberLabel, daysLeftLabel, qtyLabel } from "./format";

describe("dayNumberLabel", () => {
  it("treats buy day as Day 1", () => {
    assert.equal(dayNumberLabel(0), "Day 1");
    assert.equal(dayNumberLabel(3), "Day 4");
  });
});

describe("daysLeftLabel", () => {
  it("shows a range, never a single fake expiry", () => {
    assert.equal(
      daysLeftLabel({
        daysElapsed: 1,
        daysLeftMin: 2,
        daysLeftMax: 4,
        level: "yellow",
      }),
      "~2–4 days left",
    );
  });

  it("handles past suggested window", () => {
    assert.equal(
      daysLeftLabel({
        daysElapsed: 6,
        daysLeftMin: -3,
        daysLeftMax: -1,
        level: "red",
      }),
      "Past suggested window",
    );
  });

  it("clamps negative min while max still open", () => {
    assert.equal(
      daysLeftLabel({
        daysElapsed: 4,
        daysLeftMin: -1,
        daysLeftMax: 1,
        level: "red",
      }),
      "~0–1 days left",
    );
  });
});

describe("qtyLabel", () => {
  it("appends half marker", () => {
    assert.equal(qtyLabel(1, "把", 1), "1 把");
    assert.equal(qtyLabel(1, "把", 0.5), "1 把 (½ left)");
  });
});
