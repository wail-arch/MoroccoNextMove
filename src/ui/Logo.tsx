import { cn } from "@/lib/cn";

/** Eight-point zellige star — the brand mark. */
export function StarMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("h-6 w-6", className)}
    >
      <path
        d="M12 1.5 14.6 6 19.4 4.6 18 9.4 22.5 12 18 14.6 19.4 19.4 14.6 18 12 22.5 9.4 18 4.6 19.4 6 14.6 1.5 12 6 9.4 4.6 4.6 9.4 6 12 1.5Z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="3.2" className="fill-plaster" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zellige text-saffron">
        <StarMark className="h-5.5 w-5.5" />
      </span>
      {!compact && (
        <span className="min-w-0 leading-tight">
          <span className="block font-display text-base font-semibold tracking-tight text-ink">
            Next Move
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-terracotta">
            Morocco
          </span>
        </span>
      )}
    </span>
  );
}
