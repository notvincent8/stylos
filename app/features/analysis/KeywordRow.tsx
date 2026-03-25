import { useState } from "react"
import { cn } from "@/app/lib/cn"
import type { ParsedKeyword } from "@/app/lib/prompt-builder"

type KeywordRowProps = {
  kw: ParsedKeyword
  isLocked: boolean
  onToggleLock: (label: string) => void
}
const KeywordRow = ({ kw, isLocked, onToggleLock }: KeywordRowProps) => {
  const [hovered, setHovered] = useState(false)

  const barColor = kw.confidence >= 8 ? "bg-accent" : kw.confidence >= 5 ? "bg-ink/42" : "bg-danger"
  const scoreColor = kw.confidence >= 8 ? "text-accent" : kw.confidence >= 5 ? "text-ink/42" : "text-danger"

  return (
    <div className={cn("relative", hovered ? "z-10" : "z-0")}>
      <button
        type="button"
        className={cn(
          "group w-full flex items-center gap-3 py-[0.6rem] font-body",
          "border-b transition-colors hover:bg-surface-2",
          isLocked ? "border-accent/20" : "border-edge",
        )}
        onClick={() => onToggleLock(kw.label)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span
          className={cn(
            "w-2 shrink-0 text-[0.42rem] leading-none transition-colors",
            isLocked ? "text-accent" : "text-transparent",
          )}
        >
          ◆
        </span>

        <span
          className={cn(
            "flex-1 text-[0.78rem] tracking-widest uppercase font-semibold transition-colors font-body text-left",
            isLocked ? "text-accent" : "text-ink/42 group-hover:text-ink",
          )}
        >
          {kw.label}
        </span>

        <div className="relative w-18 h-0.5 bg-edge-mid shrink-0">
          <div
            className={cn("absolute inset-y-0 left-0 transition-[width] duration-500", barColor)}
            style={{ width: `${kw.confidence * 10}%` }}
          />
        </div>

        <span className={cn("font-body font-bold text-[0.65rem] w-4 text-right shrink-0 leading-none", scoreColor)}>
          {kw.confidence}
        </span>
      </button>

      {hovered && kw.description && (
        <div className="absolute bottom-full -translate-y-2 left-4 z-50 bg-surface-3 border border-edge-strong p-3.5 text-[0.75rem] text-ink leading-relaxed max-w-75 min-w-45 font-body shadow-[0_8px_32px_rgba(0,0,0,0.55)] pointer-events-none">
          {kw.description}
          <div className="absolute -bottom-1.25 left-3 w-2 h-2 bg-surface-3 border-r border-b border-edge-strong rotate-45" />
        </div>
      )}
    </div>
  )
}

export default KeywordRow
