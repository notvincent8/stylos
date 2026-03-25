import type { ImageBlockParam, TextBlockParam } from "@anthropic-ai/sdk/resources"
import { FIELDS } from "@/app/lib/prompt-builder/constants"

export type Field = (typeof FIELDS)[number]["id"]
export const fieldIds = FIELDS.map((f) => f.id) as [Field, ...Field[]]

export type AnalysisMode = "trending" | "creative"

export type PromptBuildResult = {
  system: string
  userContent: Array<ImageBlockParam | TextBlockParam>
  warnings: string[]
}

export type PromptBuilderOptions = {
  fields: Field[]
  imageData?: { data: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" }
  customInstructions?: string
  minKeywords?: number
  maxKeywords?: number
  outputMode?: "flat" | "grouped"
  modes?: AnalysisMode[]
  lockedKeywords?: string[]
}
