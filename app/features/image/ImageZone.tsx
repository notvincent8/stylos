import Image from "next/image"
import type { DragEvent } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/app/lib/cn"
import { formatBytes, isAcceptedType, type ProcessedImage } from "@/app/lib/imageProcessor"

type ImageZoneProps = {
  image: ProcessedImage | null
  processing: boolean
  error: string | null
  onFile: (file: File) => void
  onClear: () => void
}

const ImageZone = ({ image, processing, error, onFile, onClear }: ImageZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file || !isAcceptedType(file.type)) return
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

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.kind === "file")
      handleFile(item?.getAsFile() ?? undefined)
    }
    document.addEventListener("paste", onPaste)
    return () => document.removeEventListener("paste", onPaste)
  }, [handleFile])

  if (image && !processing) {
    return (
      <div>
        <div className="border border-edge-mid bg-surface flex items-center justify-center overflow-hidden">
          <Image
            src={image.previewUrl}
            alt="preview"
            width={image.width}
            height={image.height}
            unoptimized
            className="max-w-full max-h-[60vh] w-auto h-auto block"
          />
        </div>

        <div className="flex items-center gap-6 py-[0.55rem] border-b border-edge">
          <span className="font-body text-[0.68rem] text-ink flex-1 overflow-hidden text-ellipsis whitespace-nowrap max-w-45">
            {image.name}
          </span>
          <span className="font-body text-[0.62rem] text-ink/42 shrink-0">
            {image.width}×{image.height}
          </span>
          <span className="font-body text-[0.62rem] text-accent shrink-0">
            {formatBytes(image.originalSize)} → {formatBytes(image.processedSize)}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="font-body text-[0.6rem] tracking-[0.12em] uppercase font-semibold text-ink/42 hover:text-ink transition-colors shrink-0 bg-transparent border-none cursor-pointer p-0"
          >
            Remove
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        tabIndex={0}
        onClick={() => !processing && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !processing && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "w-full min-h-90 flex flex-col items-center justify-center gap-[0.6rem] p-8",
          "border transition-colors duration-150",
          dragOver
            ? "border-accent bg-accent-dim cursor-copy"
            : processing
              ? "border-edge-mid cursor-default"
              : "border-edge-strong hover:border-accent cursor-pointer",
        )}
      >
        {processing ? (
          <span className="font-display text-[1.1rem] tracking-[0.25em] text-accent uppercase">Processing…</span>
        ) : error ? (
          <span className="font-body text-[0.7rem] text-danger text-center">{error}</span>
        ) : (
          <>
            <div
              className={cn(
                "font-display tracking-[0.12em] uppercase transition-all duration-150 leading-none",
                dragOver ? "text-[2.6rem] text-accent" : "text-[2.2rem] text-edge-strong",
              )}
            >
              {dragOver ? "Release" : "Place an image"}
            </div>
            <div className="font-body text-[0.58rem] tracking-[0.2em] uppercase text-ink/18 font-semibold">
              Drop · Click · Paste
            </div>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ""
        }}
      />
    </div>
  )
}

export default ImageZone
