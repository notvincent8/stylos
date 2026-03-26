import { cn } from "@/app/lib/cn"

type DailyUsageNoticeProps = {
  used: number | null
  cap: number | null
  compact?: boolean
}

const DailyUsageNotice = ({ used, cap, compact = false }: DailyUsageNoticeProps) => {
  const effectiveCap = cap ?? 5
  const displayUsed = used !== null ? Math.min(used, effectiveCap) : null
  const isExhausted = used !== null && used >= effectiveCap
  const fillPercent = displayUsed !== null ? (displayUsed / effectiveCap) * 100 : 0
  const hasData = displayUsed !== null

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-body text-[0.72rem] tracking-[0.18em] uppercase font-semibold text-ink/42 shrink-0">
          Free Preview
        </span>

        {hasData ? (
          <>
            <div className="flex-1 h-[2px] bg-surface-3 overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-700 ease-out",
                  isExhausted ? "bg-danger" : "bg-accent",
                )}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
            <span
              className={cn(
                "font-body text-[0.72rem] tabular-nums font-semibold tracking-wider shrink-0",
                isExhausted ? "text-danger" : "text-ink/35",
              )}
            >
              {displayUsed} / {effectiveCap}
            </span>
          </>
        ) : (
          <>
            <div className="flex-1 h-px bg-edge" />
            <span className="font-body text-[0.68rem] text-ink/25 shrink-0 tracking-[0.06em]">
              {effectiveCap} / day
            </span>
          </>
        )}
      </div>
    )
  }

  // ── Full (desktop sidebar) ────────────────────────────────────────────────
  // Stacked: label + count, bar, subtext
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-body text-[0.72rem] tracking-[0.18em] uppercase font-semibold text-ink/42 shrink-0">
          Free Preview
        </span>
        {hasData && (
          <span
            className={cn(
              "font-body text-[0.72rem] tabular-nums font-semibold tracking-wider shrink-0",
              isExhausted ? "text-danger" : "text-ink/55",
            )}
          >
            {displayUsed} / {effectiveCap}
          </span>
        )}
      </div>

      {hasData && (
        <div className="h-[2px] w-full bg-surface-3 overflow-hidden">
          <div
            className={cn("h-full transition-all duration-700 ease-out", isExhausted ? "bg-danger" : "bg-accent")}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      )}

      <p className={cn("font-body text-[0.68rem] leading-relaxed", isExhausted ? "text-danger/70" : "text-ink/42")}>
        {isExhausted
          ? "Daily limit reached — come back tomorrow"
          : hasData
            ? `${effectiveCap - displayUsed!} ${effectiveCap - displayUsed! === 1 ? "analysis" : "analyses"} remaining · Resets at midnight UTC`
            : `Portfolio demo · ${effectiveCap} free analyses / day, no account needed`}
      </p>
    </div>
  )
}

export default DailyUsageNotice
