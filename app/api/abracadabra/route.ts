import { NextResponse } from "next/server"
import { z } from "zod"
import client from "@/app/lib/anthropic"
import { buildPrompt } from "@/app/lib/prompt-builder"
import { fieldIds } from "@/app/lib/prompt-builder/type"
import { checkRateLimit, getIp } from "@/app/lib/rateLimit"

// ~1.5 MB of base64 ≈ ~1.1 MB of actual image data — enough for a
// 1568-px JPEG after client-side processing, not enough for abuse.
const MAX_IMAGE_B64_LENGTH = 1_500_000

export const bodySchema = z.object({
  fields: z.array(z.enum(fieldIds)).min(1).max(20),
  maxKeywords: z.number().int().min(1).max(20).optional(),
  modes: z.array(z.enum(["trending", "creative"])).optional(),
  lockedKeywords: z.array(z.string().max(100)).max(20).optional(),
  customInstructions: z.string().max(300).optional(),
  imageData: z.object({
    data: z.string().min(1).max(MAX_IMAGE_B64_LENGTH),
    mediaType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
  }),
})

export const POST = async (req: Request) => {
  const ip = getIp(req)
  const limit = checkRateLimit(ip)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    )
  }

  const body = await req.json()
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { fields, maxKeywords, modes, lockedKeywords, customInstructions, imageData } = parseResult.data
  const { system, userContent, warnings } = buildPrompt({
    fields,
    imageData,
    maxKeywords,
    modes,
    lockedKeywords,
    customInstructions,
  })

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: userContent }],
    })
    return NextResponse.json({ content: message.content, warnings })
  } catch (err) {
    console.error("Something went wrong", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
