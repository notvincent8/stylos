import type { Field } from "@/app/lib/prompt-builder/type"

export type ParsedKeyword = {
  label: string
  field: Field
  confidence: number // 1–10
  description?: string
}

export const parseKeywordsResponse = (text: string): ParsedKeyword[] => {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line): ParsedKeyword | null => {
      const match = line.match(/^-\s+(.+?)\s+\(([^)]+)\)\s+\[(\d+)](?:\s+\|\s+(.+))?$/)
      if (!match) return null
      const kw: ParsedKeyword = {
        label: match[1].trim(),
        field: match[2] as Field,
        confidence: Math.min(10, Math.max(1, Number(match[3]))),
      }
      const description = match[4]?.trim()
      if (description) kw.description = description
      return kw
    })
    .filter((item): item is ParsedKeyword => item !== null)
}
