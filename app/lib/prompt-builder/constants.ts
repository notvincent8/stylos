export const FIELDS = [
  { id: "fashion", label: "Fashion", icon: "✦", desc: "clothing, style, silhouette" },
  { id: "design", label: "Design", icon: "◈", desc: "product, industrial, UX" },
  { id: "graphic", label: "Graphic", icon: "▣", desc: "typography, layout, branding" },
  { id: "architecture", label: "Architecture", icon: "⬡", desc: "buildings, space, structure" },
  { id: "interior", label: "Interior", icon: "◻", desc: "rooms, furniture, atmosphere" },
  { id: "art", label: "Art", icon: "◎", desc: "painting, illustration, medium" },
  { id: "photography", label: "Photography", icon: "⊕", desc: "composition, light, technique" },
] as const

export const BASE_ROLE = `
You are an expert in visual style analysis. Your task is to extract design and aesthetic keywords from an image.
`

export const CORE_RULES = `
Rules:
- Do NOT describe objects literally
- Focus only on style, aesthetic, era, or design language
- Use recognized or plausible style terms
- Avoid generic or vague keywords
`

export const QUALITY_RULES = `
Keyword constraints:
- Provide between {MIN} and {MAX} keywords in total, distributed across all requested fields.
- No duplicates
- Avoid near-duplicates unless clearly distinct
- Favor variety within the selected fields
- Do not attempt to cover unrelated domains
`

export const MULTI_FIELD_RULE = `
If multiple fields are selected, balance them but prioritize the most visually dominant styles. Too many fields may reduce specificity.
`

export const TRENDING_RULE = `
Trending bias:
- Prioritize keywords that are actively trending right now (last 1–3 months).
- Draw from recent runway reviews, design press (Dezeen, Wallpaper*, Hypebeast, Vogue Runway), and social discovery platforms (Pinterest, Are.na).
- Prefer terms that feel current over terms that feel timeless when both are valid.
`

export const CREATIVE_RULE = `
Creative mode:
- You may make unexpected, cross-disciplinary, or unconventional associations.
- Niche subcultures, emerging micro-aesthetics, and surprising cross-domain terms are encouraged.
- Prioritize originality and specificity. A term that raises an eyebrow is better than one that does not.
- Do not default to safe or expected descriptors.
`

export const LOCKED_KEYWORDS_RULE = `
Already-selected keywords (do not repeat):
{LOCKED}

These have already been confirmed by the user. Fill only the remaining {REMAINING} keyword slot(s) with new, non-overlapping keywords.
`
