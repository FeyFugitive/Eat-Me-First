import type { DayRange, UrgencyInfo, UrgencyLevel } from "./types";

/**
 * Calendar-day difference from boughtAt (YYYY-MM-DD or ISO) to `today`.
 * Uses UTC date parts so local timezone midnight edges stay stable in tests.
 */
export function daysElapsedSince(
  boughtAt: string,
  today: Date = new Date(),
): number {
  const bought = parseDateOnly(boughtAt);
  const end = dateOnlyUTC(today);
  const ms = end.getTime() - bought.getTime();
  return Math.floor(ms / 86_400_000);
}

/**
 * Pure urgency from PLAN.md §4:
 * - daysLeftMax = shelfDays[1] - daysElapsed
 * - daysLeftMin = shelfDays[0] - daysElapsed
 * - daysLeftMax <= 0 → red (past suggested window)
 * - daysLeftMax <= 1 → red (today / tomorrow)
 * - daysLeftMin <= 2 → yellow (eat soon)
 * - else → green
 */
export function calcUrgency(
  shelfDays: DayRange,
  boughtAt: string,
  today: Date = new Date(),
): UrgencyInfo {
  const daysElapsed = daysElapsedSince(boughtAt, today);
  const daysLeftMin = shelfDays[0] - daysElapsed;
  const daysLeftMax = shelfDays[1] - daysElapsed;
  const level = urgencyLevel(daysLeftMin, daysLeftMax);
  return { daysElapsed, daysLeftMin, daysLeftMax, level };
}

export function urgencyLevel(
  daysLeftMin: number,
  daysLeftMax: number,
): UrgencyLevel {
  if (daysLeftMax <= 0) return "red";
  if (daysLeftMax <= 1) return "red";
  if (daysLeftMin <= 2) return "yellow";
  return "green";
}

/** Sort key: red first, then yellow, then green; within level, soonest max first. */
export function urgencySortKey(info: UrgencyInfo): number {
  const tier = info.level === "red" ? 0 : info.level === "yellow" ? 1 : 2;
  return tier * 10_000 + info.daysLeftMax;
}

function parseDateOnly(iso: string): Date {
  const datePart = iso.slice(0, 10);
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function dateOnlyUTC(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}
