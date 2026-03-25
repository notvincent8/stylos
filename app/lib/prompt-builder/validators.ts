import type { PromptBuilderOptions } from "@/app/lib/prompt-builder/type"

export const validateOptions = (options: PromptBuilderOptions): string[] => {
  const warnings: string[] = []

  if (options.fields.length === 0) {
    warnings.push("At least one field should be selected.")
  }

  if (options.fields.length > 3) {
    warnings.push("Using too many fields may reduce keyword specificity.")
  }

  if (options.minKeywords && options.maxKeywords && options.minKeywords > options.maxKeywords) {
    warnings.push("minKeywords should not exceed maxKeywords.")
  }

  return warnings
}
