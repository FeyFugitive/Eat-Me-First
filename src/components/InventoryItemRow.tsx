"use client";

import { StorageIcon } from "@/components/StorageIcon";
import { dayNumberLabel, daysLeftLabel, qtyLabel } from "@/lib/format";
import type { InventoryItem, UrgencyInfo, UrgencyLevel } from "@/lib/types";

const barClass: Record<UrgencyLevel, string> = {
  red: "bg-[var(--urgency-red)]",
  yellow: "bg-[var(--urgency-yellow)]",
  green: "bg-[var(--urgency-green)]",
};

const levelLabel: Record<UrgencyLevel, string> = {
  red: "Eat now",
  yellow: "Eat soon",
  green: "OK",
};

type Props = {
  item: InventoryItem;
  urgency: UrgencyInfo;
  onEaten: (id: string) => void;
  onHalfLeft: (id: string) => void;
  onThrown: (id: string) => void;
};

export function InventoryItemRow({
  item,
  urgency,
  onEaten,
  onHalfLeft,
  onThrown,
}: Props) {
  return (
    <article
      className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
      data-urgency={urgency.level}
    >
      <div className="flex gap-0">
        <div
          className={`w-1.5 shrink-0 self-stretch ${barClass[urgency.level]}`}
          aria-hidden="true"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold leading-tight">
                {item.name}
              </h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-[var(--muted)]">
                <span>{qtyLabel(item.qty, item.unit, item.remaining)}</span>
                <span aria-hidden="true">·</span>
                <StorageIcon storage={item.storage} />
                <span aria-hidden="true">·</span>
                <span>{dayNumberLabel(urgency.daysElapsed)}</span>
              </p>
            </div>
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badgeClass(urgency.level)}`}
            >
              {levelLabel[urgency.level]}
            </span>
          </div>

          <p className="text-sm font-medium text-[var(--foreground)]">
            {daysLeftLabel(urgency)}
          </p>

          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <ActionButton
              label="Eaten"
              onClick={() => onEaten(item.id)}
              variant="default"
            />
            <ActionButton
              label="Half left"
              onClick={() => onHalfLeft(item.id)}
              variant="default"
              disabled={item.remaining === 0.5}
            />
            <ActionButton
              label="Thrown away"
              onClick={() => onThrown(item.id)}
              variant="danger"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function badgeClass(level: UrgencyLevel): string {
  switch (level) {
    case "red":
      return "bg-[var(--urgency-red-soft)] text-[var(--urgency-red-text)]";
    case "yellow":
      return "bg-[var(--urgency-yellow-soft)] text-[var(--urgency-yellow-text)]";
    default:
      return "bg-[var(--urgency-green-soft)] text-[var(--urgency-green-text)]";
  }
}

function ActionButton({
  label,
  onClick,
  variant,
  disabled,
}: {
  label: string;
  onClick: () => void;
  variant: "default" | "danger";
  disabled?: boolean;
}) {
  const base =
    "min-h-11 rounded-lg px-1.5 py-2 text-center text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const styles =
    variant === "danger"
      ? "bg-[var(--urgency-red-soft)] text-[var(--urgency-red-text)] active:brightness-95"
      : "bg-[var(--accent-soft)] text-[var(--foreground)] active:brightness-95";

  return (
    <button
      type="button"
      className={`${base} ${styles}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
