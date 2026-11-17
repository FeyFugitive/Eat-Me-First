import type { InventoryItem, UrgencyInfo } from "./types";

export type TodayRow = { item: InventoryItem; urgency: UrgencyInfo };

/** Buy day is day 1 (same convention as dayNumberLabel / PLAN §8). */
export function dayNumberZh(daysElapsed: number): number {
  return Math.max(0, daysElapsed) + 1;
}

/**
 * One-sentence Chinese summary for /today (PLAN §6 Prompt 5):
 * "今天有 N 样建议优先吃：…" with top 3 names + 第 N 天.
 * `rows` must already be urgency-sorted (red → yellow) and red/yellow only.
 */
export function todaySummarySentence(rows: TodayRow[]): string {
  const n = rows.length;
  if (n === 0) {
    return "今天有 0 样建议优先吃。";
  }

  const top = rows.slice(0, 3);
  const names = top
    .map(({ item, urgency }) => {
      const day = dayNumberZh(urgency.daysElapsed);
      return `${item.name}（第 ${day} 天）`;
    })
    .join("、");

  return `今天有 ${n} 样建议优先吃：${names}`;
}
