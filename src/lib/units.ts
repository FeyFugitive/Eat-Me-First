/** Coarse units only — never grams/ml (PLAN.md §4 / iron rule 1). */
export const COMMON_UNITS = [
  "个",
  "盒",
  "包",
  "袋",
  "把",
  "块",
  "根",
  "颗",
  "份",
  "瓶",
] as const;

export function unitOptions(hint: string): string[] {
  const base = [...COMMON_UNITS];
  if (hint && !base.includes(hint as (typeof COMMON_UNITS)[number])) {
    return [hint, ...base];
  }
  if (hint) {
    return [hint, ...base.filter((u) => u !== hint)];
  }
  return base;
}
