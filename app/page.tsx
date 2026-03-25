"use client"

import Image from "next/image"
import type { DragEvent } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useMagic } from "@/app/hook/useMagic"
import { formatBytes, isAcceptedType, type ProcessedImage, processImage } from "@/app/lib/imageProcessor"
import type { ParsedKeyword } from "@/app/lib/prompt-builder"
import { FIELDS } from "@/app/lib/prompt-builder/constants"
import type { AnalysisMode, Field } from "@/app/lib/prompt-builder/type"

const MODES: { id: AnalysisMode; icon: string; label: string; desc: string }[] = [
  { id: "trending", icon: "◉", label: "Pulse", desc: "trending now" },
  { id: "creative", icon: "◌", label: "Unbox", desc: "unexpected" },
]

const confidenceColor = (c: number) =>
  c >= 8 ? "rgba(200,255,0,0.75)" : c >= 5 ? "rgba(255,255,255,0.35)" : "rgba(255,110,110,0.6)"

type ImageZoneProps = {
  image: ProcessedImage | null
  processing: boolean
  error: string | null
  onFile: (file: File) => void
  onClear: () => void
}

function ImageZone({ image, processing, error, onFile, onClear }: ImageZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return
      if (!isAcceptedType(file.type)) return
      onFile(file)
    },
    [onFile],
  )

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleFile(e.dataTransfer.files[0])
    },
    [handleFile],
  )

  // Global paste listener
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.kind === "file")
      handleFile(item?.getAsFile() ?? undefined)
    }
    document.addEventListener("paste", onPaste)
    return () => document.removeEventListener("paste", onPaste)
  }, [handleFile])

  const borderColor = dragOver
    ? "rgba(200,255,0,0.4)"
    : image
      ? "rgba(200,255,0,0.25)"
      : error
        ? "rgba(255,80,80,0.3)"
        : "rgba(255,255,255,0.08)"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div
        style={{
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        Image
      </div>

      <button
        type="button"
        tabIndex={0}
        onClick={() => !image && !processing && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !image && !processing && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `1px dashed ${borderColor}`,
          borderRadius: "2px",
          minHeight: "100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: image || processing ? "default" : "pointer",
          transition: "border-color 0.2s",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {!image && !processing && !error && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1.5rem",
            }}
          >
            <span style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.15)" }}>◫</span>
            <span
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.15em",
                color: dragOver ? "rgba(200,255,0,0.5)" : "rgba(255,255,255,0.15)",
                textTransform: "uppercase",
                transition: "color 0.15s",
              }}
            >
              {dragOver ? "Release to load" : "Drop · Click · Paste"}
            </span>
          </div>
        )}
        {error && !processing && (
          <div
            style={{
              padding: "1rem",
              fontSize: "0.65rem",
              color: "rgba(255,100,100,0.7)",
              letterSpacing: "0.05em",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {processing && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
              padding: "1.5rem",
            }}
          >
            <span style={{ fontSize: "1.1rem", color: "rgba(200,255,0,0.5)" }}>◈</span>
            <span
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.15em",
                color: "rgba(255,255,255,0.2)",
                textTransform: "uppercase",
              }}
            >
              Optimizing...
            </span>
          </div>
        )}

        {image && !processing && (
          <div style={{ width: "100%", display: "flex", gap: "0.75rem", padding: "0.65rem", alignItems: "center" }}>
            <Image
              src={image.previewUrl}
              alt="preview"
              style={{
                width: "52px",
                height: "52px",
                objectFit: "cover",
                borderRadius: "1px",
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.03em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {image.name}
              </div>
              <div
                style={{
                  fontSize: "0.58rem",
                  color: "rgba(255,255,255,0.25)",
                  letterSpacing: "0.06em",
                }}
              >
                {image.width}×{image.height}
              </div>
              <div
                style={{
                  fontSize: "0.58rem",
                  color: "rgba(200,255,0,0.5)",
                  letterSpacing: "0.06em",
                }}
              >
                {formatBytes(image.originalSize)} → {formatBytes(image.processedSize)}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.2)",
                cursor: "pointer",
                fontSize: "0.75rem",
                padding: "0.25rem",
                flexShrink: 0,
                fontFamily: "'DM Mono', monospace",
                lineHeight: 1,
              }}
              title="Remove image"
            >
              ×
            </button>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files?.[0])}
        onClick={(e) => {
          // Reset so same file can be re-selected
          ;(e.target as HTMLInputElement).value = ""
        }}
      />
    </div>
  )
}

