import { useMemo } from "react"
import FieldSection from "@/app/features/analysis/FieldSection"
import LoadingAnimation from "@/app/features/analysis/LoadingAnimation"
import type { ParsedKeyword } from "@/app/lib/prompt-builder"
import type { Field } from "@/app/lib/prompt-builder/type"

type KeywordResultsProps = {
  data: ParsedKeyword[] | null | undefined
  isLoading: boolean
  error: string | null
  lockedLabels: Set<string>
  hasImage: boolean
  onToggleLock: (label: string) => void
}

const KeywordResults = ({ data, isLoading, error, lockedLabels, hasImage, onToggleLock }: KeywordResultsProps) => {
  const grouped = useMemo(
    () =>
      data?.reduce(
        (acc, kw) => {
          acc[kw.field] = [...(acc[kw.field] ?? []), kw]
          return acc
        },
        {} as Record<Field, ParsedKeyword[]>,
      ),
    [data],
  )

  if (isLoading) return <LoadingAnimation />

  if (error) {
    return (
      <div className="border border-danger-dim bg-danger-dim p-[0.8rem_1rem] text-[0.7rem] text-danger font-body">
        {error}
      </div>
    )
  }

  if (!grouped) {
    return hasImage ? (
      <div className="font-body text-[0.62rem] tracking-[0.18em] uppercase text-ink/18 font-semibold">
        Select disciplines → extract
      </div>
    ) : null
  }

  return (
    <div className="flex flex-col gap-8">
      {(Object.entries(grouped) as [Field, ParsedKeyword[]][]).map(([field, keywords]) => (
        <FieldSection
          key={field}
          field={field}
          keywords={keywords}
          lockedLabels={lockedLabels}
          onToggleLock={onToggleLock}
        />
      ))}
      <div className="font-body text-[0.55rem] tracking-[0.12em] uppercase text-ink/18 font-semibold -mt-2">
        Click to lock · confidence 1–10
      </div>
    </div>
  )
}

export default KeywordResults
