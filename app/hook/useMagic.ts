import { useCallback, useEffect, useRef, useState } from "react"
import { type ParsedKeyword, parseKeywordsResponse } from "@/app/lib/prompt-builder"
import type { AnalysisMode, Field } from "@/app/lib/prompt-builder/type"

type AnalyseOptions = {
  fields: Field[]
  maxKeywords?: number
  modes?: AnalysisMode[]
  lockedKeywords?: ParsedKeyword[]
  customInstructions?: string
  imageData: { data: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" }
}

type UseMagicReturn = {
  data: ParsedKeyword[] | null
  isLoading: boolean
  error: string | null
  dailyUsed: number | null
  dailyCap: number | null
  analyse: (options: AnalyseOptions) => Promise<void>
}

const readUsageHeaders = (headers: Headers): { used: number | null; cap: number | null } => {
  const usedRaw = headers.get("X-User-Used")
  const capRaw = headers.get("X-User-Limit")
  return {
    used: usedRaw !== null ? Number(usedRaw) : null,
    cap: capRaw !== null ? Number(capRaw) : null,
  }
}

export const useMagic = (): UseMagicReturn => {
  const [data, setData] = useState<ParsedKeyword[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dailyUsed, setDailyUsed] = useState<number | null>(null)
  const [dailyCap, setDailyCap] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const analyse = useCallback(
    async ({
      fields,
      maxKeywords,
      modes,
      lockedKeywords = [],
      customInstructions,
      imageData,
    }: AnalyseOptions): Promise<void> => {
      if (fields.length === 0) return

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch("api/abracadabra", {
          method: "POST",
          body: JSON.stringify({
            fields,
            maxKeywords,
            modes,
            lockedKeywords: lockedKeywords.map((k) => k.label),
            customInstructions: customInstructions?.trim() || undefined,
            imageData,
          }),
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        })

        if (!res.ok) {
          const { used, cap } = readUsageHeaders(res.headers)
          if (used !== null) setDailyUsed(used)
          if (cap !== null) setDailyCap(cap)

          try {
            const body = (await res.json()) as { error?: string }
            setError(body.error ?? "Failed to analyse the image.")
          } catch {
            setError("Failed to analyse the image.")
          }
          return
        }

        const { used, cap } = readUsageHeaders(res.headers)
        if (used !== null) setDailyUsed(used)
        if (cap !== null) setDailyCap(cap)

        const { content } = (await res.json()) as { content: Array<{ type: string; text?: string }> }
        const textBlock = content.find((block) => block.type === "text")
        if (!textBlock?.text) {
          setError("Unexpected response format.")
          return
        }
        const newKeywords = parseKeywordsResponse(textBlock.text)
        setData([...lockedKeywords, ...newKeywords])
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return
        setError("An error occurred while calling the magic endpoint.")
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  return { data, isLoading, error, dailyUsed, dailyCap, analyse }
}