export default function Home() {
  const [selectedFields, setSelectedFields] = useState<Field[]>([])
  const [maxKeywords, setMaxKeywords] = useState(10)
  const [modes, setModes] = useState<Set<AnalysisMode>>(new Set())
  const [lockedLabels, setLockedLabels] = useState<Set<string>>(new Set())
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null)

  const [image, setImage] = useState<ProcessedImage | null>(null)
  const [imageProcessing, setImageProcessing] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  const { analyse, error, isLoading, data } = useMagic()

  // Revoke preview URL on unmount or image change
  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.previewUrl)
    }
  }, [image])

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
      if (next.has(mode)) next.delete(mode)
      else next.add(mode)
      return next
    })
  }, [])

  const adjustMax = useCallback((delta: number) => {
    setMaxKeywords((prev) => Math.min(20, Math.max(1, prev + delta)))
  }, [])

  const toggleLock = useCallback((label: string) => {
    setLockedLabels((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
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

  const grouped = useMemo(
    () =>
      data?.reduce(
        (acc, kw) => {
          acc[kw.field] = [...(acc[kw.field] ?? []), kw]
          return acc
        },
        {} as Record<Field, ParsedKeyword[]>,
      ),
    [data],
  )

  return (
    <main
      style={{
        display: "flex",
        gap: "4rem",
        flex: 1,
        width: "100%",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "8rem 4rem",
        background: "#000",
        minHeight: "100vh",
        boxSizing: "border-box",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem", minWidth: "260px" }}>
        <ImageZone
          image={image}
          processing={imageProcessing}
          error={imageError}
          onFile={handleImageFile}
          onClear={handleImageClear}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Select fields
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {FIELDS.map((f) => {
              const isActive = selectedFields.includes(f.id)
              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => toggleField(f.id)}
                  className="field-btn"
                  data-active={isActive}
                  style={{
                    borderRadius: "2px",
                    padding: "0.55rem 0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  <span style={{ fontSize: "0.75rem", width: "1rem" }}>{f.icon}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.05em", flex: 1 }}>
                    {f.label}
                  </span>
                  <span style={{ fontSize: "0.6rem", opacity: 0.5 }}>{f.desc}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Mode
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {MODES.map((m) => {
              const isActive = modes.has(m.id)
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => toggleMode(m.id)}
                  className="field-btn"
                  data-active={isActive}
                  style={{
                    flex: 1,
                    borderRadius: "2px",
                    padding: "0.6rem 0.65rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "0.2rem",
                    cursor: "pointer",
                    fontFamily: "'DM Mono', monospace",
                  }}
                >
                  <span style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                    {m.icon} {m.label}
                  </span>
                  <span style={{ fontSize: "0.55rem", opacity: 0.5, letterSpacing: "0.04em" }}>{m.desc}</span>
                </button>
              )
            })}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Max keywords
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => adjustMax(-1)}
              disabled={maxKeywords <= 1}
              style={{
                width: "2rem",
                height: "2rem",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "2px",
                color: maxKeywords <= 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)",
                cursor: maxKeywords <= 1 ? "not-allowed" : "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              −
            </button>
            <span
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: "0.9rem",
                color: "#C8FF00",
                letterSpacing: "0.1em",
                fontWeight: 500,
              }}
            >
              {maxKeywords}
            </span>
            <button
              type="button"
              onClick={() => adjustMax(1)}
              disabled={maxKeywords >= 20}
              style={{
                width: "2rem",
                height: "2rem",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "2px",
                color: maxKeywords >= 20 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.5)",
                cursor: maxKeywords >= 20 ? "not-allowed" : "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
            >
              +
            </button>
          </div>
          {lockedKeywords.length > 0 && (
            <div
              style={{
                fontSize: "0.55rem",
                color: "rgba(200,255,0,0.45)",
                letterSpacing: "0.08em",
              }}
            >
              ⊙ {lockedKeywords.length} locked · {remainingSlots} slot{remainingSlots !== 1 ? "s" : ""} open
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleAnalyse}
          disabled={!canAnalyse}
          className="analyze-btn"
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: "2px",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontFamily: "'DM Mono', monospace",
            fontWeight: 500,
          }}
        >
          {isLoading
            ? "Analyzing..."
            : lockedKeywords.length > 0
              ? `Fill ${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""} →`
              : "Extract Keywords →"}
        </button>
      </div>
      <div style={{ flex: 1, minHeight: "400px" }}>
        {!isLoading && !data && !error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "400px",
              color: "rgba(255,255,255,0.1)",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {image ? "Select fields and extract" : "Drop an image to begin"}
          </div>
        )}

        {isLoading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "400px",
              gap: "1rem",
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>◈</div>
            <div
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Reading aesthetics...
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              border: "1px solid rgba(255,60,60,0.3)",
              borderRadius: "3px",
              padding: "1rem",
              color: "rgba(255,100,100,0.8)",
              fontSize: "0.75rem",
            }}
          >
            {error}
          </div>
        )}
        {grouped && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {(Object.entries(grouped) as [Field, ParsedKeyword[]][]).map(([field, keywords]) => {
              const fieldMeta = FIELDS.find((f) => f.id === field)
              return (
                <div key={field}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.75rem",
                      paddingBottom: "0.5rem",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem" }}>{fieldMeta?.icon}</span>
                    <span
                      style={{
                        fontSize: "0.6rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {fieldMeta?.label ?? field}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "0.6rem",
                        color: "rgba(200,255,0,0.4)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {keywords.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {keywords.map((kw) => {
                      const isLocked = lockedLabels.has(kw.label)
                      const isHovered = hoveredKeyword === kw.label
                      return (
                        <div key={kw.label} style={{ position: "relative" }}>
                          <button
                            type="button"
                            onClick={() => toggleLock(kw.label)}
                            onMouseEnter={() => kw.description && setHoveredKeyword(kw.label)}
                            onMouseLeave={() => setHoveredKeyword(null)}
                            style={{
                              fontSize: "0.72rem",
                              padding: "0.3rem 0.6rem",
                              border: `1px solid ${isLocked ? "#C8FF00" : "rgba(255,255,255,0.1)"}`,
                              borderRadius: "2px",
                              color: isLocked ? "#C8FF00" : "rgba(255,255,255,0.7)",
                              letterSpacing: "0.04em",
                              background: isLocked ? "rgba(200,255,0,0.06)" : "rgba(255,255,255,0.02)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              fontFamily: "'DM Mono', monospace",
                              transition: "all 0.15s",
                            }}
                          >
                            {isLocked && <span style={{ fontSize: "0.6rem", opacity: 0.9 }}>⊙</span>}
                            {kw.label}
                            <span
                              style={{
                                fontSize: "0.55rem",
                                color: confidenceColor(kw.confidence),
                                marginLeft: "0.1rem",
                              }}
                            >
                              {kw.confidence}
                            </span>
                          </button>

                          {/* Tooltip */}
                          {isHovered && kw.description && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: "calc(100% + 7px)",
                                left: "50%",
                                transform: "translateX(-50%)",
                                background: "rgba(12,12,12,0.97)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "2px",
                                padding: "0.45rem 0.65rem",
                                fontSize: "0.6rem",
                                color: "rgba(255,255,255,0.55)",
                                letterSpacing: "0.03em",
                                lineHeight: 1.55,
                                maxWidth: "200px",
                                whiteSpace: "normal",
                                zIndex: 100,
                                pointerEvents: "none",
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {kw.description}
                              <span
                                style={{
                                  position: "absolute",
                                  bottom: "-4px",
                                  left: "50%",
                                  transform: "translateX(-50%) rotate(45deg)",
                                  width: "6px",
                                  height: "6px",
                                  background: "rgba(12,12,12,0.97)",
                                  borderRight: "1px solid rgba(255,255,255,0.1)",
                                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div
              style={{
                fontSize: "0.55rem",
                color: "rgba(255,255,255,0.12)",
                letterSpacing: "0.1em",
                marginTop: "-0.5rem",
              }}
            >
              click to lock · score 1–10 reflects visual confidence
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
