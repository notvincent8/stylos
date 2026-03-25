import type { Field } from "@/app/lib/prompt-builder/type"

export const formatFields = (fields: Field[]): string => {
  return fields.map((f) => f.replace(/_/g, " ")).join(", ")
}

export const formatFieldInstruction = (fields: Field[]): string => {
  return `
Focus strictly on the following fields:
${formatFields(fields)}

For each selected field, extract keywords that reflect recognized styles, movements, aesthetics, or design categories relevant to that domain.
`
}

export const formatOutput = (outputMode: "flat" | "grouped" = "flat"): string => {
  const confidenceNote = `
confidence is an integer from 1 to 10:
- 8–10: unmistakably present in the image
- 5–7: plausible, defensible reading
- 1–4: tangential, creative stretch, or low visual evidence — still worth noting but honestly scored`

  if (outputMode === "grouped") {
    return `
Output format:
Keywords by field:
<Field name>:
- keyword [confidence]
${confidenceNote}
`
  }

  return `
Output format:
- keyword (field) [confidence] | description

Where:
- "confidence" is an integer from 1 to 10${confidenceNote}
- "description" is a single concise sentence (max ~15 words) explaining what this aesthetic term means and, for confidence below 8, briefly why it applies to the image
`
}

export const injectKeywordRange = (template: string, min: number, max: number) => {
  return template.replace("{MIN}", String(min)).replace("{MAX}", String(max))
}
