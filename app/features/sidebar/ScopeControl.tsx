import Label from "@/app/components/ui/Label"
import { cn } from "@/app/lib/cn"

type ScopeControlProps = {
  maxKeywords: number
  lockedCount: number
  remainingSlots: number
  onAdjust: (delta: number) => void
}

const ScopeControl = ({ maxKeywords, lockedCount, remainingSlots, onAdjust }: ScopeControlProps) => {
  return (
    <div>
      <Label>Scope</Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAdjust(-1)}
          disabled={maxKeywords <= 1}
          aria-label="Decrease keyword count"
          className={cn(
            "w-8 h-8 flex items-center justify-center font-body font-semibold text-base",
            "border border-edge-mid transition-colors",
            maxKeywords <= 1
              ? "text-ink/18 cursor-not-allowed"
              : "text-ink/42 hover:text-ink hover:border-edge-strong cursor-pointer",
          )}
        >
          −
        </button>

        <span className="flex-1 text-center font-display text-[1.6rem] tracking-widest text-accent leading-none">
          {maxKeywords}
        </span>

        <button
          type="button"
          onClick={() => onAdjust(1)}
          disabled={maxKeywords >= 20}
          aria-label="Increase keyword count"
          className={cn(
            "w-8 h-8 flex items-center justify-center font-body font-semibold text-base",
            "border border-edge-mid transition-colors",
            maxKeywords >= 20
              ? "text-ink/18 cursor-not-allowed"
              : "text-ink/42 hover:text-ink hover:border-edge-strong cursor-pointer",
          )}
        >
          +
        </button>
      </div>

      {lockedCount > 0 && (
        <div className="font-body text-[0.65rem] tracking-widest uppercase font-semibold text-accent mt-[0.55rem]">
          {lockedCount} locked · {remainingSlots} open
        </div>
      )}
    </div>
  )
}

export default ScopeControl
