import { useCallback, useEffect, useRef, useState } from "react"
import { type ParsedKeyword, parseKeywordsResponse } from "@/app/lib/prompt-builder"
import type { AnalysisMode, Field } from "@/app/lib/prompt-builder/type"

type AnalyseOptions = {
  fields: Field[]
  maxKeywords?: number
  modes?: AnalysisMode[]
  lockedKeywords?: ParsedKeyword[]
  imageData: { data: string; mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" }
}

type UseMagicReturn = {
  data: ParsedKeyword[] | null
  isLoading: boolean
  error: string | null
  analyse: (options: AnalyseOptions) => Promise<void>
}

export const useMagic = (): UseMagicReturn => {
  const [data, setData] = useState<ParsedKeyword[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const analyse = useCallback(
    async ({ fields, maxKeywords, modes, lockedKeywords = [], imageData }: AnalyseOptions): Promise<void> => {
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
            imageData,
          }),
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        })

        if (!res.ok) {
          setError("Failed to call magic endpoint.")
          return
        }

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

  return { data, isLoading, error, analyse }
}
