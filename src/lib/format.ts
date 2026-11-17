import type { UrgencyInfo } from "./types";

/**
 * "Day N" display: buy day is day 1 (PLAN §8: 第 N 天 → elapsed = N - 1).
 */
export function dayNumberLabel(daysElapsed: number): string {
  const day = Math.max(0, daysElapsed) + 1;
  return `Day ${day}`;
}

/**
 * Approx days-left as a range — never a single fake expiry date (iron rule 2).
 */
export function daysLeftLabel(info: UrgencyInfo): string {
  const { daysLeftMin, daysLeftMax } = info;

  if (daysLeftMax <= 0) {
    return "Past suggested window";
  }

  if (daysLeftMin <= 0) {
    // Still inside max window but min already elapsed
    return `~0–${daysLeftMax} days left`;
  }

  if (daysLeftMin === daysLeftMax) {
    return `~${daysLeftMax} days left`;
  }

  return `~${daysLeftMin}–${daysLeftMax} days left`;
}

export function qtyLabel(qty: number, unit: string, remaining: 1 | 0.5 | 0): string {
  const half = remaining === 0.5 ? " (½ left)" : "";
  return `${qty} ${unit}${half}`;
}
