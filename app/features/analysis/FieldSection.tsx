import type { ParsedKeyword } from "@/app/lib/prompt-builder"
import { FIELDS } from "@/app/lib/prompt-builder/constants"
import type { Field } from "@/app/lib/prompt-builder/type"
import KeywordRow from "./KeywordRow"

type FieldSectionProps = {
  field: Field
  keywords: ParsedKeyword[]
  lockedLabels: Set<string>
  onToggleLock: (label: string) => void
}

const FieldSection = ({ field, keywords, lockedLabels, onToggleLock }: FieldSectionProps) => {
  const meta = FIELDS.find((f) => f.id === field)

  return (
    <div>
      <div className="flex items-center gap-3 pb-[0.6rem] border-b border-edge-mid mb-0.5">
        <span className="font-display text-[1.55rem] tracking-widest text-ink uppercase leading-none">
          {meta?.label ?? field}
        </span>
        <span className="font-body text-[0.6rem] tracking-[0.12em] uppercase text-ink/42 font-semibold">
          {meta?.icon} {keywords.length}
        </span>
      </div>

      <div>
        {keywords.map((kw) => (
          <KeywordRow key={kw.label} kw={kw} isLocked={lockedLabels.has(kw.label)} onToggleLock={onToggleLock} />
        ))}
      </div>
    </div>
  )
}

export default FieldSection
