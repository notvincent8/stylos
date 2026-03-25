import Rule from "@/app/components/ui/Rule"
import FieldSelector from "@/app/features/sidebar/FieldSelector"
import ModeSelector from "@/app/features/sidebar/ModeSelector"
import ScopeControl from "@/app/features/sidebar/ScopeControl"
import { cn } from "@/app/lib/cn"
import type { AnalysisMode, Field } from "@/app/lib/prompt-builder/type"

type SidebarProps = {
  selectedFields: Field[]
  modes: Set<AnalysisMode>
  maxKeywords: number
  lockedCount: number
  remainingSlots: number
  isLoading: boolean
  canAnalyse: boolean
  onToggleField: (id: Field) => void
  onToggleMode: (mode: AnalysisMode) => void
  onAdjustMax: (delta: number) => void
  onAnalyse: () => void
}

const Sidebar = ({
  selectedFields,
  modes,
  maxKeywords,
  lockedCount,
  remainingSlots,
  isLoading,
  canAnalyse,
  onToggleField,
  onToggleMode,
  onAdjustMax,
  onAnalyse,
}: SidebarProps) => {
  return (
    <aside className="w-67 shrink-0 h-full border-r border-edge bg-surface flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col gap-6 p-10 pb-6">
        <div className="pb-1">
          <div className="font-display text-[3rem] tracking-[0.18em] text-ink uppercase leading-[0.9]">Stylos</div>
          <div className="font-body text-[0.58rem] tracking-[0.2em] uppercase text-ink/42 font-semibold mt-2">
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
      </div>

      <div className="shrink-0 p-10 pt-4 pb-10 border-t border-edge">
        <button
          type="button"
          onClick={onAnalyse}
          disabled={!canAnalyse}
          className={cn(
            "w-full py-[0.95rem] font-body text-[0.72rem] tracking-[0.22em] uppercase font-bold transition-colors",
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
