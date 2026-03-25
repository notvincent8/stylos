"use client"

import { useCallback, useMemo, useState } from "react"
import KeywordResults from "@/app/features/analysis/KeywordResults"
import ImageZone from "@/app/features/image/ImageZone"
import Sidebar from "@/app/features/sidebar/Sidebar"
import { useMagic } from "@/app/hook/useMagic"
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

  const { analyse, error, isLoading, data } = useMagic()

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
      imageData: { data: image.data, mediaType: image.mediaType },
    }).catch(() => {})
  }, [analyse, selectedFields, maxKeywords, modes, lockedKeywords, image])

  return (
    <main className="h-screen overflow-hidden flex bg-canvas">
      <Sidebar
        selectedFields={selectedFields}
        modes={modes}
        maxKeywords={maxKeywords}
        lockedCount={lockedKeywords.length}
        remainingSlots={remainingSlots}
        isLoading={isLoading}
        canAnalyse={canAnalyse}
        onToggleField={toggleField}
        onToggleMode={toggleMode}
        onAdjustMax={adjustMax}
        onAnalyse={handleAnalyse}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="shrink-0 p-10 pb-0">
          <ImageZone
            image={image}
            processing={imageProcessing}
            error={imageError}
            onFile={handleImageFile}
            onClear={handleImageClear}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-10 pt-6 min-h-0">
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
    </main>
  )
}
