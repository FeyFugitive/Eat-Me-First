import type { StoragePlace } from "@/lib/types";

const labels: Record<StoragePlace, string> = {
  fridge: "Fridge",
  freezer: "Freezer",
  pantry: "Pantry",
};

export function StorageIcon({
  storage,
  className = "",
}: {
  storage: StoragePlace;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[var(--muted)] ${className}`}
      title={labels[storage]}
      aria-label={labels[storage]}
    >
      {storage === "fridge" ? (
        <FridgeSvg />
      ) : storage === "freezer" ? (
        <FreezerSvg />
      ) : (
        <PantrySvg />
      )}
    </span>
  );
}

function FridgeSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="6"
        y="3"
        width="12"
        height="18"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M6 11h12" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M9 7v2M9 14v3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FreezerSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v18M12 12l4-4M12 12l-4-4M12 12l4 4M12 12l-4 4M5 8.5h3M16 8.5h3M5 15.5h3M16 15.5h3"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PantrySvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h16M6 20V8l6-4 6 4v12M10 20v-5h4v5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
