"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import DailyUsageNotice from "@/app/components/ui/DailyUsageNotice"
import KeywordResults from "@/app/features/analysis/KeywordResults"
import ImageZone from "@/app/features/image/ImageZone"
import type { Layout } from "@/app/features/sidebar/Sidebar"
import Sidebar from "@/app/features/sidebar/Sidebar"
import { useMagic } from "@/app/hook/useMagic"
import { cn } from "@/app/lib/cn"
import { type ProcessedImage, processImage } from "@/app/lib/imageProcessor"
import type { AnalysisMode, Field } from "@/app/lib/prompt-builder/type"

export default function Home() {
  const [selectedFields, setSelectedFields] = useState<Field[]>([])
  const [maxKeywords, setMaxKeywords] = useState(10)
  const [modes, setModes] = useState<Set<AnalysisMode>>(new Set())
  const [lockedLabels, setLockedLabels] = useState<Set<string>>(new Set())
  const [image, setImage] = useState<ProcessedImage | null>(null)
  const [imageProcessing, setImageProcessing] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [layout, setLayout] = useState<Layout>("columns")
  const [customInstructions, setCustomInstructions] = useState("")

  const { analyse, error, isLoading, data, dailyUsed, dailyCap } = useMagic()

  // Warn before reload/close while analysis is in progress
  useEffect(() => {
    if (!isLoading) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isLoading])

  const handleImageFile = useCallback(async (file: File) => {
    setImageError(null)
    setImageProcessing(true)
    try {
      const processed = await processImage(file)
      setImage((prev) => {
        if (prev) URL.revokeObjectURL(prev.previewUrl)
        return processed
      })
    } catch {
      setImageError("Could not process image. Try a different file.")
    } finally {
      setImageProcessing(false)
    }
  }, [])

  const handleImageClear = useCallback(() => {
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl)
      return null
    })
    setImageError(null)
    setLockedLabels(new Set())
  }, [])

  const toggleField = useCallback((id: Field) => {
    setSelectedFields((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }, [])

  const toggleMode = useCallback((mode: AnalysisMode) => {
    setModes((prev) => {
      const next = new Set(prev)
      next.has(mode) ? next.delete(mode) : next.add(mode)
      return next
    })
  }, [])

  const adjustMax = useCallback((delta: number) => {
    setMaxKeywords((prev) => Math.min(20, Math.max(1, prev + delta)))
  }, [])

  const toggleLock = useCallback((label: string) => {
    setLockedLabels((prev) => {
      const next = new Set(prev)
      next.has(label) ? next.delete(label) : next.add(label)
      return next
    })
  }, [])

  const lockedKeywords = useMemo(() => data?.filter((kw) => lockedLabels.has(kw.label)) ?? [], [data, lockedLabels])
  const remainingSlots = Math.max(0, maxKeywords - lockedKeywords.length)
  const canAnalyse = selectedFields.length > 0 && !isLoading && !imageProcessing && image !== null && remainingSlots > 0

  const handleAnalyse = useCallback(() => {
    if (!image) return
    analyse({
      fields: selectedFields,
      maxKeywords,
      modes: Array.from(modes),
      lockedKeywords,
      customInstructions: customInstructions.trim() || undefined,
      imageData: { data: image.data, mediaType: image.mediaType },
    }).catch(() => {})
  }, [analyse, selectedFields, maxKeywords, modes, lockedKeywords, customInstructions, image])

  const extractButtonLabel = isLoading
    ? "Analyzing…"
    : lockedKeywords.length > 0
      ? `Fill ${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""}`
      : "Extract Keywords"

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-canvas focus:text-ink focus:border focus:border-edge-strong focus:px-3 focus:py-2 focus:text-[0.72rem] focus:tracking-widest focus:uppercase focus:font-body focus:font-semibold"
      >
        Skip to main content
      </a>

      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-canvas"
      >
        <Sidebar
          selectedFields={selectedFields}
          modes={modes}
          maxKeywords={maxKeywords}
          lockedCount={lockedKeywords.length}
          remainingSlots={remainingSlots}
          isLoading={isLoading}
          canAnalyse={canAnalyse}
          layout={layout}
          customInstructions={customInstructions}
          onToggleField={toggleField}
          onToggleMode={toggleMode}
          onAdjustMax={adjustMax}
          onAnalyse={handleAnalyse}
          onLayoutChange={setLayout}
          onCustomInstructionsChange={setCustomInstructions}
          dailyUsed={dailyUsed}
          dailyCap={dailyCap}
        />

        <div className="flex-1 min-w-0 flex flex-col md:overflow-hidden pb-24 md:pb-0">
          <div
            className={cn(
              "flex flex-col md:flex-1 md:min-h-0 md:overflow-hidden",
              layout === "columns" ? "md:flex-row" : "md:flex-col",
            )}
          >
            <div
              className={cn(
                "shrink-0 border-edge flex flex-col overflow-hidden",
                "p-4 md:p-8",
                "border-b",
                layout === "columns" ? "md:w-110 md:border-r md:border-b-0" : "md:h-[38vh]",
              )}
            >
              <ImageZone
                image={image}
                processing={imageProcessing}
                error={imageError}
                onFile={handleImageFile}
                onClear={handleImageClear}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-5 md:p-10 min-w-0 min-h-0">
              <KeywordResults
                data={data}
                isLoading={isLoading}
                error={error}
                lockedLabels={lockedLabels}
                hasImage={image !== null}
                onToggleLock={toggleLock}
              />
            </div>
          </div>
          <div className="shrink-0 border-t border-edge px-5 md:px-10 py-[0.6rem] flex items-center gap-3 md:gap-6">
            <span className="font-body text-[0.6rem] tracking-[0.15em] uppercase text-ink/35 font-semibold shrink-0">
              AI Notice
            </span>
            <div className="h-3 w-px bg-edge-mid shrink-0" />
            <p className="font-body text-[0.6rem] leading-normal text-ink/42 select-none min-w-0">
              Images are processed by <span className="text-ink/55">Anthropic&apos;s Claude API</span> and not stored by
              this app. Results are AI-generated and may be inaccurate.{" "}
              <span className="text-ink/42 hidden sm:inline">EU AI Act · GDPR Art. 13</span>
            </p>
            <a
              href="https://github.com/notvincent8"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 font-body text-[0.6rem] tracking-[0.15em] uppercase text-ink/25 hover:text-ink/55 transition-colors"
            >
              ↗ gh
            </a>
          </div>
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div
          className="bg-canvas/95 backdrop-blur-sm border-t border-edge px-4 pt-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mb-3">
            <DailyUsageNotice used={dailyUsed} cap={dailyCap} compact />
          </div>
          <button
            type="button"
            onClick={handleAnalyse}
            disabled={!canAnalyse}
            aria-busy={isLoading}
            className={cn(
              "w-full py-4 font-body text-[0.78rem] tracking-[0.22em] uppercase font-bold transition-colors",
              canAnalyse
                ? "bg-accent text-canvas border border-accent cursor-pointer active:bg-[#BFED00]"
                : "bg-surface-3 text-ink/18 border border-edge-mid cursor-not-allowed",
            )}
          >
            {extractButtonLabel}
          </button>
        </div>
      </div>
    </>
  )
}
