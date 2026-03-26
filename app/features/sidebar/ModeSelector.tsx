import { cn } from "@/app/lib/cn"
import type { AnalysisMode } from "@/app/lib/prompt-builder/type"

const MODES: { id: AnalysisMode; label: string; desc: string }[] = [
  { id: "trending", label: "Pulse", desc: "trending now" },
  { id: "creative", label: "Unbox", desc: "unexpected" },
]

type ModeSelectorProps = {
  modes: Set<AnalysisMode>
  onToggle: (mode: AnalysisMode) => void
}

const ModeSelector = ({ modes, onToggle }: ModeSelectorProps) => {
  return (
    <fieldset className="border-none p-0 m-0">
      <legend className="text-[0.68rem] tracking-[0.22em] uppercase text-ink/42 font-body font-semibold mb-[0.6rem]">
        Mode
      </legend>
      <div className="flex gap-[0.3rem]">
        {MODES.map((m) => {
          const isActive = modes.has(m.id)
          return (
            <button
              type="button"
              key={m.id}
              aria-pressed={isActive}
              onClick={() => onToggle(m.id)}
              className={cn(
                "flex-1 flex flex-col items-start gap-[0.12rem] font-body",
                "border border-l-2 py-[0.6rem] px-[0.65rem] transition-all duration-150",
                isActive
                  ? "border-edge-mid border-l-accent bg-accent-dim text-accent"
                  : "border-edge-mid border-l-transparent text-ink/42 hover:border-edge-strong hover:bg-surface-2 hover:text-ink",
              )}
            >
              <span className="text-[0.78rem] font-bold tracking-[0.06em] uppercase">{m.label}</span>
              <span className="text-[0.65rem] text-left tracking-[0.05em] uppercase text-ink/18">{m.desc}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default ModeSelector
