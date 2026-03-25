import { NextResponse } from "next/server"
import { z } from "zod"
import client from "@/app/lib/anthropic"
import { buildPrompt } from "@/app/lib/prompt-builder"
import { fieldIds } from "@/app/lib/prompt-builder/type"

export const bodySchema = z.object({
  fields: z.array(z.enum(fieldIds)).min(1),
  maxKeywords: z.number().int().min(1).max(20).optional(),
  modes: z.array(z.enum(["trending", "creative"])).optional(),
  lockedKeywords: z.array(z.string()).optional(),
  imageData: z.object({
    data: z.string().min(1),
    mediaType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
  }),
})

export const POST = async (req: Request) => {
  const body = await req.json()
  const parseResult = bodySchema.safeParse(body)

  if (!parseResult.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { fields, maxKeywords, modes, lockedKeywords, imageData } = parseResult.data
  const { system, userContent, warnings } = buildPrompt({
    fields,
    imageData,
    maxKeywords,
    modes,
    lockedKeywords,
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
