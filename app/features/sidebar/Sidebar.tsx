import type { SVGProps } from "react"
import DailyUsageNotice from "@/app/components/ui/DailyUsageNotice"
import Rule from "@/app/components/ui/Rule"
import FieldSelector from "@/app/features/sidebar/FieldSelector"
import ModeSelector from "@/app/features/sidebar/ModeSelector"
import ScopeControl from "@/app/features/sidebar/ScopeControl"
import { cn } from "@/app/lib/cn"
import type { AnalysisMode, Field } from "@/app/lib/prompt-builder/type"

export type Layout = "columns" | "rows"

const MAX_CUSTOM = 300

// Hoisted: regex literals inside a function are recreated on every call.
// Safe to share: String.replace() does not mutate lastIndex.
const TAG_REGEX = /<[^>]*>/g
const sanitize = (s: string) => s.replace(TAG_REGEX, "")

const IconColumns = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 14 14" fill="currentColor" {...props}>
    <title>Side by side layout</title>
    <rect x="0" y="0" width="5.5" height="14" rx="1" />
    <rect x="8.5" y="0" width="5.5" height="14" rx="1" />
  </svg>
)

const IconRows = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 14 14" fill="currentColor" {...props}>
    <title>Stacked layout</title>
    <rect x="0" y="0" width="14" height="5.5" rx="1" />
    <rect x="0" y="8.5" width="14" height="5.5" rx="1" />
  </svg>
)

type SidebarProps = {
  selectedFields: Field[]
  modes: Set<AnalysisMode>
  maxKeywords: number
  lockedCount: number
  remainingSlots: number
  isLoading: boolean
  canAnalyse: boolean
  layout: Layout
  customInstructions: string
  dailyUsed: number | null
  dailyCap: number | null
  onToggleField: (id: Field) => void
  onToggleMode: (mode: AnalysisMode) => void
  onAdjustMax: (delta: number) => void
  onAnalyse: () => void
  onLayoutChange: (l: Layout) => void
  onCustomInstructionsChange: (v: string) => void
}

const Sidebar = ({
  selectedFields,
  modes,
  maxKeywords,
  lockedCount,
  remainingSlots,
  isLoading,
  canAnalyse,
  layout,
  customInstructions,
  dailyUsed,
  dailyCap,
  onToggleField,
  onToggleMode,
  onAdjustMax,
  onAnalyse,
  onLayoutChange,
  onCustomInstructionsChange,
}: SidebarProps) => {
  const remaining = MAX_CUSTOM - customInstructions.length
  const isOverLimit = remaining < 0

  return (
    <aside
      aria-label="Controls"
      className="w-full md:w-67 shrink-0 md:h-full border-b md:border-b-0 md:border-r border-edge bg-surface flex flex-col md:overflow-hidden"
    >
      <div className="flex-1  md:overflow-y-auto flex flex-col gap-5 md:gap-6 p-5 md:p-9 pb-5 md:pb-6">
        <div className="pb-1">
          <h1 className="font-display text-[2.4rem] md:text-[3rem] tracking-[0.18em] text-ink uppercase leading-[0.9]">
            Stylos
          </h1>
          <div className="font-body text-[0.65rem] tracking-[0.2em] uppercase text-ink/42 font-semibold mt-2">
            Aesthetic analysis
          </div>
        </div>

        <Rule />

        <FieldSelector selectedFields={selectedFields} onToggle={onToggleField} />

        <Rule />

        <ModeSelector modes={modes} onToggle={onToggleMode} />

        <Rule />

        <ScopeControl
          maxKeywords={maxKeywords}
          lockedCount={lockedCount}
          remainingSlots={remainingSlots}
          onAdjust={onAdjustMax}
        />

        <Rule />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="hint-textarea"
              className="font-body text-[0.68rem] tracking-[0.18em] uppercase text-ink/42 font-semibold"
            >
              Hint
            </label>
            <span
              aria-live="polite"
              aria-atomic="true"
              className={cn(
                "font-body text-[0.60rem] tabular-nums transition-colors",
                isOverLimit ? "text-danger" : "text-ink/25",
              )}
            >
              {remaining}
            </span>
          </div>
          <textarea
            id="hint-textarea"
            value={customInstructions}
            onChange={(e) => onCustomInstructionsChange(sanitize(e.target.value).slice(0, MAX_CUSTOM))}
            rows={3}
            placeholder="e.g. focus on color palette, avoid trend terms…"
            className={cn(
              "w-full bg-surface-2 border font-body text-[0.78rem] leading-relaxed p-[0.5rem_0.6rem] resize-none",
              "text-ink/70 placeholder:text-ink/18",
              "focus:outline-none transition-colors",
              isOverLimit ? "border-danger" : "border-edge focus:border-edge-mid",
            )}
          />
        </div>

        <Rule className="hidden md:block" />

        <div className="hidden md:flex flex-col gap-2">
          <span className="font-body text-[0.68rem] tracking-[0.18em] uppercase text-ink/42 font-semibold">Layout</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onLayoutChange("columns")}
              title="Side by side"
              className={cn(
                "flex-1 py-[0.45rem] flex items-center justify-center gap-1.5 border transition-colors cursor-pointer",
                layout === "columns"
                  ? "border-edge-mid text-ink/70 bg-surface-2"
                  : "border-edge text-ink/25 hover:text-ink/45 bg-transparent",
              )}
            >
              <IconColumns className="w-2.5 h-2.5" />
              <span className="font-body text-[0.65rem] tracking-widest uppercase">Side</span>
            </button>
            <button
              type="button"
              onClick={() => onLayoutChange("rows")}
              title="Stacked"
              className={cn(
                "flex-1 py-[0.45rem] flex items-center justify-center gap-1.5 border transition-colors cursor-pointer",
                layout === "rows"
                  ? "border-edge-mid text-ink/70 bg-surface-2"
                  : "border-edge text-ink/25 hover:text-ink/45 bg-transparent",
              )}
            >
              <IconRows className="w-2.5 h-2.5" />
              <span className="font-body text-[0.65rem] tracking-widest uppercase">Stack</span>
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:flex shrink-0 p-10 pt-4 pb-6 border-t border-edge flex-col gap-4">
        <DailyUsageNotice used={dailyUsed} cap={dailyCap} />
        <button
          type="button"
          onClick={onAnalyse}
          disabled={!canAnalyse}
          aria-busy={isLoading}
          className={cn(
            "w-full py-[0.95rem] font-body text-[0.78rem] tracking-[0.22em] uppercase font-bold transition-colors",
            canAnalyse
              ? "bg-accent text-canvas border border-accent hover:bg-[#BFED00] hover:border-[#BFED00] cursor-pointer"
              : "bg-surface-3 text-ink/18 border border-edge-mid cursor-not-allowed",
          )}
        >
          {isLoading
            ? "Analyzing…"
            : lockedCount > 0
              ? `Fill ${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""}`
              : "Extract Keywords"}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
