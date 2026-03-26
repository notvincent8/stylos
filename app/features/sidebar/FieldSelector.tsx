import { cn } from "@/app/lib/cn"
import { FIELDS } from "@/app/lib/prompt-builder/constants"
import type { Field } from "@/app/lib/prompt-builder/type"

type FieldSelectorProps = {
  selectedFields: Field[]
  onToggle: (id: Field) => void
}

const FieldSelector = ({ selectedFields, onToggle }: FieldSelectorProps) => {
  return (
    <fieldset className="border-none p-0 m-0">
      <legend className="text-[0.68rem] tracking-[0.22em] uppercase text-ink/42 font-body font-semibold mb-[0.6rem]">
        Disciplines
      </legend>
      <div className="flex flex-col gap-[0.28rem]">
        {FIELDS.map((f) => {
          const isActive = selectedFields.includes(f.id)
          return (
            <button
              type="button"
              key={f.id}
              aria-pressed={isActive}
              onClick={() => onToggle(f.id)}
              className={cn(
                "flex items-center gap-2 w-full font-body text-[0.78rem] font-semibold tracking-[0.04em] uppercase",
                "border border-l-2 py-[0.48rem] px-3 transition-all duration-150",
                isActive
                  ? "border-edge-mid border-l-accent bg-accent-dim text-accent"
                  : "border-edge-mid border-l-transparent text-ink/42 hover:border-edge-strong hover:bg-surface-2 hover:text-ink",
              )}
            >
              <span className="text-[0.78rem] w-4 shrink-0">{f.icon}</span>
              <span className="flex-1 text-left">{f.label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export default FieldSelector
